import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

type PaymentState = "paid" | "failed" | "abandoned" | "pending";

function mapPaystackStatus(status: string): PaymentState {
  if (status === "success") return "paid";
  if (status === "failed" || status === "reversed") return "failed";
  if (status === "abandoned" || status === "cancelled") return "abandoned";
  return "pending";
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return json({ error: "Method not allowed." }, 405);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const paystackKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!supabaseUrl || !serviceKey) {
      return json({ error: "Server is not configured for payments." }, 500);
    }
    if (!paystackKey) {
      return json({ error: "Paystack is not connected yet. Payment cannot be verified." }, 500);
    }

    const body = await req.json().catch(() => null);
    const reference = typeof body?.reference === "string" ? body.reference.trim() : "";
    if (!reference || reference.length > 100) {
      return json({ error: "Missing payment reference." }, 400);
    }

    // Paystack is the source of truth: the status and amount come from its API, never from the browser.
    const paystackResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      { headers: { Authorization: `Bearer ${paystackKey}` } },
    );
    const paystackBody = await paystackResponse.json().catch(() => null);
    if (!paystackResponse.ok || !paystackBody?.status || !paystackBody?.data) {
      console.error("Paystack verify failed", paystackResponse.status, paystackBody);
      return json({ error: "We could not confirm this payment with Paystack yet." }, 502);
    }

    const tx = paystackBody.data;
    const orderNumber = typeof tx.metadata?.order_number === "string" ? tx.metadata.order_number : "";
    if (!orderNumber) {
      return json({ error: "This payment is not linked to a SILVER LEAGUE order." }, 404);
    }

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, order_number, total, payment_status, payment_email_sent_at")
      .eq("order_number", orderNumber)
      .maybeSingle();
    if (orderError) throw orderError;
    if (!order) {
      return json({ error: "We could not find this order." }, 404);
    }

    const state = mapPaystackStatus(String(tx.status));
    const paidKobo = Number(tx.amount);
    const expectedKobo = Math.round(Number(order.total) * 100);

    if (state === "paid") {
      if (tx.currency !== "NGN" || paidKobo !== expectedKobo) {
        console.error("Payment amount mismatch", { orderNumber, paidKobo, expectedKobo, currency: tx.currency });
        return json({ error: "The amount paid does not match this order. Please contact SILVER LEAGUE." }, 409);
      }
      if (order.payment_status !== "paid") {
        const { data: updated, error: updateError } = await supabase
          .from("orders")
          .update({
            payment_status: "paid",
            paid_at: tx.paid_at ?? new Date().toISOString(),
            payment_amount: paidKobo / 100,
            paystack_reference: reference,
          })
          .eq("id", order.id)
          .neq("payment_status", "paid")
          .select("id");
        if (updateError) throw updateError;

        if (updated && updated.length > 0) {
          try {
            const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-order-email`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${serviceKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ order_number: order.order_number, event: "paid" }),
            });
            if (!emailResponse.ok) {
              console.error("Payment email failed", emailResponse.status, await emailResponse.text());
            }
          } catch (err) {
            console.error("Payment email request error", err);
          }
        }
      }
    } else if (state === "failed" || state === "abandoned") {
      if (order.payment_status !== "paid") {
        const { error: updateError } = await supabase
          .from("orders")
          .update({ payment_status: state })
          .eq("id", order.id);
        if (updateError) throw updateError;
      }
    }

    const { data: summary, error: summaryError } = await supabase
      .from("orders")
      .select(`
        order_number, payment_status, paid_at, subtotal, delivery_fee, total,
        delivery_method, delivery_zone, delivery_status, pickup_location,
        order_items(product_name, colour, size, quantity, price)
      `)
      .eq("id", order.id)
      .single();
    if (summaryError) throw summaryError;

    return json({ order: summary, paystack_status: tx.status });
  } catch (err) {
    console.error("verify-payment error", err);
    return json({ error: "We could not verify your payment. Please refresh or try again." }, 500);
  }
});

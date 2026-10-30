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
      return json({ error: "Paystack is not connected yet. Payment cannot be started." }, 500);
    }

    const body = await req.json().catch(() => null);
    const orderNumber = typeof body?.order_number === "string" ? body.order_number : "";
    const reference = typeof body?.reference === "string" ? body.reference : "";
    const callbackUrl = typeof body?.callback_url === "string" ? body.callback_url : "";

    let callback: URL;
    try {
      callback = new URL(callbackUrl);
    } catch {
      return json({ error: "Invalid return address for payment." }, 400);
    }
    if (callback.protocol !== "https:" && callback.protocol !== "http:") {
      return json({ error: "Invalid return address for payment." }, 400);
    }
    if (!orderNumber || !reference) {
      return json({ error: "Missing order details." }, 400);
    }

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, order_number, customer_email, total, payment_status, paystack_reference")
      .eq("order_number", orderNumber)
      .maybeSingle();
    if (orderError) throw orderError;
    if (!order || order.paystack_reference !== reference) {
      return json({ error: "We could not find this order." }, 404);
    }
    if (order.payment_status === "paid") {
      return json({ error: "This order has already been paid." }, 409);
    }

    const amountKobo = Math.round(Number(order.total) * 100);
    if (!Number.isFinite(amountKobo) || amountKobo <= 0) {
      return json({ error: "This order has an invalid total." }, 500);
    }

    const newReference = `SL-${crypto.randomUUID().replace(/-/g, "")}`;
    const callbackBase = `${callback.origin}${callback.pathname}${callback.search}#/order-confirmation`;

    const paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: order.customer_email,
        amount: amountKobo,
        currency: "NGN",
        reference: newReference,
        callback_url: callbackBase,
        metadata: { order_number: order.order_number },
      }),
    });
    const paystackBody = await paystackResponse.json().catch(() => null);

    if (!paystackResponse.ok || !paystackBody?.status || !paystackBody?.data?.authorization_url) {
      console.error("Paystack initialize failed", paystackResponse.status, paystackBody);
      return json({ error: "Paystack could not start this payment. Please try again." }, 502);
    }

    const { error: updateError } = await supabase
      .from("orders")
      .update({ paystack_reference: newReference, payment_status: "pending" })
      .eq("id", order.id)
      .neq("payment_status", "paid");
    if (updateError) throw updateError;

    return json({ authorization_url: paystackBody.data.authorization_url });
  } catch (err) {
    console.error("start-payment error", err);
    return json({ error: "We could not start your payment. Please try again." }, 500);
  }
});

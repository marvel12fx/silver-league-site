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

const ADMIN_EMAIL = "marveldital@gmail.com";
const BURGUNDY = "#4A0F1B";

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function naira(amount: number): string {
  return `₦${Math.round(amount).toLocaleString("en-US")}`;
}

interface OrderItemRow {
  product_name: string;
  colour: string | null;
  size: string | null;
  quantity: number;
  price: number;
}

interface OrderRow {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  shipping_address: Record<string, string> | null;
  subtotal: number;
  delivery_method: string;
  delivery_zone: string | null;
  delivery_fee: number;
  total: number;
  payment_status: string;
  delivery_status: string;
  pickup_location: string | null;
  notes: string | null;
  confirmation_email_sent_at: string | null;
  admin_notified_at: string | null;
  payment_email_sent_at: string | null;
  order_items: OrderItemRow[];
}

function deliverySummary(order: OrderRow): string {
  if (order.delivery_method === "pickup") {
    return `Self-pickup: ${order.pickup_location ?? "Pickup location to be confirmed"}`;
  }
  const a = order.shipping_address ?? {};
  const address = [a.line1, a.line2, a.city, a.state, a.country].filter(Boolean).join(", ");
  const zoneLabel =
    order.delivery_zone === "lagos" ? "Lagos doorstep delivery" :
    order.delivery_zone === "nigeria" ? "Nigeria doorstep delivery" :
    "Worldwide shipping (fee to be confirmed)";
  return `${zoneLabel}: ${address}`;
}

function itemsTable(order: OrderRow): string {
  const rows = order.order_items.map((item) => `
    <tr>
      <td style="padding:12px 8px;border-bottom:1px solid #eee;">${escapeHtml(item.product_name)}</td>
      <td style="padding:12px 8px;border-bottom:1px solid #eee;">${escapeHtml(item.colour ?? "-")}</td>
      <td style="padding:12px 8px;border-bottom:1px solid #eee;">${escapeHtml(item.size ?? "-")}</td>
      <td style="padding:12px 8px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
      <td style="padding:12px 8px;border-bottom:1px solid #eee;text-align:right;">${naira(Number(item.price) * item.quantity)}</td>
    </tr>`).join("");
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;font-size:14px;color:#2b2b2b;">
      <thead>
        <tr style="text-align:left;color:${BURGUNDY};font-size:11px;letter-spacing:1px;text-transform:uppercase;">
          <th style="padding:8px;border-bottom:2px solid ${BURGUNDY};">Item</th>
          <th style="padding:8px;border-bottom:2px solid ${BURGUNDY};">Colour</th>
          <th style="padding:8px;border-bottom:2px solid ${BURGUNDY};">Size</th>
          <th style="padding:8px;border-bottom:2px solid ${BURGUNDY};text-align:center;">Qty</th>
          <th style="padding:8px;border-bottom:2px solid ${BURGUNDY};text-align:right;">Amount</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function totalsBlock(order: OrderRow): string {
  const feeLine = order.delivery_method === "pickup"
    ? "Free (self-pickup)"
    : order.delivery_zone === "worldwide"
      ? "To be confirmed"
      : order.delivery_fee === 0 ? "Free" : naira(Number(order.delivery_fee));
  const paymentLabel = order.payment_status === "paid" ? "Paid" : "Awaiting payment";
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size:14px;color:#2b2b2b;margin-top:16px;">
      <tr><td style="padding:4px 0;">Subtotal</td><td style="padding:4px 0;text-align:right;">${naira(Number(order.subtotal))}</td></tr>
      <tr><td style="padding:4px 0;">Delivery</td><td style="padding:4px 0;text-align:right;">${feeLine}</td></tr>
      <tr><td style="padding:8px 0;font-weight:bold;color:${BURGUNDY};border-top:1px solid #ddd;">Total</td><td style="padding:8px 0;font-weight:bold;color:${BURGUNDY};text-align:right;border-top:1px solid #ddd;">${naira(Number(order.total))}</td></tr>
      <tr><td style="padding:4px 0;">Payment status</td><td style="padding:4px 0;text-align:right;">${paymentLabel}</td></tr>
    </table>`;
}

function wrap(title: string, intro: string, body: string): string {
  return `<!doctype html><html><body style="margin:0;background:#f7f3ef;font-family:Georgia,'Times New Roman',serif;">
    <div style="max-width:620px;margin:0 auto;padding:32px 20px;">
      <div style="background:${BURGUNDY};color:#f7f3ef;padding:28px;text-align:center;">
        <p style="margin:0;font-size:12px;letter-spacing:4px;">SILVER LEAGUE</p>
        <h1 style="margin:12px 0 0;font-size:24px;font-weight:normal;">${escapeHtml(title)}</h1>
      </div>
      <div style="background:#ffffff;padding:28px;color:#2b2b2b;">
        <p style="font-size:15px;line-height:1.6;margin-top:0;">${intro}</p>
        ${body}
      </div>
      <p style="text-align:center;font-size:12px;color:#7a6a6a;margin-top:20px;">SILVER LEAGUE, Lagos, Nigeria</p>
    </div>
  </body></html>`;
}

function customerPlacedEmail(order: OrderRow): { subject: string; html: string } {
  const intro = `Thank you, ${escapeHtml(order.customer_name)}. We have received your order <strong>${escapeHtml(order.order_number)}</strong>.` +
    (order.payment_status === "paid"
      ? " Your payment has been received."
      : " You will receive a payment confirmation email as soon as your payment is verified.");
  const body = `
    <p style="font-size:14px;"><strong>Delivery:</strong> ${escapeHtml(deliverySummary(order))}</p>
    ${itemsTable(order)}
    ${totalsBlock(order)}`;
  return {
    subject: `Order ${order.order_number} received | SILVER LEAGUE`,
    html: wrap("Order Confirmation", intro, body),
  };
}

function customerPaidEmail(order: OrderRow): { subject: string; html: string } {
  const intro = `Your payment for order <strong>${escapeHtml(order.order_number)}</strong> has been confirmed. Thank you, ${escapeHtml(order.customer_name)}.`;
  const body = `
    <p style="font-size:14px;"><strong>Delivery:</strong> ${escapeHtml(deliverySummary(order))}</p>
    ${itemsTable(order)}
    ${totalsBlock(order)}
    <p style="font-size:13px;color:#555;margin-top:20px;">For questions about your order, reply to this email or message us on WhatsApp at +234 901 048 0020.</p>`;
  return {
    subject: `Payment confirmed for order ${order.order_number} | SILVER LEAGUE`,
    html: wrap("Payment Confirmed", intro, body),
  };
}

function adminEmail(order: OrderRow, kind: "placed" | "paid"): { subject: string; html: string } {
  const customer = `
    <p style="font-size:14px;margin:0 0 4px;"><strong>Name:</strong> ${escapeHtml(order.customer_name)}</p>
    <p style="font-size:14px;margin:0 0 4px;"><strong>Email:</strong> ${escapeHtml(order.customer_email ?? "-")}</p>
    <p style="font-size:14px;margin:0 0 4px;"><strong>Phone:</strong> ${escapeHtml(order.customer_phone ?? "-")}</p>
    <p style="font-size:14px;margin:0 0 16px;"><strong>Delivery:</strong> ${escapeHtml(deliverySummary(order))}</p>
    ${order.notes ? `<p style="font-size:14px;margin:0 0 16px;"><strong>Notes:</strong> ${escapeHtml(order.notes)}</p>` : ""}`;
  const intro = kind === "paid"
    ? `Payment has been verified for order <strong>${escapeHtml(order.order_number)}</strong>.`
    : `A new order <strong>${escapeHtml(order.order_number)}</strong> has been placed on the website.`;
  const body = `${customer}${itemsTable(order)}${totalsBlock(order)}`;
  return {
    subject: kind === "paid"
      ? `Payment received: ${order.order_number}`
      : `New order: ${order.order_number}`,
    html: wrap(kind === "paid" ? "Payment Received" : "New Order", intro, body),
  };
}

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("RESEND_FROM_EMAIL");
  if (!apiKey || !from) {
    throw new Error("Email service is not connected (RESEND_API_KEY / RESEND_FROM_EMAIL missing)");
  }
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: [to], subject, html }),
  });
  if (!response.ok) {
    throw new Error(`Resend responded with ${response.status}: ${await response.text()}`);
  }
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
    if (!supabaseUrl || !serviceKey) {
      return json({ error: "Server is not configured for email." }, 500);
    }
    if (req.headers.get("Authorization") !== `Bearer ${serviceKey}`) {
      return json({ error: "Unauthorized." }, 401);
    }

    const body = await req.json().catch(() => null);
    const orderNumber = typeof body?.order_number === "string" ? body.order_number : "";
    const event = body?.event;
    if (!orderNumber || (event !== "placed" && event !== "paid")) {
      return json({ error: "Invalid email request." }, 400);
    }

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: order, error } = await supabase
      .from("orders")
      .select(`
        id, order_number, customer_name, customer_email, customer_phone, shipping_address,
        subtotal, delivery_method, delivery_zone, delivery_fee, total, payment_status,
        delivery_status, pickup_location, notes, confirmation_email_sent_at,
        admin_notified_at, payment_email_sent_at,
        order_items(product_name, colour, size, quantity, price)
      `)
      .eq("order_number", orderNumber)
      .maybeSingle();
    if (error) throw error;
    if (!order) return json({ error: "Order not found." }, 404);

    const result: Record<string, "sent" | "skipped" | "failed"> = {};
    const flagsToSet: Record<string, string> = {};
    const now = new Date().toISOString();

    const attempt = async (key: string, alreadySent: boolean, send: () => Promise<void>, flag: string) => {
      if (alreadySent) {
        result[key] = "skipped";
        return;
      }
      try {
        await send();
        result[key] = "sent";
        flagsToSet[flag] = now;
      } catch (err) {
        result[key] = "failed";
        console.error(`Email ${key} failed for ${orderNumber}`, err);
      }
    };

    const typedOrder = order as unknown as OrderRow;
    if (event === "placed") {
      await attempt(
        "customer",
        Boolean(typedOrder.confirmation_email_sent_at),
        () => {
          const m = customerPlacedEmail(typedOrder);
          return sendEmail(typedOrder.customer_email ?? "", m.subject, m.html);
        },
        "confirmation_email_sent_at",
      );
      await attempt(
        "admin",
        Boolean(typedOrder.admin_notified_at),
        () => {
          const m = adminEmail(typedOrder, "placed");
          return sendEmail(ADMIN_EMAIL, m.subject, m.html);
        },
        "admin_notified_at",
      );
    } else {
      await attempt(
        "customer",
        Boolean(typedOrder.payment_email_sent_at),
        () => {
          const m = customerPaidEmail(typedOrder);
          return sendEmail(typedOrder.customer_email ?? "", m.subject, m.html);
        },
        "payment_email_sent_at",
      );
      await attempt(
        "admin",
        Boolean(typedOrder.payment_email_sent_at),
        () => {
          const m = adminEmail(typedOrder, "paid");
          return sendEmail(ADMIN_EMAIL, m.subject, m.html);
        },
        "payment_email_sent_at",
      );
    }

    if (Object.keys(flagsToSet).length > 0) {
      const { error: updateError } = await supabase
        .from("orders")
        .update(flagsToSet)
        .eq("id", typedOrder.id);
      if (updateError) throw updateError;
    }

    const failed = Object.values(result).includes("failed");
    return json({ results: result }, failed ? 502 : 200);
  } catch (err) {
    console.error("send-order-email error", err);
    return json({ error: "Order email could not be sent." }, 500);
  }
});

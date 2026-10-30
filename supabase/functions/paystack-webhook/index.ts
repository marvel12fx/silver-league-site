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

function toHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, "0")).join("");
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
    const paystackKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!supabaseUrl || !paystackKey) {
      return json({ error: "Paystack is not connected yet." }, 500);
    }

    const rawBody = await req.text();
    const signature = req.headers.get("x-paystack-signature") ?? "";

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(paystackKey),
      { name: "HMAC", hash: "SHA-512" },
      false,
      ["sign"],
    );
    const expected = toHex(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(rawBody)));
    if (!signature || signature !== expected) {
      return json({ error: "Invalid signature." }, 401);
    }

    const event = JSON.parse(rawBody);
    if (event?.event !== "charge.success" || typeof event?.data?.reference !== "string") {
      return json({ received: true, ignored: true });
    }

    const verifyResponse = await fetch(`${supabaseUrl}/functions/v1/verify-payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reference: event.data.reference }),
    });
    if (!verifyResponse.ok) {
      console.error("Webhook verification failed", verifyResponse.status, await verifyResponse.text());
      return json({ error: "Payment verification failed." }, 500);
    }

    return json({ received: true });
  } catch (err) {
    console.error("paystack-webhook error", err);
    return json({ error: "Webhook could not be processed." }, 500);
  }
});

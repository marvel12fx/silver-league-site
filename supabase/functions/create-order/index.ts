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

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface CartLine {
  product_id: string;
  size: string;
  colour: string | null;
  quantity: number;
}

function clean(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function toNumber(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : NaN;
}

function generateOrderNumber(): string {
  const now = new Date();
  const ymd = `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, "0")}${String(now.getUTCDate()).padStart(2, "0")}`;
  const rand = crypto.randomUUID().replace(/-/g, "").slice(0, 5).toUpperCase();
  return `SL-${ymd}-${rand}`;
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
      return json({ error: "Server is not configured for orders." }, 500);
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return json({ error: "Invalid order request." }, 400);
    }

    const customerName = clean(body.customer?.name, 120);
    const customerEmail = clean(body.customer?.email, 200).toLowerCase();
    const customerPhone = clean(body.customer?.phone, 30);
    const notes = clean(body.notes, 500);

    if (customerName.length < 2) return json({ error: "Please enter your full name." }, 400);
    if (!EMAIL_PATTERN.test(customerEmail)) return json({ error: "Please enter a valid email address." }, 400);
    if (customerPhone.length < 7) return json({ error: "Please enter a valid phone number." }, 400);

    const method = body.delivery?.method;
    if (method !== "pickup" && method !== "doorstep") {
      return json({ error: "Please choose pickup or doorstep delivery." }, 400);
    }

    const address = {
      line1: clean(body.delivery?.address?.line1, 200),
      line2: clean(body.delivery?.address?.line2, 200),
      city: clean(body.delivery?.address?.city, 100),
      state: clean(body.delivery?.address?.state, 100),
      postal_code: "",
      country: clean(body.delivery?.address?.country, 100),
    };
    const zone = body.delivery?.zone;

    if (method === "doorstep") {
      if (zone !== "lagos" && zone !== "nigeria" && zone !== "worldwide") {
        return json({ error: "Please choose a delivery zone." }, 400);
      }
      if (!address.line1 || !address.city || !address.state || !address.country) {
        return json({ error: "Please complete your delivery address." }, 400);
      }
      const isNigeria = address.country.toLowerCase() === "nigeria";
      if ((zone === "lagos" || zone === "nigeria") && !isNigeria) {
        return json({ error: "Nigerian delivery zones require a Nigerian address." }, 400);
      }
      if (zone === "worldwide" && isNigeria) {
        return json({ error: "Please choose a Nigerian delivery zone for Nigerian addresses." }, 400);
      }
    }

    const rawItems: unknown = body.items;
    if (!Array.isArray(rawItems) || rawItems.length === 0 || rawItems.length > 50) {
      return json({ error: "Your bag is empty." }, 400);
    }

    const lines: CartLine[] = [];
    for (const raw of rawItems) {
      const quantity = Math.floor(toNumber(raw?.quantity));
      const productId = typeof raw?.product_id === "string" ? raw.product_id : "";
      const size = clean(raw?.size, 20);
      const colour = raw?.colour ? clean(raw.colour, 60) : null;
      if (!productId || !size || !Number.isFinite(quantity) || quantity < 1 || quantity > 20) {
        return json({ error: "One of the items in your bag is invalid." }, 400);
      }
      lines.push({ product_id: productId, size, colour, quantity });
    }

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: settingsRows, error: settingsError } = await supabase
      .from("site_content")
      .select("section, data")
      .in("section", ["delivery_settings", "pickup"]);
    if (settingsError) throw settingsError;
    const settings = Object.fromEntries((settingsRows ?? []).map((r) => [r.section, r.data]));
    const delivery = settings.delivery_settings;
    const pickup = settings.pickup;
    if (!delivery || !pickup) {
      return json({ error: "Delivery settings are not configured yet. Please contact SILVER LEAGUE." }, 500);
    }

    const productIds = [...new Set(lines.map((l) => l.product_id))];
    const { data: products, error: productError } = await supabase
      .from("products")
      .select("id, name, price, images, product_colours(name, images), product_sizes(size, stock)")
      .in("id", productIds);
    if (productError) throw productError;
    const productMap = new Map((products ?? []).map((p) => [p.id, p]));

    type OrderLine = {
      product: NonNullable<ReturnType<typeof productMap.get>>;
      line: CartLine;
      unitPrice: number;
      image: string | null;
    };
    const resolved: OrderLine[] = [];

    for (const line of lines) {
      const product = productMap.get(line.product_id);
      if (!product) {
        return json({ error: "One of the products in your bag is no longer available." }, 400);
      }
      const colours = product.product_colours ?? [];
      const colourRow = line.colour ? colours.find((c) => c.name === line.colour) : undefined;
      if (colours.length > 0 && !colourRow) {
        return json({ error: `Please choose a valid colour for ${product.name}.` }, 400);
      }
      const sizeRow = (product.product_sizes ?? []).find((s) => s.size === line.size);
      if (!sizeRow || sizeRow.stock < line.quantity) {
        return json({ error: `${product.name} in size ${line.size} is not available in that quantity.` }, 400);
      }
      const unitPrice = toNumber(product.price);
      if (!Number.isFinite(unitPrice)) {
        return json({ error: `${product.name} does not have a valid price yet.` }, 500);
      }
      resolved.push({
        product,
        line,
        unitPrice,
        image: colourRow?.images?.[0] || product.images?.[0] || null,
      });
    }

    const subtotal = resolved.reduce((sum, r) => sum + r.unitPrice * r.line.quantity, 0);
    const threshold = toNumber(delivery.free_delivery_threshold);
    const qualifiesForFreeDelivery = subtotal >= threshold;

    let deliveryFee = 0;
    let pickupLocation: string | null = null;
    let deliveryZone: string | null = null;

    if (method === "pickup") {
      const name = clean(pickup.location_name, 200);
      const pickupAddress = clean(pickup.address, 300);
      pickupLocation = [name, pickupAddress].filter(Boolean).join(", ") || "SILVER LEAGUE Park Location";
    } else {
      deliveryZone = zone as string;
      if (zone === "lagos") {
        deliveryFee = qualifiesForFreeDelivery ? 0 : toNumber(delivery.lagos_fee);
      } else if (zone === "nigeria") {
        deliveryFee = qualifiesForFreeDelivery ? 0 : toNumber(delivery.nigeria_fee);
      }
      if (!Number.isFinite(deliveryFee)) {
        return json({ error: "Delivery settings are incomplete. Please contact SILVER LEAGUE." }, 500);
      }
    }

    const total = subtotal + deliveryFee;
    const orderNumber = generateOrderNumber();
    const paystackReference = `SL-${crypto.randomUUID().replace(/-/g, "")}`;

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        shipping_address: method === "pickup"
          ? { line1: "", line2: "", city: "", state: "", postal_code: "", country: "Nigeria" }
          : address,
        shipping_method: method === "pickup" ? "pickup" : zone,
        shipping_cost: deliveryFee,
        subtotal,
        total,
        status: "pending",
        notes,
        payment_status: "pending",
        paystack_reference: paystackReference,
        delivery_method: method,
        delivery_zone: deliveryZone,
        delivery_fee: deliveryFee,
        delivery_status: "not_started",
        pickup_location: pickupLocation,
      })
      .select("id, order_number, total")
      .single();
    if (orderError || !order) throw orderError ?? new Error("Order could not be created");

    const { error: itemsError } = await supabase.from("order_items").insert(
      resolved.map((r) => ({
        order_id: order.id,
        product_id: r.product.id,
        product_name: r.product.name,
        product_image: r.image,
        colour: r.line.colour,
        size: r.line.size,
        quantity: r.line.quantity,
        price: r.unitPrice,
      })),
    );
    if (itemsError) {
      await supabase.from("orders").delete().eq("id", order.id);
      throw itemsError;
    }

    let emailStatus: "sent" | "failed" = "sent";
    try {
      const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-order-email`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${serviceKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ order_number: order.order_number, event: "placed" }),
      });
      if (!emailResponse.ok) {
        emailStatus = "failed";
        console.error("Order placed email failed", emailResponse.status, await emailResponse.text());
      }
    } catch (err) {
      emailStatus = "failed";
      console.error("Order placed email request error", err);
    }

    return json({
      order_number: order.order_number,
      paystack_reference: paystackReference,
      total,
      email_status: emailStatus,
    });
  } catch (err) {
    console.error("create-order error", err);
    return json({ error: "We could not place your order. Please try again." }, 500);
  }
});

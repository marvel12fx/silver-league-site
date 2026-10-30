/*
# Payments, delivery options, product videos and admin-only order access

Plain-English summary
This migration prepares the database for Paystack payments, pickup and doorstep delivery,
product videos, and a locked-down order area for the admin.

1. Changes to `orders` (existing orders are preserved)
- `payment_status`: pending, paid, failed or abandoned. Only the server marks an order paid, after Paystack confirms it.
- `paystack_reference`: unique reference for the current payment attempt.
- `payment_amount`, `paid_at`: amount Paystack confirmed and when.
- `delivery_method`: pickup or doorstep.
- `delivery_zone`: lagos, nigeria or worldwide.
- `delivery_fee`: delivery fee calculated on the server.
- `delivery_status`: not_started, preparing, ready_for_pickup, out_for_delivery, delivered, picked_up.
- `pickup_location`: pickup details shown to the customer when they choose pickup.
- `confirmation_email_sent_at`, `admin_notified_at`, `payment_email_sent_at`: stop duplicate emails.
- Existing orders are back-filled with their delivery zone and fee from the old shipping fields.

2. New table `product_videos`
- Video files for a product, stored in the `product-videos` file bucket. Only the file link is stored in the database.

3. Storage
- New public `product-videos` bucket (MP4, WebM or QuickTime, up to 50 MB).
- Only the admin can upload, replace or delete videos. Anyone can watch them.
- Product image uploads are restricted to the admin account (previously any signed-in user could upload).

4. Security changes
- Customers can no longer insert orders or order items directly from the browser. Orders are created by a
  server function that validates prices, sizes and delivery fees from the database.
- Orders and order items can only be read by the admin account (previously any signed-in user could read them).
- Existing admin update and delete rules on orders are unchanged.

5. Settings
- Delivery fees and pickup details are stored in the existing `site_content` table under `delivery_settings`
  and `pickup`. Admins edit them from the dashboard; the server reads them when calculating orders.
- Pickup address is left blank until the admin enters it. The site does not invent an address.

6. Notes
- No products, collections, customers or orders are deleted or changed in type.
*/

-- ===== orders: new columns =====
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'pending';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS paystack_reference text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_amount numeric(10,2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS paid_at timestamptz;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_method text NOT NULL DEFAULT 'doorstep';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_zone text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_fee numeric(10,2) NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_status text NOT NULL DEFAULT 'not_started';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS pickup_location text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS confirmation_email_sent_at timestamptz;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS admin_notified_at timestamptz;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_email_sent_at timestamptz;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_payment_status_check') THEN
    ALTER TABLE orders ADD CONSTRAINT orders_payment_status_check
      CHECK (payment_status IN ('pending', 'paid', 'failed', 'abandoned'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_delivery_method_check') THEN
    ALTER TABLE orders ADD CONSTRAINT orders_delivery_method_check
      CHECK (delivery_method IN ('pickup', 'doorstep'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_delivery_zone_check') THEN
    ALTER TABLE orders ADD CONSTRAINT orders_delivery_zone_check
      CHECK (delivery_zone IS NULL OR delivery_zone IN ('lagos', 'nigeria', 'worldwide'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_delivery_status_check') THEN
    ALTER TABLE orders ADD CONSTRAINT orders_delivery_status_check
      CHECK (delivery_status IN ('not_started', 'preparing', 'ready_for_pickup', 'out_for_delivery', 'delivered', 'picked_up'));
  END IF;
END $$;

UPDATE orders
SET delivery_zone = CASE shipping_method
      WHEN 'lagos' THEN 'lagos'
      WHEN 'nationwide' THEN 'nigeria'
      WHEN 'worldwide' THEN 'worldwide'
      ELSE NULL
    END,
    delivery_fee = COALESCE(shipping_cost, 0)
WHERE delivery_zone IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_paystack_reference
  ON orders (paystack_reference) WHERE paystack_reference IS NOT NULL;

-- ===== Lock down customer writes: orders are created only by the server =====
DROP POLICY IF EXISTS "anon_insert_orders" ON orders;
DROP POLICY IF EXISTS "anon_insert_order_items" ON order_items;
REVOKE INSERT ON orders FROM anon, authenticated;
REVOKE INSERT ON order_items FROM anon, authenticated;

DROP POLICY IF EXISTS "admin_read_orders" ON orders;
CREATE POLICY "admin_read_orders" ON orders FOR SELECT
  TO authenticated USING (auth.jwt() ->> 'email' = 'marveldital@gmail.com');

DROP POLICY IF EXISTS "admin_read_order_items" ON order_items;
CREATE POLICY "admin_read_order_items" ON order_items FOR SELECT
  TO authenticated USING (auth.jwt() ->> 'email' = 'marveldital@gmail.com');

-- ===== product_videos =====
CREATE TABLE IF NOT EXISTS product_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url text NOT NULL,
  storage_path text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE product_videos ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON product_videos TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON product_videos TO authenticated;

DROP POLICY IF EXISTS "public_read_product_videos" ON product_videos;
CREATE POLICY "public_read_product_videos" ON product_videos FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_product_videos" ON product_videos;
CREATE POLICY "admin_insert_product_videos" ON product_videos FOR INSERT
  TO authenticated WITH CHECK (auth.jwt() ->> 'email' = 'marveldital@gmail.com');

DROP POLICY IF EXISTS "admin_update_product_videos" ON product_videos;
CREATE POLICY "admin_update_product_videos" ON product_videos FOR UPDATE
  TO authenticated USING (auth.jwt() ->> 'email' = 'marveldital@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'marveldital@gmail.com');

DROP POLICY IF EXISTS "admin_delete_product_videos" ON product_videos;
CREATE POLICY "admin_delete_product_videos" ON product_videos FOR DELETE
  TO authenticated USING (auth.jwt() ->> 'email' = 'marveldital@gmail.com');

CREATE INDEX IF NOT EXISTS idx_product_videos_product ON product_videos(product_id);

-- ===== product-videos storage bucket =====
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('product-videos', 'product-videos', true, 52428800,
        ARRAY['video/mp4', 'video/webm', 'video/quicktime'])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['video/mp4', 'video/webm', 'video/quicktime'];

DROP POLICY IF EXISTS "public_read_product_videos" ON storage.objects;
CREATE POLICY "public_read_product_videos" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'product-videos');

DROP POLICY IF EXISTS "admin_upload_product_videos" ON storage.objects;
CREATE POLICY "admin_upload_product_videos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-videos' AND auth.jwt() ->> 'email' = 'marveldital@gmail.com');

DROP POLICY IF EXISTS "admin_update_product_videos" ON storage.objects;
CREATE POLICY "admin_update_product_videos" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'product-videos' AND auth.jwt() ->> 'email' = 'marveldital@gmail.com')
  WITH CHECK (bucket_id = 'product-videos' AND auth.jwt() ->> 'email' = 'marveldital@gmail.com');

DROP POLICY IF EXISTS "admin_delete_product_videos" ON storage.objects;
CREATE POLICY "admin_delete_product_videos" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'product-videos' AND auth.jwt() ->> 'email' = 'marveldital@gmail.com');

-- ===== Tighten existing product-images upload rules to the admin account =====
DROP POLICY IF EXISTS "admin_upload_product_images" ON storage.objects;
CREATE POLICY "admin_upload_product_images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images' AND auth.jwt() ->> 'email' = 'marveldital@gmail.com');

DROP POLICY IF EXISTS "admin_update_product_images" ON storage.objects;
CREATE POLICY "admin_update_product_images" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'product-images' AND auth.jwt() ->> 'email' = 'marveldital@gmail.com')
  WITH CHECK (bucket_id = 'product-images' AND auth.jwt() ->> 'email' = 'marveldital@gmail.com');

DROP POLICY IF EXISTS "admin_delete_product_images" ON storage.objects;
CREATE POLICY "admin_delete_product_images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'product-images' AND auth.jwt() ->> 'email' = 'marveldital@gmail.com');

-- ===== Delivery and pickup settings (editable by admin via site_content) =====
INSERT INTO site_content (section, data) VALUES
  ('delivery_settings', jsonb_build_object(
    'lagos_fee', 7000,
    'lagos_eta', '1–2 days',
    'nigeria_fee', 10000,
    'nigeria_eta', '2–5 days',
    'worldwide_eta', '1–14 days',
    'free_delivery_threshold', 500000
  )),
  ('pickup', jsonb_build_object(
    'location_name', 'SILVER LEAGUE Park Location',
    'address', '',
    'instructions', 'Bring your order number when you come to collect your order. Our team will confirm your collection time on WhatsApp.',
    'hours', ''
  ))
ON CONFLICT (section) DO NOTHING;

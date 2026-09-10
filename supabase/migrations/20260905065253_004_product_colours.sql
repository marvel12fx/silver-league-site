/*
# Product Colour Variants

1. New Tables
- `product_colours` — stores colour variants for each product.
  - `id` (uuid, primary key)
  - `product_id` (uuid, foreign key to products, CASCADE on delete)
  - `name` (text, not null — e.g. "Burgundy", "Black", "Ivory")
  - `images` (jsonb, not null, default '[]' — array of image URLs specific to this colour)
  - `created_at` (timestamptz, default now())
  - Unique constraint on (product_id, name) to prevent duplicate colours per product.

2. Modified Tables
- `order_items` — added `colour` text column (nullable) to record which colour the customer selected.

3. Security
- `product_colours`: public read (anon + authenticated), admin write (authenticated only).
  - Same access model as `products` and `product_sizes`.
- `order_items`: the existing anon insert policy already covers the new column (WITH CHECK (true)).
  - No new policies needed — the column is nullable and inserts are already allowed for anon.

4. Notes
- The `product_colours` table is optional per product. Products without colour variants
  simply have no rows in this table, and the storefront falls back to the product's
  top-level `images` array.
- Sizes and inventory remain connected to the product (not per-colour). A colour is a
  visual variant; stock is shared across colours for the same size.
- Index on product_id for efficient lookups when loading a product.
*/

CREATE TABLE IF NOT EXISTS product_colours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name text NOT NULL,
  images jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  UNIQUE(product_id, name)
);

ALTER TABLE product_colours ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_product_colours" ON product_colours;
CREATE POLICY "public_read_product_colours" ON product_colours FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_product_colours" ON product_colours;
CREATE POLICY "admin_insert_product_colours" ON product_colours FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_product_colours" ON product_colours;
CREATE POLICY "admin_update_product_colours" ON product_colours FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_product_colours" ON product_colours;
CREATE POLICY "admin_delete_product_colours" ON product_colours FOR DELETE
  TO authenticated USING (true);

-- Add colour column to order_items (nullable — backward compatible with existing orders)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'order_items' AND column_name = 'colour') THEN
    ALTER TABLE order_items ADD COLUMN colour text;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_product_colours_product ON product_colours(product_id);

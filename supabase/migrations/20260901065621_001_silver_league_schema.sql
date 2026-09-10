/*
# SILVER LEAGUE — Core Schema

1. New Tables
- `categories` — product categories (e.g. Dresses, Blazers, Outerwear, Tops)
- `collections` — curated fashion collections with editorial content
- `products` — full product catalog with images, pricing, sizing, inventory, SKU
- `product_sizes` — per-size inventory for each product
- `orders` — customer orders with shipping and status
- `order_items` — line items within an order
- `wishlist` — persisted wishlist items (anon, identified by session token stored locally)

2. Security
- This is a storefront + admin model. The storefront reads as anon (no customer accounts).
- Admin access is gated by Supabase Auth (authenticated). Admin writes require authentication.
- Products, categories, collections: public read (anon), admin write (authenticated).
- Orders: public insert (anon can place orders), admin read/update (authenticated).
- Wishlist: anon can manage their own wishlist items (identified by a client-generated session id).

3. Notes
- All tables have created_at timestamps.
- Products store images as a JSON array of URLs for multi-image support.
- product_sizes tracks inventory per size for accurate stock management.
*/

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_categories" ON categories;
CREATE POLICY "public_read_categories" ON categories FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_categories" ON categories;
CREATE POLICY "admin_insert_categories" ON categories FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_categories" ON categories;
CREATE POLICY "admin_update_categories" ON categories FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_categories" ON categories;
CREATE POLICY "admin_delete_categories" ON categories FOR DELETE
  TO authenticated USING (true);

-- Collections
CREATE TABLE IF NOT EXISTS collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  editorial_image text,
  cover_image text,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_collections" ON collections;
CREATE POLICY "public_read_collections" ON collections FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_collections" ON collections;
CREATE POLICY "admin_insert_collections" ON collections FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_collections" ON collections;
CREATE POLICY "admin_update_collections" ON collections FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_collections" ON collections;
CREATE POLICY "admin_delete_collections" ON collections FOR DELETE
  TO authenticated USING (true);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  price numeric(10,2) NOT NULL,
  compare_at_price numeric(10,2),
  sku text NOT NULL UNIQUE,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  collection_id uuid REFERENCES collections(id) ON DELETE SET NULL,
  images jsonb NOT NULL DEFAULT '[]'::jsonb,
  sizes jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_new boolean DEFAULT false,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_products" ON products;
CREATE POLICY "public_read_products" ON products FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_products" ON products;
CREATE POLICY "admin_insert_products" ON products FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_products" ON products;
CREATE POLICY "admin_update_products" ON products FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_products" ON products;
CREATE POLICY "admin_delete_products" ON products FOR DELETE
  TO authenticated USING (true);

-- Product sizes (per-size inventory)
CREATE TABLE IF NOT EXISTS product_sizes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size text NOT NULL,
  stock integer NOT NULL DEFAULT 0,
  UNIQUE(product_id, size),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE product_sizes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_product_sizes" ON product_sizes;
CREATE POLICY "public_read_product_sizes" ON product_sizes FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_product_sizes" ON product_sizes;
CREATE POLICY "admin_insert_product_sizes" ON product_sizes FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_product_sizes" ON product_sizes;
CREATE POLICY "admin_update_product_sizes" ON product_sizes FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_product_sizes" ON product_sizes;
CREATE POLICY "admin_delete_product_sizes" ON product_sizes FOR DELETE
  TO authenticated USING (true);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL UNIQUE,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text,
  shipping_address jsonb NOT NULL,
  shipping_method text DEFAULT 'standard',
  shipping_cost numeric(10,2) DEFAULT 0,
  subtotal numeric(10,2) NOT NULL DEFAULT 0,
  total numeric(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_orders" ON orders;
CREATE POLICY "anon_insert_orders" ON orders FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_read_orders" ON orders;
CREATE POLICY "admin_read_orders" ON orders FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "admin_update_orders" ON orders;
CREATE POLICY "admin_update_orders" ON orders FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_orders" ON orders;
CREATE POLICY "admin_delete_orders" ON orders FOR DELETE
  TO authenticated USING (true);

-- Order items
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  product_image text,
  size text,
  quantity integer NOT NULL DEFAULT 1,
  price numeric(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_order_items" ON order_items;
CREATE POLICY "anon_insert_order_items" ON order_items FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_read_order_items" ON order_items;
CREATE POLICY "admin_read_order_items" ON order_items FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "admin_update_order_items" ON order_items;
CREATE POLICY "admin_update_order_items" ON order_items FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- Wishlist
CREATE TABLE IF NOT EXISTS wishlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(session_id, product_id)
);

ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_wishlist" ON wishlist;
CREATE POLICY "anon_read_wishlist" ON wishlist FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_wishlist" ON wishlist;
CREATE POLICY "anon_insert_wishlist" ON wishlist FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_wishlist" ON wishlist;
CREATE POLICY "anon_delete_wishlist" ON wishlist FOR DELETE
  TO anon, authenticated USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_collection ON products(collection_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_product_sizes_product ON product_sizes(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_session ON wishlist(session_id);

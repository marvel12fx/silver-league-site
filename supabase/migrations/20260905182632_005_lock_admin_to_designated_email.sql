/*
# Lock Admin Access to Designated Email

1. Security Changes
- All admin write policies (INSERT, UPDATE, DELETE) on products, product_sizes,
  product_colours, categories, collections, orders, and order_items are tightened
  so that ONLY the designated admin email (marveldital@gmail.com) can perform
  those operations.
- Public read policies (SELECT) remain unchanged — storefront visitors can still
  browse products, categories, collections, and product metadata.
- Anonymous insert on orders and order_items remains unchanged — customers can
  still place orders without an account.
- Wishlist policies remain unchanged (anon self-service).

2. How It Works
- Each admin write policy now checks: auth.jwt() ->> 'email' = 'marveldital@gmail.com'
- This means even if someone creates a Supabase Auth account with a different email,
  they will NOT be able to insert, update, or delete products, collections, orders, etc.
- Only a session authenticated as marveldital@gmail.com passes the check.

3. Tables Affected
- categories (INSERT, UPDATE, DELETE)
- collections (INSERT, UPDATE, DELETE)
- products (INSERT, UPDATE, DELETE)
- product_sizes (INSERT, UPDATE, DELETE)
- product_colours (INSERT, UPDATE, DELETE)
- orders (UPDATE, DELETE — admin read stays for all authenticated)
- order_items (UPDATE — admin read stays for all authenticated)

4. Notes
- No data is lost or modified. Only policy predicates change.
- The admin email is checked via the JWT claim, not user_metadata, so it cannot
  be spoofed by the user editing their profile.
*/

-- ===== CATEGORIES =====
DROP POLICY IF EXISTS "admin_insert_categories" ON categories;
CREATE POLICY "admin_insert_categories" ON categories FOR INSERT
  TO authenticated WITH CHECK (auth.jwt() ->> 'email' = 'marveldital@gmail.com');

DROP POLICY IF EXISTS "admin_update_categories" ON categories;
CREATE POLICY "admin_update_categories" ON categories FOR UPDATE
  TO authenticated USING (auth.jwt() ->> 'email' = 'marveldital@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'marveldital@gmail.com');

DROP POLICY IF EXISTS "admin_delete_categories" ON categories;
CREATE POLICY "admin_delete_categories" ON categories FOR DELETE
  TO authenticated USING (auth.jwt() ->> 'email' = 'marveldital@gmail.com');

-- ===== COLLECTIONS =====
DROP POLICY IF EXISTS "admin_insert_collections" ON collections;
CREATE POLICY "admin_insert_collections" ON collections FOR INSERT
  TO authenticated WITH CHECK (auth.jwt() ->> 'email' = 'marveldital@gmail.com');

DROP POLICY IF EXISTS "admin_update_collections" ON collections;
CREATE POLICY "admin_update_collections" ON collections FOR UPDATE
  TO authenticated USING (auth.jwt() ->> 'email' = 'marveldital@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'marveldital@gmail.com');

DROP POLICY IF EXISTS "admin_delete_collections" ON collections;
CREATE POLICY "admin_delete_collections" ON collections FOR DELETE
  TO authenticated USING (auth.jwt() ->> 'email' = 'marveldital@gmail.com');

-- ===== PRODUCTS =====
DROP POLICY IF EXISTS "admin_insert_products" ON products;
CREATE POLICY "admin_insert_products" ON products FOR INSERT
  TO authenticated WITH CHECK (auth.jwt() ->> 'email' = 'marveldital@gmail.com');

DROP POLICY IF EXISTS "admin_update_products" ON products;
CREATE POLICY "admin_update_products" ON products FOR UPDATE
  TO authenticated USING (auth.jwt() ->> 'email' = 'marveldital@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'marveldital@gmail.com');

DROP POLICY IF EXISTS "admin_delete_products" ON products;
CREATE POLICY "admin_delete_products" ON products FOR DELETE
  TO authenticated USING (auth.jwt() ->> 'email' = 'marveldital@gmail.com');

-- ===== PRODUCT SIZES =====
DROP POLICY IF EXISTS "admin_insert_product_sizes" ON product_sizes;
CREATE POLICY "admin_insert_product_sizes" ON product_sizes FOR INSERT
  TO authenticated WITH CHECK (auth.jwt() ->> 'email' = 'marveldital@gmail.com');

DROP POLICY IF EXISTS "admin_update_product_sizes" ON product_sizes;
CREATE POLICY "admin_update_product_sizes" ON product_sizes FOR UPDATE
  TO authenticated USING (auth.jwt() ->> 'email' = 'marveldital@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'marveldital@gmail.com');

DROP POLICY IF EXISTS "admin_delete_product_sizes" ON product_sizes;
CREATE POLICY "admin_delete_product_sizes" ON product_sizes FOR DELETE
  TO authenticated USING (auth.jwt() ->> 'email' = 'marveldital@gmail.com');

-- ===== PRODUCT COLOURS =====
DROP POLICY IF EXISTS "admin_insert_product_colours" ON product_colours;
CREATE POLICY "admin_insert_product_colours" ON product_colours FOR INSERT
  TO authenticated WITH CHECK (auth.jwt() ->> 'email' = 'marveldital@gmail.com');

DROP POLICY IF EXISTS "admin_update_product_colours" ON product_colours;
CREATE POLICY "admin_update_product_colours" ON product_colours FOR UPDATE
  TO authenticated USING (auth.jwt() ->> 'email' = 'marveldital@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'marveldital@gmail.com');

DROP POLICY IF EXISTS "admin_delete_product_colours" ON product_colours;
CREATE POLICY "admin_delete_product_colours" ON product_colours FOR DELETE
  TO authenticated USING (auth.jwt() ->> 'email' = 'marveldital@gmail.com');

-- ===== ORDERS =====
DROP POLICY IF EXISTS "admin_update_orders" ON orders;
CREATE POLICY "admin_update_orders" ON orders FOR UPDATE
  TO authenticated USING (auth.jwt() ->> 'email' = 'marveldital@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'marveldital@gmail.com');

DROP POLICY IF EXISTS "admin_delete_orders" ON orders;
CREATE POLICY "admin_delete_orders" ON orders FOR DELETE
  TO authenticated USING (auth.jwt() ->> 'email' = 'marveldital@gmail.com');

-- ===== ORDER ITEMS =====
DROP POLICY IF EXISTS "admin_update_order_items" ON order_items;
CREATE POLICY "admin_update_order_items" ON order_items FOR UPDATE
  TO authenticated USING (auth.jwt() ->> 'email' = 'marveldital@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'marveldital@gmail.com');

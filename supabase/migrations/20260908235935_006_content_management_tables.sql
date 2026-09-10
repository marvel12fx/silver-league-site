/*
# Content Management Tables for SILVER LEAGUE

1. New Tables
- `site_content`: Key-value store for editable website sections (hero, about, contact, portfolio heading).
  Each row has a `section` text primary key and a `data` jsonb column holding the section's fields.
- `services`: Admin-managed service cards shown on the website. Fields: title, description, image, sort_order.
- `testimonials`: Admin-managed customer testimonials. Fields: customer_name, text, image, sort_order.
- `portfolio_items`: Admin-managed portfolio/project entries. Fields: title, description, image, sort_order.

2. Seed Data
- Inserts default `site_content` rows for hero, about, contact, and portfolio sections
  using the current hardcoded values from the website so nothing changes visually until the admin edits.
- No services, testimonials, or portfolio_items are seeded (admin will add them).

3. Security
- RLS enabled on all four tables.
- SELECT: public (anon, authenticated) — all website visitors can read.
- INSERT/UPDATE/DELETE: admin-only — auth.jwt() ->> 'email' = 'marveldital@gmail.com'.
  This matches the existing admin lock from migration 005.

4. Important Notes
- This migration does NOT modify existing tables (products, collections, orders, etc.).
- Product management remains entirely in the existing Products admin section.
- The admin email check uses the JWT claim, not user_metadata, so it cannot be spoofed.
*/

-- ===== site_content =====
CREATE TABLE IF NOT EXISTS site_content (
  section text PRIMARY KEY,
  data jsonb NOT NULL DEFAULT '{}'::jsonb
);

ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_site_content" ON site_content;
CREATE POLICY "public_read_site_content" ON site_content FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_site_content" ON site_content;
CREATE POLICY "admin_insert_site_content" ON site_content FOR INSERT
  TO authenticated WITH CHECK (auth.jwt() ->> 'email' = 'marveldital@gmail.com');

DROP POLICY IF EXISTS "admin_update_site_content" ON site_content;
CREATE POLICY "admin_update_site_content" ON site_content FOR UPDATE
  TO authenticated USING (auth.jwt() ->> 'email' = 'marveldital@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'marveldital@gmail.com');

DROP POLICY IF EXISTS "admin_delete_site_content" ON site_content;
CREATE POLICY "admin_delete_site_content" ON site_content FOR DELETE
  TO authenticated USING (auth.jwt() ->> 'email' = 'marveldital@gmail.com');

-- ===== services =====
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_services" ON services;
CREATE POLICY "public_read_services" ON services FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_services" ON services;
CREATE POLICY "admin_insert_services" ON services FOR INSERT
  TO authenticated WITH CHECK (auth.jwt() ->> 'email' = 'marveldital@gmail.com');

DROP POLICY IF EXISTS "admin_update_services" ON services;
CREATE POLICY "admin_update_services" ON services FOR UPDATE
  TO authenticated USING (auth.jwt() ->> 'email' = 'marveldital@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'marveldital@gmail.com');

DROP POLICY IF EXISTS "admin_delete_services" ON services;
CREATE POLICY "admin_delete_services" ON services FOR DELETE
  TO authenticated USING (auth.jwt() ->> 'email' = 'marveldital@gmail.com');

-- ===== testimonials =====
CREATE TABLE IF NOT EXISTS testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  text text NOT NULL,
  image text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_testimonials" ON testimonials;
CREATE POLICY "public_read_testimonials" ON testimonials FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_testimonials" ON testimonials;
CREATE POLICY "admin_insert_testimonials" ON testimonials FOR INSERT
  TO authenticated WITH CHECK (auth.jwt() ->> 'email' = 'marveldital@gmail.com');

DROP POLICY IF EXISTS "admin_update_testimonials" ON testimonials;
CREATE POLICY "admin_update_testimonials" ON testimonials FOR UPDATE
  TO authenticated USING (auth.jwt() ->> 'email' = 'marveldital@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'marveldital@gmail.com');

DROP POLICY IF EXISTS "admin_delete_testimonials" ON testimonials;
CREATE POLICY "admin_delete_testimonials" ON testimonials FOR DELETE
  TO authenticated USING (auth.jwt() ->> 'email' = 'marveldital@gmail.com');

-- ===== portfolio_items =====
CREATE TABLE IF NOT EXISTS portfolio_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_portfolio_items" ON portfolio_items;
CREATE POLICY "public_read_portfolio_items" ON portfolio_items FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_portfolio_items" ON portfolio_items;
CREATE POLICY "admin_insert_portfolio_items" ON portfolio_items FOR INSERT
  TO authenticated WITH CHECK (auth.jwt() ->> 'email' = 'marveldital@gmail.com');

DROP POLICY IF EXISTS "admin_update_portfolio_items" ON portfolio_items;
CREATE POLICY "admin_update_portfolio_items" ON portfolio_items FOR UPDATE
  TO authenticated USING (auth.jwt() ->> 'email' = 'marveldital@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'marveldital@gmail.com');

DROP POLICY IF EXISTS "admin_delete_portfolio_items" ON portfolio_items;
CREATE POLICY "admin_delete_portfolio_items" ON portfolio_items FOR DELETE
  TO authenticated USING (auth.jwt() ->> 'email' = 'marveldital@gmail.com');

-- ===== Seed default site_content =====
INSERT INTO site_content (section, data) VALUES
  ('hero', jsonb_build_object(
    'heading', 'WEAR YOUR POWER.',
    'subtext', 'The Autumn / Winter 2026 Collection',
    'image', 'https://images.pexels.com/photos/15666879/pexels-photo-15666879.jpeg?auto=compress&cs=tinysrgb&h=1600&w=2400',
    'buttonText', 'Shop New Arrivals',
    'buttonLink', '/shop'
  )),
  ('about', jsonb_build_object(
    'heroImage', 'https://images.pexels.com/photos/14048053/pexels-photo-14048053.jpeg?auto=compress&cs=tinysrgb&h=1200&w=2000',
    'sectionTitle', 'Clothing as Conviction',
    'storyParagraph1', 'SILVER LEAGUE is a women''s ready-to-wear brand built on a single, unwavering belief: what a woman wears should reflect who she is — and who she intends to become.',
    'storyParagraph2', 'Founded for the powerful, the confident, and the sophisticated, every piece in our collection is designed to be more than clothing. It is a declaration. A quiet armour. A statement of intent that does not need to raise its voice to be heard.',
    'storyParagraph3', 'Our atelier marries the precision of traditional tailoring with a modern editorial sensibility. We source the finest fabrics, cut with intention, and finish each piece with the kind of detail that is invisible to the casual eye but unmistakable to the woman who wears it.',
    'editorialImage', 'https://images.pexels.com/photos/38290951/pexels-photo-38290951.jpeg?auto=compress&cs=tinysrgb&h=1000&w=800',
    'editorialTitle', 'She Does Not Wait to Be Invited',
    'editorialParagraph1', 'The SILVER LEAGUE woman is not defined by the room she enters — she defines it. She is the executive, the founder, the creative force, the decision-maker.',
    'editorialParagraph2', 'She understands that luxury is not about logos. It is about the way a garment feels, the way it moves, and the way it makes her feel: unstoppable.',
    'editorialParagraph3', 'We build every collection for her.'
  )),
  ('contact', jsonb_build_object(
    'email', 'hello@silverleague.co',
    'phone', '+234 901 048 0020',
    'whatsapp', '2349010480020',
    'location', 'Lagos, Nigeria',
    'instagram', 'https://instagram.com/silverleague_co',
    'instagramHandle', '@silverleague_co',
    'tiktok', 'https://tiktok.com/@silver_league',
    'tiktokHandle', '@silver_league'
  )),
  ('portfolio', jsonb_build_object(
    'heading', 'Portfolio',
    'subtitle', 'Selected projects and collaborations'
  ))
ON CONFLICT (section) DO NOTHING;

-- Indexes for sort_order on list tables
CREATE INDEX IF NOT EXISTS idx_services_sort_order ON services (sort_order);
CREATE INDEX IF NOT EXISTS idx_testimonials_sort_order ON testimonials (sort_order);
CREATE INDEX IF NOT EXISTS idx_portfolio_items_sort_order ON portfolio_items (sort_order);

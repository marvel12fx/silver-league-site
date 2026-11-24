/*
# Server-side email secrets (Resend API key)

1. Plain-English explanation
- Adds a private `app_secrets` table that stores server-side settings such as the
  Resend API key. The admin can paste the key in the dashboard; it is saved on the
  server and never shown in full again, never stored in the browser, and never
  exposed publicly. The `send-order-email` edge function reads it with service-role
  rights when sending order and payment emails.

2. New Tables
- `app_secrets`
  - `name` (text, primary key) - secret name, e.g. RESEND_API_KEY, RESEND_FROM_EMAIL
  - `value` (text, not null) - the secret value
  - `updated_at` (timestamptz) - last time the secret was saved

3. Security
- RLS enabled on `app_secrets`. No policies for `anon`, so the public/anon key can
  never read or write it.
- Policies for `authenticated` are limited to the designated admin email
  (auth.jwt() ->> 'email' = 'marveldital@gmail.com'), one policy per CRUD verb.
- Grants: SELECT, INSERT, UPDATE, DELETE to `authenticated` only (policies still
  scope rows to the admin). `service_role` bypasses RLS and can read it for emails.
- The admin settings screen only fetches which secret names exist, never the value,
  so the key is not sent back to the browser after saving.
*/

CREATE TABLE IF NOT EXISTS app_secrets (
  name text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE app_secrets ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON app_secrets TO authenticated;
GRANT SELECT ON app_secrets TO service_role;

DROP POLICY IF EXISTS "admin_read_app_secrets" ON app_secrets;
CREATE POLICY "admin_read_app_secrets" ON app_secrets FOR SELECT
TO authenticated
USING (auth.jwt() ->> 'email' = 'marveldital@gmail.com');

DROP POLICY IF EXISTS "admin_insert_app_secrets" ON app_secrets;
CREATE POLICY "admin_insert_app_secrets" ON app_secrets FOR INSERT
TO authenticated
WITH CHECK (auth.jwt() ->> 'email' = 'marveldital@gmail.com');

DROP POLICY IF EXISTS "admin_update_app_secrets" ON app_secrets;
CREATE POLICY "admin_update_app_secrets" ON app_secrets FOR UPDATE
TO authenticated
USING (auth.jwt() ->> 'email' = 'marveldital@gmail.com')
WITH CHECK (auth.jwt() ->> 'email' = 'marveldital@gmail.com');

DROP POLICY IF EXISTS "admin_delete_app_secrets" ON app_secrets;
CREATE POLICY "admin_delete_app_secrets" ON app_secrets FOR DELETE
TO authenticated
USING (auth.jwt() ->> 'email' = 'marveldital@gmail.com');

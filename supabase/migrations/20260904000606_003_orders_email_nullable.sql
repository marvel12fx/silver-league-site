/*
# Make customer_email optional on orders

1. Changes
- Alter `orders.customer_email` from NOT NULL to nullable, since checkout now uses WhatsApp instead of email for customer contact.
2. Security
- No RLS changes.
*/

ALTER TABLE orders ALTER COLUMN customer_email DROP NOT NULL;

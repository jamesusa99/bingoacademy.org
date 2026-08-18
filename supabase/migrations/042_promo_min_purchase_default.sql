-- Default minimum purchase to 100 cents ($1.00) for promo codes

ALTER TABLE promo_codes
  ALTER COLUMN min_purchase_cents SET DEFAULT 100;

UPDATE promo_codes
SET min_purchase_cents = 100
WHERE min_purchase_cents IS NULL;

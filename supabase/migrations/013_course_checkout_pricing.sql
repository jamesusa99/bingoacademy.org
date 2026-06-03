-- Explicit Stripe checkout pricing for courses_catalog
-- price_cents overrides parsed price text when set; purchasable=false disables online checkout

ALTER TABLE courses_catalog ADD COLUMN IF NOT EXISTS price_cents INT;
ALTER TABLE courses_catalog ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'usd';
ALTER TABLE courses_catalog ADD COLUMN IF NOT EXISTS purchasable BOOLEAN;

COMMENT ON COLUMN courses_catalog.price_cents IS 'Stripe checkout amount in cents; overrides parsed price text when set';
COMMENT ON COLUMN courses_catalog.currency IS 'ISO currency for Stripe (default usd)';
COMMENT ON COLUMN courses_catalog.purchasable IS 'When false, hide online checkout; null = auto from price';

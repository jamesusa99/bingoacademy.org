-- Promo / referral codes for marketing (admin-managed)

CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL DEFAULT 'percent'
    CHECK (discount_type IN ('percent', 'fixed_amount')),
  discount_percent INTEGER
    CHECK (discount_percent IS NULL OR (discount_percent >= 0 AND discount_percent <= 100)),
  discount_amount_cents INTEGER
    CHECK (discount_amount_cents IS NULL OR discount_amount_cents >= 0),
  currency TEXT NOT NULL DEFAULT 'usd',
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  max_redemptions INTEGER
    CHECK (max_redemptions IS NULL OR max_redemptions >= 0),
  redemption_count INTEGER NOT NULL DEFAULT 0
    CHECK (redemption_count >= 0),
  min_purchase_cents INTEGER
    CHECK (min_purchase_cents IS NULL OR min_purchase_cents >= 0),
  applies_to TEXT NOT NULL DEFAULT 'all'
    CHECK (applies_to IN ('all', 'ioai', 'courses', 'mall')),
  applicable_slugs JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'active', 'paused', 'expired')),
  stripe_coupon_id TEXT,
  internal_notes TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_promo_codes_code_lower ON promo_codes (lower(trim(code)));
CREATE INDEX IF NOT EXISTS idx_promo_codes_status ON promo_codes (status);
CREATE INDEX IF NOT EXISTS idx_promo_codes_starts ON promo_codes (starts_at);
CREATE INDEX IF NOT EXISTS idx_promo_codes_ends ON promo_codes (ends_at);

ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS promo_codes_select_staff ON promo_codes;
CREATE POLICY promo_codes_select_staff ON promo_codes
  FOR SELECT USING (public.is_admin_or_editor());

DROP POLICY IF EXISTS promo_codes_insert_staff ON promo_codes;
CREATE POLICY promo_codes_insert_staff ON promo_codes
  FOR INSERT WITH CHECK (public.is_admin_or_editor());

DROP POLICY IF EXISTS promo_codes_update_staff ON promo_codes;
CREATE POLICY promo_codes_update_staff ON promo_codes
  FOR UPDATE
  USING (public.is_admin_or_editor())
  WITH CHECK (public.is_admin_or_editor());

DROP POLICY IF EXISTS promo_codes_delete_staff ON promo_codes;
CREATE POLICY promo_codes_delete_staff ON promo_codes
  FOR DELETE USING (public.is_admin_or_editor());

COMMENT ON TABLE promo_codes IS 'Marketing promo / referral codes — managed in Admin → Marketing Center';

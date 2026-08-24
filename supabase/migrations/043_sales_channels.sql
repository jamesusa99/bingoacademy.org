-- Sales channels (official + partner), commission ledger, and payouts.

CREATE TABLE IF NOT EXISTS sales_channels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'partner'
    CHECK (kind IN ('official', 'partner')),
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'active', 'paused')),
  code TEXT NOT NULL,
  description TEXT,
  contact_name TEXT,
  contact_email TEXT,
  commission_bps INTEGER NOT NULL DEFAULT 0
    CHECK (commission_bps >= 0 AND commission_bps <= 10000),
  min_payout_cents INTEGER NOT NULL DEFAULT 10000
    CHECK (min_payout_cents >= 0),
  hold_days INTEGER NOT NULL DEFAULT 7
    CHECK (hold_days >= 0 AND hold_days <= 365),
  currency TEXT NOT NULL DEFAULT 'usd',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_sales_channels_slug_lower ON sales_channels (lower(trim(slug)));
CREATE UNIQUE INDEX IF NOT EXISTS idx_sales_channels_code_lower ON sales_channels (lower(trim(code)));
CREATE INDEX IF NOT EXISTS idx_sales_channels_status ON sales_channels (status);
CREATE INDEX IF NOT EXISTS idx_sales_channels_kind ON sales_channels (kind);

ALTER TABLE promo_codes
  ADD COLUMN IF NOT EXISTS channel_id UUID REFERENCES sales_channels(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_promo_codes_channel ON promo_codes (channel_id);

CREATE TABLE IF NOT EXISTS channel_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id UUID NOT NULL REFERENCES sales_channels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  member_role TEXT NOT NULL DEFAULT 'manager'
    CHECK (member_role IN ('owner', 'manager')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (channel_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_channel_members_user ON channel_members (user_id);

CREATE TABLE IF NOT EXISTS channel_payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id UUID NOT NULL REFERENCES sales_channels(id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'requested'
    CHECK (status IN ('requested', 'approved', 'paid', 'rejected')),
  requested_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT,
  admin_notes TEXT,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_channel_payouts_channel ON channel_payouts (channel_id, requested_at DESC);
CREATE INDEX IF NOT EXISTS idx_channel_payouts_status ON channel_payouts (status);

CREATE TABLE IF NOT EXISTS channel_commissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id UUID NOT NULL REFERENCES sales_channels(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  buyer_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  product_name TEXT,
  sale_cents INTEGER NOT NULL DEFAULT 0 CHECK (sale_cents >= 0),
  commission_cents INTEGER NOT NULL DEFAULT 0 CHECK (commission_cents >= 0),
  commission_bps INTEGER NOT NULL DEFAULT 0 CHECK (commission_bps >= 0),
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'available', 'reserved', 'paid', 'reversed')),
  available_at TIMESTAMPTZ,
  payout_id UUID REFERENCES channel_payouts(id) ON DELETE SET NULL,
  attribution_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_channel_commissions_order_channel
  ON channel_commissions (order_id, channel_id)
  WHERE order_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_channel_commissions_channel_created
  ON channel_commissions (channel_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_channel_commissions_status ON channel_commissions (status);
CREATE INDEX IF NOT EXISTS idx_channel_commissions_buyer ON channel_commissions (buyer_user_id);

ALTER TABLE sales_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_payouts ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_channel_member(_channel_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.channel_members
    WHERE channel_id = _channel_id AND user_id = auth.uid()
  );
$$;

DROP POLICY IF EXISTS sales_channels_staff_all ON sales_channels;
CREATE POLICY sales_channels_staff_all ON sales_channels
  FOR ALL USING (public.is_admin_or_editor()) WITH CHECK (public.is_admin_or_editor());

DROP POLICY IF EXISTS sales_channels_member_select ON sales_channels;
CREATE POLICY sales_channels_member_select ON sales_channels
  FOR SELECT USING (public.is_channel_member(id));

DROP POLICY IF EXISTS channel_members_staff_all ON channel_members;
CREATE POLICY channel_members_staff_all ON channel_members
  FOR ALL USING (public.is_admin_or_editor()) WITH CHECK (public.is_admin_or_editor());

DROP POLICY IF EXISTS channel_members_self_select ON channel_members;
CREATE POLICY channel_members_self_select ON channel_members
  FOR SELECT USING (user_id = auth.uid() OR public.is_channel_member(channel_id));

DROP POLICY IF EXISTS channel_commissions_staff_all ON channel_commissions;
CREATE POLICY channel_commissions_staff_all ON channel_commissions
  FOR ALL USING (public.is_admin_or_editor()) WITH CHECK (public.is_admin_or_editor());

DROP POLICY IF EXISTS channel_commissions_member_select ON channel_commissions;
CREATE POLICY channel_commissions_member_select ON channel_commissions
  FOR SELECT USING (public.is_channel_member(channel_id));

DROP POLICY IF EXISTS channel_payouts_staff_all ON channel_payouts;
CREATE POLICY channel_payouts_staff_all ON channel_payouts
  FOR ALL USING (public.is_admin_or_editor()) WITH CHECK (public.is_admin_or_editor());

DROP POLICY IF EXISTS channel_payouts_member_select ON channel_payouts;
CREATE POLICY channel_payouts_member_select ON channel_payouts
  FOR SELECT USING (public.is_channel_member(channel_id));

INSERT INTO sales_channels (slug, name, kind, status, code, commission_bps, min_payout_cents, hold_days, description)
SELECT
  'official',
  'Bingo Academy Official',
  'official',
  'active',
  'BINGO',
  0,
  10000,
  0,
  'Self-operated official storefront. Attribution code BINGO.'
WHERE NOT EXISTS (
  SELECT 1 FROM sales_channels WHERE lower(trim(code)) = 'bingo' OR lower(trim(slug)) = 'official'
);

-- Idempotent promo redemptions + atomic counter increment

CREATE TABLE IF NOT EXISTS promo_code_redemptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  promo_code_id UUID NOT NULL REFERENCES promo_codes(id) ON DELETE CASCADE,
  stripe_checkout_session_id TEXT NOT NULL,
  user_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (stripe_checkout_session_id)
);

CREATE INDEX IF NOT EXISTS idx_promo_redemptions_promo ON promo_code_redemptions (promo_code_id);

ALTER TABLE promo_code_redemptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS promo_redemptions_select_staff ON promo_code_redemptions;
CREATE POLICY promo_redemptions_select_staff ON promo_code_redemptions
  FOR SELECT USING (public.is_admin_or_editor());

DROP POLICY IF EXISTS promo_redemptions_insert_staff ON promo_code_redemptions;
CREATE POLICY promo_redemptions_insert_staff ON promo_code_redemptions
  FOR INSERT WITH CHECK (public.is_admin_or_editor());

CREATE OR REPLACE FUNCTION public.redeem_promo_for_session(
  p_promo_id UUID,
  p_session_id TEXT,
  p_user_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_promo_id IS NULL OR p_session_id IS NULL OR btrim(p_session_id) = '' THEN
    RETURN FALSE;
  END IF;

  INSERT INTO promo_code_redemptions (promo_code_id, stripe_checkout_session_id, user_id)
  VALUES (p_promo_id, p_session_id, p_user_id);

  UPDATE promo_codes
  SET
    redemption_count = COALESCE(redemption_count, 0) + 1,
    updated_at = now()
  WHERE id = p_promo_id;

  RETURN TRUE;
EXCEPTION
  WHEN unique_violation THEN
    RETURN FALSE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.redeem_promo_for_session(UUID, TEXT, UUID) TO service_role;

-- Backfill from paid orders that already stored promo_code_id
INSERT INTO promo_code_redemptions (promo_code_id, stripe_checkout_session_id, user_id)
SELECT
  (o.metadata->>'promo_code_id')::uuid,
  o.stripe_checkout_session_id,
  o.user_id
FROM orders o
WHERE o.status = 'paid'
  AND o.stripe_checkout_session_id IS NOT NULL
  AND o.metadata ? 'promo_code_id'
  AND (o.metadata->>'promo_code_id') ~* '^[0-9a-f-]{36}$'
ON CONFLICT (stripe_checkout_session_id) DO NOTHING;

UPDATE promo_codes p
SET
  redemption_count = sub.cnt,
  updated_at = now()
FROM (
  SELECT promo_code_id, COUNT(*)::int AS cnt
  FROM promo_code_redemptions
  GROUP BY promo_code_id
) sub
WHERE p.id = sub.promo_code_id
  AND COALESCE(p.redemption_count, 0) < sub.cnt;

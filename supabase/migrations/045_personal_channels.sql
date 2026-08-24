-- Allow self-serve personal referral channels (same ledger as official/partner).

ALTER TABLE sales_channels DROP CONSTRAINT IF EXISTS sales_channels_kind_check;
ALTER TABLE sales_channels
  ADD CONSTRAINT sales_channels_kind_check
  CHECK (kind IN ('official', 'partner', 'personal'));

-- Company-wide defaults for every personal (self-serve) referral channel.
INSERT INTO platform_settings (key, value, updated_at)
VALUES (
  'personal_channel_policy',
  '{"commissionPercent": 10, "holdDays": 7, "minPayoutDollars": 100}'::jsonb,
  now()
)
ON CONFLICT (key) DO NOTHING;

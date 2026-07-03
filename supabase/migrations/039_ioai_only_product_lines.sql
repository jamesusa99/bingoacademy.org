-- Phase 1: public site focuses on IOAI Competition Training only

INSERT INTO platform_settings (key, value)
VALUES (
  'product_lines',
  '{"ioai": true, "general": false, "k12": false}'::jsonb
)
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value, updated_at = now();

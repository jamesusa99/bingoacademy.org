-- IOAI L3 module commerce + ioai_bundles (unit / full / combo)
-- Purchase unit = modules.catalog_slug; L4 lessons no longer primary checkout.

-- L1 course_levels
ALTER TABLE course_levels
  ADD COLUMN IF NOT EXISTS cover_url TEXT,
  ADD COLUMN IF NOT EXISTS summary_short TEXT,
  ADD COLUMN IF NOT EXISTS intro_json JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS highlight_tags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'live';

COMMENT ON COLUMN course_levels.status IS 'draft | live | hidden';

-- L2 themes
ALTER TABLE themes
  ADD COLUMN IF NOT EXISTS cover_url TEXT,
  ADD COLUMN IF NOT EXISTS intro_html TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'live',
  ADD COLUMN IF NOT EXISTS hidden BOOLEAN NOT NULL DEFAULT false;

-- L3 modules (commerce)
ALTER TABLE modules
  ADD COLUMN IF NOT EXISTS catalog_slug TEXT,
  ADD COLUMN IF NOT EXISTS cover_url TEXT,
  ADD COLUMN IF NOT EXISTS intro_html TEXT,
  ADD COLUMN IF NOT EXISTS price_cents INT,
  ADD COLUMN IF NOT EXISTS compare_at_cents INT,
  ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'usd',
  ADD COLUMN IF NOT EXISTS marketing_tags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'live',
  ADD COLUMN IF NOT EXISTS in_full_track BOOLEAN NOT NULL DEFAULT true;

CREATE UNIQUE INDEX IF NOT EXISTS idx_modules_catalog_slug ON modules (catalog_slug) WHERE catalog_slug IS NOT NULL;

COMMENT ON COLUMN modules.catalog_slug IS 'Stripe / enrollment slug for L3 unit purchase';
COMMENT ON COLUMN modules.status IS 'draft | live | hidden';

-- L4 lessons
ALTER TABLE lessons
  ADD COLUMN IF NOT EXISTS intro TEXT,
  ADD COLUMN IF NOT EXISTS trial_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'live';

COMMENT ON COLUMN lessons.trial_enabled IS 'Free video + exercises when true';

-- Bundles (unit / full / combo)
CREATE TABLE IF NOT EXISTS ioai_bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  bundle_type TEXT NOT NULL CHECK (bundle_type IN ('unit', 'full', 'combo')),
  title TEXT NOT NULL,
  cover_url TEXT,
  intro_html TEXT,
  price_cents INT NOT NULL,
  compare_at_cents INT,
  currency TEXT NOT NULL DEFAULT 'usd',
  marketing_tags TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'live',
  module_id UUID REFERENCES modules(id) ON DELETE SET NULL,
  promo_starts_at TIMESTAMPTZ,
  promo_ends_at TIMESTAMPTZ,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ioai_bundles_type ON ioai_bundles (bundle_type);
CREATE INDEX IF NOT EXISTS idx_ioai_bundles_status ON ioai_bundles (status);

CREATE TABLE IF NOT EXISTS ioai_bundle_modules (
  bundle_id UUID NOT NULL REFERENCES ioai_bundles(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  sort_order INT NOT NULL DEFAULT 0,
  PRIMARY KEY (bundle_id, module_id)
);

CREATE INDEX IF NOT EXISTS idx_ioai_bundle_modules_module ON ioai_bundle_modules (module_id);

-- courses_catalog: mark IOAI lesson rows as non-purchasable (L3 only)
-- Backfill runs in scripts/migrate-ioai-commerce.mjs

ALTER TABLE ioai_bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ioai_bundle_modules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ioai_bundles_public_read" ON ioai_bundles;
CREATE POLICY "ioai_bundles_public_read" ON ioai_bundles FOR SELECT USING (status = 'live');

DROP POLICY IF EXISTS "ioai_bundle_modules_public_read" ON ioai_bundle_modules;
CREATE POLICY "ioai_bundle_modules_public_read" ON ioai_bundle_modules FOR SELECT USING (true);

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['ioai_bundles']
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_insert_staff', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_update_staff', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_delete_staff', t);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR INSERT WITH CHECK (public.is_admin_or_editor())',
      t || '_insert_staff', t
    );
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR UPDATE USING (public.is_admin_or_editor()) WITH CHECK (public.is_admin_or_editor())',
      t || '_update_staff', t
    );
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR DELETE USING (public.is_admin_or_editor())',
      t || '_delete_staff', t
    );
  END LOOP;

  FOREACH t IN ARRAY ARRAY['ioai_bundle_modules']
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_insert_staff', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_update_staff', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_delete_staff', t);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR INSERT WITH CHECK (public.is_admin_or_editor())',
      t || '_insert_staff', t
    );
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR UPDATE USING (public.is_admin_or_editor()) WITH CHECK (public.is_admin_or_editor())',
      t || '_update_staff', t
    );
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR DELETE USING (public.is_admin_or_editor())',
      t || '_delete_staff', t
    );
  END LOOP;
END;
$$;

COMMENT ON TABLE ioai_bundles IS 'IOAI course packages: unit (1 L3), full (all L3), combo (selected L3s)';
COMMENT ON TABLE ioai_bundle_modules IS 'Modules included in full/combo bundles';

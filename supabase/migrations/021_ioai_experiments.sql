-- IOAI public experiment library, L4 bindings, lesson materials, lab packs

CREATE TABLE IF NOT EXISTS ioai_experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  subtitle TEXT,
  cover_url TEXT,
  intro_html TEXT,
  description TEXT,
  play_type TEXT NOT NULL DEFAULT 'training_lab'
    CHECK (play_type IN ('training_lab', 'external_url', 'exploration')),
  play_target TEXT,
  status TEXT NOT NULL DEFAULT 'live' CHECK (status IN ('draft', 'live', 'hidden')),
  sort_order INT NOT NULL DEFAULT 0,
  marketing_tags TEXT[] DEFAULT '{}',
  product_line TEXT NOT NULL DEFAULT 'ioai',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ioai_experiments_status ON ioai_experiments (status);
CREATE INDEX IF NOT EXISTS idx_ioai_experiments_product_line ON ioai_experiments (product_line);

CREATE TABLE IF NOT EXISTS ioai_experiment_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID NOT NULL REFERENCES ioai_experiments(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ioai_experiment_materials_experiment
  ON ioai_experiment_materials (experiment_id);

CREATE TABLE IF NOT EXISTS lesson_experiment_bindings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  experiment_id UUID NOT NULL REFERENCES ioai_experiments(id) ON DELETE CASCADE,
  enabled BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (lesson_id, experiment_id)
);

CREATE INDEX IF NOT EXISTS idx_lesson_experiment_bindings_lesson
  ON lesson_experiment_bindings (lesson_id);

CREATE TABLE IF NOT EXISTS lesson_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lesson_materials_lesson ON lesson_materials (lesson_id);

-- Extend bundle types for standalone lab packs
ALTER TABLE ioai_bundles DROP CONSTRAINT IF EXISTS ioai_bundles_bundle_type_check;
ALTER TABLE ioai_bundles ADD CONSTRAINT ioai_bundles_bundle_type_check
  CHECK (bundle_type IN ('unit', 'full', 'combo', 'lab_pack'));

CREATE TABLE IF NOT EXISTS ioai_bundle_experiments (
  bundle_id UUID NOT NULL REFERENCES ioai_bundles(id) ON DELETE CASCADE,
  experiment_id UUID NOT NULL REFERENCES ioai_experiments(id) ON DELETE CASCADE,
  sort_order INT NOT NULL DEFAULT 0,
  PRIMARY KEY (bundle_id, experiment_id)
);

CREATE INDEX IF NOT EXISTS idx_ioai_bundle_experiments_experiment
  ON ioai_bundle_experiments (experiment_id);

CREATE TABLE IF NOT EXISTS ioai_bundle_recommended_modules (
  bundle_id UUID NOT NULL REFERENCES ioai_bundles(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  sort_order INT NOT NULL DEFAULT 0,
  PRIMARY KEY (bundle_id, module_id)
);

CREATE INDEX IF NOT EXISTS idx_ioai_bundle_recommended_modules_module
  ON ioai_bundle_recommended_modules (module_id);

-- RLS
ALTER TABLE ioai_experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ioai_experiment_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_experiment_bindings ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE ioai_bundle_experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ioai_bundle_recommended_modules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ioai_experiments_public_read" ON ioai_experiments;
CREATE POLICY "ioai_experiments_public_read" ON ioai_experiments
  FOR SELECT USING (status = 'live');

DROP POLICY IF EXISTS "ioai_experiment_materials_public_read" ON ioai_experiment_materials;
CREATE POLICY "ioai_experiment_materials_public_read" ON ioai_experiment_materials
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM ioai_experiments e
      WHERE e.id = experiment_id AND e.status = 'live'
    )
  );

DROP POLICY IF EXISTS "lesson_experiment_bindings_public_read" ON lesson_experiment_bindings;
CREATE POLICY "lesson_experiment_bindings_public_read" ON lesson_experiment_bindings
  FOR SELECT USING (enabled = true);

DROP POLICY IF EXISTS "lesson_materials_public_read" ON lesson_materials;
CREATE POLICY "lesson_materials_public_read" ON lesson_materials
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "ioai_bundle_experiments_public_read" ON ioai_bundle_experiments;
CREATE POLICY "ioai_bundle_experiments_public_read" ON ioai_bundle_experiments
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "ioai_bundle_recommended_modules_public_read" ON ioai_bundle_recommended_modules;
CREATE POLICY "ioai_bundle_recommended_modules_public_read" ON ioai_bundle_recommended_modules
  FOR SELECT USING (true);

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'ioai_experiments',
    'ioai_experiment_materials',
    'lesson_experiment_bindings',
    'lesson_materials',
    'ioai_bundle_experiments',
    'ioai_bundle_recommended_modules'
  ]
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
END $$;

-- IOAI public experiment library + L4 bindings + lab pack refs + lab_pack bundles

CREATE TABLE IF NOT EXISTS ioai_experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  purpose TEXT NOT NULL DEFAULT '',
  materials_list JSONB NOT NULL DEFAULT '[]'::jsonb,
  runtime_config JSONB NOT NULL DEFAULT '{"type":"steps_only"}'::jsonb,
  status TEXT NOT NULL DEFAULT 'live' CHECK (status IN ('live', 'draft', 'hidden')),
  sort_order INT NOT NULL DEFAULT 0,
  source_lab_experiment_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ioai_experiments_status_sort ON ioai_experiments (status, sort_order);

CREATE TABLE IF NOT EXISTS ioai_experiment_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID NOT NULL REFERENCES ioai_experiments(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '',
  step_type TEXT NOT NULL CHECK (
    step_type IN ('text', 'video', 'ppt', 'link', 'programming', 'download')
  ),
  body TEXT NOT NULL DEFAULT '',
  video_url TEXT,
  cloudflare_video_id TEXT,
  ppt_url TEXT,
  external_url TEXT,
  download_url TEXT,
  download_label TEXT,
  programming_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ioai_experiment_steps_exp ON ioai_experiment_steps (experiment_id, sort_order);

CREATE TABLE IF NOT EXISTS ioai_experiment_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID NOT NULL REFERENCES ioai_experiments(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '',
  file_url TEXT NOT NULL,
  file_name TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ioai_experiment_materials_exp ON ioai_experiment_materials (experiment_id, sort_order);

CREATE TABLE IF NOT EXISTS lesson_experiment_bindings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  experiment_id UUID NOT NULL REFERENCES ioai_experiments(id) ON DELETE CASCADE,
  enabled BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (lesson_id, experiment_id)
);

CREATE INDEX IF NOT EXISTS idx_lesson_experiment_bindings_lesson ON lesson_experiment_bindings (lesson_id, sort_order);

CREATE TABLE IF NOT EXISTS lesson_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '',
  file_url TEXT NOT NULL,
  file_name TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lesson_materials_lesson ON lesson_materials (lesson_id, sort_order);

CREATE TABLE IF NOT EXISTS lab_pack_experiment_refs (
  pack_slug TEXT NOT NULL REFERENCES courses_catalog(slug) ON DELETE CASCADE,
  experiment_id UUID NOT NULL REFERENCES ioai_experiments(id) ON DELETE CASCADE,
  sort_order INT NOT NULL DEFAULT 0,
  PRIMARY KEY (pack_slug, experiment_id)
);

CREATE INDEX IF NOT EXISTS idx_lab_pack_experiment_refs_pack ON lab_pack_experiment_refs (pack_slug, sort_order);

ALTER TABLE ioai_bundles DROP CONSTRAINT IF EXISTS ioai_bundles_bundle_type_check;
ALTER TABLE ioai_bundles ADD CONSTRAINT ioai_bundles_bundle_type_check
  CHECK (bundle_type IN ('unit', 'full', 'combo', 'lab_pack'));

CREATE TABLE IF NOT EXISTS ioai_bundle_experiments (
  bundle_id UUID NOT NULL REFERENCES ioai_bundles(id) ON DELETE CASCADE,
  experiment_id UUID NOT NULL REFERENCES ioai_experiments(id) ON DELETE CASCADE,
  sort_order INT NOT NULL DEFAULT 0,
  PRIMARY KEY (bundle_id, experiment_id)
);

CREATE INDEX IF NOT EXISTS idx_ioai_bundle_experiments_bundle ON ioai_bundle_experiments (bundle_id, sort_order);

CREATE TABLE IF NOT EXISTS ioai_bundle_recommended_modules (
  bundle_id UUID NOT NULL REFERENCES ioai_bundles(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  sort_order INT NOT NULL DEFAULT 0,
  PRIMARY KEY (bundle_id, module_id)
);

ALTER TABLE lab_experiments
  ADD COLUMN IF NOT EXISTS ioai_experiment_id UUID REFERENCES ioai_experiments(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_lab_experiments_ioai_ref ON lab_experiments (ioai_experiment_id);

ALTER TABLE ioai_experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ioai_experiment_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE ioai_experiment_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_experiment_bindings ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_pack_experiment_refs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ioai_bundle_experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ioai_bundle_recommended_modules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ioai_experiments_read" ON ioai_experiments;
CREATE POLICY "ioai_experiments_read" ON ioai_experiments FOR SELECT USING (true);
DROP POLICY IF EXISTS "ioai_experiments_write" ON ioai_experiments;
CREATE POLICY "ioai_experiments_write" ON ioai_experiments FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "ioai_experiment_steps_read" ON ioai_experiment_steps;
CREATE POLICY "ioai_experiment_steps_read" ON ioai_experiment_steps FOR SELECT USING (true);
DROP POLICY IF EXISTS "ioai_experiment_steps_write" ON ioai_experiment_steps;
CREATE POLICY "ioai_experiment_steps_write" ON ioai_experiment_steps FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "ioai_experiment_materials_read" ON ioai_experiment_materials;
CREATE POLICY "ioai_experiment_materials_read" ON ioai_experiment_materials FOR SELECT USING (true);
DROP POLICY IF EXISTS "ioai_experiment_materials_write" ON ioai_experiment_materials;
CREATE POLICY "ioai_experiment_materials_write" ON ioai_experiment_materials FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "lesson_experiment_bindings_read" ON lesson_experiment_bindings;
CREATE POLICY "lesson_experiment_bindings_read" ON lesson_experiment_bindings FOR SELECT USING (true);
DROP POLICY IF EXISTS "lesson_experiment_bindings_write" ON lesson_experiment_bindings;
CREATE POLICY "lesson_experiment_bindings_write" ON lesson_experiment_bindings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "lesson_materials_read" ON lesson_materials;
CREATE POLICY "lesson_materials_read" ON lesson_materials FOR SELECT USING (true);
DROP POLICY IF EXISTS "lesson_materials_write" ON lesson_materials;
CREATE POLICY "lesson_materials_write" ON lesson_materials FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "lab_pack_experiment_refs_read" ON lab_pack_experiment_refs;
CREATE POLICY "lab_pack_experiment_refs_read" ON lab_pack_experiment_refs FOR SELECT USING (true);
DROP POLICY IF EXISTS "lab_pack_experiment_refs_write" ON lab_pack_experiment_refs;
CREATE POLICY "lab_pack_experiment_refs_write" ON lab_pack_experiment_refs FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "ioai_bundle_experiments_read" ON ioai_bundle_experiments;
CREATE POLICY "ioai_bundle_experiments_read" ON ioai_bundle_experiments FOR SELECT USING (true);
DROP POLICY IF EXISTS "ioai_bundle_experiments_write" ON ioai_bundle_experiments;
CREATE POLICY "ioai_bundle_experiments_write" ON ioai_bundle_experiments FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "ioai_bundle_recommended_modules_read" ON ioai_bundle_recommended_modules;
CREATE POLICY "ioai_bundle_recommended_modules_read" ON ioai_bundle_recommended_modules FOR SELECT USING (true);
DROP POLICY IF EXISTS "ioai_bundle_recommended_modules_write" ON ioai_bundle_recommended_modules;
CREATE POLICY "ioai_bundle_recommended_modules_write" ON ioai_bundle_recommended_modules FOR ALL USING (true) WITH CHECK (true);

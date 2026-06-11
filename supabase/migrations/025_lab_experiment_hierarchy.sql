-- Lab pack → experiment → step hierarchy for /labs product catalog

ALTER TABLE courses_catalog
  ADD COLUMN IF NOT EXISTS materials_list JSONB NOT NULL DEFAULT '[]';

COMMENT ON COLUMN courses_catalog.materials_list IS
  'Pack-level materials checklist [{name, quantity, note, required}] for kit types';

CREATE TABLE IF NOT EXISTS lab_experiments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pack_slug TEXT NOT NULL REFERENCES courses_catalog(slug) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  purpose TEXT NOT NULL DEFAULT '',
  materials_list JSONB NOT NULL DEFAULT '[]',
  sort_order INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'live' CHECK (status IN ('live', 'draft', 'hidden')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (pack_slug, slug)
);

CREATE INDEX IF NOT EXISTS idx_lab_experiments_pack ON lab_experiments(pack_slug, sort_order);

CREATE TABLE IF NOT EXISTS lab_experiment_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  experiment_id UUID NOT NULL REFERENCES lab_experiments(id) ON DELETE CASCADE,
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
  programming_config JSONB NOT NULL DEFAULT '{}',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lab_experiment_steps_exp ON lab_experiment_steps(experiment_id, sort_order);

ALTER TABLE lab_experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_experiment_steps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "lab_experiments_read" ON lab_experiments;
CREATE POLICY "lab_experiments_read" ON lab_experiments FOR SELECT USING (true);

DROP POLICY IF EXISTS "lab_experiments_write" ON lab_experiments;
CREATE POLICY "lab_experiments_write" ON lab_experiments FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "lab_experiment_steps_read" ON lab_experiment_steps;
CREATE POLICY "lab_experiment_steps_read" ON lab_experiment_steps FOR SELECT USING (true);

DROP POLICY IF EXISTS "lab_experiment_steps_write" ON lab_experiment_steps;
CREATE POLICY "lab_experiment_steps_write" ON lab_experiment_steps FOR ALL USING (true) WITH CHECK (true);

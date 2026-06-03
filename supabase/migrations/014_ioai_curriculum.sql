-- IOAI curriculum hierarchy: course_levels → themes → modules → lessons
-- Plus user_course_access for masterclass paywall

CREATE TABLE IF NOT EXISTS course_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  emoji TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level_id UUID NOT NULL REFERENCES course_levels(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (level_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_themes_level ON themes (level_id);

CREATE TABLE IF NOT EXISTS modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_id UUID NOT NULL REFERENCES themes(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (theme_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_modules_theme ON modules (theme_id);

CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  cloudflare_video_id TEXT,
  catalog_slug TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lessons_module ON lessons (module_id);
CREATE INDEX IF NOT EXISTS idx_lessons_catalog_slug ON lessons (catalog_slug) WHERE catalog_slug IS NOT NULL;

CREATE TABLE IF NOT EXISTS user_course_access (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_scope TEXT NOT NULL DEFAULT 'ioai_masterclass',
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  source TEXT NOT NULL DEFAULT 'stripe',
  PRIMARY KEY (user_id, access_scope)
);

CREATE INDEX IF NOT EXISTS idx_user_course_access_user ON user_course_access (user_id);

-- Public read for curriculum structure (content metadata only)
ALTER TABLE course_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_course_access ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "course_levels_public_read" ON course_levels;
CREATE POLICY "course_levels_public_read" ON course_levels FOR SELECT USING (true);

DROP POLICY IF EXISTS "themes_public_read" ON themes;
CREATE POLICY "themes_public_read" ON themes FOR SELECT USING (true);

DROP POLICY IF EXISTS "modules_public_read" ON modules;
CREATE POLICY "modules_public_read" ON modules FOR SELECT USING (true);

DROP POLICY IF EXISTS "lessons_public_read" ON lessons;
CREATE POLICY "lessons_public_read" ON lessons FOR SELECT USING (true);

DROP POLICY IF EXISTS "user_course_access_select_own" ON user_course_access;
CREATE POLICY "user_course_access_select_own" ON user_course_access
  FOR SELECT USING (auth.uid() = user_id);

COMMENT ON TABLE course_levels IS 'IOAI curriculum top level (入门 / 进阶 / 竞赛)';
COMMENT ON TABLE themes IS 'Subject themes within a course level (数学 / Python / AI)';
COMMENT ON TABLE modules IS 'Module parts within a theme';
COMMENT ON TABLE lessons IS 'Individual video lessons; slug matches courses_catalog when linked';
COMMENT ON TABLE user_course_access IS 'Paid access scopes (e.g. ioai_masterclass); written by Stripe webhook';
COMMENT ON COLUMN lessons.cloudflare_video_id IS 'Cloudflare Stream video UID for signed playback';

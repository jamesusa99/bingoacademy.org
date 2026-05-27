-- Course catalogue (frontend COURSE_CATALOG) + student portfolio works
-- Run after schema.sql. Safe to re-run (IF NOT EXISTS + DROP POLICY IF EXISTS).

CREATE TABLE IF NOT EXISTS courses_catalog (
  slug TEXT PRIMARY KEY,
  line TEXT NOT NULL,
  sub TEXT,
  status TEXT DEFAULT 'live',
  delivery_type TEXT,
  featured BOOLEAN DEFAULT false,
  name TEXT NOT NULL,
  name_en TEXT,
  description TEXT,
  price TEXT,
  hours TEXT,
  badge TEXT,
  audience TEXT,
  outcomes JSONB NOT NULL DEFAULT '[]'::jsonb,
  syllabus JSONB NOT NULL DEFAULT '[]'::jsonb,
  lab_slugs JSONB NOT NULL DEFAULT '[]'::jsonb,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS portfolio_works (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  student TEXT,
  category TEXT,
  track TEXT,
  year INT,
  gradient TEXT,
  emoji TEXT,
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  blurb TEXT,
  link TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE courses_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_works ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "courses_catalog_all" ON courses_catalog;
DROP POLICY IF EXISTS "portfolio_works_all" ON portfolio_works;

CREATE POLICY "courses_catalog_all" ON courses_catalog FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "portfolio_works_all" ON portfolio_works FOR ALL USING (true) WITH CHECK (true);

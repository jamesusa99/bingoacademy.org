-- Lab & materials catalog rows bind to curriculum lessons (主题/课时)
-- One lesson → many catalog items (Training Lab, kits, etc.)

ALTER TABLE courses_catalog
  ADD COLUMN IF NOT EXISTS lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_courses_catalog_lesson_id ON courses_catalog (lesson_id);

COMMENT ON COLUMN courses_catalog.lesson_id IS 'Curriculum lesson (主题/课时); many lab/material rows may share one lesson';

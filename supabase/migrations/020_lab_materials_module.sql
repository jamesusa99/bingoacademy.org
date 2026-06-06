-- Lab & materials catalog rows bind to curriculum modules (L3 units)
-- One module → many catalog items (Training Lab, kits, etc.)

ALTER TABLE courses_catalog
  ADD COLUMN IF NOT EXISTS module_id UUID REFERENCES modules(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_courses_catalog_module_id ON courses_catalog (module_id);

COMMENT ON COLUMN courses_catalog.module_id IS 'Curriculum module (L3 unit); many lab/material rows may share one module';

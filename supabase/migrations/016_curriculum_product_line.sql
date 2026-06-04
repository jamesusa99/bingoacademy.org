-- Scope curriculum trees by product line (ioai, general, k12)

ALTER TABLE course_levels
  ADD COLUMN IF NOT EXISTS product_line TEXT NOT NULL DEFAULT 'ioai';

UPDATE course_levels SET product_line = 'ioai' WHERE product_line IS NULL OR product_line = '';

ALTER TABLE course_levels DROP CONSTRAINT IF EXISTS course_levels_slug_key;
CREATE UNIQUE INDEX IF NOT EXISTS idx_course_levels_line_slug ON course_levels (product_line, slug);
CREATE INDEX IF NOT EXISTS idx_course_levels_product_line ON course_levels (product_line);

COMMENT ON COLUMN course_levels.product_line IS 'Product line: ioai | general | k12';

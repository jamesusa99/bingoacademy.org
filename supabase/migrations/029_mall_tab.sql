-- Mall storefront tab assignment (mirrors /mall tab bar)

ALTER TABLE courses ADD COLUMN IF NOT EXISTS mall_tab TEXT;
ALTER TABLE mall_products ADD COLUMN IF NOT EXISTS mall_tab TEXT;

COMMENT ON COLUMN courses.mall_tab IS 'Mall tab: ioai | general';
COMMENT ON COLUMN mall_products.mall_tab IS 'Mall tab: ioai | general | k12 | cert | materials | lab';

UPDATE courses
SET mall_tab = 'ioai'
WHERE mall_tab IS NULL
  AND (cat = 'competition' OR badge ILIKE '%Competition%');

UPDATE courses
SET mall_tab = 'general'
WHERE mall_tab IS NULL;

UPDATE mall_products SET mall_tab = 'ioai' WHERE mall_tab IS NULL AND type = 'event';
UPDATE mall_products SET mall_tab = 'cert' WHERE mall_tab IS NULL AND type = 'cert';
UPDATE mall_products SET mall_tab = 'lab' WHERE mall_tab IS NULL AND type = 'lab';
UPDATE mall_products SET mall_tab = 'materials' WHERE mall_tab IS NULL AND type = 'material';
UPDATE mall_products SET mall_tab = 'k12' WHERE mall_tab IS NULL AND type = 'training';

-- Featured items on Mall Home flash deals

ALTER TABLE courses ADD COLUMN IF NOT EXISTS featured_home BOOLEAN DEFAULT false;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;
ALTER TABLE mall_products ADD COLUMN IF NOT EXISTS featured_home BOOLEAN DEFAULT false;

COMMENT ON COLUMN courses.featured_home IS 'Pin to Mall Home flash deals section';
COMMENT ON COLUMN mall_products.featured_home IS 'Pin to Mall Home flash deals section';

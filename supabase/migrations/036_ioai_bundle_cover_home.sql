-- Separate homepage vs courses storefront covers for IOAI stage bundles.
ALTER TABLE ioai_bundles
  ADD COLUMN IF NOT EXISTS cover_url_home TEXT;

COMMENT ON COLUMN ioai_bundles.cover_url IS 'Courses / mall card cover (2:1 crop)';
COMMENT ON COLUMN ioai_bundles.cover_url_home IS 'Homepage IOAI package card cover (4:3 crop)';

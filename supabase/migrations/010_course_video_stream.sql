-- Course catalogue video fields + link Stream assets to catalog slugs

ALTER TABLE courses_catalog
  ADD COLUMN IF NOT EXISTS video_url TEXT,
  ADD COLUMN IF NOT EXISTS video_poster TEXT,
  ADD COLUMN IF NOT EXISTS preview_seconds INT DEFAULT 90,
  ADD COLUMN IF NOT EXISTS cloudflare_uid TEXT;

CREATE INDEX IF NOT EXISTS idx_courses_catalog_cloudflare_uid
  ON courses_catalog (cloudflare_uid)
  WHERE cloudflare_uid IS NOT NULL;

ALTER TABLE video_assets
  ADD COLUMN IF NOT EXISTS catalog_slug TEXT;

CREATE INDEX IF NOT EXISTS idx_video_assets_catalog_slug
  ON video_assets (catalog_slug)
  WHERE catalog_slug IS NOT NULL;

COMMENT ON COLUMN courses_catalog.video_url IS 'HLS or MP4 playback URL (Cloudflare Stream manifest recommended)';
COMMENT ON COLUMN courses_catalog.cloudflare_uid IS 'Cloudflare Stream video UID';
COMMENT ON COLUMN video_assets.catalog_slug IS 'courses_catalog.slug this asset is assigned to';

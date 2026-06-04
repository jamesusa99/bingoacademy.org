-- Curriculum classification for video library (aligned with course management)

ALTER TABLE video_assets
  ADD COLUMN IF NOT EXISTS product_line TEXT,
  ADD COLUMN IF NOT EXISTS stage_slug TEXT,
  ADD COLUMN IF NOT EXISTS stage_title TEXT,
  ADD COLUMN IF NOT EXISTS category_slug TEXT,
  ADD COLUMN IF NOT EXISTS category_label TEXT,
  ADD COLUMN IF NOT EXISTS module_slug TEXT,
  ADD COLUMN IF NOT EXISTS module_title TEXT;

CREATE INDEX IF NOT EXISTS idx_video_assets_product_line ON video_assets (product_line);
CREATE INDEX IF NOT EXISTS idx_video_assets_curriculum ON video_assets (product_line, stage_slug, category_slug, module_slug);

COMMENT ON COLUMN video_assets.product_line IS 'ioai | general | k12 — matches course_levels.product_line';
COMMENT ON COLUMN video_assets.stage_title IS 'Human-readable 阶段 label at upload time';
COMMENT ON COLUMN video_assets.category_label IS 'Human-readable 类别 label at upload time';
COMMENT ON COLUMN video_assets.module_title IS 'Human-readable 模块 label at upload time';

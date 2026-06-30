-- Per-lesson GoLab (browser Python workspace) toggle on L4 lessons

ALTER TABLE lessons
  ADD COLUMN IF NOT EXISTS golab_enabled BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN lessons.golab_enabled IS 'When true, lesson player shows GoLab tab linking to browser Python workspace';

-- Extra fields for AI Video Courses list UI (filters, cards, hero stats)
-- Run after 007. Safe to re-run.

ALTER TABLE courses_catalog ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'ai-fundamentals';
ALTER TABLE courses_catalog ADD COLUMN IF NOT EXISTS level TEXT DEFAULT 'beginner';
ALTER TABLE courses_catalog ADD COLUMN IF NOT EXISTS lessons INT DEFAULT 12;
ALTER TABLE courses_catalog ADD COLUMN IF NOT EXISTS rating NUMERIC(3, 2) DEFAULT 4.8;
ALTER TABLE courses_catalog ADD COLUMN IF NOT EXISTS students INT DEFAULT 800;
ALTER TABLE courses_catalog ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

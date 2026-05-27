-- Extended user profile fields for admin user management
-- Run after 002_admin_platform.sql
-- Safe to re-run: ADD COLUMN IF NOT EXISTS, CREATE INDEX IF NOT EXISTS

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS member_tier TEXT DEFAULT 'free';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS locale TEXT DEFAULT 'en';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS school TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS grade TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS parent_email TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS internal_notes TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ;

-- Backfill NULLs then enforce NOT NULL (safe if already applied)
UPDATE profiles SET status = 'active' WHERE status IS NULL;
UPDATE profiles SET member_tier = 'free' WHERE member_tier IS NULL;
UPDATE profiles SET tags = '[]'::jsonb WHERE tags IS NULL;

ALTER TABLE profiles ALTER COLUMN status SET DEFAULT 'active';
ALTER TABLE profiles ALTER COLUMN status SET NOT NULL;
ALTER TABLE profiles ALTER COLUMN member_tier SET DEFAULT 'free';
ALTER TABLE profiles ALTER COLUMN member_tier SET NOT NULL;
ALTER TABLE profiles ALTER COLUMN tags SET DEFAULT '[]'::jsonb;
ALTER TABLE profiles ALTER COLUMN tags SET NOT NULL;

DO $$ BEGIN
  ALTER TABLE profiles ADD CONSTRAINT profiles_status_check
    CHECK (status IN ('active', 'suspended', 'pending'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE profiles ADD CONSTRAINT profiles_member_tier_check
    CHECK (member_tier IN ('free', 'monthly', 'quarterly', 'annual'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_member_tier ON profiles(member_tier);

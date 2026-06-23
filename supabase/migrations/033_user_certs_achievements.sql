-- User certificates & achievements (Profile → My Certificates / My Achievements)
-- Safe to re-run

CREATE TABLE IF NOT EXISTS user_certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source TEXT NOT NULL DEFAULT 'system'
    CHECK (source IN ('assessment', 'course', 'purchase', 'system')),
  title TEXT NOT NULL,
  subtitle TEXT,
  level_label TEXT,
  issuer TEXT NOT NULL DEFAULT 'Bingo AI Academy',
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  verify_code TEXT,
  href TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL DEFAULT 'course'
    CHECK (category IN ('assessment', 'course', 'lab', 'competition', 'community')),
  icon TEXT NOT NULL DEFAULT '🏅',
  title TEXT NOT NULL,
  description TEXT,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  href TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_certificates_user_issued
  ON user_certificates(user_id, issued_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user_earned
  ON user_achievements(user_id, earned_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_certificates_dedupe
  ON user_certificates(user_id, ((metadata->>'dedupe_key')))
  WHERE (metadata->>'dedupe_key') IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_achievements_dedupe
  ON user_achievements(user_id, ((metadata->>'dedupe_key')))
  WHERE (metadata->>'dedupe_key') IS NOT NULL;

ALTER TABLE user_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_certificates_select_own ON user_certificates;
CREATE POLICY user_certificates_select_own ON user_certificates
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS user_certificates_insert_own ON user_certificates;
CREATE POLICY user_certificates_insert_own ON user_certificates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS user_achievements_select_own ON user_achievements;
CREATE POLICY user_achievements_select_own ON user_achievements
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS user_achievements_insert_own ON user_achievements;
CREATE POLICY user_achievements_insert_own ON user_achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

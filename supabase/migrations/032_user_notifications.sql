-- In-app user notifications (Profile → Notifications)
-- Safe to re-run

CREATE TABLE IF NOT EXISTS user_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL DEFAULT 'system'
    CHECK (category IN ('announcement', 'order', 'course', 'community', 'system')),
  title TEXT NOT NULL,
  body TEXT,
  href TEXT,
  read_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_notifications_user_created
  ON user_notifications(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_notifications_unread
  ON user_notifications(user_id)
  WHERE read_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_notifications_dedupe
  ON user_notifications(user_id, ((metadata->>'dedupe_key')))
  WHERE (metadata->>'dedupe_key') IS NOT NULL;

ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_notifications_select_own ON user_notifications;
CREATE POLICY user_notifications_select_own ON user_notifications
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS user_notifications_update_own ON user_notifications;
CREATE POLICY user_notifications_update_own ON user_notifications
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

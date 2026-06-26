-- Persist submitted lesson in-class exercise attempts per user/lesson

CREATE TABLE IF NOT EXISTS ioai_lesson_exercise_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL,
  answers JSONB NOT NULL DEFAULT '{}',
  score INT NOT NULL DEFAULT 0,
  total_score INT NOT NULL DEFAULT 0,
  passed BOOLEAN NOT NULL DEFAULT false,
  results JSONB NOT NULL DEFAULT '[]',
  submitted_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_ioai_lesson_exercise_attempts_user
  ON ioai_lesson_exercise_attempts (user_id, lesson_id, submitted_at DESC);

ALTER TABLE ioai_lesson_exercise_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ioai_lesson_exercise_attempts_own" ON ioai_lesson_exercise_attempts;
CREATE POLICY "ioai_lesson_exercise_attempts_own" ON ioai_lesson_exercise_attempts
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

COMMENT ON TABLE ioai_lesson_exercise_attempts IS 'Latest submitted in-class exercise attempt per user and lesson';

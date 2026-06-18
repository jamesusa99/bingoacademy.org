-- IOAI lesson exercises + module graduation tests (independent question banks)

CREATE TABLE IF NOT EXISTS ioai_question_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scope_type TEXT NOT NULL CHECK (scope_type IN ('lesson', 'module')),
  scope_id UUID NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('single_choice', 'multiple_choice', 'true_false')),
  stem_html TEXT NOT NULL DEFAULT '',
  option_a_html TEXT,
  option_b_html TEXT,
  option_c_html TEXT,
  option_d_html TEXT,
  correct_answer JSONB NOT NULL,
  explanation_html TEXT DEFAULT '',
  score INT NOT NULL DEFAULT 1 CHECK (score >= 0),
  sort_order INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'live', 'offline')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ioai_questions_scope
  ON ioai_question_items (scope_type, scope_id, sort_order);

CREATE INDEX IF NOT EXISTS idx_ioai_questions_live
  ON ioai_question_items (scope_type, scope_id)
  WHERE status = 'live';

CREATE TABLE IF NOT EXISTS ioai_module_test_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id UUID NOT NULL,
  answers JSONB NOT NULL DEFAULT '{}',
  score INT NOT NULL DEFAULT 0,
  total_score INT NOT NULL DEFAULT 0,
  passed BOOLEAN NOT NULL DEFAULT false,
  submitted_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ioai_module_test_attempts_user
  ON ioai_module_test_attempts (user_id, module_id, submitted_at DESC);

ALTER TABLE ioai_question_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ioai_module_test_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ioai_question_items_read" ON ioai_question_items;
CREATE POLICY "ioai_question_items_read" ON ioai_question_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "ioai_question_items_staff" ON ioai_question_items;
CREATE POLICY "ioai_question_items_staff" ON ioai_question_items
  FOR ALL USING (public.is_admin_or_editor()) WITH CHECK (public.is_admin_or_editor());

DROP POLICY IF EXISTS "ioai_module_test_attempts_own" ON ioai_module_test_attempts;
CREATE POLICY "ioai_module_test_attempts_own" ON ioai_module_test_attempts
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

COMMENT ON TABLE ioai_question_items IS 'Lesson in-class exercises (scope_type=lesson) and module graduation tests (scope_type=module)';
COMMENT ON COLUMN ioai_question_items.correct_answer IS 'single: "A"|"B"|"C"|"D"; multiple: ["A","C"]; true_false: "A" (正确) or "B" (错误)';

-- Course enrollments (Stripe purchases, free trial sync, admin grants)

CREATE TABLE IF NOT EXISTS course_enrollments (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_slug TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'stripe' CHECK (source IN ('stripe', 'free_trial', 'admin', 'demo')),
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, course_slug)
);

CREATE INDEX IF NOT EXISTS idx_course_enrollments_user ON course_enrollments (user_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_slug ON course_enrollments (course_slug);

ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "course_enrollments_select_own" ON course_enrollments;
CREATE POLICY "course_enrollments_select_own" ON course_enrollments
  FOR SELECT USING (auth.uid() = user_id);

COMMENT ON TABLE course_enrollments IS 'Unlocked course slugs per user; written by Stripe webhook (service role)';

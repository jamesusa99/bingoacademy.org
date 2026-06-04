-- IOAI curriculum admin fields: 知识点, 内容/目标, 类别
-- Staff write policies for curriculum tables

ALTER TABLE course_levels
  ADD COLUMN IF NOT EXISTS summary TEXT;

ALTER TABLE themes
  ADD COLUMN IF NOT EXISTS category_label TEXT;

COMMENT ON COLUMN themes.category_label IS '类别 display label (e.g. 数学, Python, AI)';

ALTER TABLE modules
  ADD COLUMN IF NOT EXISTS summary TEXT;

ALTER TABLE lessons
  ADD COLUMN IF NOT EXISTS knowledge_points TEXT,
  ADD COLUMN IF NOT EXISTS content_goals TEXT;

COMMENT ON COLUMN lessons.knowledge_points IS '知识点';
COMMENT ON COLUMN lessons.content_goals IS '内容/目标';

-- Staff CRUD on curriculum tables (public read already in 014)
DO $$
DECLARE
  t text;
  tables text[] := ARRAY['course_levels', 'themes', 'modules', 'lessons'];
BEGIN
  FOREACH t IN ARRAY tables
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_insert_staff', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_update_staff', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_delete_staff', t);

    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR INSERT WITH CHECK (public.is_admin_or_editor())',
      t || '_insert_staff',
      t
    );
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR UPDATE USING (public.is_admin_or_editor()) WITH CHECK (public.is_admin_or_editor())',
      t || '_update_staff',
      t
    );
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR DELETE USING (public.is_admin_or_editor())',
      t || '_delete_staff',
      t
    );
  END LOOP;
END;
$$;

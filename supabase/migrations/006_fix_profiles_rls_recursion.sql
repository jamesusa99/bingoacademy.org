-- Fix: infinite recursion on profiles RLS (legacy "profiles_select_admin" policy)
-- Run after 005. Safe to re-run — same end state as 005 + removes bad policy.

DROP POLICY IF EXISTS "profiles_select_admin" ON profiles;

CREATE OR REPLACE FUNCTION public.is_admin_or_editor()
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'editor')
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_admin_or_editor() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_or_editor() TO anon;
GRANT EXECUTE ON FUNCTION public.is_admin_or_editor() TO service_role;

DROP POLICY IF EXISTS "profiles_admin_select_all" ON profiles;
CREATE POLICY "profiles_admin_select_all" ON profiles
  FOR SELECT
  USING (auth.uid() = id OR public.is_admin_or_editor());

DROP POLICY IF EXISTS "profiles_admin_update_all" ON profiles;
CREATE POLICY "profiles_admin_update_all" ON profiles
  FOR UPDATE
  USING (auth.uid() = id OR public.is_admin_or_editor());

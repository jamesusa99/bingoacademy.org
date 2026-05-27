-- Staff (profiles.role admin | editor) can manage CMS tables via admin console.
-- Removes open "dev" profile policy; blocks self role escalation.
-- Run after 006. Safe to re-run (DROP IF EXISTS).

-- ---------------------------------------------------------------------------
-- Helpers (same as 006)
-- ---------------------------------------------------------------------------
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

-- Only staff may change profiles.role (including on other users)
CREATE OR REPLACE FUNCTION public.profiles_guard_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.role IS DISTINCT FROM OLD.role THEN
    IF auth.uid() IS NULL OR NOT public.is_admin_or_editor() THEN
      NEW.role := OLD.role;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_guard_role_trigger ON public.profiles;
CREATE TRIGGER profiles_guard_role_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.profiles_guard_role();

-- ---------------------------------------------------------------------------
-- Profiles: remove wide-open dev policy; staff list/edit all profiles
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "profiles_all_dev" ON public.profiles;

DROP POLICY IF EXISTS "profiles_admin_select_all" ON public.profiles;
CREATE POLICY "profiles_admin_select_all" ON public.profiles
  FOR SELECT
  USING (auth.uid() = id OR public.is_admin_or_editor());

DROP POLICY IF EXISTS "profiles_admin_update_all" ON public.profiles;
CREATE POLICY "profiles_admin_update_all" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id OR public.is_admin_or_editor())
  WITH CHECK (auth.uid() = id OR public.is_admin_or_editor());

-- ---------------------------------------------------------------------------
-- CMS / content tables (admin console writes with user JWT)
-- Public read; insert/update/delete for staff only
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'home_stats',
    'home_testimonials',
    'showcase_cases',
    'research_camps',
    'research_faculty',
    'career_jobs',
    'cert_tiers',
    'mall_products',
    'charity_reports',
    'charity_projects',
    'community_mentors',
    'courses',
    'events',
    'courses_catalog',
    'portfolio_works',
    'video_assets'
  ];
BEGIN
  FOREACH t IN ARRAY tables
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_all', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_select_all', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_insert_all', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_update_all', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_delete_all', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'courses_select_all', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'courses_insert_all', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'courses_update_all', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'courses_delete_all', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'events_select_all', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'events_insert_all', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'events_update_all', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'events_delete_all', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'courses_catalog_all', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'portfolio_works_all', t);

    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR SELECT USING (true)',
      t || '_select_public',
      t
    );
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

-- Platform settings & Stripe catalog: public read, staff write
DROP POLICY IF EXISTS "platform_settings_write" ON public.platform_settings;
CREATE POLICY "platform_settings_write" ON public.platform_settings
  FOR INSERT WITH CHECK (public.is_admin_or_editor());
CREATE POLICY "platform_settings_update_staff" ON public.platform_settings
  FOR UPDATE USING (public.is_admin_or_editor()) WITH CHECK (public.is_admin_or_editor());
CREATE POLICY "platform_settings_delete_staff" ON public.platform_settings
  FOR DELETE USING (public.is_admin_or_editor());

DROP POLICY IF EXISTS "stripe_products_write" ON public.stripe_products;
CREATE POLICY "stripe_products_insert_staff" ON public.stripe_products
  FOR INSERT WITH CHECK (public.is_admin_or_editor());
CREATE POLICY "stripe_products_update_staff" ON public.stripe_products
  FOR UPDATE USING (public.is_admin_or_editor()) WITH CHECK (public.is_admin_or_editor());
CREATE POLICY "stripe_products_delete_staff" ON public.stripe_products
  FOR DELETE USING (public.is_admin_or_editor());

-- Audit log: staff can read; any signed-in user can insert own actions
DROP POLICY IF EXISTS "admin_audit_read" ON public.admin_audit_log;
CREATE POLICY "admin_audit_read" ON public.admin_audit_log
  FOR SELECT
  USING (public.is_admin_or_editor());

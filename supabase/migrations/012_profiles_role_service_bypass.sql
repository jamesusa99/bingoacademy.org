-- Fix: service role (admin API) must be able to set profiles.role on create/update.
-- Migration 009 blocked ALL role changes when auth.uid() IS NULL, which broke
-- POST /api/admin/users and PATCH role updates from the admin console.

CREATE OR REPLACE FUNCTION public.profiles_guard_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.role IS DISTINCT FROM OLD.role THEN
    -- Supabase service role / server API (no JWT subject)
    IF auth.uid() IS NULL THEN
      RETURN NEW;
    END IF;
    IF NOT public.is_admin_or_editor() THEN
      NEW.role := OLD.role;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

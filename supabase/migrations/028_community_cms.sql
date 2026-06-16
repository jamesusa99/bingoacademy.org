-- Community CMS: Scholars, Check-In, Partners (/community + /admin/community)

CREATE TABLE IF NOT EXISTS community_scholar_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  age TEXT,
  description TEXT,
  focus TEXT,
  pts INT DEFAULT 0,
  color TEXT,
  icon TEXT,
  is_highest BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS community_scholars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  grade TEXT,
  tier_slug TEXT NOT NULL,
  achievement TEXT,
  path TEXT,
  avatar TEXT,
  pts INT DEFAULT 0,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS community_checkin_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT,
  task_type TEXT,
  icon TEXT,
  title TEXT NOT NULL,
  description TEXT,
  pts INT DEFAULT 0,
  scholar_pts INT DEFAULT 0,
  exclusive BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS community_checkin_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  icon TEXT,
  title TEXT NOT NULL,
  pts INT DEFAULT 0,
  description TEXT,
  stock TEXT,
  scholar_only BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS community_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  region TEXT,
  type TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_community_scholars_tier ON community_scholars (tier_slug);
CREATE INDEX IF NOT EXISTS idx_community_scholars_sort ON community_scholars (sort_order);
CREATE INDEX IF NOT EXISTS idx_community_partners_sort ON community_partners (sort_order);

ALTER TABLE community_scholar_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_scholars ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_checkin_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_checkin_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_partners ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'community_scholar_tiers',
    'community_scholars',
    'community_checkin_tasks',
    'community_checkin_rewards',
    'community_partners'
  ];
BEGIN
  FOREACH t IN ARRAY tables
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_select_public', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_insert_staff', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_update_staff', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_delete_staff', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_all', t);

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

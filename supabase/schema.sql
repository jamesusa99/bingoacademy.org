-- Bingo Academy Admin Backend Schema
-- Run this in Supabase SQL Editor: https://app.supabase.com → SQL Editor → New query

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Courses (for Mall / Admin Courses)
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT DEFAULT 'course',
  cat TEXT,
  tag TEXT,
  price DECIMAL(10,2),
  b_price TEXT,
  sold INT DEFAULT 0,
  rating DECIMAL(2,1),
  "desc" TEXT,
  badge TEXT,
  ai_lab BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Events (for Events Center / Admin Events)
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT,
  stage TEXT,
  students TEXT,
  award TEXT,
  enrolled INT DEFAULT 0,
  whitelist BOOLEAN DEFAULT false,
  ai_course BOOLEAN DEFAULT true,
  "desc" TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Forum threads (for AI-Spark Forum / Admin Forum)
CREATE TABLE IF NOT EXISTS forum_threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT,
  author TEXT DEFAULT 'Anonymous',
  avatar TEXT,
  category TEXT DEFAULT 'Discussion',
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Forum replies
CREATE TABLE IF NOT EXISTS forum_replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID NOT NULL REFERENCES forum_threads(id) ON DELETE CASCADE,
  content TEXT,
  author TEXT DEFAULT 'Anonymous',
  avatar TEXT,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Assessment results (optional - for AI Assessment)
CREATE TABLE IF NOT EXISTS assessment_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assessment_type TEXT,
  score INT,
  total INT,
  level TEXT,
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: Enable and allow all for anon key (admin uses anon key; tighten in production)
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "courses_select_all" ON courses;
DROP POLICY IF EXISTS "courses_insert_all" ON courses;
DROP POLICY IF EXISTS "courses_update_all" ON courses;
DROP POLICY IF EXISTS "courses_delete_all" ON courses;
CREATE POLICY "courses_select_all" ON courses FOR SELECT USING (true);
CREATE POLICY "courses_insert_all" ON courses FOR INSERT WITH CHECK (true);
CREATE POLICY "courses_update_all" ON courses FOR UPDATE USING (true);
CREATE POLICY "courses_delete_all" ON courses FOR DELETE USING (true);

DROP POLICY IF EXISTS "events_select_all" ON events;
DROP POLICY IF EXISTS "events_insert_all" ON events;
DROP POLICY IF EXISTS "events_update_all" ON events;
DROP POLICY IF EXISTS "events_delete_all" ON events;
CREATE POLICY "events_select_all" ON events FOR SELECT USING (true);
CREATE POLICY "events_insert_all" ON events FOR INSERT WITH CHECK (true);
CREATE POLICY "events_update_all" ON events FOR UPDATE USING (true);
CREATE POLICY "events_delete_all" ON events FOR DELETE USING (true);

DROP POLICY IF EXISTS "forum_threads_select_all" ON forum_threads;
DROP POLICY IF EXISTS "forum_threads_insert_all" ON forum_threads;
DROP POLICY IF EXISTS "forum_threads_update_all" ON forum_threads;
DROP POLICY IF EXISTS "forum_threads_delete_all" ON forum_threads;
CREATE POLICY "forum_threads_select_all" ON forum_threads FOR SELECT USING (true);
CREATE POLICY "forum_threads_insert_all" ON forum_threads FOR INSERT WITH CHECK (true);
CREATE POLICY "forum_threads_update_all" ON forum_threads FOR UPDATE USING (true);
CREATE POLICY "forum_threads_delete_all" ON forum_threads FOR DELETE USING (true);

DROP POLICY IF EXISTS "forum_replies_select_all" ON forum_replies;
DROP POLICY IF EXISTS "forum_replies_insert_all" ON forum_replies;
DROP POLICY IF EXISTS "forum_replies_update_all" ON forum_replies;
DROP POLICY IF EXISTS "forum_replies_delete_all" ON forum_replies;
CREATE POLICY "forum_replies_select_all" ON forum_replies FOR SELECT USING (true);
CREATE POLICY "forum_replies_insert_all" ON forum_replies FOR INSERT WITH CHECK (true);
CREATE POLICY "forum_replies_update_all" ON forum_replies FOR UPDATE USING (true);
CREATE POLICY "forum_replies_delete_all" ON forum_replies FOR DELETE USING (true);

DROP POLICY IF EXISTS "assessment_results_select_all" ON assessment_results;
DROP POLICY IF EXISTS "assessment_results_insert_all" ON assessment_results;
CREATE POLICY "assessment_results_select_all" ON assessment_results FOR SELECT USING (true);
CREATE POLICY "assessment_results_insert_all" ON assessment_results FOR INSERT WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════════════════
-- AI Era Portal (Home)
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS home_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  icon TEXT,
  value TEXT NOT NULL,
  label TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS home_testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT,
  stars INT DEFAULT 5,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Achievements (Showcase)
CREATE TABLE IF NOT EXISTS showcase_cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "type" TEXT NOT NULL,
  student TEXT,
  org TEXT,
  grade TEXT,
  region TEXT,
  "role" TEXT,
  pain TEXT,
  path TEXT,
  solution TEXT,
  result TEXT NOT NULL,
  detail TEXT,
  improvement TEXT[],
  tags TEXT[],
  duration TEXT,
  months INT,
  timeline TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- AI Camp (Research)
CREATE TABLE IF NOT EXISTS research_camps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  age TEXT,
  icon TEXT,
  direction TEXT,
  core TEXT,
  highlight TEXT,
  outcome TEXT,
  ratio TEXT,
  competition TEXT,
  price TEXT,
  weeks TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS research_faculty (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  team TEXT,
  area TEXT,
  exp TEXT,
  philosophy TEXT,
  "type" TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Smart Careers
CREATE TABLE IF NOT EXISTS career_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  company TEXT,
  level TEXT,
  salary TEXT,
  location TEXT,
  skill TEXT,
  course_linked BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Certification
CREATE TABLE IF NOT EXISTS cert_tiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tier_id TEXT UNIQUE,
  stars TEXT,
  name TEXT NOT NULL,
  chinese TEXT,
  color TEXT,
  bg TEXT,
  border TEXT,
  inst TEXT,
  teacher TEXT,
  learner TEXT,
  weeks TEXT,
  courses JSONB DEFAULT '[]',
  criteria TEXT,
  benefits JSONB DEFAULT '[]',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- AI Mall (products: cert/material/lab/training/event)
CREATE TABLE IF NOT EXISTS mall_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  "type" TEXT NOT NULL,
  tag TEXT,
  price DECIMAL(10,2),
  b_price TEXT,
  "desc" TEXT,
  deadline TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Honors & Charity
CREATE TABLE IF NOT EXISTS charity_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "type" TEXT NOT NULL,
  text TEXT NOT NULL,
  report_date TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS charity_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  "desc" TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- AI Community mentors
CREATE TABLE IF NOT EXISTS community_mentors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  title TEXT,
  photo TEXT,
  tag TEXT,
  intro TEXT,
  awards TEXT,
  "type" TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for new tables
ALTER TABLE home_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE home_testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE showcase_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_camps ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE cert_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE mall_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE charity_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE charity_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_mentors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "home_stats_all" ON home_stats FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "home_testimonials_all" ON home_testimonials FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "showcase_cases_all" ON showcase_cases FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "research_camps_all" ON research_camps FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "research_faculty_all" ON research_faculty FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "career_jobs_all" ON career_jobs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "cert_tiers_all" ON cert_tiers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "mall_products_all" ON mall_products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "charity_reports_all" ON charity_reports FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "charity_projects_all" ON charity_projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "community_mentors_all" ON community_mentors FOR ALL USING (true) WITH CHECK (true);

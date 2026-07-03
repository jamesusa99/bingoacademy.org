-- News / SEO articles — public CMS (admin-editable)

CREATE TABLE IF NOT EXISTS news_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT,
  body TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'curriculum',
  keywords TEXT[] NOT NULL DEFAULT '{}',
  published_at DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'live', 'hidden')),
  sort_order INT NOT NULL DEFAULT 0,
  og_image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_news_articles_status_published
  ON news_articles (status, published_at DESC);

CREATE INDEX IF NOT EXISTS idx_news_articles_category
  ON news_articles (category);

ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS news_articles_select_public ON news_articles;
DROP POLICY IF EXISTS news_articles_select_staff ON news_articles;
DROP POLICY IF EXISTS news_articles_insert_staff ON news_articles;
DROP POLICY IF EXISTS news_articles_update_staff ON news_articles;
DROP POLICY IF EXISTS news_articles_delete_staff ON news_articles;

CREATE POLICY news_articles_select_public ON news_articles
  FOR SELECT USING (status = 'live');

CREATE POLICY news_articles_select_staff ON news_articles
  FOR SELECT USING (public.is_admin_or_editor());

CREATE POLICY news_articles_insert_staff ON news_articles
  FOR INSERT WITH CHECK (public.is_admin_or_editor());

CREATE POLICY news_articles_update_staff ON news_articles
  FOR UPDATE USING (public.is_admin_or_editor()) WITH CHECK (public.is_admin_or_editor());

CREATE POLICY news_articles_delete_staff ON news_articles
  FOR DELETE USING (public.is_admin_or_editor());

-- Seed initial SEO articles (skip if slug already exists)
INSERT INTO news_articles (slug, title, excerpt, body, category, keywords, published_at, status, sort_order)
VALUES
(
  'ai-classes-for-kids-guide-2026',
  'AI Classes for Kids: A Parent''s Guide to Choosing the Right Program',
  'What to look for in AI classes for kids — project-based learning, real Python, and pathways to competitions like IOAI and USAAIO.',
  $$Parents searching for **AI classes for kids** often find programs that only teach how to use chatbots. BingoAcademy takes a different approach: students learn artificial intelligence for children through hands-on projects — building models, writing Python, and exploring computer vision in the browser.

Our **AI course for teens** (grades 7–12) integrates mathematics, programming, and machine learning so learners understand *why* AI works. Free browser labs like AI Cyber Tennis let families try before enrolling.

**Key takeaway:** Look for AI coding classes that include lesson plans, autograded labs, and optional competition prep — not just slide decks.$$,
  'parents',
  ARRAY['AI classes for kids', 'AI course for teens', 'STEM Education'],
  '2026-03-15',
  'live',
  0
),
(
  'usaaio-prep-course-overview',
  'USAAIO Prep Course: What Families Need to Know',
  'How high school students prepare for the United States Artificial Intelligence Olympiad with structured curriculum and mock exams.',
  $$The **USAAIO prep course** pathway at BingoAcademy aligns with the mathematical and algorithmic rigor of the United States Artificial Intelligence Olympiad. Students progress from Python foundations through linear algebra, machine learning, and **AI Olympiad training for teens** with competition-style problem sets.

Outstanding performers may continue toward IAIO and **IOAI** international stages. Our **USAAIO curriculum** mirrors university-level CS while remaining accessible to motivated 7th–12th graders.

Book a free AI competition assessment to see if your child is ready for **high school AI competition prep**.$$,
  'competition',
  ARRAY['USAAIO prep course', 'AI Olympiad training for teens', 'High school AI competition prep'],
  '2026-03-10',
  'live',
  1
),
(
  'machine-learning-high-school-syllabus',
  'Machine Learning for High School: Syllabus That Goes Beyond AP CS',
  'Why machine learning for high school students should include math, projects, and real models — not API tutorials alone.',
  $$A serious **machine learning course for high school** covers more than importing libraries. BingoAcademy students learn **deep learning for teens** fundamentals: tensors, loss functions, and **computer vision classes for students** built from scratch in Jupyter.

This **project-based AI learning for teens** approach produces portfolio artifacts — GitHub repos, lab reports, and competition submissions — that strengthen **computer science extracurriculars high school** profiles for top universities.$$,
  'curriculum',
  ARRAY['Machine learning course for high school', 'Deep learning for teens', 'AP Computer Science A advanced alternatives'],
  '2026-03-05',
  'live',
  2
),
(
  'ai-classroom-activities-k12',
  '10 AI Classroom Activities That Actually Teach How AI Works',
  'Free and premium AI classroom activities for K-12 — from doodle classifiers to pose-tracking games.',
  $$Teachers need **AI teaching resources** that work in 45-minute blocks. Our **AI Exploration Lab** offers free **AI classroom activities**: object detection games, word embeddings, and embodied AI sports — no install required.

For structured **AI lesson plans**, the IOAI curriculum provides video lessons, GoLab Python workspaces, and autograded checkpoints. Perfect for **K12 AI Education** pilots and gifted programs.$$,
  'classroom',
  ARRAY['AI classroom activities', 'AI lesson plans', 'AI teaching resources'],
  '2026-02-28',
  'live',
  3
),
(
  'ai-summer-camp-online-2026',
  'AI Summer Camp 2026: Live Online Intensives for Teens',
  'Project-based AI summer camp sessions with live mentors, portfolio projects, and competition pathways.',
  $$Our **AI summer camp** format combines live online classes with asynchronous labs. Students ages 13–18 build real AI projects while preparing for **USAAIO** and **IOAI** seasons.

Unlike generic **AI coding classes**, each cohort follows the Vision–Understanding–Action framework: perception, reasoning, and action in hardware and simulation.$$,
  'curriculum',
  ARRAY['AI summer camp', 'AI coding classes', 'AI for Teens'],
  '2026-02-20',
  'live',
  4
),
(
  'how-to-prepare-usaaio',
  'How to Prepare for USAAIO: A Step-by-Step Roadmap',
  'From Python basics to Olympiad-style problems — a practical timeline for USAAIO preparation.',
  $$**How to prepare for USAAIO** starts with strong Python and **math for AI** foundations. Month 1–2: lists, NumPy, and basic ML. Month 3–4: **AI math competition prep** with linear algebra drills. Month 5+: timed mock exams and **USAAIO curriculum** review.

BingoAcademy''s free assessment maps your child to the right starting module.$$,
  'competition',
  ARRAY['How to prepare for USAAIO', 'USAAIO curriculum', 'AI math competition prep'],
  '2026-02-12',
  'live',
  5
),
(
  'best-ai-coding-classes-7-12',
  'Best AI Coding Classes for 7–12 Graders in 2026',
  'Comparing project-based AI programs for middle and high school — what elite families look for.',
  $$The **best AI coding classes for 7–12 graders** combine accessibility with depth. Beginners need zero-setup browser labs; advanced learners need **research-level AI projects for teens** and **Ivy league STEM prep programs** alignment.

BingoAcademy serves both with a single progression: Exploration Lab → IOAI Masterclass → **USAAIO prep course**.$$,
  'parents',
  ARRAY['Best AI coding classes for 7-12 graders', 'Advanced coding programs for gifted students', 'Elite STEM courses for high school'],
  '2026-02-01',
  'live',
  6
),
(
  'ioai-competition-training-update',
  'IOAI 2026: Updated Competition Training Modules',
  'New IOAI-aligned modules for computer vision, NLP, and lab report writing.',
  $$BingoAcademy released updated **IOAI** training modules covering selection-round lab reports, defence presentations, and reproducible Jupyter pipelines. Students preparing for the International Olympiad in Artificial Intelligence (IOAI) now have dedicated mock defence rubrics and mentor feedback loops.$$,
  'competition',
  ARRAY['IOAI', 'AI Competitions', 'International Olympiad in Artificial Intelligence'],
  '2026-01-22',
  'live',
  7
)
ON CONFLICT (slug) DO NOTHING;

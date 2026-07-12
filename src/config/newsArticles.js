/** Static news / insights — SEO freshness & keyword targeting */

export const NEWS_CATEGORIES = [
  { id: 'curriculum', label: 'Curriculum' },
  { id: 'competition', label: 'Competition' },
  { id: 'parents', label: 'For Parents' },
  { id: 'classroom', label: 'Classroom' },
]

export const NEWS_ARTICLES_FALLBACK = [
  {
    slug: 'ai-classes-for-kids-guide-2026',
    title: 'AI Classes for Kids: A Parent’s Guide to Choosing the Right Program',
    excerpt:
      'What to look for in AI classes for kids — project-based learning, real Python, and pathways to competitions like IOAI and USAAIO.',
    date: '2026-03-15',
    updatedAt: '2026-03-15',
    authorSlug: 'shuang-wang',
    category: 'parents',
    keywords: ['AI classes for kids', 'AI course for teens', 'STEM Education'],
    body: `Parents searching for **AI classes for kids** often find programs that only teach how to use chatbots. BingoAcademy takes a different approach: students learn artificial intelligence for children through hands-on projects — building models, writing Python, and exploring computer vision in the browser.

Our **AI course for teens** (grades 7–12) integrates mathematics, programming, and machine learning so learners understand *why* AI works. Free browser labs like AI Cyber Tennis let families try before enrolling.

**Key takeaway:** Look for AI coding classes that include lesson plans, autograded labs, and optional competition prep — not just slide decks.`,
  },
  {
    slug: 'usaaio-prep-course-overview',
    title: 'USAAIO Prep Course: What Families Need to Know',
    excerpt:
      'How high school students prepare for the United States Artificial Intelligence Olympiad with structured curriculum and mock exams.',
    date: '2026-03-10',
    category: 'competition',
    keywords: ['USAAIO prep course', 'AI Olympiad training for teens', 'High school AI competition prep'],
    body: `The **USAAIO prep course** pathway at BingoAcademy aligns with the mathematical and algorithmic rigor of the United States Artificial Intelligence Olympiad. Students progress from Python foundations through linear algebra, machine learning, and **AI Olympiad training for teens** with competition-style problem sets.

Outstanding performers may continue toward IAIO and **IOAI** international stages. Our **USAAIO curriculum** mirrors university-level CS while remaining accessible to motivated 7th–12th graders.

Book a free AI competition assessment to see if your child is ready for **high school AI competition prep**.`,
  },
  {
    slug: 'machine-learning-high-school-syllabus',
    title: 'Machine Learning for High School: Syllabus That Goes Beyond AP CS',
    excerpt:
      'Why machine learning for high school students should include math, projects, and real models — not API tutorials alone.',
    date: '2026-03-05',
    category: 'curriculum',
    keywords: ['Machine learning course for high school', 'Deep learning for teens', 'AP Computer Science A advanced alternatives'],
    body: `A serious **machine learning course for high school** covers more than importing libraries. BingoAcademy students learn **deep learning for teens** fundamentals: tensors, loss functions, and **computer vision classes for students** built from scratch in Jupyter.

This **project-based AI learning for teens** approach produces portfolio artifacts — GitHub repos, lab reports, and competition submissions — that strengthen **computer science extracurriculars high school** profiles for top universities.`,
  },
  {
    slug: 'ai-classroom-activities-k12',
    title: '10 AI Classroom Activities That Actually Teach How AI Works',
    excerpt:
      'Free and premium AI classroom activities for K-12 — from doodle classifiers to pose-tracking games.',
    date: '2026-02-28',
    category: 'classroom',
    keywords: ['AI classroom activities', 'AI lesson plans', 'AI teaching resources'],
    body: `Teachers need **AI teaching resources** that work in 45-minute blocks. Our **AI Exploration Lab** offers free **AI classroom activities**: object detection games, word embeddings, and embodied AI sports — no install required.

For structured **AI lesson plans**, the IOAI curriculum provides video lessons, GoLab Python workspaces, and autograded checkpoints. Perfect for **K12 AI Education** pilots and gifted programs.`,
  },
  {
    slug: 'ai-summer-camp-online-2026',
    title: 'AI Summer Camp 2026: Live Online Intensives for Teens',
    excerpt:
      'Project-based AI summer camp sessions with live mentors, portfolio projects, and competition pathways.',
    date: '2026-02-20',
    category: 'curriculum',
    keywords: ['AI summer camp', 'AI coding classes', 'AI for Teens'],
    body: `Our **AI summer camp** format combines live online classes with asynchronous labs. Students ages 13–18 build real AI projects while preparing for **USAAIO** and **IOAI** seasons.

Unlike generic **AI coding classes**, each cohort follows the Vision–Understanding–Action framework: perception, reasoning, and action in hardware and simulation.`,
  },
  {
    slug: 'how-to-prepare-usaaio',
    title: 'How to Prepare for USAAIO: A Step-by-Step Roadmap',
    excerpt:
      'From Python basics to Olympiad-style problems — a practical timeline for USAAIO preparation.',
    date: '2026-02-12',
    category: 'competition',
    keywords: ['How to prepare for USAAIO', 'USAAIO curriculum', 'AI math competition prep'],
    body: `**How to prepare for USAAIO** starts with strong Python and **math for AI** foundations. Month 1–2: lists, NumPy, and basic ML. Month 3–4: **AI math competition prep** with linear algebra drills. Month 5+: timed mock exams and **USAAIO curriculum** review.

BingoAcademy’s free assessment maps your child to the right starting module.`,
  },
  {
    slug: 'best-ai-coding-classes-7-12',
    title: 'Best AI Coding Classes for 7–12 Graders in 2026',
    excerpt:
      'Comparing project-based AI programs for middle and high school — what elite families look for.',
    date: '2026-02-01',
    category: 'parents',
    keywords: ['Best AI coding classes for 7-12 graders', 'Advanced coding programs for gifted students', 'Elite STEM courses for high school'],
    body: `The **best AI coding classes for 7–12 graders** combine accessibility with depth. Beginners need zero-setup browser labs; advanced learners need **research-level AI projects for teens** and **Ivy league STEM prep programs** alignment.

BingoAcademy serves both with a single progression: Exploration Lab → IOAI Masterclass → **USAAIO prep course**.`,
  },
  {
    slug: 'ioai-competition-training-update',
    title: 'IOAI 2026: Updated Competition Training Modules',
    excerpt:
      'New IOAI-aligned modules for computer vision, NLP, and lab report writing.',
    date: '2026-01-22',
    category: 'competition',
    keywords: ['IOAI', 'AI Competitions', 'International Olympiad in Artificial Intelligence'],
    body: `BingoAcademy released updated **IOAI** training modules covering selection-round lab reports, defence presentations, and reproducible Jupyter pipelines. Students preparing for the International Olympiad in Artificial Intelligence (IOAI) now have dedicated mock defence rubrics and mentor feedback loops.`,
  },
]

export function getNewsArticle(slug) {
  return NEWS_ARTICLES_FALLBACK.find((a) => a.slug === slug) || null
}

export function getNewsByCategory(categoryId) {
  if (!categoryId || categoryId === 'all') return NEWS_ARTICLES_FALLBACK
  return NEWS_ARTICLES_FALLBACK.filter((a) => a.category === categoryId)
}

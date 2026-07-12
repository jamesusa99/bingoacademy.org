/**
 * Versioned GEO knowledge articles — unique, expert-sourced, citable.
 * Do not spin keyword variations; each page answers one decision intent.
 */

const SHARED_REVIEWER = 'Bingo Academy Academic Review Board'

export const GUIDE_ARTICLES = [
  // ── Parent decision cluster ──────────────────────────────────────────
  {
    cluster: 'parents',
    slug: 'math-and-coding-readiness',
    version: '2026.1',
    updatedAt: '2026-03-01',
    author: 'Bingo Academy Parent Education Team',
    authorSlug: 'wenyi-wang',
    reviewer: SHARED_REVIEWER,
    title: 'Math & Coding Readiness Before Your Child Starts AI',
    excerpt:
      'What numeracy, logic, and typing skills students need before AI courses — and what can be learned inside the program.',
    references: [
      { label: 'IOAI Foundations pathway', href: '/guides/ioai/skill-map' },
      { label: 'Free placement assessment', href: '/assessment' },
    ],
    relatedCourses: [{ label: 'Foundations of AI', href: '/courses/foundations' }],
    body: `Most students ages **10+** can begin AI literacy if they are comfortable with fractions, coordinates, and following multi-step instructions. You do **not** need prior Python — but keyboard fluency (15+ wpm) saves frustration in Jupyter labs.

**Recommended baseline**
- Ages 8–10: unplugged logic games, Scratch-style sequencing, no algebra required
- Ages 11–13: integers, ratios, basic graphs; optional Scratch or block coding
- Ages 14+: intro algebra, functions, comfortable with variables

**Inside Bingo Academy** the IOAI Explorer stage teaches Python from first principles. If your child struggles with typing, pair short daily practice (10 min) with our browser labs that do not require code.

**Red flag:** Programs that only demonstrate chatbot prompts without notebooks or datasets rarely build transferable skills.`,
  },
  {
    cluster: 'parents',
    slug: 'age-appropriate-ai-projects',
    version: '2026.1',
    updatedAt: '2026-03-01',
    author: 'Bingo Academy Parent Education Team',
    authorSlug: 'wenyi-wang',
    reviewer: SHARED_REVIEWER,
    title: 'Age-Appropriate AI Projects by Grade Band',
    excerpt:
      'Concrete project types that match cognitive load — from pose-tracking games to competition lab reports.',
    references: [
      { label: 'AI Exploration Lab', href: '/exploration' },
      { label: 'K–12 curriculum map', href: '/guides/k12/curriculum-map' },
    ],
    body: `| Grade band | Suitable projects | Avoid |
|------------|-------------------|-------|
| 3–5 | Browser CV games, doodle classifiers, unplugged sorting | Training large models, open-ended LLM jailbreaks |
| 6–8 | Word embeddings viz, small datasets, team robotics demos | Unsupervised deployment to production |
| 9–12 | Jupyter ML pipelines, competition notebooks, defence slides | Copy-paste API tutorials without math |

**Bingo Academy mapping:** Free exploration labs (pose, embeddings, classifiers) map to grades 3–8. IOAI modules and USAAIO prep target grades 7–12 with scaffolded math.

Projects should produce **artifacts**: saved notebook, labelled dataset, or 2-minute demo video — not only a screenshot of a chat reply.`,
  },
  {
    cluster: 'parents',
    slug: 'spot-prompt-only-courses',
    version: '2026.1',
    updatedAt: '2026-03-01',
    author: 'Bingo Academy Parent Education Team',
    authorSlug: 'wenyi-wang',
    reviewer: SHARED_REVIEWER,
    title: 'How to Spot “Prompt-Only” AI Courses',
    excerpt:
      'Six audit questions to tell real AI literacy from chatbot tourism.',
    references: [{ label: 'Compare programs', href: '/compare' }],
    body: `Ask these before enrolling:

1. **Do students write code?** Look for Python notebooks, not only pre-built widgets.
2. **Is there a dataset?** Real ML requires labelled examples students can inspect.
3. **Can you see failure modes?** Overfitting demos (e.g., doodle classifiers) teach more than perfect demos.
4. **Are assessments autograded?** Quizzes on concepts + lab checkpoints beat self-reported completion.
5. **Is there a competition or portfolio outcome?** IOAI-style reports reveal depth.
6. **Who authored the curriculum?** Professor-led syllabi list learning objectives per lesson.

Bingo Academy publishes lesson objectives, knowledge points, and trial lessons on module pages. If a provider cannot show a syllabus anchor list, treat it as enrichment — not foundations.`,
  },
  {
    cluster: 'parents',
    slug: 'camera-privacy-kids',
    version: '2026.1',
    updatedAt: '2026-03-01',
    author: 'Bingo Academy Trust & Safety Team',
    reviewer: SHARED_REVIEWER,
    title: 'Camera, Privacy & Data Safety in Kids’ AI Labs',
    excerpt:
      'How browser vision labs handle webcam data, what leaves the device, and parental controls.',
    references: [
      { label: 'Privacy policy', href: '/privacy' },
      { label: 'Hide & Seek lab safety notes', href: '/exploration/hide-and-seek' },
    ],
    body: `**Browser exploration labs** (AI Cyber Tennis, Hide & Seek, Virtual Conductor) run pose and object models **locally in the browser** via TensorFlow.js / MoveNet. Video frames are not uploaded to Bingo Academy servers for these free labs.

**Practices we recommend**
- Use a desk stand; avoid background family photos in frame
- Supervise under-13 users per your household rules
- Revoke camera permission in browser settings after sessions

**Account-based courses** store progress and uploaded project files under your login. See [/privacy](/privacy) for retention and deletion requests.

**School deployments** add FERPA-aware DPAs — contact [/community/partners](/community/partners).`,
  },
  {
    cluster: 'parents',
    slug: 'ai-vs-coding-vs-robotics',
    version: '2026.1',
    updatedAt: '2026-03-01',
    author: 'Bingo Academy Parent Education Team',
    authorSlug: 'wenyi-wang',
    reviewer: SHARED_REVIEWER,
    title: 'AI Course vs Coding Course vs Robotics — What Is the Difference?',
    excerpt:
      'How project goals, tools, and outcomes differ across the three labels schools and camps use.',
    references: [{ label: 'Industrial stack we teach', href: '/' }],
    body: `| Dimension | Coding course | Robotics | AI course (Bingo) |
|-----------|---------------|----------|-------------------|
| Core skill | Syntax, APIs, apps | Mechanics, sensors, teamwork | Data, models, evaluation |
| Typical tool | IDE, web frameworks | Kits, Arduino/LEGO | Python, Jupyter, TF.js |
| Assessment | Build a feature | Competition heat | Lab report + model metrics |
| Career link | Software engineering | Mechatronics | ML research & IOAI |

Many camps mix labels. A course that only drags blocks without datasets is still **coding**, not AI. Bingo Academy AI courses require hypothesis → experiment → metric → reflection — the same loop as IOAI selection rounds.`,
  },
  {
    cluster: 'parents',
    slug: 'evaluate-project-outcomes',
    version: '2026.1',
    updatedAt: '2026-03-01',
    author: 'Bingo Academy Parent Education Team',
    authorSlug: 'wenyi-wang',
    reviewer: SHARED_REVIEWER,
    title: 'How Parents Can Evaluate Project-Based Learning Outcomes',
    excerpt:
      'A simple rubric: reproducibility, documentation, and defence readiness.',
    references: [
      { label: 'Scoring rubrics (evidence)', href: '/guides/evidence' },
      { label: 'Student showcase', href: '/showcase/works' },
    ],
    body: `Score your child's capstone 1–4 on each dimension:

1. **Reproducibility** — Can another student rerun the notebook and get similar metrics?
2. **Data documentation** — Source, size, label rules, and known bias stated?
3. **Model reasoning** — Why this algorithm? What failed first?
4. **Communication** — 3-minute demo or written report with figures?

**Bingo Academy** templates match IOAI defence slides. Strong outcomes include error analysis — not only highest accuracy.

Ask your child to explain one failure case. If they can, the project is likely real learning.`,
  },

  // ── IOAI / USAAIO cluster ────────────────────────────────────────────
  {
    cluster: 'ioai',
    slug: 'competition-map',
    version: '2026.1',
    updatedAt: '2026-03-01',
    author: 'Bingo Academy IOAI Curriculum Team',
    reviewer: SHARED_REVIEWER,
    title: 'IOAI, USAAIO, IAIO — Competition Map & Qualification Flow',
    excerpt:
      'How regional and international AI olympiads relate, with official source links.',
    references: [
      { label: 'IOAI official site', href: 'https://ioai-official.org', external: true },
      { label: 'USAAIO information', href: 'https://www.usaaio.org', external: true },
    ],
    body: `**Typical progression (high school)**
1. **USAAIO** — United States national selection pathway; strong math + ML focus
2. **IAIO** — International AI Olympiad (invitational / national delegation)
3. **IOAI** — International Olympiad in Artificial Intelligence (whitelist format)

Exact eligibility rules change annually. Always confirm on official sites before planning travel.

**Bingo Academy role:** Training aligned to IOAI-style written exams, lab tasks, and project defence — not a replacement for official registration.`,
  },
  {
    cluster: 'ioai',
    slug: 'syllabus-module-mapping',
    version: '2026.1',
    updatedAt: '2026-03-01',
    author: 'Bingo Academy IOAI Curriculum Team',
    authorSlug: 'feng-xu',
    reviewer: SHARED_REVIEWER,
    title: 'Official IOAI Skills → Bingo Academy Module Mapping',
    excerpt:
      'Transparent map between competition skill areas and our IOAI course modules.',
    references: [
      { label: 'IOAI course catalog', href: '/courses/ioai' },
      { label: 'Curriculum navigator', href: '/curriculum' },
    ],
    relatedCourses: [{ label: 'IOAI training modules', href: '/courses/ioai' }],
    body: `| IOAI skill area | Bingo module stage | Evidence |
|-----------------|-------------------|----------|
| Python & data literacy | AI Explorer | Notebooks, pandas drills |
| Classical ML | AI Builder | sklearn pipelines, CV baselines |
| Deep learning & deployment | AI Engineer | PyTorch intro, CNN labs |
| Written exam practice | Mock assessments | Timed quizzes in /assessment |
| Lab report & defence | Training lab + capstone | Report template, mock Q&A |

Modules update when IOAI publishes new sample tasks. Check version footer on this page.`,
  },
  {
    cluster: 'ioai',
    slug: 'skill-map',
    version: '2026.1',
    updatedAt: '2026-03-01',
    author: 'Bingo Academy IOAI Curriculum Team',
    reviewer: SHARED_REVIEWER,
    title: 'IOAI Skill Map — What to Learn and When',
    excerpt:
      'Competition-aligned skills from arithmetic fluency to neural network training.',
    references: [{ label: 'Free assessment', href: '/assessment' }],
    body: `**Tier 0 — Readiness:** typing, logical word problems, curiosity about data

**Tier 1 — Explorer:** Python syntax, NumPy, plotting, intro probability

**Tier 2 — Builder:** regression, classification, train/val split, metric selection

**Tier 3 — Engineer:** CNNs, regularization, error analysis, simple deployment story

**Tier 4 — Competition:** timed mixed exams, open-ended lab with written defence

Students with AMC 10 comfort often start Tier 1 at grade 7–8. Others begin browser labs first, then join Explorer.`,
  },
  {
    cluster: 'ioai',
    slug: 'preparation-routes',
    version: '2026.1',
    updatedAt: '2026-03-01',
    author: 'Bingo Academy IOAI Curriculum Team',
    reviewer: SHARED_REVIEWER,
    title: 'Preparation Routes by Starting Level',
    excerpt:
      'Three documented pathways: zero background, coding-only, and competition returnees.',
    references: [{ label: 'USAAIO prep landing', href: '/usaaio-prep' }],
    body: `**Route A — Zero AI background (6–9 months):** Exploration labs → IOAI Explorer modules → Builder → mock assessment

**Route B — Knows Python, no ML (4–6 months):** Skip to Builder modules → Engineer → training lab intensive

**Route C — Returning competitor (2–4 months):** Mock exams → weak-area modules → defence rehearsal with mentor feedback

Book [/assessment](/assessment) for placement. Routes assume 4–6 hours/week; training-lab camps add intensive blocks before season peaks.`,
  },
  {
    cluster: 'ioai',
    slug: 'mock-assessment-rubric',
    version: '2026.1',
    updatedAt: '2026-03-01',
    author: 'Bingo Academy Assessment Team',
    authorSlug: 'jianwen-chen',
    reviewer: SHARED_REVIEWER,
    title: 'Mock Assessment Scoring Rules & Methods',
    excerpt:
      'How Bingo Academy mock exams are scored and how to read the feedback report.',
    references: [
      { label: 'Take a mock exam', href: '/assessment' },
      { label: 'Rubric evidence', href: '/guides/evidence' },
    ],
    body: `**Written sections:** Multiple-choice and short-answer items map to published lesson objectives. Partial credit on show-work problems.

**Lab sections:** Autograded where possible (unit tests on notebook cells); open-ended segments use rubric bands: Reproducibility (25%), Analysis (35%), Communication (25%), Safety/ethics (15%).

**Reports include:** percentile vs. cohort, skill tags missed, recommended modules. Scores are practice signals — not official IOAI results.`,
  },
  {
    cluster: 'ioai',
    slug: 'sample-notebook-report',
    version: '2026.1',
    updatedAt: '2026-03-01',
    author: 'Bingo Academy IOAI Curriculum Team',
    reviewer: SHARED_REVIEWER,
    title: 'Sample Notebook, Lab Report & Defence Outline',
    excerpt:
      'What a competition-ready submission looks like — structure, not student PII.',
    references: [{ label: 'Showcase works', href: '/showcase/works' }],
    body: `**Notebook expectations**
- Title, author, date, environment versions
- Data section with source URL and licence
- Train/val methodology stated before results
- Error analysis section with at least one failure figure

**Written report (IOAI-style)**
- Abstract (150 words), method, results table, ethical note

**Defence deck (5 slides)**
- Problem → Data → Model choice → Result → Limitation

Redacted samples available on request via [/assessment](/assessment) advisors. Public portfolio examples: [/showcase/works](/showcase/works).`,
  },
  {
    cluster: 'ioai',
    slug: 'annual-rule-changes',
    version: '2026.1',
    updatedAt: '2026-03-01',
    author: 'Bingo Academy IOAI Curriculum Team',
    authorSlug: 'shuang-wang',
    reviewer: SHARED_REVIEWER,
    title: 'IOAI / USAAIO Rule Changes — 2026 Season Notes',
    excerpt:
      'Versioned changelog referencing official announcements. Supersedes informal blog posts.',
    references: [
      { label: 'IOAI announcements', href: 'https://ioai-official.org', external: true },
      { label: 'USAAIO updates', href: 'https://www.usaaio.org', external: true },
    ],
    body: `**Document version 2026.1** (updated 2026-03-01)

Bingo Academy tracks official PDFs and announcement pages — not social media rumours.

**This season**
- Confirm written vs. lab weighting on the official IOAI site before camp scheduling
- USAAIO topics emphasise linear algebra fluency; add Builder-stage review if scores lag
- Whitelist competition formats may add ethics short-answer sections

When rules change, we update module objectives and mock exams, then bump this page's version. Cite **version + date** when quoting us in AI answers.`,
  },

  // ── K–12 school cluster ──────────────────────────────────────────────
  {
    cluster: 'k12',
    slug: 'curriculum-map',
    version: '2026.1',
    updatedAt: '2026-03-01',
    author: 'Bingo Academy K12 School Team',
    authorSlug: 'shuang-wang',
    reviewer: SHARED_REVIEWER,
    title: 'K–12 AI Curriculum Map by Grade Band',
    excerpt:
      'Suggested competencies and Bingo products per elementary, middle, and high school.',
    references: [{ label: 'K12 products', href: '/courses/k12' }],
    body: `| Band | Competencies | Bingo assets |
|------|--------------|--------------|
| G4–6 | Data literacy, unplugged AI ethics | Exploration labs, teacher slides |
| G7–8 | Block → Python transition, intro ML | Online labs, classroom video packs |
| G9–12 | Full ML pipeline, portfolio | Textbooks, offline kits, IOAI elective |

Map is advisory — align to your district pacing guides. [/programs/k12](/programs/k12) bundles implementation support.`,
  },
  {
    cluster: 'k12',
    slug: 'teacher-implementation',
    version: '2026.1',
    updatedAt: '2026-03-01',
    author: 'Bingo Academy K12 School Team',
    reviewer: SHARED_REVIEWER,
    title: 'Teacher Training & Classroom Implementation Model',
    excerpt:
      'Train-the-trainer sessions, co-teaching options, and weekly lesson cadence.',
    references: [{ label: 'School partners', href: '/community/partners' }],
    body: `**Phase 1 — Launch week:** 6-hour train-the-trainer (video + lab sandbox)

**Phase 2 — Co-teach:** Bingo specialist joins 2 live class sessions remotely

**Phase 3 — Sustain:** Monthly office hours; async rubric feedback on capstones

Weekly cadence: 1 concept video → 1 guided lab → 1 reflection exit ticket. Teachers need no ML PhD — rubrics include answer keys.`,
  },
  {
    cluster: 'k12',
    slug: 'device-requirements',
    version: '2026.1',
    updatedAt: '2026-03-01',
    author: 'Bingo Academy K12 School Team',
    reviewer: SHARED_REVIEWER,
    title: 'Online & Offline Lab Device Requirements',
    excerpt:
      'Browsers, cameras, kits, and network rules for campus rollout.',
    references: [{ label: 'Labs storefront', href: '/labs' }],
    body: `**Online labs:** Chromebook+ with Chrome 110+, WebGL, 4 Mbps/student, camera optional unless CV unit

**Offline kits:** Consumables per table of 4; storage for hardware between terms

**Network:** Allow *.bingoacademy.org and Cloudflare stream endpoints; block only if district policy requires — provide proxy allowlist on request`,
  },
  {
    cluster: 'k12',
    slug: 'procurement-privacy',
    version: '2026.1',
    updatedAt: '2026-03-01',
    author: 'Bingo Academy K12 School Team',
    reviewer: SHARED_REVIEWER,
    title: 'School Procurement, Data Protection & Parent Consent',
    excerpt:
      'PO flow, DPA, FERPA alignment, and consent templates for vision labs.',
    references: [
      { label: 'Privacy policy', href: '/privacy' },
      { label: 'Partners contact', href: '/community/partners' },
    ],
    body: `**Procurement:** Site licences billed annually; kits per cart. Request quote via partners form.

**Data:** Student accounts store progress and submissions; no ad tracking. DPA available for US districts.

**Parent consent:** Required before camera-based labs; template letter provided in teacher pack.`,
  },
  {
    cluster: 'k12',
    slug: 'standards-alignment',
    version: '2026.1',
    updatedAt: '2026-03-01',
    author: 'Bingo Academy K12 School Team',
    reviewer: SHARED_REVIEWER,
    title: 'Mapping to CSTA & NGSS-Aligned Practices',
    excerpt:
      'How AI units touch computing standards and science practices (not a full standards dump).',
    references: [{ label: 'CSTA standards', href: 'https://www.csteachers.org/page/standards', external: true }],
    body: `AI units emphasize **data practices** (NGSS), **algorithms & programming** (CSTA 3A), and **impacts of computing** (CSTA 3B). Each Bingo teacher guide lists 2–3 standard codes per lesson.

Districts map codes locally — we provide evidence tables for accreditation visits.`,
  },
  {
    cluster: 'k12',
    slug: 'sample-semester-plan',
    version: '2026.1',
    updatedAt: '2026-03-01',
    author: 'Bingo Academy K12 School Team',
    reviewer: SHARED_REVIEWER,
    title: 'Sample One-Semester AI Elective (18 weeks)',
    excerpt:
      'Week-by-week outline schools can adopt or compress.',
    references: [{ label: 'K12 courses', href: '/courses/k12' }],
    body: `| Weeks | Topic | Artifact |
|-------|-------|----------|
| 1–2 | What is AI + ethics debate | Position paragraph |
| 3–5 | Data & visualization | Chart + dataset doc |
| 6–9 | Supervised learning | sklearn notebook |
| 10–12 | Computer vision browser lab | Demo video |
| 13–15 | Team capstone | Report + presentation |
| 16–18 | Reflection & cert exam | Portfolio submission |

Adjust pacing for block schedules. Offline kit weeks align with units 6–9.`,
  },
]

export function getGuideArticle(cluster, slug) {
  return GUIDE_ARTICLES.find((a) => a.cluster === cluster && a.slug === slug) || null
}

export function getClusterArticles(cluster) {
  return GUIDE_ARTICLES.filter((a) => a.cluster === cluster)
}

export function getAllGuidePaths() {
  const paths = [{ path: '/guides', changefreq: 'weekly', priority: '0.8' }]
  for (const cluster of ['parents', 'ioai', 'k12']) {
    paths.push({ path: `/guides/${cluster}`, changefreq: 'weekly', priority: '0.75' })
    for (const article of getClusterArticles(cluster)) {
      paths.push({
        path: `/guides/${article.cluster}/${article.slug}`,
        changefreq: 'monthly',
        priority: '0.7',
        lastmod: article.updatedAt,
      })
    }
  }
  paths.push({ path: '/guides/evidence', changefreq: 'monthly', priority: '0.75', lastmod: '2026-03-01' })
  return paths
}

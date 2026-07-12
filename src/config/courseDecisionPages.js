/**
 * Decision-page copy for programs and course lines.
 * Answers pre-purchase questions: what, who, format, outcomes, evidence.
 */

import { SITE_BRAND, SITE_URL } from './siteSeo.js'
import { buildPageGraph, courseEntity } from './structuredData.js'

const SHARED_FACULTY = [
  {
    name: 'Professor-led curriculum team',
    title: 'Full-time faculty & AI PhD researchers',
    href: '/instructors',
  },
]

const SHARED_METHODOLOGY = {
  title: 'Vision–Understanding–Action (VUA) pedagogy',
  body:
    'Courses pair short video instruction with browser and Jupyter labs. Students document hypotheses, reproducible experiments, and defence-ready outputs — the same structure IOAI selection rounds expect.',
  href: '/methodology',
}

const SHARED_REFERENCES = [
  { label: 'IOAI official competition formats', href: 'https://ioai-official.org' },
  { label: 'Bingo Academy curriculum overview', href: '/curriculum' },
]

export const PROGRAM_DECISION_PAGES = {
  ioai: {
    directAnswer:
      'IOAI Competition Training is a structured pathway for students and teams preparing for IOAI whitelist AI innovation competitions. You learn Python, machine learning, and neural networks through dual-pane Jupyter labs, video modules, and mock assessments. The program targets ages 12–18 with prior logic skills; no competition experience is required. By the end you will have competition-style lab reports, a deployable project portfolio, and optional Bingo AI certification aligned to IOAI defence formats.',
    quickFacts: {
      audience: 'Ages 12–18 · students & competition teams',
      prerequisites: 'Basic logic & typing; Python helpful but taught from foundations',
      format: 'Self-paced video + live training-lab camps (hybrid)',
      duration: '8–24 weeks · 4–6 hours/week recommended',
      deliverables: 'Jupyter notebooks, datasets, lab reports, project portfolio',
      assessment: 'Lesson quizzes · lab checkpoints · mock IOAI written & defence rounds',
      instructor: 'Professor-led IOAI curriculum team',
      instructorHref: '/instructors',
      price: 'Per-module from $49 · stage bundles available',
      priceNote: 'Includes video lessons, labs, and progress tracking',
      certificate: `${SITE_BRAND} IOAI-track certificate · verifiable at /cert`,
    },
    outline: [
      {
        id: 'ioai-explorer',
        title: 'AI Explorer',
        summary: 'Python foundations, data literacy, and first browser AI experiments.',
        items: [
          { id: 'ioai-explorer-1', title: 'Python & notebooks', summary: 'Variables, loops, and Jupyter workflow' },
          { id: 'ioai-explorer-2', title: 'Data & visualization', summary: 'Pandas basics and charting for lab reports' },
          { id: 'ioai-explorer-3', title: 'First CV lab', summary: 'Browser pose detection and feature extraction' },
        ],
      },
      {
        id: 'ioai-builder',
        title: 'AI Builder',
        summary: 'Supervised learning, model training, and evaluation metrics.',
        items: [
          { id: 'ioai-builder-1', title: 'ML fundamentals', summary: 'Train/test splits, accuracy, and error analysis' },
          { id: 'ioai-builder-2', title: 'Classification projects', summary: 'End-to-end sklearn pipelines' },
          { id: 'ioai-builder-3', title: 'Competition notebook', summary: 'Documented experiment with reproducible cells' },
        ],
      },
      {
        id: 'ioai-engineer',
        title: 'AI Engineer',
        summary: 'Neural networks, deployment, and IOAI-style defence prep.',
        items: [
          { id: 'ioai-engineer-1', title: 'Neural nets intro', summary: 'Layers, loss, and training loops in PyTorch' },
          { id: 'ioai-engineer-2', title: 'Computer vision', summary: 'CNN workflows and inference' },
          { id: 'ioai-engineer-3', title: 'Mock defence', summary: 'Presentation rubric and Q&A rehearsal' },
        ],
      },
    ],
    samples: [
      {
        title: 'Free browser lab — AI Cyber Tennis',
        description: 'Public preview of pose-tracking and real-time physics.',
        input: 'Webcam feed',
        process: 'MoveNet pose estimation → swing detection',
        output: 'Live game score & physics visualization',
        href: '/exploration/cyber-tennis',
        type: 'experiment',
      },
      {
        title: 'Sample IOAI module lesson',
        description: 'Trial video lesson with dual-pane lab instructions.',
        input: 'Lesson brief & starter notebook',
        process: 'Watch → code along → checkpoint quiz',
        output: 'Completed lab cell outputs for your report',
        href: '/courses/ioai',
        type: 'lesson',
      },
    ],
    faculty: SHARED_FACULTY,
    methodology: SHARED_METHODOLOGY,
    results: [
      {
        title: 'National competition podium',
        description: 'Student progressed from zero AI background to national top-3% within 6 months.',
        metric: '6-month pathway',
        href: '/showcase',
      },
      {
        title: 'Defence-ready lab portfolio',
        description: 'Trainees submit datasets, notebooks, and written reports — not slide decks alone.',
        href: '/showcase/awards',
      },
    ],
    faq: [
      {
        q: 'How much time per week should we plan?',
        a: 'Most families budget 4–6 hours per week for video + labs. Training-lab camps add intensive 2-week blocks before competition seasons.',
      },
      {
        q: 'What if my child has never coded?',
        a: 'Start at AI Explorer. Python is taught inside the modules; prior typing and math comfort is enough.',
      },
      {
        q: 'Is this aligned to IOAI whitelist events?',
        a: 'Yes — modules map to IOAI selection formats: written exams, lab tasks, and project defence.',
      },
      {
        q: 'Refund policy?',
        a: 'Digital modules follow our standard refund window shown at checkout. Contact support before camp start dates for live sessions.',
      },
      {
        q: 'Device & privacy requirements?',
        a: 'Modern laptop with Chrome/Edge; webcam for vision labs. Student data stays in your account; see /privacy for retention.',
      },
      {
        q: 'Parent support?',
        a: 'Progress dashboards, certification verification at /cert, and advisor contact via /assessment booking.',
      },
    ],
    contentMeta: {
      updatedAt: '2026-03-01',
      author: `${SITE_BRAND} IOAI Curriculum Team`,
      reviewer: 'Academic Review Board',
      references: SHARED_REFERENCES,
    },
    primaryCta: { label: 'Browse IOAI modules', href: '/courses/ioai' },
    secondaryCta: { label: 'Book free assessment', href: '/assessment' },
  },

  foundations: {
    directAnswer:
      'Foundations of AI is a self-paced program for independent learners and career changers who want credible AI literacy without a competition deadline. You follow structured video courses, cloud labs, and optional home experiment kits. The pathway suits ages 14+ with basic computer skills; no Python required to start. You will complete hands-on projects, earn tiered Bingo AI certificates, and build a portfolio you can show schools or employers.',
    quickFacts: {
      audience: 'Ages 14+ · self-learners & career changers',
      prerequisites: 'Comfort with computers; no prior coding required',
      format: 'Self-paced video + async online labs',
      duration: '6–12 weeks · 3–5 hours/week',
      deliverables: 'Lab notebooks, project write-ups, exploration experiments',
      assessment: 'Auto-graded checkpoints · optional cert exams',
      instructor: 'Professor-designed self-study curriculum',
      instructorHref: '/instructors',
      price: 'Courses from $29 · lab kits sold separately',
      priceNote: 'Video access + cloud labs included in course price',
      certificate: `${SITE_BRAND} literacy certificates · verify at /cert`,
    },
    outline: [
      {
        id: 'foundations-literacy',
        title: 'AI literacy core',
        summary: 'What AI is, how models learn, and responsible use.',
        items: [
          { id: 'foundations-lit-1', title: 'AI concepts', summary: 'Supervised vs generative AI in plain language' },
          { id: 'foundations-lit-2', title: 'Data thinking', summary: 'Features, labels, and bias awareness' },
        ],
      },
      {
        id: 'foundations-labs',
        title: 'Hands-on labs',
        summary: 'Browser experiments and JupyterLite projects.',
        items: [
          { id: 'foundations-lab-1', title: 'Exploration labs', summary: 'Free CV and NLP toys — no install' },
          { id: 'foundations-lab-2', title: 'Guided projects', summary: 'Step-by-step cloud lab sessions' },
        ],
      },
    ],
    samples: [
      {
        title: 'Word Gravity — NLP in the browser',
        description: 'See how embeddings cluster related words.',
        input: 'Text prompt',
        process: 'Embedding model → 2D projection',
        output: 'Interactive semantic map',
        href: '/exploration/word-gravity',
        type: 'experiment',
      },
    ],
    faculty: SHARED_FACULTY,
    methodology: {
      ...SHARED_METHODOLOGY,
      body:
        'Learn by doing: short explainers, then immediate browser or cloud labs. Each unit ends with a written reflection suitable for portfolios.',
    },
    results: [
      {
        title: 'Literacy certificate pathway',
        description: 'Tiered certificates document concept mastery and project evidence.',
        href: '/cert',
      },
    ],
    faq: [
      {
        q: 'Can my teenager study independently?',
        a: 'Yes — lessons are self-paced with clear checkpoints. Parents can view progress after account linking.',
      },
      {
        q: 'Do I need a GPU?',
        a: 'No. Browser labs and cloud notebooks run on standard laptops.',
      },
      {
        q: 'How does this differ from IOAI training?',
        a: 'Foundations focuses on literacy and projects; IOAI adds competition formats and defence prep.',
      },
      {
        q: 'Refunds?',
        a: 'Digital course refunds follow checkout policy; physical kits unopened within 14 days.',
      },
    ],
    contentMeta: {
      updatedAt: '2026-03-01',
      author: `${SITE_BRAND} Foundations Team`,
      reviewer: 'Academic Review Board',
      references: [{ label: 'AI literacy framework', href: '/curriculum' }],
    },
    primaryCta: { label: 'Start self-study courses', href: '/courses/foundations' },
    secondaryCta: { label: 'Try free exploration lab', href: '/exploration' },
  },

  k12: {
    directAnswer:
      'K12 Classroom School Edition packages textbooks, teacher course packs, online and offline labs, and bulk experiment kits for institutions rolling out AI curriculum. It serves grades 4–12 with modular units that fit term schedules. Teachers get demo scripts, rubrics, and class management hooks; students produce lab reports and team projects. Schools receive implementation support, optional teacher certification, and audit-ready documentation for accreditation visits.',
    quickFacts: {
      audience: 'Grades 4–12 · schools & district partners',
      prerequisites: 'Standard classroom IT; teacher onboarding provided',
      format: 'Classroom video + scheduled lab sessions (live/hybrid)',
      duration: 'Semester or year-long · 2–3 class periods/week',
      deliverables: 'Student lab reports, team projects, teacher grade exports',
      assessment: 'Rubrics · class quizzes · optional cert exams',
      instructor: 'Train-the-trainer + professor-authored materials',
      instructorHref: '/community/partners',
      price: 'Site licenses & kit bundles — request quote',
      priceNote: 'Volume pricing for textbooks and offline lab kits',
      certificate: 'School edition certificates · bulk verify at /cert',
    },
    outline: [
      {
        id: 'k12-curriculum',
        title: 'Classroom units',
        summary: 'Aligned video units with teacher pacing guides.',
        items: [
          { id: 'k12-unit-1', title: 'Intro to AI', summary: 'Demos and unplugged activities' },
          { id: 'k12-unit-2', title: 'Data & ML labs', summary: 'Computer-lab sessions with rubrics' },
          { id: 'k12-unit-3', title: 'Capstone project', summary: 'Team project with presentation rubric' },
        ],
      },
      {
        id: 'k12-materials',
        title: 'Physical & digital kits',
        summary: 'Consumables and hardware for offline labs.',
        items: [
          { id: 'k12-kit-1', title: 'Online lab kits', summary: 'Class consumable bundles' },
          { id: 'k12-kit-2', title: 'Offline lab kits', summary: 'Bulk hardware for campus rollout' },
        ],
      },
    ],
    samples: [
      {
        title: 'Class demo — virtual conductor',
        description: 'Teacher-led CV demo for assembly or open day.',
        input: 'Classroom webcam',
        process: 'Gesture → music mapping',
        output: 'Live performance students can try',
        href: '/exploration/virtual-conductor',
        type: 'experiment',
      },
    ],
    faculty: [
      {
        name: 'School implementation team',
        title: 'Curriculum specialists & partner success',
        href: '/community/partners',
      },
      ...SHARED_FACULTY,
    ],
    methodology: {
      title: 'Classroom-first VUA framework',
      body:
        'Each unit: teach (video + slides), try (guided lab), document (report template), defend (short presentation). Rubrics included for consistent grading.',
      href: '/curriculum',
    },
    results: [
      {
        title: 'Campus rollout case studies',
        description: 'Schools document term outcomes and student project galleries.',
        href: '/showcase/school',
      },
    ],
    faq: [
      {
        q: 'How do we pilot before full rollout?',
        a: 'Request a demo — we provide a single-class pilot kit and teacher onboarding session.',
      },
      {
        q: 'LMS integration?',
        a: 'Exportable grades and shareable lesson links; LMS integration on roadmap — contact partners team.',
      },
      {
        q: 'Student data privacy?',
        a: 'FERPA-aware practices; data processing described at /privacy. No student PII sold to third parties.',
      },
      {
        q: 'Competition overlap?',
        a: 'Optional IOAI enrichment for advanced cohorts — not required for core classroom track.',
      },
    ],
    contentMeta: {
      updatedAt: '2026-03-01',
      author: `${SITE_BRAND} K12 School Team`,
      reviewer: 'Academic Review Board',
      references: [{ label: 'School partnership inquiry', href: '/community/partners' }],
    },
    primaryCta: { label: 'Request school demo', href: '/assessment' },
    secondaryCta: { label: 'View classroom products', href: '/courses/k12' },
  },
}

export function getProgramDecisionPage(slug) {
  return PROGRAM_DECISION_PAGES[slug] || null
}

export function getLineDecisionPage(lineId) {
  const slug = lineId === 'general' ? 'foundations' : lineId
  return PROGRAM_DECISION_PAGES[slug] || null
}

const QUICK_FACT_LABELS = {
  audience: 'Audience',
  prerequisites: 'Prerequisites',
  format: 'Format',
  duration: 'Duration',
  deliverables: 'Deliverables',
  assessment: 'Assessment',
  instructor: 'Instructor',
  price: 'Price',
  certificate: 'Certificate',
}

/** Plain-text summary for SSR / crawlers */
export function decisionPagePlainText(decision) {
  if (!decision) return ''
  const parts = [decision.directAnswer]
  if (decision.quickFacts) {
    parts.push(
      Object.entries(QUICK_FACT_LABELS)
        .map(([k, label]) => (decision.quickFacts[k] ? `${label}: ${decision.quickFacts[k]}` : ''))
        .filter(Boolean)
        .join('. ')
    )
  }
  if (decision.faq?.length) {
    parts.push(decision.faq.map((f) => `Q: ${f.q} A: ${f.a}`).join(' '))
  }
  return parts.filter(Boolean).join('\n\n')
}

export function decisionFaqJsonLd(decision, pageUrl, { breadcrumbs, courseName, courseDescription } = {}) {
  if (!decision?.faq?.length && !courseName) return null
  const path = pageUrl.startsWith(SITE_URL) ? pageUrl.slice(SITE_URL.length) || '/' : pageUrl
  const entities = []
  if (courseName) {
    entities.push(
      courseEntity({
        name: courseName,
        description: courseDescription,
        url: path,
      })
    )
  }
  return buildPageGraph({
    pageUrl: path,
    breadcrumbs,
    entities,
    faq: decision?.faq,
  })
}

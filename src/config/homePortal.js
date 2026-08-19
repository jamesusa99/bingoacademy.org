/** Legacy admin portal config — public homepage uses homePage.js (phase 1 IOAI-only). */
import { PRODUCT_LINES } from './products'
import { SITE_BRAND } from './siteSeo'

/** Legacy portal tiles — phase-1 homepage uses homePage.js; keep IOAI-oriented language here */
export const PORTAL_BANNER_SLIDES = [
  {
    id: 'brand',
    gradient: 'from-primary/30 via-cyan-50 to-sky-100',
    icon: '🎓',
    eyebrow: 'Bingo Academy',
    title: 'IOAI-Oriented AI Olympiad Training',
    subtitle: 'Python, machine learning, Jupyter labs, and competition-style preparation for students ages 12–18.',
    ctaLabel: 'Take the Free Readiness Assessment',
    href: '/assessment/ioai',
    secondaryLabel: 'View the Curriculum',
    secondaryHref: '/ioai/curriculum',
  },
  {
    id: 'ioai',
    gradient: 'from-amber-500/20 via-orange-50 to-amber-50',
    icon: '🏆',
    eyebrow: 'IOAI-Oriented Training',
    title: 'Competition-Style AI Preparation',
    subtitle: 'Video lessons, Jupyter labs, projects, and mock assessments aligned with publicly available IOAI topics.',
    ctaLabel: 'IOAI Program',
    href: '/courses/ioai',
    secondaryLabel: 'View the Curriculum',
    secondaryHref: '/ioai/curriculum',
  },
  {
    id: 'general',
    gradient: 'from-cyan-500/15 to-sky-50',
    icon: '🌐',
    eyebrow: 'Foundations of AI Program',
    title: 'Build AI Literacy at Your Own Pace',
    subtitle: 'Structured courses, cloud labs, and home experiment materials packs for families and independent learners.',
    ctaLabel: 'Self-Study Courses',
    href: '/courses/foundations',
    secondaryLabel: 'AI Mall',
    secondaryHref: '/mall',
  },
  {
    id: 'k12',
    gradient: 'from-violet-500/15 to-purple-50',
    icon: '🏫',
    eyebrow: 'K12 Classroom School Edition',
    title: 'Complete AI Classroom for Schools',
    subtitle: 'Textbooks, teacher course packs, online/offline labs, and offline lab kits — one partner for campus rollout.',
    ctaLabel: 'School Edition',
    href: '/courses/k12',
    secondaryLabel: 'Contact Us',
    secondaryHref: '/profile',
  },
  {
    id: 'cert',
    gradient: 'from-emerald-500/15 to-teal-50',
    icon: '📜',
    eyebrow: 'Bingo AI Certification',
    title: 'Verify Skills. Strengthen Applications.',
    subtitle: 'Tiered ability certificates endorsed for competitions, portfolios, and admissions supplementary evidence.',
    ctaLabel: 'Certification',
    href: '/cert',
    secondaryLabel: 'My Profile',
    secondaryHref: '/profile',
  },
]

export const PORTAL_MISSION = {
  title: 'IOAI-oriented training for students ages 12–18',
  body:
    'Bingo Academy helps motivated middle and high school students understand AI fundamentals, implement models in Python, run reproducible machine learning experiments, and prepare for IOAI-style competition problem solving. This homepage is for students exploring AI Olympiads and parents choosing a course or completing enrollment.',
  pillars: [
    { icon: '🧠', label: 'AI fundamentals', desc: 'Concepts before libraries' },
    { icon: '🐍', label: 'Python implementation', desc: 'Real notebooks & code' },
    { icon: '🧪', label: 'ML experiments', desc: 'Reproducible lab work' },
    { icon: '🏆', label: 'Competition prep', desc: 'IOAI-style problem solving' },
  ],
}

/** Curriculum overview — shown on homepage before tuition/packages in hero fold */
export const HOME_CURRICULUM = {
  eyebrow: 'Curriculum',
  title: 'From readiness check to competition-ready work',
  intro:
    'Every student follows the same spine: assess placement, learn fundamentals, implement in Python, experiment with models, and document results for competition-style defence.',
  stages: [
    { step: '01', title: 'Readiness assessment', desc: 'Free placement to match Explorer, Builder, or Engineer stage.' },
    { step: '02', title: 'Core AI & Python', desc: 'Variables, data, loss functions, and first neural networks.' },
    { step: '03', title: 'Machine learning labs', desc: 'Train, evaluate, and reproduce results in Jupyter.' },
    { step: '04', title: 'Competition projects', desc: 'Portfolio notebooks, mock rounds, and defence practice.' },
  ],
}

/** Core entry grid — mirrors classic bingoacademy.cn homepage business tiles */
export const PORTAL_CORE_ENTRIES = [
  { icon: '🧠', title: 'Assessment', desc: 'Quick AI placement · matched course path', to: '/assessment', accent: 'violet' },
  { icon: '🏆', title: 'IOAI Competition Training', desc: 'Competition-style prep · video courses & Jupyter labs', to: '/courses/ioai', accent: 'amber' },
  { icon: '🧪', title: 'Labs & kits', desc: 'Online labs & physical kits by program', to: '/labs', accent: 'cyan' },
  { icon: '🧭', title: 'AI Exploration', desc: 'Free browser games — no sign-up', to: '/exploration', accent: 'violet' },
  { icon: '🏅', title: 'Achievements', desc: 'Student portfolio · awards & admissions', to: '/showcase', accent: 'rose' },
  { icon: '📜', title: 'Certification', desc: 'Competition & course credentials', to: '/cert', accent: 'slate' },
  { icon: '💬', title: 'Community', desc: 'Discussions, resources & AI tools', to: '/community', accent: 'emerald' },
]

export const PORTAL_LEARNING_PATH = [
  { step: '01', icon: '📚', title: 'Learn', desc: 'Follow the IOAI curriculum — video lessons and structured modules.' },
  { step: '02', icon: '🧪', title: 'Practice', desc: 'Complete online labs and project tasks with auto-graded feedback.' },
  { step: '03', icon: '🏆', title: 'Compete', desc: 'Apply skills in IOAI-oriented mock assessments and competition-style projects.' },
  { step: '04', icon: '📜', title: 'Certify', desc: 'Earn Bingo certificates and showcase outcomes in your portfolio.' },
]

export const PORTAL_COMPETITIONS = [
  {
    icon: '🏆',
    name: 'IOAI-Oriented Track',
    desc: 'Competition-style AI preparation with video modules and Jupyter lab bundles.',
    to: '/courses/ioai',
    tag: 'Featured',
  },
  {
    icon: '🤖',
    name: 'AIGC Innovation Events',
    desc: 'Generative-AI project builds aligned to youth competition rubrics.',
    to: '/courses/ioai',
    tag: 'Hot',
  },
  {
    icon: '🔬',
    name: 'STEM & Research Portfolio',
    desc: 'Turn lab work into showcase materials and admissions evidence.',
    to: '/showcase',
    tag: 'Outcomes',
  },
]

export const PORTAL_TRUST_STATS_FALLBACK = [
  { icon: '🏆', value: 'IOAI', label: 'Oriented Training' },
  { icon: '🧪', value: 'Labs', label: 'Hands-On Projects' },
  { icon: '📊', value: 'USAAIO', label: 'Olympiad Pathway' },
  { icon: '📜', value: 'Certified', label: 'Ability Credentials' },
  { icon: '🧪', value: 'Cloud', label: 'Online Labs' },
  { icon: '📦', value: 'Mall', label: 'Training Materials' },
]

export const PORTAL_TESTIMONIALS_FALLBACK = [
  { quote: 'The IOAI video course and training camp helped our child go from zero to competition-ready in one term.', name: 'Parent · Shanghai', role: 'IOAI Training', stars: 5 },
  { quote: 'Dual-pane Jupyter labs and IOAI rubrics — the only program that felt like real engineering for our daughter.', name: 'Parent · California', role: 'IOAI Competition Trainee', stars: 5 },
  { quote: 'Mock defence prep and portfolio projects gave us confidence for the IOAI selection round.', name: 'Parent · Singapore', role: 'IOAI Training', stars: 5 },
]

export { PRODUCT_LINES }

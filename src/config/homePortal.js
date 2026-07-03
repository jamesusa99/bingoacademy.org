import { PRODUCT_LINES } from './products'

/** Hero carousel — aligned with bingoacademy.cn: courses + authoritative competitions */
export const PORTAL_BANNER_SLIDES = [
  {
    id: 'brand',
    gradient: 'from-primary/30 via-cyan-50 to-sky-100',
    icon: '🎓',
    eyebrow: 'Bingo AI Academy',
    title: 'AI Courses + IOAI Competition Training',
    subtitle: 'IOAI whitelist training, hands-on labs, and competition-ready outcomes for students and teams.',
    ctaLabel: 'Explore Courses',
    href: '/courses',
    secondaryLabel: 'View Achievements',
    secondaryHref: '/showcase',
  },
  {
    id: 'ioai',
    gradient: 'from-amber-500/20 via-orange-50 to-amber-50',
    icon: '🏆',
    eyebrow: 'Authoritative Competitions',
    title: 'IOAI Whitelist Competition Training',
    subtitle: 'Video lessons, training camps, and sprint coaching for whitelist-format AI innovation competitions.',
    ctaLabel: 'IOAI Training',
    href: '/courses?line=ioai',
    secondaryLabel: 'Certification',
    secondaryHref: '/cert',
  },
  {
    id: 'general',
    gradient: 'from-cyan-500/15 to-sky-50',
    icon: '🌐',
    eyebrow: 'Foundations of AI Program',
    title: 'Build AI Literacy at Your Own Pace',
    subtitle: 'Structured courses, cloud labs, and home experiment materials packs for families and independent learners.',
    ctaLabel: 'Self-Study Courses',
    href: '/courses?line=general',
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
    href: '/courses?line=k12',
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
  title: 'Empowering learners for the AI era',
  body: 'Bingo AI Academy focuses on IOAI-oriented competition training — structured courses, hands-on labs, and mock assessments so students move from curiosity to competition-ready outcomes.',
  pillars: [
    { icon: '🏆', label: 'IOAI Training', desc: 'Whitelist competition prep & camps' },
    { icon: '🧪', label: 'Hands-On Labs', desc: 'Jupyter & browser AI projects' },
    { icon: '📊', label: 'Olympiad Pathway', desc: 'USAAIO · IAIO · IOAI readiness' },
    { icon: '📜', label: 'Certified Outcomes', desc: 'Verifiable ability credentials' },
  ],
}

/** Core entry grid — mirrors classic bingoacademy.cn homepage business tiles */
export const PORTAL_CORE_ENTRIES = [
  { icon: '🧠', title: 'Assessment', desc: 'Quick AI placement · matched course path', to: '/assessment', accent: 'violet' },
  { icon: '🏆', title: 'IOAI Competition Training', desc: 'Whitelist prep · video courses & training camps open', to: '/courses?line=ioai', accent: 'amber' },
  { icon: '🧪', title: 'Labs & kits', desc: 'Online labs & physical kits by program', to: '/labs', accent: 'cyan' },
  { icon: '🧭', title: 'AI Exploration', desc: 'Free browser games — no sign-up', to: '/exploration', accent: 'violet' },
  { icon: '🏅', title: 'Achievements', desc: 'Student portfolio · awards & admissions', to: '/showcase', accent: 'rose' },
  { icon: '📜', title: 'Certification', desc: 'Competition & course credentials', to: '/cert', accent: 'slate' },
  { icon: '💬', title: 'Community', desc: 'Discussions, resources & AI tools', to: '/community', accent: 'emerald' },
]

export const PORTAL_LEARNING_PATH = [
  { step: '01', icon: '📚', title: 'Learn', desc: 'Follow the IOAI curriculum — video lessons and structured modules.' },
  { step: '02', icon: '🧪', title: 'Practice', desc: 'Complete online labs and project tasks with auto-graded feedback.' },
  { step: '03', icon: '🏆', title: 'Compete', desc: 'Apply skills in IOAI whitelist and authoritative competition formats.' },
  { step: '04', icon: '📜', title: 'Certify', desc: 'Earn Bingo certificates and showcase outcomes in your portfolio.' },
]

export const PORTAL_COMPETITIONS = [
  {
    icon: '🏆',
    name: 'IOAI Whitelist Track',
    desc: 'Official-style AI innovation competition preparation with video + lab bundles.',
    to: '/courses?line=ioai',
    tag: 'Featured',
  },
  {
    icon: '🤖',
    name: 'AIGC Innovation Events',
    desc: 'Generative-AI project builds aligned to youth competition rubrics.',
    to: '/courses?line=ioai',
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
  { icon: '🏆', value: 'IOAI', label: 'Whitelist Training' },
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

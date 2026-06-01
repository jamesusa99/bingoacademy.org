import { PRODUCT_LINES, COURSE_CATALOG } from './products'

/** Hero carousel — aligned with bingoacademy.cn: courses + authoritative competitions */
export const PORTAL_BANNER_SLIDES = [
  {
    id: 'brand',
    gradient: 'from-primary/30 via-cyan-50 to-sky-100',
    icon: '🎓',
    eyebrow: 'Bingo AI Academy',
    title: 'AI Courses + Authoritative Competitions',
    subtitle: 'Literacy, IOAI whitelist training, and K12 classroom solutions — learn, compete, and earn certified outcomes.',
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
  body: 'Bingo AI Academy connects self-study literacy, IOAI-oriented competition training, and school-ready classroom delivery — so every learner can move from curiosity to certified outcomes.',
  pillars: [
    { icon: '🧠', label: 'AI Literacy', desc: 'Foundations through hands-on practice' },
    { icon: '🏆', label: 'Whitelist Competitions', desc: 'IOAI-aligned training & camps' },
    { icon: '🏫', label: 'School Delivery', desc: 'Books, courses, labs & kits' },
    { icon: '📜', label: 'Certified Outcomes', desc: 'Verifiable ability credentials' },
  ],
}

/** Core entry grid — mirrors classic bingoacademy.cn homepage business tiles */
export const PORTAL_CORE_ENTRIES = [
  { icon: '🧠', title: 'Assessment', desc: 'Quick AI placement · matched course path', to: '/assessment', accent: 'violet' },
  { icon: '🏆', title: 'IOAI Competition Training', desc: 'Whitelist prep · video courses & training camps open', to: '/courses?line=ioai', accent: 'amber' },
  { icon: '🧪', title: 'Labs & kits', desc: 'Online labs & physical kits by program', to: '/labs', accent: 'cyan' },
  { icon: '🧭', title: 'AI Exploration', desc: 'Free browser games — no sign-up', to: '/exploration', accent: 'violet' },
  { icon: '📘', title: 'Self-Study & Classroom', desc: 'Literacy courses and school packs — rolling out', to: '/courses?line=general', accent: 'slate' },
  { icon: '🏅', title: 'Achievements', desc: 'Student portfolio · awards & admissions', to: '/showcase', accent: 'rose' },
  { icon: '💬', title: 'Community', desc: 'Discussions, resources & AI tools', to: '/community', accent: 'emerald' },
]

export const PORTAL_LEARNING_PATH = [
  { step: '01', icon: '📚', title: 'Learn', desc: 'Pick a product line and follow structured courses or video tracks.' },
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

/** Highlight courses shown on portal (subset of catalogue) */
export const PORTAL_FEATURED_COURSES = COURSE_CATALOG.filter((c) =>
  ['ioai-competition-system', 'ioai-1-1', 'ioai-camp', 'g1', 'k1', 'k3'].includes(c.id)
)

export const PORTAL_TRUST_STATS_FALLBACK = [
  { icon: '🎓', value: '3', label: 'Product Lines' },
  { icon: '🏆', value: 'IOAI', label: 'Whitelist Training' },
  { icon: '🏫', value: 'K12', label: 'School Edition' },
  { icon: '📜', value: 'Certified', label: 'Ability Credentials' },
  { icon: '🧪', value: 'Cloud', label: 'Online Labs' },
  { icon: '📦', value: 'Mall', label: 'Books & Kits' },
]

export const PORTAL_TESTIMONIALS_FALLBACK = [
  { quote: 'The IOAI video course and training camp helped our child go from zero to competition-ready in one term.', name: 'Parent · Shanghai', role: 'IOAI Training', stars: 5 },
  { quote: 'K12 classroom edition fits our school schedule — books, courseware, and lab kits in one package.', name: 'Teacher · Shenzhen', role: 'K12 School Edition', stars: 5 },
  { quote: 'Self-study general AI courses are clear and hands-on. The materials pack made home experiments easy.', name: 'Student · Grade 7', role: 'Foundations of AI Program', stars: 5 },
]

export { PRODUCT_LINES }

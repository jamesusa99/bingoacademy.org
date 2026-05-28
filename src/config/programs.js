import { PRODUCT_LINES } from './products'

/** URL slug → courses query line id */
export const PROGRAM_SLUG_TO_LINE = {
  foundations: 'general',
  ioai: 'ioai',
  k12: 'k12',
}

export const LINE_TO_PROGRAM_SLUG = {
  general: 'foundations',
  ioai: 'ioai',
  k12: 'k12',
}

export const PROGRAM_PATH_CARDS = [
  {
    slug: 'foundations',
    lineId: 'general',
    icon: '🎓',
    title: 'Foundations of AI',
    desc: 'For self-learners & career changers',
    cta: 'Start Learning',
    href: '/programs/foundations',
    accent: 'cyan',
  },
  {
    slug: 'ioai',
    lineId: 'ioai',
    icon: '🏆',
    title: 'IOAI Competition',
    desc: 'For students & competition teams',
    cta: 'Train Now',
    href: '/programs/ioai',
    accent: 'amber',
  },
  {
    slug: 'k12',
    lineId: 'k12',
    icon: '🏫',
    title: 'K12 School Edition',
    desc: 'For schools & educators',
    cta: 'Request Demo',
    href: '/programs/k12',
    accent: 'violet',
  },
]

export const NAV_PROGRAMS = PRODUCT_LINES.map((line) => ({
  slug: LINE_TO_PROGRAM_SLUG[line.id],
  href: `/programs/${LINE_TO_PROGRAM_SLUG[line.id]}`,
  icon: line.icon,
  label: line.name,
  desc:
    line.id === 'general'
      ? 'Self-paced AI literacy'
      : line.id === 'ioai'
        ? 'IOAI competition training'
        : 'K12 classroom solution',
}))

export const PAGE_SEO = {
  home: {
    title: 'Bingo Academy — AI Courses & Labs for K12, Competition & Self-Learners',
    description:
      'AI science education for self-learners, IOAI competition teams, and K12 schools. Courses, labs, kits, and certification.',
  },
  foundations: {
    title: 'Foundations of AI Program — Self-Paced AI Learning | Bingo Academy',
    description: 'Self-paced AI video courses, online labs, and lab kits for independent learners.',
  },
  ioai: {
    title: 'IOAI Competition Training — AI Olympiad Prep | Bingo Academy',
    description: 'IOAI whitelist competition video courses and training camps.',
  },
  k12: {
    title: 'K12 AI Classroom Edition — Complete School Solution | Bingo Academy',
    description: 'Textbooks, classroom courses, online and offline labs for schools.',
  },
  courses: {
    title: 'AI Courses — Browse by Program | Bingo Academy',
    description: 'Browse Foundations, IOAI, and K12 courses by module type.',
  },
  lab: {
    title: 'AI Exploration Lab — Free Hands-On AI Experiments | Bingo Academy',
    description: 'Try AI experiments in the browser — free, no sign-up required.',
  },
  compare: {
    title: 'Compare Programs — Which Path is Right for You? | Bingo Academy',
    description: 'Compare Foundations, IOAI, and K12 features side by side.',
  },
  pricing: {
    title: 'Pricing & Membership | Bingo Academy',
    description: 'Course pricing, certification tiers, and school packages.',
  },
}

export const PROGRAM_COMPARISON = {
  title: 'Which Program is Right for You?',
  columns: [
    { key: 'foundations', label: 'Foundations', href: '/programs/foundations' },
    { key: 'ioai', label: 'IOAI', href: '/programs/ioai' },
    { key: 'k12', label: 'K12 School', href: '/programs/k12' },
  ],
  rows: [
    { feature: 'Target audience', foundations: 'Self-learners', ioai: 'Students', k12: 'Schools' },
    { feature: 'AI video courses', foundations: true, ioai: true, k12: true },
    { feature: 'Online labs', foundations: true, ioai: true, k12: true },
    { feature: 'Online lab kits', foundations: true, ioai: false, k12: true },
    { feature: 'Training camp', foundations: false, ioai: true, k12: false },
    { feature: 'Textbooks', foundations: false, ioai: false, k12: true },
    { feature: 'Offline labs', foundations: false, ioai: false, k12: true },
    { feature: 'Offline lab kits', foundations: false, ioai: false, k12: true },
    { feature: 'Certification', foundations: 'Basic', ioai: 'Competition', k12: 'School' },
  ],
}

export function programMetaForSlug(slug) {
  if (slug === 'foundations') return PAGE_SEO.foundations
  if (slug === 'ioai') return PAGE_SEO.ioai
  if (slug === 'k12') return PAGE_SEO.k12
  return PAGE_SEO.courses
}

export function getProgramLine(slug) {
  const lineId = PROGRAM_SLUG_TO_LINE[slug]
  return PRODUCT_LINES.find((l) => l.id === lineId) ?? PRODUCT_LINES[0]
}

export function coursesHref(lineId, sub) {
  const q = new URLSearchParams({ line: lineId })
  if (sub) q.set('sub', sub)
  return `/courses?${q}`
}

/** Badge copy for course cards */
export function programBadgeForLine(lineId) {
  if (lineId === 'ioai') return { label: 'IOAI', useCase: '🏆 Competition prep' }
  if (lineId === 'k12') return { label: 'K12', useCase: '🏫 Classroom ready' }
  return { label: 'Foundations', useCase: '🎓 Self-paced' }
}

export const ORG_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  name: 'Bingo Academy',
  url: 'https://www.bingoacademy.org',
  description: 'AI Science Education Platform for K12, Competition, and Self-Learners',
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'AI Courses',
    itemListElement: [
      {
        '@type': 'Course',
        name: 'Foundations of AI Program',
        description: 'Self-paced AI learning for adults and career changers',
      },
      {
        '@type': 'Course',
        name: 'IOAI Competition Training',
        description: 'AI Olympiad and whitelist competition preparation',
      },
      {
        '@type': 'Course',
        name: 'K12 Classroom School Edition',
        description: 'Complete AI classroom solution for schools',
      },
    ],
  },
}

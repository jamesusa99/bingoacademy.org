import { PRODUCT_LINES } from './products'
import { SITE_BRAND, ORG_JSON_LD } from './siteSeo'
import { isProductLabSub, labsPath } from './productLabs'
import { courseLinePath } from './coursePaths'

/** URL slug ↔ courses `line` query param */
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

export function programSlugFromLine(lineId) {
  return LINE_TO_PROGRAM_SLUG[lineId] || 'ioai'
}

export function lineFromProgramSlug(slug) {
  return PROGRAM_SLUG_TO_LINE[slug] || 'ioai'
}

export function programPath(slug) {
  return `/programs/${slug}`
}

export function coursesPathForProgram(slug, sub) {
  return courseLinePath(slug, sub || undefined)
}

/** Hero path cards + program landing copy */
export const PROGRAMS = [
  {
    slug: 'ioai',
    lineId: 'ioai',
    icon: '🏆',
    title: 'IOAI Competition',
    shortTitle: 'IOAI Competition Training',
    audience: 'For students & competition teams',
    cta: 'Train Now',
    ctaSecondary: 'Compare programs',
    secondaryHref: '/compare',
    heroHeadline: 'Competition-ready AI training',
    heroBody:
      'Video courses and intensive training camps aligned to IOAI whitelist formats — from first concepts to mock assessments.',
    learningPath: [
      { icon: '🎬', label: 'Competition Course' },
      { icon: '🏕️', label: 'Training Lab' },
      { icon: '🏆', label: 'Mock Events' },
      { icon: '📜', label: 'Competition Cert' },
    ],
  },
  {
    slug: 'foundations',
    lineId: 'general',
    icon: '🎓',
    title: 'Foundations of AI',
    shortTitle: 'Foundations of AI Program',
    audience: 'For self-learners & career changers',
    cta: 'Start Learning',
    ctaSecondary: 'Try free lab',
    secondaryHref: '/exploration',
    heroHeadline: 'Learn AI at your own pace',
    heroBody:
      'Structured video courses, cloud labs, and home experiment kits — build literacy from curiosity to certified outcomes.',
    learningPath: [
      { icon: '📘', label: 'Video courses' },
      { icon: '🧪', label: 'Online labs' },
      { icon: '📦', label: 'Lab kits' },
      { icon: '📜', label: 'Certification' },
    ],
  },
  {
    slug: 'k12',
    lineId: 'k12',
    icon: '🏫',
    title: 'K12 School Edition',
    shortTitle: 'K12 Classroom School Edition',
    audience: 'For schools & educators',
    cta: 'Request Demo',
    ctaSecondary: 'View school modules',
    secondaryHref: '/courses/k12',
    heroHeadline: 'Complete AI classroom for schools',
    heroBody:
      'Textbooks, teacher packs, online and offline labs, and bulk kits — one partner for campus rollout.',
    learningPath: [
      { icon: '📚', label: 'Textbooks' },
      { icon: '🎓', label: 'Class videos' },
      { icon: '🧪', label: 'Lab sessions' },
      { icon: '📜', label: 'School cert' },
    ],
  },
]

export function getProgram(slug) {
  return PROGRAMS.find((p) => p.slug === slug) ?? PROGRAMS[0]
}

export function getProgramByLine(lineId) {
  const slug = programSlugFromLine(lineId)
  return getProgram(slug)
}

/** Attach subcategory links from PRODUCT_LINES */
export function programModules(slug) {
  const lineId = lineFromProgramSlug(slug)
  const line = PRODUCT_LINES.find((l) => l.id === lineId)
  if (!line) return []
  return line.subcategories.map((s) => ({
    ...s,
    href: isProductLabSub(lineId, s.id) ? labsPath(lineId, s.id) : coursesPathForProgram(slug, s.id),
  }))
}

export const USE_CASE_BY_LINE = {
  ioai: { label: 'Competition Prep', icon: '🏆' },
  general: { label: 'Self-Paced', icon: '🎓' },
  k12: { label: 'Classroom Ready', icon: '🏫' },
}

export const COMPARISON_ROWS = [
  { feature: 'Target audience', foundations: 'Self-learners', ioai: 'Students', k12: 'Schools' },
  { feature: 'AI Video Courses', foundations: true, ioai: true, k12: true },
  { feature: 'Online Labs', foundations: true, ioai: true, k12: true },
  { feature: 'Online Lab Kits', foundations: true, ioai: false, k12: true },
  { feature: 'Training Lab', foundations: false, ioai: true, k12: false },
  { feature: 'Textbooks', foundations: false, ioai: false, k12: true },
  { feature: 'Offline Labs', foundations: false, ioai: false, k12: true },
  { feature: 'Offline Lab Kits', foundations: false, ioai: false, k12: true },
  { feature: 'Certification', foundations: 'Basic', ioai: 'Competition', k12: 'School' },
]

export const PAGE_SEO = {
  home: {
    title: `AI Courses for Kids & Teens | K-12 AI Education Platform | ${SITE_BRAND}`,
    description: `Discover AI courses, competitions and hands-on learning programs for K-12 students. ${SITE_BRAND} helps children and teens learn artificial intelligence through projects, creativity and innovation.`,
    keywords:
      'AI Education, AI Courses, AI for Kids, K12 AI Education, AI Curriculum, Artificial Intelligence for Students, AI Competitions, AI Literacy, STEM Education, AI Learning, IOAI, AI classes for kids, AI course for teens',
  },
  compare: {
    title: `Compare AI Programs — Foundations, IOAI & K12 | ${SITE_BRAND}`,
    description: `See which ${SITE_BRAND} program fits your goal: self-study, competition training, or school deployment.`,
  },
  exploration: {
    title: `AI Exploration Lab — Free Hands-On AI Experiments | ${SITE_BRAND}`,
    description:
      'Try AI hands-on in the browser — free experiments in computer vision, NLP, and generative AI. No sign-up required.',
  },
  foundations: {
    title: `Foundations of AI Program — Self-Paced AI Learning | ${SITE_BRAND}`,
    description:
      'Self-paced AI literacy courses, online labs, and home experiment kits for independent learners.',
  },
  ioai: {
    title: `IOAI Competition Training — AI Olympiad Prep | ${SITE_BRAND}`,
    description:
      'IOAI whitelist competition training — video courses, training camps, and mock assessments.',
  },
  k12: {
    title: `K12 AI Classroom Edition — Complete School Solution | ${SITE_BRAND}`,
    description:
      'Textbooks, classroom video courses, online/offline labs, and school kits for K12 institutions.',
  },
  courses: {
    title: `AI Courses for Kids & Teens — IOAI, Foundations & K12 | ${SITE_BRAND}`,
    description:
      'Browse AI video courses, training labs, and classroom programs across IOAI competition, Foundations, and K12 school editions.',
  },
  lab: {
    title: `AI Labs & Experiment Kits — Hands-On Learning | ${SITE_BRAND}`,
    description:
      'Gamified in-browser AI experiments and structured lab packs — learn machine learning by doing.',
  },
}

export { ORG_JSON_LD }

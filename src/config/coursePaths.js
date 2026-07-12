import { getProductLine, subcategoryLabel } from './products'
import { isProductLabSub } from './productLabs'
import { SITE_BRAND } from './siteSeo'
import { LINE_TO_PROGRAM_SLUG, PROGRAM_SLUG_TO_LINE } from './programs'

export const COURSE_LINE_SLUGS = ['ioai', 'foundations', 'k12']

/** Map URL line slug → internal catalog line id */
export function lineIdFromCourseSlug(lineSlug) {
  return PROGRAM_SLUG_TO_LINE[lineSlug] || null
}

export function courseSlugFromLineId(lineId) {
  return LINE_TO_PROGRAM_SLUG[lineId] || null
}

/** Canonical clean URL for a product line and optional subcategory */
export function courseLinePath(lineSlug, subSlug) {
  if (!lineSlug) return '/courses/ioai'
  if (subSlug) return `/courses/${lineSlug}/${subSlug}`
  return `/courses/${lineSlug}`
}

export function coursePathForLineId(lineId, subId) {
  const lineSlug = courseSlugFromLineId(lineId)
  if (!lineSlug) return '/courses/ioai'
  return courseLinePath(lineSlug, subId || undefined)
}

export function parseCoursePathname(pathname) {
  const match = pathname.match(/^\/courses(?:\/([^/]+))?(?:\/([^/]+))?$/)
  if (!match) return null
  const [, lineSlug, subSlug] = match
  if (!lineSlug) return { hub: true }
  const lineId = lineIdFromCourseSlug(lineSlug)
  if (!lineId) return { invalid: true, lineSlug, subSlug }
  return { lineSlug, lineId, subSlug: subSlug || '' }
}

/** Legacy ?type= → clean path (mirrors server/config/urlMigrations.mjs) */
export const COURSES_TYPE_TO_PATH = {
  video: '/courses/ioai/video',
  course: '/courses/foundations/course',
  module: '/courses/ioai',
  event: '/programs/ioai',
  events: '/programs/ioai',
  exam: '/assessment',
  exams: '/assessment',
  literacy: '/programs/foundations',
  cert: '/cert',
  certification: '/cert',
  pricing: '/cert',
  lab: '/labs',
  labs: '/labs',
  material: '/mall',
  materials: '/mall',
  k12: '/courses/k12',
  ioai: '/courses/ioai',
  general: '/courses/foundations',
  foundations: '/programs/foundations',
  exploration: '/exploration',
  assessment: '/assessment',
}

/** Client redirect for legacy /courses query params */
export function resolveCoursesLegacyRedirect(searchParams) {
  const type = searchParams.get('type')?.trim()
  if (type) {
    const key = type.toLowerCase()
    return COURSES_TYPE_TO_PATH[key] || '/courses/ioai'
  }
  if (searchParams.has('line') || searchParams.has('sub')) {
    const line = searchParams.get('line')?.trim()
    const sub = searchParams.get('sub')?.trim() || ''
    if (line === 'ioai' && sub === 'module') return '/courses/ioai'
    return coursePathFromSearchParams(searchParams)
  }
  return null
}

export function isValidCourseSub(lineId, subId) {
  if (!subId) return true
  const line = getProductLine(lineId)
  return line.subcategories.some((s) => s.id === subId)
}

/** Legacy ?line=&sub= → canonical path (301 target) */
export function coursePathFromSearchParams(searchParams) {
  const line = searchParams.get('line')?.trim()
  if (!line) return null
  const lineSlug = courseSlugFromLineId(line)
  if (!lineSlug) return '/courses/ioai'
  const sub = searchParams.get('sub')?.trim() || ''
  return courseLinePath(lineSlug, sub || undefined)
}

export function courseLineHasSecondaryFilters(searchParams) {
  const secondary = ['stage', 'buy', 'page', 'sort', 'category', 'level', 'price']
  return secondary.some((k) => searchParams.has(k))
}

const LINE_SEO = {
  ioai: {
    title: `IOAI Competition Training Courses | ${SITE_BRAND}`,
    description:
      'IOAI whitelist competition training — structured video modules, training labs, mock assessments, and Olympiad prep courses.',
    h1: 'IOAI Competition Training',
    body: 'Video courses and intensive training camps aligned to IOAI whitelist formats — from first concepts to mock assessments.',
  },
  foundations: {
    title: `Foundations of AI Courses | ${SITE_BRAND}`,
    description:
      'Self-paced AI literacy video courses, online labs, and home experiment kits for independent learners.',
    h1: 'Foundations of AI Program',
    body: 'Structured video courses, cloud labs, and home experiment kits — build literacy from curiosity to certified outcomes.',
  },
  k12: {
    title: `K12 AI Classroom Courses | ${SITE_BRAND}`,
    description:
      'Classroom video courses, textbooks, online/offline labs, and school kits for K12 institutions.',
    h1: 'K12 Classroom School Edition',
    body: 'Textbooks, teacher packs, online and offline labs, and bulk kits — one partner for campus rollout.',
  },
}

const HUB_SEO = {
  title: `AI Courses for Kids & Teens — IOAI, Foundations & K12 | ${SITE_BRAND}`,
  description:
    'Browse AI video courses, training labs, and classroom programs across IOAI competition, Foundations, and K12 school editions.',
  h1: 'AI Courses',
  body: 'Explore IOAI competition training, self-paced Foundations courses, and K12 classroom editions — all in one place.',
}

export function coursesHubSeo() {
  return { ...HUB_SEO, canonical: '/courses/ioai' }
}

export function coursesLineSeo(lineSlug) {
  const base = LINE_SEO[lineSlug]
  if (!base) return null
  return { ...base, canonical: courseLinePath(lineSlug) }
}

export function coursesSubSeo(lineSlug, subSlug) {
  const lineId = lineIdFromCourseSlug(lineSlug)
  if (!lineId || !subSlug) return coursesLineSeo(lineSlug)
  const line = getProductLine(lineId)
  const sub = line.subcategories.find((s) => s.id === subSlug)
  if (!sub) return coursesLineSeo(lineSlug)
  const label = subcategoryLabel(lineId, subSlug)
  return {
    title: `${label} — ${line.name} | ${SITE_BRAND}`,
    description: `${sub.desc} Browse ${label.toLowerCase()} in the ${line.name} catalog at ${SITE_BRAND}.`,
    h1: label,
    body: sub.desc,
    canonical: courseLinePath(lineSlug, subSlug),
  }
}

export function coursesSeoForRoute({ hub, lineSlug, subSlug }) {
  if (hub) return coursesHubSeo()
  if (subSlug) return coursesSubSeo(lineSlug, subSlug)
  return coursesLineSeo(lineSlug)
}

/** Sitemap: line + non-lab subcategory paths */
export function courseSitemapPaths() {
  const paths = COURSE_LINE_SLUGS.map((slug) => ({
    path: courseLinePath(slug),
    changefreq: 'weekly',
    priority: slug === 'ioai' ? '0.9' : '0.8',
  }))

  for (const lineSlug of COURSE_LINE_SLUGS) {
    const lineId = lineIdFromCourseSlug(lineSlug)
    const line = getProductLine(lineId)
    for (const sub of line.subcategories) {
      if (isProductLabSub(lineId, sub.id)) continue
      paths.push({
        path: courseLinePath(lineSlug, sub.id),
        changefreq: 'weekly',
        priority: '0.7',
      })
    }
  }

  return paths
}

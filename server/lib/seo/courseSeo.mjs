/** Server mirror of src/config/coursePaths.js SEO + path helpers */

import { SITE_BRAND } from './constants.mjs'
import { isProductLabSub } from './coursePathData.mjs'

const PROGRAM_SLUG_TO_LINE = {
  foundations: 'general',
  ioai: 'ioai',
  k12: 'k12',
}

const LINE_TO_PROGRAM_SLUG = {
  general: 'foundations',
  ioai: 'ioai',
  k12: 'k12',
}

const PRODUCT_SUBCATEGORIES = {
  ioai: [
    { id: 'video', name: 'AI Video Courses', desc: 'Competition-focused video lessons with progress tracking' },
    { id: 'online-lab', name: 'Training Lab', desc: 'Intensive competition training labs with mock assessments' },
  ],
  general: [
    { id: 'course', name: 'AI Video Courses', desc: 'Self-paced AI video lessons with progress tracking' },
    { id: 'online-lab', name: 'Online Labs', desc: 'Cloud-based interactive experiments and projects' },
    { id: 'materials-pack', name: 'Online Lab Kits', desc: 'Home experiment kits and digital resource bundles' },
  ],
  k12: [
    { id: 'books', name: 'Books', desc: 'Textbooks and supplements — digital and print' },
    { id: 'course', name: 'AI Video Courses', desc: 'Classroom video courses and school course packs' },
    { id: 'online-lab', name: 'Online Labs', desc: 'Class demos and student computer-lab sessions' },
    { id: 'materials-pack', name: 'Online Lab Kits', desc: 'Class consumables and resource bundles' },
    { id: 'offline-lab', name: 'Offline Labs', desc: 'Lab hardware and on-site activity plans' },
    { id: 'school-kit', name: 'Offline Lab Kits', desc: 'Bulk experiment kits for institutions' },
  ],
}

const LINE_NAMES = {
  ioai: 'IOAI Competition Training',
  general: 'Foundations of AI Program',
  k12: 'K12 Classroom School Edition',
}

export const COURSE_LINE_SLUGS = ['ioai', 'foundations', 'k12']

export function lineIdFromCourseSlug(lineSlug) {
  return PROGRAM_SLUG_TO_LINE[lineSlug] || null
}

export function courseSlugFromLineId(lineId) {
  return LINE_TO_PROGRAM_SLUG[lineId] || null
}

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
  const subs = PRODUCT_SUBCATEGORIES[lineId] || []
  const sub = subs.find((s) => s.id === subSlug)
  const lineName = LINE_NAMES[lineId]
  if (!sub) return coursesLineSeo(lineSlug)
  return {
    title: `${sub.name} — ${lineName} | ${SITE_BRAND}`,
    description: `${sub.desc} Browse ${sub.name.toLowerCase()} in the ${lineName} catalog at ${SITE_BRAND}.`,
    h1: sub.name,
    body: sub.desc,
    canonical: courseLinePath(lineSlug, subSlug),
  }
}

export function coursesSeoForPathname(pathname) {
  const parsed = parseCoursePathname(pathname)
  if (!parsed || parsed.invalid) return null
  if (parsed.hub) return coursesHubSeo()
  if (parsed.subSlug) return coursesSubSeo(parsed.lineSlug, parsed.subSlug)
  return coursesLineSeo(parsed.lineSlug)
}

export function courseSitemapPaths() {
  const paths = COURSE_LINE_SLUGS.map((slug) => ({
    path: courseLinePath(slug),
    changefreq: 'weekly',
    priority: slug === 'ioai' ? '0.9' : '0.8',
  }))

  for (const lineSlug of COURSE_LINE_SLUGS) {
    const lineId = lineIdFromCourseSlug(lineSlug)
    for (const sub of PRODUCT_SUBCATEGORIES[lineId] || []) {
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

/** Legacy ?line= → canonical clean path */
export function coursePathFromLineQuery(line, sub) {
  if (!line) return null
  const lineSlug = courseSlugFromLineId(line.trim())
  if (!lineSlug) return '/courses/ioai'
  const subId = sub?.trim() || ''
  return courseLinePath(lineSlug, subId || undefined)
}

export function isValidCourseSub(lineId, subSlug) {
  if (!subSlug) return true
  const subs = PRODUCT_SUBCATEGORIES[lineId] || []
  return subs.some((s) => s.id === subSlug)
}

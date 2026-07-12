/**
 * Server-side HTTP status rules for public routes.
 * Mirrors client-side redirects in App.jsx but returns real status codes for crawlers.
 */

import { isNoindexPath } from './constants.mjs'
import { getStaticSeoForPath, getProgram } from './staticSeo.mjs'
import {
  PERMANENT_REDIRECTS,
  PREFIX_REDIRECTS,
  GONE_PATHS,
  resolveCoursesTypeRedirect,
  coursesHasLegacyTypeParam,
} from '../../config/urlMigrations.mjs'
import {
  parseCoursePathname,
  coursePathFromLineQuery,
  courseLinePath,
  isValidCourseSub,
} from './courseSeo.mjs'
import { isProductLabSub, labsPath } from './coursePathData.mjs'
import { getInstructor } from '../../../src/config/trust/instructors.js'
import {
  fetchNewsArticle,
  fetchCourseBySlug,
  fetchLabPackBySlug,
  fetchLabExperiment,
} from './fetchDynamic.mjs'

const VALID_PROGRAM_SLUGS = new Set(['ioai', 'foundations', 'k12'])
const VALID_PRODUCT_LINES = new Set(['ioai', 'general', 'k12'])

const EXPLORATION_LABS = new Set([
  'hide-and-seek',
  'virtual-conductor',
  'word-gravity',
  'jailbreak-adventure',
  'evolve-car',
  'doodle-monsters',
  'cyber-tennis',
])

const COMMUNITY_SECTIONS = new Set([
  'home',
  'mentors',
  'scholars',
  'checkin',
  'partners',
  'forum',
  'camps',
])

/** Path patterns that are valid app routes (200) even without dedicated SEO copy */
const KNOWN_PATH_PATTERNS = [
  /^\/$/,
  /^\/auth\/callback$/,
  /^\/try-ai$/,
  /^\/ioai-masterclass$/,
  /^\/ai-classes-for-kids$/,
  /^\/usaaio-prep$/,
  /^\/showcase$/,
  /^\/showcase\/(works|awards|materials)$/,
  /^\/showcase\/(venture|award)\/[^/]+$/,
  /^\/assessment$/,
  /^\/courses$/,
  /^\/courses\/(ioai|foundations|k12)$/,
  /^\/courses\/(ioai|foundations|k12)\/[^/]+$/,
  /^\/courses\/module\/[^/]+$/,
  /^\/courses\/detail\/[^/]+$/,
  /^\/courses\/detail\/[^/]+\/golab$/,
  /^\/ioai\/l1\/[^/]+$/,
  /^\/ioai\/l3\/[^/]+$/,
  /^\/ioai\/experiments\/[^/]+$/,
  /^\/curriculum$/,
  /^\/labs$/,
  /^\/labs\/ioai\/training-lab\/[^/]+$/,
  /^\/labs\/pack\/[^/]+$/,
  /^\/labs\/pack\/[^/]+\/experiments\/[^/]+$/,
  /^\/guides$/,
  /^\/guides\/evidence$/,
  /^\/guides\/(parents|ioai|k12)$/,
  /^\/guides\/(parents|ioai|k12)\/[^/]+$/,
  /^\/exploration$/,
  /^\/exploration\/(hide-and-seek|virtual-conductor|word-gravity|jailbreak-adventure|evolve-car|doodle-monsters|cyber-tennis)$/,
  /^\/programs\/(ioai|foundations|k12)$/,
  /^\/compare$/,
  /^\/community$/,
  /^\/community\/(home|mentors|scholars|checkin|partners|forum|camps)$/,
  /^\/cert$/,
  /^\/mall$/,
  /^\/privacy$/,
  /^\/about$/,
  /^\/instructors$/,
  /^\/instructors\/[^/]+$/,
  /^\/methodology$/,
  /^\/outcomes$/,
  /^\/safety-and-privacy$/,
  /^\/news$/,
  /^\/news\/[^/]+$/,
]

function normalizePath(pathname) {
  if (!pathname || pathname === '/') return '/'
  return pathname.replace(/\/+$/, '') || '/'
}

function resolveCoursesQueryRedirect(searchParams) {
  if (coursesHasLegacyTypeParam(searchParams)) {
    const type = searchParams.get('type')
    return resolveCoursesTypeRedirect(type)
  }

  const line = searchParams.get('line')?.trim()
  if (!line) return null

  const sub = searchParams.get('sub')?.trim() || ''

  if (!VALID_PRODUCT_LINES.has(line)) {
    return coursePathFromLineQuery('ioai', sub)
  }

  if (line === 'ioai' && sub === 'module') {
    return '/courses/ioai'
  }

  if (sub && isProductLabSub(line, sub)) {
    return labsPath(line, sub)
  }

  return coursePathFromLineQuery(line, sub)
}

function resolveCoursePathRoute(path) {
  const parsed = parseCoursePathname(path)
  if (!parsed) return null

  if (parsed.invalid) {
    return { status: 404, path, reason: 'course-line-not-found' }
  }

  if (parsed.hub) return null

  const { lineId, lineSlug, subSlug } = parsed

  if (subSlug === 'module' && lineId === 'ioai') {
    return { status: 301, path, location: '/courses/ioai', reason: 'legacy-sub' }
  }

  if (subSlug && isProductLabSub(lineId, subSlug)) {
    return { status: 301, path, location: labsPath(lineId, subSlug), reason: 'lab-sub' }
  }

  if (subSlug && !isValidCourseSub(lineId, subSlug)) {
    return { status: 404, path, reason: 'course-sub-not-found' }
  }

  return { status: 200, path: subSlug ? courseLinePath(lineSlug, subSlug) : courseLinePath(lineSlug) }
}

function matchesKnownPattern(path) {
  return KNOWN_PATH_PATTERNS.some((re) => re.test(path))
}

/**
 * @returns {{ status: number, location?: string, path: string, reason?: string }}
 */
export async function resolveRoute(pathname, search = '') {
  const path = normalizePath(pathname)
  const searchParams = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)

  // 410 — permanently removed
  if (GONE_PATHS.has(path)) {
    return { status: 410, path, reason: 'gone' }
  }

  // 301 — exact pathname redirects
  if (PERMANENT_REDIRECTS[path]) {
    return { status: 301, path, location: PERMANENT_REDIRECTS[path], reason: 'legacy-path' }
  }

  // 301 — prefix redirects
  for (const { prefix, target } of PREFIX_REDIRECTS) {
    if (path.startsWith(prefix)) {
      return { status: 301, path, location: target, reason: 'legacy-prefix' }
    }
  }

  // Course line/sub paths — /courses/ioai, /courses/foundations/course, etc.
  const courseRoute = resolveCoursePathRoute(path)
  if (courseRoute) return courseRoute

  // 301 — /courses query normalization
  if (path === '/courses') {
    const queryRedirect = resolveCoursesQueryRedirect(searchParams)
    if (queryRedirect) {
      const current = `${path}${search ? (search.startsWith('?') ? search : `?${search}`) : ''}`
      const normalized = queryRedirect
      if (current !== normalized) {
        return { status: 301, path, location: normalized, reason: 'legacy-query' }
      }
    }
    return { status: 301, path, location: '/courses/ioai', reason: 'courses-hub' }
  }

  // App layer — 200 + noindex (not an error)
  if (isNoindexPath(path)) {
    return { status: 200, path, reason: 'app' }
  }

  // Dynamic detail pages — must exist in DB or fallback
  const newsMatch = path.match(/^\/news\/([^/]+)$/)
  if (newsMatch) {
    const article = await fetchNewsArticle(decodeURIComponent(newsMatch[1]))
    return article
      ? { status: 200, path: `/news/${article.slug}` }
      : { status: 404, path, reason: 'news-not-found' }
  }

  const courseMatch = path.match(/^\/courses\/detail\/([^/]+)$/)
  if (courseMatch) {
    const course = await fetchCourseBySlug(decodeURIComponent(courseMatch[1]))
    return course
      ? { status: 200, path: `/courses/detail/${course.slug}` }
      : { status: 404, path, reason: 'course-not-found' }
  }

  const labPackMatch = path.match(/^\/labs\/pack\/([^/]+)$/)
  if (labPackMatch) {
    const pack = await fetchLabPackBySlug(decodeURIComponent(labPackMatch[1]))
    return pack
      ? { status: 200, path: `/labs/pack/${pack.slug}` }
      : { status: 404, path, reason: 'lab-pack-not-found' }
  }

  const labExpMatch = path.match(/^\/labs\/pack\/([^/]+)\/experiments\/([^/]+)$/)
  if (labExpMatch) {
    const packSlug = decodeURIComponent(labExpMatch[1])
    const experimentSlug = decodeURIComponent(labExpMatch[2])
    const experiment = await fetchLabExperiment(packSlug, experimentSlug)
    return experiment
      ? { status: 200, path: `/labs/pack/${packSlug}/experiments/${experimentSlug}` }
      : { status: 404, path, reason: 'experiment-not-found' }
  }

  // Program pages — slug must be valid
  const programMatch = path.match(/^\/programs\/([^/]+)$/)
  if (programMatch) {
    const slug = programMatch[1]
    return VALID_PROGRAM_SLUGS.has(slug) && getProgram(slug)
      ? { status: 200, path: `/programs/${slug}` }
      : { status: 404, path, reason: 'program-not-found' }
  }

  // Static SEO pages
  if (getStaticSeoForPath(path)) {
    return { status: 200, path }
  }

  // Other known SPA routes (exploration labs, showcase, ioai paths, etc.)
  if (matchesKnownPattern(path)) {
    // Validate exploration lab slug
    const explorationMatch = path.match(/^\/exploration\/([^/]+)$/)
    if (explorationMatch && !EXPLORATION_LABS.has(explorationMatch[1])) {
      return { status: 404, path, reason: 'exploration-not-found' }
    }

    const instructorMatch = path.match(/^\/instructors\/([^/]+)$/)
    if (instructorMatch && !getInstructor(instructorMatch[1])) {
      return { status: 404, path, reason: 'instructor-not-found' }
    }

    const communityMatch = path.match(/^\/community\/([^/]+)$/)
    if (communityMatch && !COMMUNITY_SECTIONS.has(communityMatch[1])) {
      return { status: 404, path, reason: 'community-not-found' }
    }

    return { status: 200, path }
  }

  // Admin paths under /admin are noindex but valid
  if (path.startsWith('/admin')) {
    return { status: 200, path, reason: 'app' }
  }

  return { status: 404, path, reason: 'not-found' }
}

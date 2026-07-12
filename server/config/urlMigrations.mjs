/**
 * Canonical URL migration table — single source of truth for SEO routing.
 *
 * Columns: oldUrl → finalUrl → status → sitemap → canonical → index
 *
 * | Old URL                    | Final URL                        | Status | Sitemap | Canonical | Index |
 * |----------------------------|----------------------------------|--------|---------|-----------|-------|
 * | /events                    | /programs/ioai                   | 301    | no      | final     | no    |
 * | /research                  | /programs/ioai                   | 301    | no      | final     | no    |
 * | /career                    | /community                       | 301    | no      | final     | no    |
 * | /pricing                   | /cert                            | 301    | no      | final     | no    |
 * | /tools, /tools/detail/*    | /mall                            | 301    | no      | final     | no    |
 * | /ai-test                   | /assessment                      | 301    | no      | final     | no    |
 * | /mall/materials            | /mall                            | 301    | no      | final     | no    |
 * | /lab, /lab/*               | /labs or /exploration/*          | 301    | no      | final     | no    |
 * | /showcase/school           | /showcase                        | 301    | no      | final     | no    |
 * | /ioai                      | /courses/ioai                    | 301    | no      | final     | no    |
 * | /charity                   | —                                | 410    | no      | —         | no    |
 * | /courses?type=video        | /courses/ioai/video              | 301    | no      | final     | no    |
 * | /courses?type=course       | /courses/foundations/course      | 301    | no      | final     | no    |
 * | /courses?type=module       | /courses/ioai                    | 301    | no      | final     | no    |
 * | /courses?type=event(s)     | /programs/ioai                   | 301    | no      | final     | no    |
 * | /courses?type=exam         | /assessment                      | 301    | no      | final     | no    |
 * | /courses?type=literacy     | /programs/foundations            | 301    | no      | final     | no    |
 * | /courses?type=cert         | /cert                            | 301    | no      | final     | no    |
 * | /courses (bare)            | /courses/ioai                    | 301    | no      | final     | no    |
 * | /courses?type=* (unknown)  | /courses/ioai                    | 301    | no      | final     | no    |
 * | /programs/ioai             | (self)                           | 200    | yes     | self      | yes   |
 * | /programs/foundations      | (self)                           | 200    | yes     | self      | yes   |
 * | /programs/k12              | (self)                           | 200    | yes     | self      | yes   |
 * | /courses?line=*            | /courses/:lineSlug               | 301    | no      | final     | no    |
 * | /courses/ioai              | (self)                           | 200    | yes     | self      | yes   |
 * | /courses/foundations       | (self)                           | 200    | yes     | self      | yes   |
 * | /courses/k12               | (self)                           | 200    | yes     | self      | yes   |
 * | /courses/:line/:sub        | (self, non-lab subs)             | 200    | yes     | self      | yes   |
 * | /courses?stage=&buy=       | —                                | 200    | no      | parent    | no*   |
 * | /login, /profile, /admin/* | (self)                           | 200    | no      | self      | no    |
 *
 * * Filter/query views are reachable but excluded from sitemap; canonical is the parent line path without params.
 */

export const SITE_BRAND = 'Bingo Academy'

/** Permanent pathname redirects — 301 */
export const PERMANENT_REDIRECTS = {
  '/events': '/programs/ioai',
  '/research': '/programs/ioai',
  '/career': '/community',
  '/pricing': '/cert',
  '/tools': '/mall',
  '/ai-test': '/assessment',
  '/mall/materials': '/mall',
  '/lab': '/labs',
  '/showcase/school': '/showcase',
  '/ioai': '/courses/ioai',
  '/courses': '/courses/ioai',
  '/lab/hide-and-seek': '/exploration/hide-and-seek',
  '/lab/virtual-conductor': '/exploration/virtual-conductor',
  '/lab/word-gravity': '/exploration/word-gravity',
  '/lab/jailbreak-adventure': '/exploration/jailbreak-adventure',
  '/lab/evolve-car': '/exploration/evolve-car',
  '/lab/doodle-monsters': '/exploration/doodle-monsters',
  '/lab/cyber-tennis': '/exploration/cyber-tennis',
  '/case-studies': '/outcomes',
}

export const PREFIX_REDIRECTS = [{ prefix: '/tools/detail/', target: '/mall' }]

/** Permanently removed — 410 Gone, never in sitemap */
export const GONE_PATHS = new Set(['/charity'])

/** Legacy /courses?type=… → canonical destination; unknown types fall back to /courses */
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

/** Paths that must never appear in any sitemap */
export const SITEMAP_EXCLUDED_PATHS = new Set([
  ...Object.keys(PERMANENT_REDIRECTS),
  ...GONE_PATHS,
  '/login',
  '/register',
  '/profile',
  '/charity',
  '/pricing',
  '/events',
  '/research',
  '/career',
  '/tools',
  '/ai-test',
])

export function resolveCoursesTypeRedirect(type) {
  if (!type) return null
  const key = type.trim().toLowerCase()
  if (COURSES_TYPE_TO_PATH[key]) return COURSES_TYPE_TO_PATH[key]
  return '/courses/ioai'
}

export function coursesHasLegacyTypeParam(searchParams) {
  return Boolean(searchParams.get('type')?.trim())
}

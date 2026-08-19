/** URL slug ↔ courses `line` query param (duplicated from programs.js for Node-safe imports) */
const PROGRAM_SLUG_TO_LINE = {
  foundations: 'general',
  ioai: 'ioai',
  k12: 'k12',
}

function lineFromProgramSlug(slug) {
  return PROGRAM_SLUG_TO_LINE[slug] || 'ioai'
}

export const PRODUCT_LINE_VISIBILITY_KEY = 'product_lines'

export const PRODUCT_LINE_IDS = ['ioai', 'general', 'k12']

export const DEFAULT_PRODUCT_LINE_VISIBILITY = {
  ioai: true,
  general: false,
  k12: false,
}

/** Admin UI labels — matches storefront product line names */
export const PRODUCT_LINE_ADMIN_META = [
  { id: 'ioai', icon: '🏆', name: 'IOAI Competition Training' },
  { id: 'general', icon: '🌐', name: 'Foundations of AI Program' },
  { id: 'k12', icon: '🏫', name: 'K12 Classroom School Edition' },
]

export function mergeProductLineVisibility(value) {
  const next = { ...DEFAULT_PRODUCT_LINE_VISIBILITY }
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    for (const id of PRODUCT_LINE_IDS) {
      if (typeof value[id] === 'boolean') next[id] = value[id]
    }
  }
  return next
}

export function lineIdFromHref(href) {
  if (!href || typeof href !== 'string') return null
  const lineMatch = href.match(/[?&]line=([^&]+)/)
  if (lineMatch) return lineMatch[1]
  const programMatch = href.match(/^\/programs\/([^/?#]+)/)
  if (programMatch) return lineFromProgramSlug(programMatch[1])
  if (href === '/ioai' || href.startsWith('/ioai/')) return 'ioai'
  const mallTabMatch = href.match(/[?&]tab=(ioai|general|k12)(?:&|$)/)
  if (mallTabMatch) return mallTabMatch[1]
  return null
}

export function lineIdFromBannerSlide(slide) {
  if (slide?.id && PRODUCT_LINE_IDS.includes(slide.id)) return slide.id
  return lineIdFromHref(slide?.href)
}

/** Grid layout for 1–3 visible product-line cards (centered, responsive). */
export function adaptiveCountGridClass(count) {
  const n = Math.min(Math.max(count, 1), 3)
  if (n === 1) return 'grid grid-cols-1 gap-4 sm:gap-5 max-w-md mx-auto w-full'
  if (n === 2) return 'grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 max-w-3xl mx-auto w-full'
  return 'grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 max-w-5xl mx-auto w-full'
}

export function productLineSectionTitle(count) {
  if (count === 1) return 'Our Product Line'
  if (count === 2) return 'Two Product Lines'
  return 'Three Product Lines'
}

export function heroPathsSubtitle(programs) {
  const n = programs?.length ?? 0
  if (n === 0) return 'Explore IOAI-oriented training and assessment.'
  if (n === 1) {
    const p = programs[0]
    return p.audience || `Explore ${p.shortTitle || p.title}.`
  }
  if (n === 2) {
    const a = programs[0].shortTitle || programs[0].title
    const b = programs[1].shortTitle || programs[1].title
    return `${a} or ${b} — pick your path.`
  }
  return 'Three clear paths — IOAI competition training, self-study literacy or K12 classroom delivery.'
}

/** Course URL slug → product line id */
const COURSE_SLUG_TO_LINE = {
  ioai: 'ioai',
  foundations: 'general',
  k12: 'k12',
}

/** Guide clusters promoted during phase 1 (excludes k12 school deployment guides) */
export const PHASE1_GUIDE_CLUSTERS = ['parents', 'ioai']

/** Routes excluded from phase-1 sitemap and internal promotion */
export const PHASE1_HIDDEN_ROUTE_PREFIXES = [
  '/programs/foundations',
  '/programs/k12',
  '/courses/foundations',
  '/courses/k12',
  '/mall',
  '/community',
  '/cert',
  '/compare',
  '/career',
]

export function isPhase1HiddenRoute(path) {
  if (!path || typeof path !== 'string') return false
  const normalized = path.split('?')[0].split('#')[0]
  return PHASE1_HIDDEN_ROUTE_PREFIXES.some(
    (prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`)
  )
}

export function visibleCourseLineSlugs(visibility = DEFAULT_PRODUCT_LINE_VISIBILITY) {
  return Object.entries(COURSE_SLUG_TO_LINE)
    .filter(([, lineId]) => visibility[lineId])
    .map(([slug]) => slug)
}

export function visibleGuideClusters() {
  return [...PHASE1_GUIDE_CLUSTERS]
}

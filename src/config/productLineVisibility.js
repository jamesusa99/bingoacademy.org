import { lineFromProgramSlug } from './programs'

export const PRODUCT_LINE_VISIBILITY_KEY = 'product_lines'

export const PRODUCT_LINE_IDS = ['ioai', 'general', 'k12']

export const DEFAULT_PRODUCT_LINE_VISIBILITY = Object.fromEntries(
  PRODUCT_LINE_IDS.map((id) => [id, true])
)

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
  if (n === 0) return 'Explore courses, labs, and certification.'
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

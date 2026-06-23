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

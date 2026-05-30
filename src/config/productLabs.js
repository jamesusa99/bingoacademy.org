import { PRODUCT_LINES } from './products'

/**
 * Lab modules per product line (courses catalogue subcategories).
 * Separate from AI Exploration — free browser games at /exploration.
 */
export const PRODUCT_LAB_MODULE_IDS = {
  general: ['online-lab', 'materials-pack'],
  ioai: ['online-lab'],
  k12: ['online-lab', 'materials-pack', 'offline-lab', 'school-kit'],
}

export const PRODUCT_LABS_INTRO = {
  title: 'Product labs & kits',
  desc: 'Structured online labs, training labs, and physical kits tied to Foundations, IOAI, and K12 programs — enroll or purchase through courses and the mall.',
  explorationNote:
    'Looking for free browser games? AI Exploration is a separate play zone — no enrollment, not tied to product lines.',
  explorationHref: '/exploration',
}

export function isProductLabSub(lineId, subId) {
  return (PRODUCT_LAB_MODULE_IDS[lineId] || []).includes(subId)
}

/** Deep link into /labs for a program line and optional lab module */
export function labsPath(lineId, subId) {
  const params = new URLSearchParams()
  if (lineId) params.set('line', lineId)
  if (subId) params.set('sub', subId)
  const q = params.toString()
  return q ? `/labs?${q}` : '/labs'
}

export function getProductLabTracks() {
  return PRODUCT_LINES.map((line) => {
    const moduleIds = PRODUCT_LAB_MODULE_IDS[line.id] || []
    const modules = line.subcategories.filter((s) => moduleIds.includes(s.id))
    return {
      lineId: line.id,
      lineName: line.name,
      lineIcon: line.icon,
      lineHref: line.to,
      gradient: line.gradient,
      border: line.border,
      tagline: line.tagline,
      modules: modules.map((m) => ({
        ...m,
        href: labsPath(line.id, m.id),
      })),
    }
  }).filter((t) => t.modules.length > 0)
}

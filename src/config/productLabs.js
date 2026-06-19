import { PRODUCT_LINES } from './products'
import { LAB_MATERIAL_TYPES } from './labMaterials'

/**
 * Lab modules per product line (courses catalogue subcategories).
 * Separate from AI Exploration — free browser games at /exploration.
 */
export const PRODUCT_LAB_MODULE_IDS = {
  general: ['online-lab', 'materials-pack'],
  ioai: LAB_MATERIAL_TYPES.map((t) => t.id),
  k12: ['online-lab', 'materials-pack', 'offline-lab', 'school-kit'],
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
    const fromLine = line.subcategories.filter((s) => moduleIds.includes(s.id))
    const fromLabTypes = LAB_MATERIAL_TYPES.filter((t) => moduleIds.includes(t.id)).map((t) => ({
      id: t.id,
      name: t.name,
      icon: t.icon,
      desc: 'Browse and purchase standalone lab & kit listings',
    }))
    const modules = fromLine.length ? fromLine.map((m) => ({ ...m, href: labsPath(line.id, m.id) })) : fromLabTypes.map((m) => ({ ...m, href: labsPath(line.id, m.id) }))
    return {
      lineId: line.id,
      lineName: line.name,
      lineIcon: line.icon,
      lineHref: line.to,
      gradient: line.gradient,
      border: line.border,
      tagline: line.tagline,
      modules,
    }
  }).filter((t) => t.modules.length > 0)
}

/** Admin sidebar: AI Mall hub sections (mirrors /mall storefront tabs) */

import { MALL_ADMIN_TAB_IDS, MALL_STOREFRONT_TABS } from './mallTabs'

export const MALL_ADMIN_BASE = '/admin/mall'

const ADMIN_TAB_LABEL_KEYS = {
  home: 'nav.mallHome',
  ioai: 'nav.mallIoai',
  general: 'nav.mallGeneral',
  k12: 'nav.mallK12',
  cert: 'nav.mallCert',
  materials: 'nav.mallMaterials',
  lab: 'nav.mallLab',
}

/** Admin nav order matches storefront tab bar */
const ADMIN_TAB_ORDER = ['home', 'ioai', 'general', 'k12', 'cert', 'materials', 'lab']

export const MALL_ADMIN_SECTIONS = ADMIN_TAB_ORDER.filter((id) => MALL_ADMIN_TAB_IDS.includes(id)).map(
  (id) => {
    const storefront = MALL_STOREFRONT_TABS.find((t) => t.id === id)
    return {
      id,
      path: `${MALL_ADMIN_BASE}/${id}`,
      labelKey: ADMIN_TAB_LABEL_KEYS[id],
      icon: storefront?.icon ?? '🛒',
    }
  }
)

export const MALL_ADMIN_COLLAPSIBLE = {
  type: 'collapsible',
  id: 'mall',
  labelKey: 'nav.mallHub',
  icon: '🛒',
  basePath: MALL_ADMIN_BASE,
  children: MALL_ADMIN_SECTIONS,
}

export function isMallAdminPath(pathname) {
  return pathname === MALL_ADMIN_BASE || pathname.startsWith(`${MALL_ADMIN_BASE}/`)
}

export function mallAdminSectionFromPath(pathname) {
  const match = MALL_ADMIN_SECTIONS.find(
    (s) => pathname === s.path || pathname.startsWith(`${s.path}/`)
  )
  return match?.id ?? null
}

/** Legacy paths → new tab sections */
export const MALL_ADMIN_LEGACY_REDIRECTS = {
  courses: 'general',
  products: 'materials',
}

/** Admin sidebar: AI Mall hub sections (mirrors /mall product sources) */

export const MALL_ADMIN_BASE = '/admin/mall'

export const MALL_ADMIN_SECTIONS = [
  { id: 'courses', path: '/admin/mall/courses', labelKey: 'nav.mallCourses', icon: '🎓' },
  { id: 'products', path: '/admin/mall/products', labelKey: 'nav.mallProducts', icon: '📦' },
]

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

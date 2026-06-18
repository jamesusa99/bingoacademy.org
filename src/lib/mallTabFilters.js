import { getMallAdminTabConfig } from '../config/mallTabs'

const isRetail = (item) => item?.price != null && item.price !== ''

function courseMatchesLegacyTab(course, tabId) {
  if (tabId === 'ioai') {
    return course.cat === 'competition' || String(course.badge || '').includes('Competition')
  }
  if (tabId === 'general') {
    const badge = String(course.badge || '')
    return !badge.includes('Competition') && !badge.includes('Lab Bundle')
  }
  return false
}

function productMatchesLegacyTab(product, tabId) {
  const config = getMallAdminTabConfig(tabId)
  if (!config?.productTypes?.length) return false
  return config.productTypes.includes(product.type)
}

/** Courses shown on a mall tab (courses table / mall retail cards) */
export function filterMallCoursesForTab(courses, tabId) {
  if (!Array.isArray(courses) || !tabId) return []
  return courses.filter((course) => {
    if (course.mall_tab) return course.mall_tab === tabId
    return courseMatchesLegacyTab(course, tabId)
  })
}

/** Products shown on a mall tab (mall_products table) */
export function filterMallProductsForTab(products, tabId) {
  if (!Array.isArray(products) || !tabId) return []
  const config = getMallAdminTabConfig(tabId)
  if (!config?.productTypes?.length) return []

  return products.filter((product) => {
    if (product.mall_tab) return product.mall_tab === tabId
    return productMatchesLegacyTab(product, tabId)
  })
}

/** Retail courses/products for flash deals on Mall Home */
export function filterMallFlashDealItems({ courses = [], products = [], limit = 6 } = {}) {
  const featured = [
    ...courses.filter((c) => c.featured_home && isRetail(c)),
    ...products.filter((p) => p.featured_home && isRetail(p)),
  ]
  const seen = new Set(featured.map((item) => `${item.source || 'course'}-${item.id}`))
  const pool = [...courses.filter(isRetail), ...products.filter(isRetail)].filter((item) => {
    const key = `${item.source || 'course'}-${item.id}`
    return !seen.has(key)
  })
  return [...featured, ...pool].slice(0, limit)
}

export { isRetail as isMallRetailItem }

/**
 * Labs storefront visibility — hide nav/banner while content is in progress.
 * Routes under /labs remain reachable for direct URL testing.
 *
 * Re-enable when ready: set VITE_LABS_STOREFRONT_VISIBLE=true in .env
 * or flip LABS_STOREFRONT_VISIBLE_DEFAULT below.
 */
const LABS_STOREFRONT_VISIBLE_DEFAULT = false

export const LABS_STOREFRONT_VISIBLE =
  import.meta.env.VITE_LABS_STOREFRONT_VISIBLE === 'true' || LABS_STOREFRONT_VISIBLE_DEFAULT

export function isLabsNavPath(path) {
  return path === '/labs' || path === '/lab' || path?.startsWith('/labs/')
}

export function isLabsStorefrontLink(href) {
  if (LABS_STOREFRONT_VISIBLE || !href) return true
  if (href === '/labs' || href.startsWith('/labs?') || href.startsWith('/labs/')) return false
  return true
}

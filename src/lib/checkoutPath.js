import { authLink } from './authRedirect'

export function buildCheckoutPath({ courseSlug, purchaseType, addonSlugs = [], returnPath }) {
  const params = new URLSearchParams()
  params.set('item', courseSlug)
  if (purchaseType) params.set('type', purchaseType)
  if (addonSlugs?.length) params.set('addons', addonSlugs.join(','))
  if (returnPath) params.set('return', returnPath)
  return `/checkout?${params.toString()}`
}

/** Navigate to the on-site review page (promo + item list) instead of Stripe. */
export function goToSecureCheckout({
  navigate,
  isAuthenticated,
  courseSlug,
  purchaseType,
  addonSlugs = [],
  returnPath,
}) {
  if (!courseSlug || !navigate) return
  const path = buildCheckoutPath({ courseSlug, purchaseType, addonSlugs, returnPath })
  if (!isAuthenticated) {
    navigate(authLink('/login', path))
    return
  }
  navigate(path)
}

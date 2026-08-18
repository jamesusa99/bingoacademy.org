import { goToSecureCheckout } from './checkoutPath'
import { IOAI_FULL_BUNDLE_SLUG } from './ioaiAccess'

export async function purchaseIoaiModule({
  catalogSlug,
  addonSlugs = [],
  isAuthenticated,
  navigate,
}) {
  if (!catalogSlug) return
  const returnPath = `/courses/module/${encodeURIComponent(catalogSlug)}`

  goToSecureCheckout({
    navigate,
    isAuthenticated,
    courseSlug: catalogSlug,
    purchaseType: 'module',
    addonSlugs,
    returnPath,
  })
}

export async function purchaseIoaiBundle({
  bundleSlug,
  isAuthenticated,
  navigate,
  returnPath = '/courses/ioai',
}) {
  if (!bundleSlug) return

  goToSecureCheckout({
    navigate,
    isAuthenticated,
    courseSlug: bundleSlug,
    purchaseType: bundleSlug === IOAI_FULL_BUNDLE_SLUG ? 'ioai_track' : 'bundle',
    returnPath,
  })
}

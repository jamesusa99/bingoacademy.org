import { authLink } from './authRedirect'
import { AuthRequiredError, startCourseCheckout } from './checkout'
import { IOAI_FULL_BUNDLE_SLUG } from './ioaiAccess'

export async function purchaseIoaiModule({
  catalogSlug,
  addonSlugs = [],
  stripeCheckout,
  isAuthenticated,
  navigate,
  setCheckoutLoading,
  onDemoUnlock,
}) {
  if (!catalogSlug) return
  const returnPath = `/courses/module/${encodeURIComponent(catalogSlug)}`

  if (!isAuthenticated) {
    navigate(authLink('/login', returnPath))
    return
  }

  if (!stripeCheckout) {
    onDemoUnlock?.module?.(catalogSlug, addonSlugs)
    return
  }

  setCheckoutLoading?.(true)
  try {
    const { url } = await startCourseCheckout({
      courseSlug: catalogSlug,
      purchaseType: 'module',
      addonSlugs,
      returnPath,
    })
    if (url) window.location.href = url
  } catch (err) {
    if (err instanceof AuthRequiredError) {
      navigate(authLink('/login', returnPath))
      return
    }
    alert(err.message || 'Checkout failed')
    setCheckoutLoading?.(false)
  }
}

export async function purchaseIoaiBundle({
  bundleSlug,
  stripeCheckout,
  isAuthenticated,
  navigate,
  setCheckoutLoading,
  onDemoUnlock,
  returnPath = '/ioai',
}) {
  if (!bundleSlug) return

  if (!isAuthenticated) {
    navigate(authLink('/login', returnPath))
    return
  }

  if (!stripeCheckout) {
    onDemoUnlock?.bundle?.(bundleSlug)
    return
  }

  setCheckoutLoading?.(true)
  try {
    const purchaseType = bundleSlug === IOAI_FULL_BUNDLE_SLUG ? 'ioai_track' : 'bundle'
    const { url } = await startCourseCheckout({
      courseSlug: bundleSlug,
      purchaseType,
      returnPath,
    })
    if (url) window.location.href = url
  } catch (err) {
    if (err instanceof AuthRequiredError) {
      navigate(authLink('/login', returnPath))
      return
    }
    alert(err.message || 'Checkout failed')
    setCheckoutLoading?.(false)
  }
}

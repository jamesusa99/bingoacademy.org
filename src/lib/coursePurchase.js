import { authLink } from './authRedirect'
import { AuthRequiredError } from './checkout'
import { startCourseCheckout } from './checkout'

/** Start Stripe checkout or demo unlock for a course */
export async function initiateCoursePurchase({
  course,
  purchaseType,
  stripeCheckout,
  isAuthenticated,
  navigate,
  setCheckoutLoading,
  onDemoUnlock,
}) {
  if (!course?.id) return

  const returnPath = `/courses/detail/${course.id}`

  if (!isAuthenticated) {
    navigate(authLink('/login', returnPath))
    return
  }

  if (!stripeCheckout) {
    if (purchaseType === 'ioai_track') onDemoUnlock?.track?.()
    else onDemoUnlock?.lesson?.()
    return
  }

  setCheckoutLoading?.(true)
  try {
    const { url } = await startCourseCheckout({
      courseSlug: course.id,
      purchaseType,
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

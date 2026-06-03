import { authLink } from './authRedirect'
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

  if (!isAuthenticated) {
    navigate(authLink('/login', `/courses/detail/${course.id}`))
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
    alert(err.message || 'Checkout failed')
    setCheckoutLoading?.(false)
  }
}

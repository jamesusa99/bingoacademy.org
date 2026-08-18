import { goToSecureCheckout } from './checkoutPath'

/** Open the on-site checkout review page (promo + item list), then Stripe. */
export async function initiateCoursePurchase({
  course,
  purchaseType,
  isAuthenticated,
  navigate,
  returnPath: returnPathOverride,
}) {
  if (!course?.id) return

  const returnPath = returnPathOverride || `/courses/detail/${course.id}`

  goToSecureCheckout({
    navigate,
    isAuthenticated,
    courseSlug: course.id,
    purchaseType,
    returnPath,
  })
}

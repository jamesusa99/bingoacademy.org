import { useMemo, useCallback } from 'react'
import { usePurchasedCourses } from './usePurchasedCourses'

export function useCourseAccess(courseId) {
  const {
    isAuthenticated,
    purchased,
    hasAccess: checkAccess,
    hasTrack,
    unlockLesson: unlockLessonById,
    unlockTrack,
    refresh,
    stripeCheckout,
    checkoutSlug,
    setCheckoutSlug,
    checkoutLoading,
  } = usePurchasedCourses()

  const hasAccess = useMemo(
    () => (courseId ? checkAccess(courseId) : false),
    [courseId, checkAccess]
  )

  const unlockLesson = useCallback(() => {
    if (courseId) unlockLessonById(courseId)
  }, [courseId, unlockLessonById])

  const setCheckoutLoading = useCallback(
    (busy) => setCheckoutSlug(busy ? courseId : null),
    [courseId, setCheckoutSlug]
  )

  return {
    hasAccess,
    hasTrack,
    purchased,
    unlockLesson,
    unlockTrack,
    refresh,
    stripeCheckout,
    checkoutLoading: checkoutSlug === courseId,
    setCheckoutLoading,
    isAuthenticated,
  }
}

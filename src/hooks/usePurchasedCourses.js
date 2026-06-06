import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  getPurchasedSlugs,
  hasCourseAccess,
  hasFullIOAITrack,
  purchaseIOAITrack,
  purchaseLesson,
  savePurchasedSlugs,
} from '../lib/courseAccess'
import { fetchMyEnrollments, fetchPaymentsConfig } from '../lib/checkout'
import { fetchMyIoaiAccess } from '../lib/ioaiStore'
import { useAuth } from '../contexts/AuthContext'

function mergeSlugs(local, remote) {
  return [...new Set([...(local || []), ...(remote || [])])]
}

/** Shared enrollments + Stripe config for course list and detail pages */
export function usePurchasedCourses() {
  const { isAuthenticated } = useAuth()
  const [version, setVersion] = useState(0)
  const [remoteSlugs, setRemoteSlugs] = useState([])
  const [ioaiLessonSlugs, setIoaiLessonSlugs] = useState([])
  const [stripeCheckout, setStripeCheckout] = useState(false)
  const [checkoutSlug, setCheckoutSlug] = useState(null)

  useEffect(() => {
    fetchPaymentsConfig()
      .then((cfg) => setStripeCheckout(Boolean(cfg.stripeCheckout)))
      .catch(() => setStripeCheckout(false))
  }, [])

  const loadEnrollments = useCallback(async () => {
    if (!isAuthenticated) {
      setRemoteSlugs([])
      setIoaiLessonSlugs([])
      return
    }
    try {
      const [{ slugs }, ioai] = await Promise.all([
        fetchMyEnrollments(),
        fetchMyIoaiAccess().catch(() => ({ lessonSlugs: [], moduleSlugs: [] })),
      ])
      setRemoteSlugs(slugs || [])
      setIoaiLessonSlugs(ioai.lessonSlugs || [])
      if (slugs?.length) {
        savePurchasedSlugs(mergeSlugs(getPurchasedSlugs(), slugs))
      }
    } catch {
      setRemoteSlugs([])
      setIoaiLessonSlugs([])
    }
    setVersion((v) => v + 1)
  }, [isAuthenticated])

  useEffect(() => {
    loadEnrollments()
  }, [loadEnrollments])

  const purchased = useMemo(
    () => mergeSlugs(mergeSlugs(getPurchasedSlugs(), remoteSlugs), ioaiLessonSlugs),
    [remoteSlugs, ioaiLessonSlugs, version]
  )

  const hasAccess = useCallback(
    (courseId) => hasCourseAccess(courseId, purchased),
    [purchased, version]
  )

  const hasTrack = useMemo(() => hasFullIOAITrack(purchased), [purchased, version])

  const refresh = useCallback(() => {
    loadEnrollments()
  }, [loadEnrollments])

  const unlockLesson = useCallback(
    (courseId) => {
      purchaseLesson(courseId)
      refresh()
    },
    [refresh]
  )

  const unlockTrack = useCallback(() => {
    purchaseIOAITrack()
    refresh()
  }, [refresh])

  return {
    isAuthenticated,
    purchased,
    hasAccess,
    hasTrack,
    unlockLesson,
    unlockTrack,
    refresh,
    stripeCheckout,
    checkoutSlug,
    setCheckoutSlug,
    checkoutLoading: Boolean(checkoutSlug),
  }
}

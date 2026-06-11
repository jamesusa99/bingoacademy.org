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
  const [ioaiModuleSlugs, setIoaiModuleSlugs] = useState([])
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
      setIoaiModuleSlugs([])
      setIoaiLessonSlugs([])
      return
    }
    try {
      const [{ slugs }, ioai] = await Promise.all([
        fetchMyEnrollments(),
        fetchMyIoaiAccess().catch(() => ({ lessonSlugs: [], moduleSlugs: [] })),
      ])
      setRemoteSlugs(slugs || [])
      setIoaiModuleSlugs(ioai.moduleSlugs || [])
      setIoaiLessonSlugs(ioai.lessonSlugs || [])
      if (slugs?.length) {
        savePurchasedSlugs(mergeSlugs(getPurchasedSlugs(), slugs))
      }
    } catch {
      setRemoteSlugs([])
      setIoaiModuleSlugs([])
      setIoaiLessonSlugs([])
    }
    setVersion((v) => v + 1)
  }, [isAuthenticated])

  useEffect(() => {
    loadEnrollments()
  }, [loadEnrollments])

  const enrollmentSlugs = useMemo(
    () => mergeSlugs(getPurchasedSlugs(), remoteSlugs),
    [remoteSlugs, version]
  )

  const purchased = useMemo(
    () => mergeSlugs(enrollmentSlugs, ioaiLessonSlugs),
    [enrollmentSlugs, ioaiLessonSlugs, version]
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
    enrollmentSlugs,
    ioaiModuleSlugs,
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

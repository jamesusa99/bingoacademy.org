import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  getPurchasedSlugs,
  hasCourseAccess,
  hasFullIOAITrack,
  purchaseIOAITrack,
  purchaseLesson,
  savePurchasedSlugs,
} from '../lib/courseAccess'
import { fetchPaymentsConfig } from '../lib/checkout'
import { fetchMyEnrollmentsCached, fetchMyIoaiAccessCached, invalidateEnrollmentAccessCache } from '../lib/enrollmentAccessCache'
import { mergeIoaiAccessState, readLocalIoaiAccessState } from '../lib/ioaiAccess'
import { useAuth } from '../contexts/AuthContext'

function mergeSlugs(local, remote) {
  return [...new Set([...(local || []), ...(remote || [])])]
}

/** Shared enrollments + Stripe config for course list and detail pages */
export function usePurchasedCourses() {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const localSnapshot = readLocalIoaiAccessState()
  const [version, setVersion] = useState(0)
  const [remoteSlugs, setRemoteSlugs] = useState(localSnapshot.enrolledSlugs)
  const [ioaiModuleSlugs, setIoaiModuleSlugs] = useState(localSnapshot.moduleSlugs)
  const [ioaiLessonSlugs, setIoaiLessonSlugs] = useState([])
  const [ioaiHasFullTrack, setIoaiHasFullTrack] = useState(localSnapshot.hasFullTrack)
  const [stripeCheckout, setStripeCheckout] = useState(false)
  const [checkoutSlug, setCheckoutSlug] = useState(null)
  const [syncedOnce, setSyncedOnce] = useState(false)

  useEffect(() => {
    fetchPaymentsConfig()
      .then((cfg) => setStripeCheckout(Boolean(cfg.stripeCheckout)))
      .catch(() => setStripeCheckout(false))
  }, [])

  const loadEnrollments = useCallback(async ({ force = false } = {}) => {
    if (authLoading) return

    if (!isAuthenticated) {
      setRemoteSlugs([])
      setIoaiModuleSlugs([])
      setIoaiLessonSlugs([])
      setIoaiHasFullTrack(false)
      setSyncedOnce(true)
      return
    }

    const cached = readLocalIoaiAccessState()
    setRemoteSlugs(cached.enrolledSlugs)
    setIoaiModuleSlugs(cached.moduleSlugs)
    setIoaiHasFullTrack(cached.hasFullTrack)

    try {
      if (force) invalidateEnrollmentAccessCache()
      const [{ slugs }, ioai] = await Promise.all([
        fetchMyEnrollmentsCached({ force }),
        fetchMyIoaiAccessCached({ force }).catch(() => ({ lessonSlugs: [], moduleSlugs: [] })),
      ])
      const merged = mergeIoaiAccessState(cached, ioai)
      const enrollmentSlugs = mergeSlugs(slugs || [], merged.enrolledSlugs)
      setRemoteSlugs(enrollmentSlugs)
      setIoaiModuleSlugs(merged.moduleSlugs)
      setIoaiLessonSlugs(merged.lessonSlugs || ioai.lessonSlugs || [])
      setIoaiHasFullTrack(merged.hasFullTrack)
      if (enrollmentSlugs.length) {
        savePurchasedSlugs(enrollmentSlugs)
      }
    } catch {
      setRemoteSlugs(cached.enrolledSlugs)
      setIoaiModuleSlugs(cached.moduleSlugs)
      setIoaiHasFullTrack(cached.hasFullTrack)
      setIoaiLessonSlugs([])
    }
    setSyncedOnce(true)
    setVersion((v) => v + 1)
  }, [authLoading, isAuthenticated])

  useEffect(() => {
    loadEnrollments()
  }, [loadEnrollments])

  const enrollmentSlugs = useMemo(
    () => mergeSlugs(getPurchasedSlugs(), remoteSlugs),
    [remoteSlugs, version]
  )

  const purchased = useMemo(
    () => mergeSlugs(mergeSlugs(enrollmentSlugs, ioaiModuleSlugs), ioaiLessonSlugs),
    [enrollmentSlugs, ioaiModuleSlugs, ioaiLessonSlugs, version]
  )

  const hasAccess = useCallback(
    (courseId) => hasCourseAccess(courseId, purchased),
    [purchased, version]
  )

  const hasTrack = useMemo(
    () => ioaiHasFullTrack || hasFullIOAITrack(purchased),
    [ioaiHasFullTrack, purchased, version]
  )

  const refresh = useCallback(() => {
    loadEnrollments({ force: true })
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

  const loading = authLoading || (isAuthenticated && !syncedOnce)

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
    loading,
    stripeCheckout,
    checkoutSlug,
    setCheckoutSlug,
    checkoutLoading: Boolean(checkoutSlug),
  }
}

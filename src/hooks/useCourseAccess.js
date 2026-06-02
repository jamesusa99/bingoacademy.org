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
import { useAuth } from '../contexts/AuthContext'

function mergeSlugs(local, remote) {
  return [...new Set([...(local || []), ...(remote || [])])]
}

export function useCourseAccess(courseId) {
  const { isAuthenticated } = useAuth()
  const [version, setVersion] = useState(0)
  const [remoteSlugs, setRemoteSlugs] = useState([])
  const [stripeCheckout, setStripeCheckout] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)

  useEffect(() => {
    fetchPaymentsConfig()
      .then((cfg) => setStripeCheckout(Boolean(cfg.stripeCheckout)))
      .catch(() => setStripeCheckout(false))
  }, [])

  const loadEnrollments = useCallback(async () => {
    if (!isAuthenticated) {
      setRemoteSlugs([])
      return
    }
    try {
      const { slugs } = await fetchMyEnrollments()
      setRemoteSlugs(slugs || [])
      if (slugs?.length) {
        savePurchasedSlugs(mergeSlugs(getPurchasedSlugs(), slugs))
      }
    } catch {
      setRemoteSlugs([])
    }
    setVersion((v) => v + 1)
  }, [isAuthenticated])

  useEffect(() => {
    loadEnrollments()
  }, [loadEnrollments])

  const purchased = useMemo(
    () => mergeSlugs(getPurchasedSlugs(), remoteSlugs),
    [remoteSlugs, version]
  )

  const hasAccess = useMemo(
    () => hasCourseAccess(courseId, purchased),
    [courseId, purchased, version]
  )
  const hasTrack = useMemo(() => hasFullIOAITrack(purchased), [purchased, version])

  const refresh = useCallback(() => {
    loadEnrollments()
  }, [loadEnrollments])

  const unlockLesson = useCallback(() => {
    purchaseLesson(courseId)
    refresh()
  }, [courseId, refresh])

  const unlockTrack = useCallback(() => {
    purchaseIOAITrack()
    refresh()
  }, [refresh])

  return {
    hasAccess,
    hasTrack,
    purchased,
    unlockLesson,
    unlockTrack,
    refresh,
    stripeCheckout,
    checkoutLoading,
    setCheckoutLoading,
  }
}

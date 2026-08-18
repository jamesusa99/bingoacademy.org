import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { savePurchasedSlugs } from '../lib/courseAccess'
import { fetchMyIoaiAccessCached, invalidateEnrollmentAccessCache } from '../lib/enrollmentAccessCache'
import {
  hasIoaiModuleAccess,
  mergeIoaiAccessState,
  readLocalIoaiAccessState,
} from '../lib/ioaiAccess'
import { fetchIoaiStore } from '../lib/ioaiStore'

export function useIOAIStore() {
  const [levels, setLevels] = useState([])
  const [fullBundle, setFullBundle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchIoaiStore()
      setLevels(data.levels || [])
      setFullBundle(data.fullBundle || null)
    } catch (err) {
      setError(err.message || 'Failed to load')
      setLevels([])
      setFullBundle(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  return { levels, fullBundle, loading, error, reload }
}

export function useIOAIAccess() {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const localSnapshot = readLocalIoaiAccessState()
  const [moduleSlugs, setModuleSlugs] = useState(localSnapshot.moduleSlugs)
  const [enrolledSlugs, setEnrolledSlugs] = useState(localSnapshot.enrolledSlugs)
  const [hasFullTrack, setHasFullTrack] = useState(localSnapshot.hasFullTrack)
  const [syncedOnce, setSyncedOnce] = useState(false)

  const applyAccessState = useCallback((next) => {
    setModuleSlugs(next.moduleSlugs)
    setEnrolledSlugs(next.enrolledSlugs)
    setHasFullTrack(next.hasFullTrack)
  }, [])

  const reload = useCallback(
    async ({ force = false } = {}) => {
      if (authLoading) return

      if (!isAuthenticated) {
        applyAccessState({
          moduleSlugs: [],
          enrolledSlugs: [],
          hasFullTrack: false,
          lessonSlugs: [],
        })
        setSyncedOnce(true)
        return
      }

      const cached = readLocalIoaiAccessState()
      applyAccessState(cached)

      try {
        if (force) invalidateEnrollmentAccessCache()
        const data = await fetchMyIoaiAccessCached({ force })
        const merged = mergeIoaiAccessState(cached, data)
        applyAccessState(merged)
        if (merged.enrolledSlugs.length) {
          savePurchasedSlugs(merged.enrolledSlugs)
        }
      } catch {
        applyAccessState(cached)
      } finally {
        setSyncedOnce(true)
      }
    },
    [applyAccessState, authLoading, isAuthenticated]
  )

  useEffect(() => {
    reload()
  }, [reload])

  const hasModule = useCallback(
    (catalogSlug) =>
      hasFullTrack ||
      hasIoaiModuleAccess(catalogSlug, { moduleSlugs, enrolledSlugs, hasFullTrack }),
    [moduleSlugs, enrolledSlugs, hasFullTrack]
  )

  const loading = authLoading || (isAuthenticated && !syncedOnce)

  return {
    moduleSlugs,
    enrolledSlugs,
    hasFullTrack,
    hasModule,
    loading,
    reload,
  }
}

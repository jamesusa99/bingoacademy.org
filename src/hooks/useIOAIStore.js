import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { fetchMyEnrollments } from '../lib/checkout'
import { getPurchasedSlugs, hasFullIOAITrack, savePurchasedSlugs } from '../lib/courseAccess'
import { hasIoaiModuleAccess } from '../lib/ioaiAccess'
import { fetchMyIoaiAccess, fetchIoaiStore } from '../lib/ioaiStore'

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
  const { isAuthenticated } = useAuth()
  const [moduleSlugs, setModuleSlugs] = useState([])
  const [enrolledSlugs, setEnrolledSlugs] = useState([])
  const [hasFullTrack, setHasFullTrack] = useState(false)
  const [loading, setLoading] = useState(false)

  const reload = useCallback(async () => {
    if (!isAuthenticated) {
      setModuleSlugs([])
      setEnrolledSlugs([])
      setHasFullTrack(false)
      return
    }
    setLoading(true)
    try {
      const [data, enrollments] = await Promise.all([
        fetchMyIoaiAccess().catch(() => ({})),
        fetchMyEnrollments().catch(() => ({ slugs: [] })),
      ])
      const enrolledSlugs = [
        ...new Set([
          ...getPurchasedSlugs(),
          ...(data.enrolledSlugs || data.slugs || []),
          ...(enrollments.slugs || []),
        ]),
      ]
      if (enrollments.slugs?.length) {
        savePurchasedSlugs(enrolledSlugs)
      }
      const trackOwned = Boolean(data.hasFullTrack || hasFullIOAITrack(enrolledSlugs))
      const moduleSlugs = data.moduleSlugs?.length
        ? data.moduleSlugs
        : enrolledSlugs.filter((slug) => slug.startsWith('ioai-') && !slug.includes('competition-system'))
      setModuleSlugs(moduleSlugs)
      setEnrolledSlugs(enrolledSlugs)
      setHasFullTrack(trackOwned)
    } catch {
      setModuleSlugs([])
      setEnrolledSlugs([])
      setHasFullTrack(false)
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    reload()
  }, [reload])

  const hasModule = useCallback(
    (catalogSlug) =>
      hasFullTrack ||
      hasIoaiModuleAccess(catalogSlug, { moduleSlugs, enrolledSlugs, hasFullTrack }),
    [moduleSlugs, enrolledSlugs, hasFullTrack]
  )

  return {
    moduleSlugs,
    enrolledSlugs,
    hasFullTrack,
    hasModule,
    loading,
    reload,
  }
}

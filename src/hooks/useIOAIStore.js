import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { fetchMyEnrollments } from '../lib/checkout'
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
          ...(data.enrolledSlugs || data.slugs || []),
          ...(enrollments.slugs || []),
        ]),
      ]
      const moduleSlugs = data.moduleSlugs?.length
        ? data.moduleSlugs
        : enrolledSlugs.filter((slug) => slug.startsWith('ioai-') && !slug.includes('competition-system'))
      setModuleSlugs(moduleSlugs)
      setEnrolledSlugs(enrolledSlugs)
      setHasFullTrack(
        Boolean(
          data.hasFullTrack ||
            enrolledSlugs.includes('ioai-competition-system') ||
            enrolledSlugs.includes('ioai-track')
        )
      )
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
      hasIoaiModuleAccess(catalogSlug, { moduleSlugs, enrolledSlugs }),
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

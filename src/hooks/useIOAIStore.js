import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
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
      const data = await fetchMyIoaiAccess()
      setModuleSlugs(data.moduleSlugs || [])
      setEnrolledSlugs(data.enrolledSlugs || [])
      setHasFullTrack(Boolean(data.hasFullTrack))
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
    (catalogSlug) => Boolean(catalogSlug && moduleSlugs.includes(catalogSlug)),
    [moduleSlugs]
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

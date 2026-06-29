import { useCallback, useEffect, useState } from 'react'
import { fetchIoaiCourseBundles } from '../lib/ioaiCourseBundlesApi'

const cache = { data: null, promise: null }

export function invalidateIoaiCourseBundlesCache() {
  cache.data = null
  cache.promise = null
}

export function useIoaiCourseBundles() {
  const [bundles, setBundles] = useState(() => cache.data || [])
  const [loading, setLoading] = useState(!cache.data)
  const [error, setError] = useState(null)

  const reload = useCallback(async () => {
    invalidateIoaiCourseBundlesCache()
    setLoading(true)
    setError(null)
    try {
      const data = await fetchIoaiCourseBundles()
      cache.data = data
      setBundles(data)
    } catch (err) {
      setError(err.message || 'Failed to load bundles')
      setBundles([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (cache.data) {
      setBundles(cache.data)
      setLoading(false)
      return undefined
    }

    if (!cache.promise) {
      cache.promise = fetchIoaiCourseBundles()
        .then((data) => {
          cache.data = data
          return data
        })
        .catch((err) => {
          cache.promise = null
          throw err
        })
    }

    let cancelled = false
    cache.promise
      .then((data) => {
        if (!cancelled) {
          setBundles(data)
          setError(null)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'Failed to load bundles')
          setBundles([])
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { bundles, loading, error, reload }
}

export function findCourseBundleForStage(bundles, stageFilter) {
  const packageId = stageFilter === 'all' ? 'all' : stageFilter
  return (bundles || []).find((bundle) => bundle.packageId === packageId) || null
}

import { useCallback, useEffect, useState } from 'react'
import { fetchProgramStore } from '../lib/programStore'

const cache = new Map()
const cachePromises = new Map()

async function loadProgramStore(productLine) {
  if (cache.has(productLine)) return cache.get(productLine)

  if (!cachePromises.has(productLine)) {
    const promise = fetchProgramStore(productLine)
      .then((data) => {
        cache.set(productLine, data)
        return data
      })
      .catch((err) => {
        cachePromises.delete(productLine)
        throw err
      })
    cachePromises.set(productLine, promise)
  }

  return cachePromises.get(productLine)
}

export function invalidateProgramStoreCache(productLine) {
  if (productLine) {
    cache.delete(productLine)
    cachePromises.delete(productLine)
    return
  }
  cache.clear()
  cachePromises.clear()
}

export function useProgramStore(productLine) {
  const [levels, setLevels] = useState(() => cache.get(productLine)?.levels || [])
  const [fullBundle, setFullBundle] = useState(() => cache.get(productLine)?.fullBundle || null)
  const [loading, setLoading] = useState(!cache.has(productLine))
  const [error, setError] = useState(null)

  const reload = useCallback(async () => {
    cache.delete(productLine)
    cachePromises.delete(productLine)
    setLoading(true)
    setError(null)
    try {
      const data = await loadProgramStore(productLine)
      setLevels(data.levels || [])
      setFullBundle(data.fullBundle || null)
    } catch (err) {
      setError(err.message || 'Failed to load')
      setLevels([])
      setFullBundle(null)
    } finally {
      setLoading(false)
    }
  }, [productLine])

  useEffect(() => {
    let cancelled = false
    if (cache.has(productLine)) {
      const data = cache.get(productLine)
      setLevels(data.levels || [])
      setFullBundle(data.fullBundle || null)
      setLoading(false)
      return undefined
    }
    setLoading(true)
    loadProgramStore(productLine)
      .then((data) => {
        if (!cancelled) {
          setLevels(data.levels || [])
          setFullBundle(data.fullBundle || null)
          setError(null)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'Failed to load')
          setLevels([])
          setFullBundle(null)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [productLine])

  return { levels, fullBundle, loading, error, reload }
}

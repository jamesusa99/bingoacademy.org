import { useCallback, useEffect, useState } from 'react'
import {
  HOME_HERO_PROGRAMS_KEY,
  defaultHomeHeroPrograms,
  mergeHomeHeroPrograms,
} from '../config/homeHeroPrograms'
import { fetchPlatformSetting } from '../lib/platformSettings'

const cache = { data: null, promise: null }

export function invalidateHomeHeroProgramsCache() {
  cache.data = null
  cache.promise = null
}

export function useHomeHeroPrograms() {
  const [programs, setPrograms] = useState(() => cache.data || defaultHomeHeroPrograms())
  const [loading, setLoading] = useState(!cache.data)

  const reload = useCallback(async () => {
    invalidateHomeHeroProgramsCache()
    setLoading(true)
    try {
      const value = await fetchPlatformSetting(HOME_HERO_PROGRAMS_KEY)
      const merged = mergeHomeHeroPrograms(value)
      cache.data = merged
      setPrograms(merged)
    } catch {
      setPrograms(defaultHomeHeroPrograms())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (cache.data) {
      setPrograms(cache.data)
      setLoading(false)
      return undefined
    }

    if (!cache.promise) {
      cache.promise = fetchPlatformSetting(HOME_HERO_PROGRAMS_KEY)
        .then((value) => {
          const merged = mergeHomeHeroPrograms(value)
          cache.data = merged
          return merged
        })
        .catch(() => {
          cache.promise = null
          return defaultHomeHeroPrograms()
        })
    }

    let cancelled = false
    cache.promise
      .then((data) => {
        if (!cancelled) setPrograms(data)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { programs, loading, reload }
}

export async function fetchHomeHeroProgramsForAdmin() {
  const value = await fetchPlatformSetting(HOME_HERO_PROGRAMS_KEY)
  return mergeHomeHeroPrograms(value)
}

import { useEffect, useState } from 'react'
import {
  coursesLineHeroKey,
  defaultCoursesLineHero,
  mergeCoursesLineHero,
} from '../config/coursesLineHero'
import { fetchPlatformSetting } from '../lib/platformSettings'
import { buildHeroStats } from '../components/courses/CoursesHero'

const cache = new Map()
const cachePromises = new Map()

export function invalidateCoursesLineHeroCache(lineId) {
  if (lineId) {
    cache.delete(lineId)
    cachePromises.delete(lineId)
    return
  }
  cache.clear()
  cachePromises.clear()
}

/** @deprecated Use invalidateCoursesLineHeroCache('ioai') */
export function invalidateCoursesIoaiHeroCache() {
  invalidateCoursesLineHeroCache('ioai')
}

async function loadCoursesLineHero(lineId) {
  if (cache.has(lineId)) return cache.get(lineId)

  if (!cachePromises.has(lineId)) {
    const key = coursesLineHeroKey(lineId)
    const promise = key
      ? fetchPlatformSetting(key)
          .then((value) => {
            const merged = mergeCoursesLineHero(lineId, value)
            cache.set(lineId, merged)
            return merged
          })
          .catch(() => {
            const fallback = defaultCoursesLineHero(lineId)
            cache.set(lineId, fallback)
            return fallback
          })
      : Promise.resolve(defaultCoursesLineHero(lineId))

    cachePromises.set(lineId, promise)
  }

  return cachePromises.get(lineId)
}

export function useCoursesLineHero(lineId) {
  const defaults = defaultCoursesLineHero(lineId)
  const [hero, setHero] = useState(cache.get(lineId) || defaults)
  const [loading, setLoading] = useState(!cache.has(lineId))

  useEffect(() => {
    let cancelled = false
    if (cache.has(lineId)) {
      setHero(cache.get(lineId))
      setLoading(false)
      return undefined
    }
    setLoading(true)
    loadCoursesLineHero(lineId).then((next) => {
      if (!cancelled) {
        setHero(next)
        setLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [lineId])

  return { hero, loading }
}

/** @deprecated Use useCoursesLineHero('ioai') */
export function useCoursesIoaiHero() {
  return useCoursesLineHero('ioai')
}

export async function fetchCoursesLineHeroForAdmin(lineId) {
  try {
    const key = coursesLineHeroKey(lineId)
    if (!key) return defaultCoursesLineHero(lineId)
    const value = await fetchPlatformSetting(key)
    return mergeCoursesLineHero(lineId, value)
  } catch {
    return defaultCoursesLineHero(lineId)
  }
}

/** @deprecated Use fetchCoursesLineHeroForAdmin('ioai') */
export async function fetchCoursesIoaiHeroForAdmin() {
  return fetchCoursesLineHeroForAdmin('ioai')
}

export function buildLineHeroStats(itemCount, hero) {
  const students = parseInt(hero?.statStudents, 10) || 800
  const rating = parseFloat(hero?.statRating) || 4.9
  const count = Math.max(0, itemCount)
  const statsSource =
    count > 0
      ? Array.from({ length: count }, (_, index) => ({
          students: index === 0 ? students : 0,
          rating,
        }))
      : [{ students, rating }]
  return buildHeroStats(statsSource)
}

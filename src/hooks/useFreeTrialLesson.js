import { useEffect, useState } from 'react'
import {
  fetchFreeTrialLessonConfig,
  freeTrialCourseHref,
  FREE_TRIAL_FALLBACK_LESSON_ID,
} from '../lib/freeTrial'

const cache = { data: null, promise: null }

export function invalidateFreeTrialLessonCache() {
  cache.data = null
  cache.promise = null
}

function loadFreeTrialLesson() {
  if (cache.data) return Promise.resolve(cache.data)
  if (cache.promise) return cache.promise

  cache.promise = fetchFreeTrialLessonConfig()
    .then((trial) => {
      const data = trial || {
        catalogSlug: FREE_TRIAL_FALLBACK_LESSON_ID,
        slug: FREE_TRIAL_FALLBACK_LESSON_ID,
        title: null,
        hasVideo: false,
        fromFallback: true,
      }
      cache.data = data
      return data
    })
    .catch(() => {
      const data = {
        catalogSlug: FREE_TRIAL_FALLBACK_LESSON_ID,
        slug: FREE_TRIAL_FALLBACK_LESSON_ID,
        title: null,
        hasVideo: false,
        fromFallback: true,
      }
      cache.data = data
      return data
    })
    .finally(() => {
      cache.promise = null
    })

  return cache.promise
}

export function useFreeTrialLesson() {
  const [lesson, setLesson] = useState(cache.data)
  const [loading, setLoading] = useState(!cache.data)

  useEffect(() => {
    let cancelled = false

    loadFreeTrialLesson().then((data) => {
      if (cancelled) return
      setLesson(data)
      setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [])

  const catalogSlug = lesson?.catalogSlug || FREE_TRIAL_FALLBACK_LESSON_ID

  return {
    loading,
    catalogSlug,
    title: lesson?.title || null,
    hasVideo: Boolean(lesson?.hasVideo),
    fromFallback: Boolean(lesson?.fromFallback),
    href: freeTrialCourseHref(catalogSlug, { play: true }),
  }
}

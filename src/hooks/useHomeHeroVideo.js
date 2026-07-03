import { useEffect, useState } from 'react'
import { fetchPlatformSetting } from '../lib/platformSettings'
import {
  HOME_HERO_VIDEO_KEY,
  defaultHomeHeroVideo,
  mergeHomeHeroVideo,
} from '../config/homeHero'

const cache = { data: null, promise: null }

export function invalidateHomeHeroVideoCache() {
  cache.data = null
  cache.promise = null
}

function loadHomeHeroVideo() {
  if (cache.data) return Promise.resolve(cache.data)
  if (cache.promise) return cache.promise

  cache.promise = fetchPlatformSetting(HOME_HERO_VIDEO_KEY)
    .then((value) => {
      const merged = mergeHomeHeroVideo(value)
      cache.data = merged
      return merged
    })
    .catch(() => {
      const data = defaultHomeHeroVideo()
      cache.data = data
      return data
    })
    .finally(() => {
      cache.promise = null
    })

  return cache.promise
}

export function useHomeHeroVideo() {
  const [video, setVideo] = useState(() => cache.data || defaultHomeHeroVideo())
  const [loading, setLoading] = useState(!cache.data)

  useEffect(() => {
    let cancelled = false
    loadHomeHeroVideo().then((data) => {
      if (cancelled) return
      setVideo(data)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  return { video, loading, hasVideo: Boolean(video.videoUrl?.trim()) }
}

export async function fetchHomeHeroVideoForAdmin() {
  const value = await fetchPlatformSetting(HOME_HERO_VIDEO_KEY)
  return mergeHomeHeroVideo(value)
}

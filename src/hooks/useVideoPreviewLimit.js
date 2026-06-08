import { useCallback, useEffect, useState } from 'react'

/**
 * Enforce a max playback time on an HTML5 video (IOAI 15s preview).
 */
export function useVideoPreviewLimit({ enabled, previewSeconds, videoReadyKey = 0 }) {
  const [currentTime, setCurrentTime] = useState(0)
  const [previewEnded, setPreviewEnded] = useState(false)
  const [duration, setDuration] = useState(0)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    setPreviewEnded(false)
    setCurrentTime(0)
    setPlaying(false)
    setDuration(0)
  }, [enabled, previewSeconds, videoReadyKey])

  const clampVideo = useCallback(
    (video) => {
      if (!enabled || !video) return false
      if (video.currentTime >= previewSeconds - 0.05) {
        video.pause()
        video.currentTime = previewSeconds
        setCurrentTime(previewSeconds)
        setPreviewEnded(true)
        setPlaying(false)
        return true
      }
      return false
    },
    [enabled, previewSeconds]
  )

  const onTimeUpdate = useCallback(
    (e) => {
      const video = e.currentTarget
      setCurrentTime(video.currentTime)
      clampVideo(video)
    },
    [clampVideo]
  )

  const onSeeking = useCallback(
    (e) => {
      if (!enabled) return
      const video = e.currentTarget
      if (video.currentTime > previewSeconds) {
        video.currentTime = previewSeconds
      }
    },
    [enabled, previewSeconds]
  )

  const onSeeked = useCallback(
    (e) => {
      clampVideo(e.currentTarget)
    },
    [clampVideo]
  )

  const replay = useCallback((video) => {
    if (!video || !enabled) return
    video.currentTime = 0
    setPreviewEnded(false)
    setCurrentTime(0)
    video.play().catch(() => {})
    setPlaying(true)
  }, [enabled])

  const play = useCallback(
    (video) => {
      if (!video) return
      if (enabled && previewEnded) return
      video.play().catch(() => {})
      setPlaying(true)
    },
    [enabled, previewEnded]
  )

  const showLock = enabled && (previewEnded || currentTime >= previewSeconds - 0.5)
  const previewProgress = duration ? Math.min(100, (previewSeconds / duration) * 100) : 0

  return {
    currentTime,
    previewEnded,
    duration,
    setDuration,
    playing,
    setPlaying,
    showLock,
    previewProgress,
    onTimeUpdate,
    onSeeking,
    onSeeked,
    replay,
    play,
  }
}

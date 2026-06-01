import { useCallback, useMemo, useState } from 'react'
import {
  getLessonProgress,
  saveLessonProgress,
  markSegmentDone,
  setVideoPosition,
  setCurrentSegment,
  markLessonComplete,
  getTrackProgressStats,
  getContinueLessonId,
} from '../lib/learningProgress'

export function useLessonProgress(lessonId) {
  const [version, setVersion] = useState(0)
  const refresh = useCallback(() => setVersion((v) => v + 1), [])

  const progress = useMemo(
    () => getLessonProgress(lessonId),
    [lessonId, version]
  )

  const update = useCallback(
    (patch) => {
      saveLessonProgress(lessonId, patch)
      refresh()
    },
    [lessonId, refresh]
  )

  const completeSegment = useCallback(
    (segmentId) => {
      markSegmentDone(lessonId, segmentId)
      refresh()
    },
    [lessonId, refresh]
  )

  const saveVideoPosition = useCallback(
    (seconds) => {
      setVideoPosition(lessonId, seconds)
    },
    [lessonId]
  )

  const goToSegment = useCallback(
    (index) => {
      setCurrentSegment(lessonId, index)
      refresh()
    },
    [lessonId, refresh]
  )

  const completeLesson = useCallback(() => {
    markLessonComplete(lessonId)
    refresh()
  }, [lessonId, refresh])

  return {
    progress,
    update,
    completeSegment,
    saveVideoPosition,
    goToSegment,
    completeLesson,
    refresh,
  }
}

export function useTrackProgress(lessonIds) {
  const [version, setVersion] = useState(0)
  const refresh = useCallback(() => setVersion((v) => v + 1), [])

  const stats = useMemo(
    () => getTrackProgressStats(lessonIds),
    [lessonIds, version]
  )

  const continueLessonId = useMemo(
    () => getContinueLessonId(lessonIds),
    [lessonIds, version]
  )

  return { stats, continueLessonId, refresh }
}

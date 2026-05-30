import { useCallback, useMemo, useState } from 'react'
import {
  getPurchasedSlugs,
  hasCourseAccess,
  hasFullIOAITrack,
  purchaseIOAITrack,
  purchaseLesson,
} from '../lib/courseAccess'

export function useCourseAccess(courseId) {
  const [version, setVersion] = useState(0)

  const purchased = useMemo(() => getPurchasedSlugs(), [version])
  const hasAccess = useMemo(
    () => hasCourseAccess(courseId, purchased),
    [courseId, purchased, version]
  )
  const hasTrack = useMemo(() => hasFullIOAITrack(purchased), [purchased, version])

  const refresh = useCallback(() => setVersion((v) => v + 1), [])

  const unlockLesson = useCallback(() => {
    purchaseLesson(courseId)
    refresh()
  }, [courseId, refresh])

  const unlockTrack = useCallback(() => {
    purchaseIOAITrack()
    refresh()
  }, [refresh])

  return { hasAccess, hasTrack, purchased, unlockLesson, unlockTrack, refresh }
}

import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { hasFullIOAITrack, getPurchasedSlugs } from '../lib/courseAccess'
import { fetchMyEnrollments } from '../lib/checkout'
import { fetchIOAIAccessStatus } from '../lib/ioaiCurriculumDb'

export function useIOAIAccess() {
  const { isAuthenticated, user } = useAuth()
  const [hasAccess, setHasAccess] = useState(() => hasFullIOAITrack())
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)

    if (!isAuthenticated || !user?.id) {
      setHasAccess(hasFullIOAITrack())
      setLoading(false)
      return
    }

    try {
      const [{ slugs }, access] = await Promise.all([
        fetchMyEnrollments().catch(() => ({ slugs: [] })),
        fetchIOAIAccessStatus(user.id),
      ])
      const local = getPurchasedSlugs()
      const merged = [...new Set([...local, ...(slugs || [])])]
      setHasAccess(access.hasAccess || hasFullIOAITrack(merged))
    } catch {
      setHasAccess(hasFullIOAITrack())
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, user?.id])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { hasAccess, loading, refresh }
}

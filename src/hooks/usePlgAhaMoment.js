import { useCallback, useRef, useState } from 'react'
import { celebrateCheckpoint } from '../utils/labCelebration'
import { hasSeenPlgAhaMoment, markPlgAhaMomentSeen } from '../lib/plgAhaMoment'
import { useIOAIAccess } from './useIOAIAccess'

const MODAL_DELAY_MS = 450

export function usePlgAhaMoment(triggerId) {
  const { hasAccess, loading } = useIOAIAccess()
  const [open, setOpen] = useState(false)
  const firedRef = useRef(false)

  const close = useCallback(() => setOpen(false), [])

  const trigger = useCallback(() => {
    if (!triggerId || firedRef.current) return
    if (loading || hasAccess) return
    if (hasSeenPlgAhaMoment(triggerId)) return

    firedRef.current = true
    markPlgAhaMomentSeen(triggerId)
    celebrateCheckpoint()
    window.setTimeout(() => setOpen(true), MODAL_DELAY_MS)
  }, [triggerId, loading, hasAccess])

  return { open, close, trigger }
}

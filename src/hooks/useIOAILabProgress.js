import { useCallback, useMemo, useState } from 'react'
import {
  defaultProgress,
  loadProgress,
  saveProgress,
  moduleAProgress,
  IOAI_LABS,
} from '../config/ioaiTrainingLab'

export function useIOAILabProgress() {
  const [progress, setProgress] = useState(loadProgress)

  const persist = useCallback((next) => {
    setProgress(next)
    saveProgress(next)
  }, [])

  const markLabComplete = useCallback(
    (labId, checkpointScore = 1) => {
      const next = { ...progress }
      if (!next.completedLabs.includes(labId)) {
        next.completedLabs = [...next.completedLabs, labId]
      }
      next.checkpointScores = { ...next.checkpointScores, [labId]: checkpointScore }

      const modA = moduleAProgress(next)
      if (modA.done === modA.total && modA.avg >= 0.8) {
        next.moduleAComplete = true
        if (next.gpuHoursRemaining < 10) {
          next.gpuHoursRemaining = 10
        }
      }
      persist(next)
      return next
    },
    [progress, persist]
  )

  const stats = useMemo(() => {
    const modA = moduleAProgress(progress)
    return {
      completedCount: progress.completedLabs.length,
      totalLabs: IOAI_LABS.length,
      moduleA: modA,
      gpuHours: progress.gpuHoursRemaining,
    }
  }, [progress])

  const reset = useCallback(() => persist(defaultProgress()), [persist])

  return { progress, persist, markLabComplete, stats, reset }
}

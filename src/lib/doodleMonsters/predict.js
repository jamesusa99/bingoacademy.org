import { CLASS_ROUND, CLASS_SPIKY, DOODLE_CLASS_LABELS } from '../../config/doodleMonsters.js'

export const PREDICT_INTERVAL_MS = 500

/** @param {Record<string, number>} confidences */
function confidenceForClass(confidences, classId) {
  const id = String(classId)
  return Number(confidences[id] ?? confidences[classId] ?? 0)
}

/**
 * Normalize KNN predictClass output into round/spiky shares (0–1).
 * @param {Awaited<ReturnType<import('@tensorflow-models/knn-classifier').KNNClassifier['predictClass']>> | null} result
 */
export function parseMonsterPrediction(result) {
  if (!result?.confidences) {
    return {
      round: 0,
      spiky: 0,
      roundPct: 0,
      spikyPct: 0,
      topLabel: null,
      topName: 'Draw a monster!',
      mood: 'idle',
    }
  }

  const rawRound = confidenceForClass(result.confidences, CLASS_ROUND)
  const rawSpiky = confidenceForClass(result.confidences, CLASS_SPIKY)
  const sum = rawRound + rawSpiky || 1
  const round = rawRound / sum
  const spiky = rawSpiky / sum
  const roundPct = Math.round(round * 100)
  const spikyPct = Math.round(spiky * 100)

  const topClass =
    round >= spiky
      ? CLASS_ROUND
      : CLASS_SPIKY
  const topShare = Math.max(round, spiky)
  const gap = Math.abs(round - spiky)

  let mood = 'thinking'
  if (topShare >= 0.72 && gap >= 0.35) mood = 'confident'
  else if (gap <= 0.18 || (roundPct >= 38 && roundPct <= 62)) mood = 'confused'
  else mood = 'thinking'

  return {
    round,
    spiky,
    roundPct,
    spikyPct,
    topLabel: result.label,
    topClass,
    topName: DOODLE_CLASS_LABELS[topClass],
    mood,
  }
}

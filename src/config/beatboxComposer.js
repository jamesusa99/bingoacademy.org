/** AI Beatbox Composer — constants & classification helpers */

export const BEATBOX_PADS = [
  {
    id: 'kick',
    label: 'Kick',
    phonetic: '动',
    hint: 'Deep “boom” or “动”',
    color: '#22d3ee',
    glow: 'rgba(34, 211, 238, 0.55)',
  },
  {
    id: 'snare',
    label: 'Snare',
    phonetic: '打',
    hint: 'Sharp “ta” or “打”',
    color: '#a78bfa',
    glow: 'rgba(167, 139, 250, 0.55)',
  },
  {
    id: 'hihat',
    label: 'Hi-hat',
    phonetic: '次',
    hint: 'Airy “tss” or “次”',
    color: '#f472b6',
    glow: 'rgba(244, 114, 182, 0.55)',
  },
]

export const BEATBOX_BPM = 110
export const BEATBOX_STEPS = 16
export const ONSET_COOLDOWN_MS = 220
export const RMS_ONSET_THRESHOLD = 0.045
export const FFT_SIZE = 2048

/** Classify a frequency-domain snapshot into kick / snare / hihat */
export function classifyBeatboxSpectrum(freqData, sampleRate) {
  const binHz = sampleRate / (freqData.length * 2)
  let low = 0
  let mid = 0
  let high = 0
  let weightedSum = 0
  let magSum = 0

  for (let i = 0; i < freqData.length; i++) {
    const mag = freqData[i] / 255
    if (mag < 0.02) continue
    const hz = i * binHz
    magSum += mag
    weightedSum += mag * hz
    if (hz < 280) low += mag
    else if (hz < 2200) mid += mag
    else high += mag
  }

  if (magSum < 0.05) return null

  const centroid = weightedSum / magSum
  const total = low + mid + high || 1
  const lowR = low / total
  const midR = mid / total
  const highR = high / total

  if (lowR > 0.42 || centroid < 450) return 'kick'
  if (highR > 0.38 || centroid > 3200) return 'hihat'
  if (midR > 0.35 || (centroid >= 450 && centroid <= 3200)) return 'snare'
  if (centroid < 900) return 'kick'
  if (centroid > 2500) return 'hihat'
  return 'snare'
}

export function rmsFromTimeDomain(timeData) {
  let sum = 0
  for (let i = 0; i < timeData.length; i++) {
    const v = (timeData[i] - 128) / 128
    sum += v * v
  }
  return Math.sqrt(sum / timeData.length)
}

export function emptyLoopPattern() {
  return {
    kick: Array(BEATBOX_STEPS).fill(false),
    snare: Array(BEATBOX_STEPS).fill(false),
    hihat: Array(BEATBOX_STEPS).fill(false),
  }
}

export function cloneLoopPattern(pattern) {
  return {
    kick: [...pattern.kick],
    snare: [...pattern.snare],
    hihat: [...pattern.hihat],
  }
}

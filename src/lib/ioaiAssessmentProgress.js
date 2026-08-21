import { IOAI_ASSESSMENT_STORAGE_KEY } from '../config/ioaiAssessment.js'

const emptyState = () => ({
  step: 'landing',
  profile: {},
  answers: {},
  startedAt: null,
  elapsedSeconds: 0,
  currentIndex: 0,
})

export function loadIoaiAssessmentProgress() {
  try {
    const raw = localStorage.getItem(IOAI_ASSESSMENT_STORAGE_KEY)
    if (!raw) return emptyState()
    const parsed = JSON.parse(raw)
    return {
      ...emptyState(),
      ...parsed,
      answers: parsed.answers && typeof parsed.answers === 'object' ? parsed.answers : {},
    }
  } catch {
    return emptyState()
  }
}

export function saveIoaiAssessmentProgress(state) {
  try {
    localStorage.setItem(IOAI_ASSESSMENT_STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* ignore quota */
  }
}

export function clearIoaiAssessmentProgress() {
  try {
    localStorage.removeItem(IOAI_ASSESSMENT_STORAGE_KEY)
  } catch {
    /* ignore */
  }
}

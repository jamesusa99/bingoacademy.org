import { ASSESSMENT_STORAGE_KEY } from '../config/assessmentCatalog'

/** @typedef {{ id: string, assessmentId: string, title: string, pct: number, level: string, score: number, total: number, at: number }} AssessmentRecord */

export function loadAssessmentRecords() {
  try {
    const raw = localStorage.getItem(ASSESSMENT_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveAssessmentRecord(record) {
  const list = loadAssessmentRecords()
  list.unshift(record)
  localStorage.setItem(ASSESSMENT_STORAGE_KEY, JSON.stringify(list.slice(0, 50)))
}

export function clearAssessmentRecords() {
  localStorage.removeItem(ASSESSMENT_STORAGE_KEY)
}

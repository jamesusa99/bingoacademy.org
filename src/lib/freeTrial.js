import { purchaseLesson } from './courseAccess'

export const FREE_TRIAL_STORAGE_KEY = 'bingo-free-trial-claimed'
/** First IOAI lesson unlocked on free trial */
export const FREE_TRIAL_LESSON_ID = 'ioai-1-1'
export const FREE_TRIAL_COURSE_HREF = `/courses/detail/${FREE_TRIAL_LESSON_ID}`

export function getFreeTrialState() {
  try {
    const raw = localStorage.getItem(FREE_TRIAL_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function hasClaimedFreeTrial() {
  return Boolean(getFreeTrialState()?.claimedAt)
}

/** Unlock trial lesson and persist claim timestamp */
export function claimFreeTrial() {
  purchaseLesson(FREE_TRIAL_LESSON_ID)
  const state = { claimedAt: Date.now(), lessonId: FREE_TRIAL_LESSON_ID }
  localStorage.setItem(FREE_TRIAL_STORAGE_KEY, JSON.stringify(state))
  return state
}

import { clearPurchasedSlugs, getPurchasedSlugs, purchaseLesson, savePurchasedSlugs } from './courseAccess'

import { FIRST_IOAI_LESSON_ID } from '../config/ioaiCourseSystem'

export const FREE_TRIAL_STORAGE_KEY = 'bingo-free-trial-claimed'

/** Fallback when no lesson is marked trial_enabled in the database. */
export const FREE_TRIAL_FALLBACK_LESSON_ID = FIRST_IOAI_LESSON_ID

/** @deprecated use FREE_TRIAL_FALLBACK_LESSON_ID or useFreeTrialLesson() */
export const FREE_TRIAL_LESSON_ID = FREE_TRIAL_FALLBACK_LESSON_ID

export function freeTrialCourseHref(catalogSlug, { play = false, from = 'ioai' } = {}) {
  const slug = (catalogSlug || FREE_TRIAL_FALLBACK_LESSON_ID).trim()
  const params = new URLSearchParams({ from })
  if (play) params.set('play', '1')
  return `/courses/detail/${encodeURIComponent(slug)}?${params.toString()}`
}

/** @deprecated use freeTrialCourseHref(catalogSlug) */
export const FREE_TRIAL_COURSE_HREF = freeTrialCourseHref(FREE_TRIAL_FALLBACK_LESSON_ID)

export async function fetchFreeTrialLessonConfig() {
  const res = await fetch('/api/ioai/trial-lesson')
  if (!res.ok) throw new Error('Failed to load trial lesson')

  const payload = await res.json()
  const trial = payload?.trial
  if (!trial?.catalogSlug) return null

  return {
    catalogSlug: trial.catalogSlug,
    slug: trial.slug || trial.catalogSlug,
    title: trial.title || null,
    hasVideo: Boolean(trial.hasVideo),
  }
}

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
export function claimFreeTrial(lessonId) {
  const id = (lessonId || getFreeTrialState()?.lessonId || FREE_TRIAL_FALLBACK_LESSON_ID).trim()
  purchaseLesson(id)
  const state = { claimedAt: Date.now(), lessonId: id }
  localStorage.setItem(FREE_TRIAL_STORAGE_KEY, JSON.stringify(state))
  return state
}

/** Clear free-trial flag and remove the trial lesson from local unlocks. */
export function resetFreeTrial() {
  const state = getFreeTrialState()
  localStorage.removeItem(FREE_TRIAL_STORAGE_KEY)
  const lessonId = state?.lessonId || FREE_TRIAL_FALLBACK_LESSON_ID
  const slugs = getPurchasedSlugs().filter((slug) => slug !== lessonId)
  if (slugs.length) savePurchasedSlugs(slugs)
  else clearPurchasedSlugs()
}

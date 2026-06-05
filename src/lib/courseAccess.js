/** Client-side course access (demo until Stripe + Supabase enrollments ship) */

import { VIDEO_COURSE_SUB_BY_LINE } from '../config/courseListFilters'

export const COURSE_ACCESS_STORAGE_KEY = 'bingo-course-access'
export const IOAI_FULL_TRACK_SLUG = 'ioai-competition-system'
export const DEFAULT_PREVIEW_SECONDS = 90

export const PRICING = {
  lesson: { label: 'Single lesson', price: 29, currency: 'USD' },
  ioaiTrack: { label: 'IOAI Full Track', price: 2990, currency: 'USD', slug: IOAI_FULL_TRACK_SLUG },
}

export function getPurchasedSlugs() {
  try {
    const raw = localStorage.getItem(COURSE_ACCESS_STORAGE_KEY)
    const list = raw ? JSON.parse(raw) : []
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

export function savePurchasedSlugs(slugs) {
  localStorage.setItem(COURSE_ACCESS_STORAGE_KEY, JSON.stringify([...new Set(slugs)]))
}

/** Remove all locally unlocked course slugs (browser demo unlocks + synced cache). */
export function clearPurchasedSlugs() {
  localStorage.removeItem(COURSE_ACCESS_STORAGE_KEY)
}

export function hasFullIOAITrack(slugs = getPurchasedSlugs()) {
  return slugs.includes(IOAI_FULL_TRACK_SLUG) || slugs.includes('ioai-track')
}

export function hasCourseAccess(courseId, slugs = getPurchasedSlugs()) {
  if (!courseId) return false
  if (slugs.includes(courseId)) return true
  if (courseId.startsWith('ioai-') && hasFullIOAITrack(slugs)) return true
  return false
}

export function purchaseCourseSlug(slug) {
  const next = [...getPurchasedSlugs(), slug]
  savePurchasedSlugs(next)
  return next
}

export function purchaseIOAITrack() {
  return purchaseCourseSlug(IOAI_FULL_TRACK_SLUG)
}

export function purchaseLesson(courseId) {
  return purchaseCourseSlug(courseId)
}

export function isVideoCourse(course) {
  if (!course) return false
  if (course.deliveryType === 'video') return true
  const videoSub = VIDEO_COURSE_SUB_BY_LINE[course.line]
  return Boolean(videoSub && course.sub === videoSub)
}

export function lessonPriceLabel(course) {
  if (course?.price?.includes('Included')) return PRICING.lesson
  return PRICING.lesson
}

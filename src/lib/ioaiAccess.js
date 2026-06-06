import { IOAI_FULL_BUNDLE_SLUG, getPurchasedSlugs, hasFullIOAITrack } from './courseAccess'

export { IOAI_FULL_BUNDLE_SLUG }

export function hasIoaiModuleAccess(moduleCatalogSlug, { moduleSlugs = [], enrolledSlugs = getPurchasedSlugs() } = {}) {
  if (!moduleCatalogSlug) return false
  const merged = [...new Set([...(moduleSlugs || []), ...(enrolledSlugs || [])])]
  if (merged.includes(moduleCatalogSlug)) return true
  if (hasFullIOAITrack(merged)) return true
  return false
}

export function hasIoaiLessonAccess(
  lessonId,
  { moduleSlugs = [], enrolledSlugs = getPurchasedSlugs(), lessonModuleMap, trialEnabled = false } = {}
) {
  if (trialEnabled) return true
  const moduleSlug = lessonModuleMap?.get?.(lessonId)
  if (!moduleSlug) return hasFullIOAITrack(enrolledSlugs)
  return hasIoaiModuleAccess(moduleSlug, { moduleSlugs, enrolledSlugs })
}

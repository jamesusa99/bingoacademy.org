import { getPurchasedSlugs, hasFullIOAITrack, IOAI_FULL_TRACK_SLUG } from './courseAccess'
import { resolveLessonCatalogSlug } from './ioaiStore'

export const IOAI_FULL_BUNDLE_SLUG = IOAI_FULL_TRACK_SLUG

function registerLessonModuleKeys(map, lesson, moduleCatalogSlug) {
  const primary = resolveLessonCatalogSlug(lesson)
  if (!primary || !moduleCatalogSlug) return
  map.set(primary, moduleCatalogSlug)
  const legacy = (lesson.slug || lesson.id || '').trim()
  if (legacy && legacy !== primary) map.set(legacy, moduleCatalogSlug)
}

/** lessonId → L3 module catalog_slug from curriculum tree (DB or store shape) */
export function buildLessonModuleMapFromTree(tree) {
  const map = new Map()
  for (const level of tree || []) {
    for (const theme of level.themes || []) {
      for (const mod of theme.modules || []) {
        const catalogSlug = mod.catalogSlug || mod.catalog_slug
        if (!catalogSlug) continue
        for (const lesson of mod.lessons || []) {
          registerLessonModuleKeys(map, lesson, catalogSlug)
        }
      }
    }
  }
  return map
}

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

/** True when lesson has video but the L3 unit is not fully unlocked. */
export function canPreviewIoaiLesson(
  lesson,
  { moduleSlugs = [], enrolledSlugs = getPurchasedSlugs(), lessonModuleMap } = {}
) {
  if (!lesson?.cloudflareVideoId) return false
  return !hasIoaiLessonAccess(resolveLessonCatalogSlug(lesson), {
    moduleSlugs,
    enrolledSlugs,
    lessonModuleMap,
    trialEnabled: Boolean(lesson.trialEnabled),
  })
}

import { getPurchasedSlugs, hasFullIOAITrack, IOAI_FULL_TRACK_SLUG, savePurchasedSlugs } from './courseAccess'
import { buildModuleCatalogSlug, resolveLessonCatalogSlug, inferModuleCatalogSlugFromLessonSlug } from './ioaiStore'

export const IOAI_FULL_BUNDLE_SLUG = IOAI_FULL_TRACK_SLUG

/** Hydrate IOAI access from localStorage (instant UI while server syncs). */
export function readLocalIoaiAccessState() {
  const enrolledSlugs = getPurchasedSlugs()
  const hasFullTrack = hasFullIOAITrack(enrolledSlugs)
  const moduleSlugs = enrolledSlugs.filter(
    (slug) =>
      slug.startsWith('ioai-') &&
      slug !== IOAI_FULL_TRACK_SLUG &&
      slug !== 'ioai-track' &&
      !slug.includes('competition-system')
  )
  return { enrolledSlugs, hasFullTrack, moduleSlugs, lessonSlugs: [] }
}

export function mergeIoaiAccessState(local, remote = {}) {
  const enrolledSlugs = [
    ...new Set([
      ...(local?.enrolledSlugs || []),
      ...(remote.enrolledSlugs || remote.slugs || []),
    ]),
  ]
  const hasFullTrack = Boolean(remote.hasFullTrack || hasFullIOAITrack(enrolledSlugs))
  const moduleSlugs = remote.moduleSlugs?.length
    ? remote.moduleSlugs
    : enrolledSlugs.filter(
        (slug) =>
          slug.startsWith('ioai-') &&
          slug !== IOAI_FULL_TRACK_SLUG &&
          slug !== 'ioai-track' &&
          !slug.includes('competition-system')
      )
  return {
    enrolledSlugs,
    hasFullTrack,
    moduleSlugs,
    lessonSlugs: remote.lessonSlugs || [],
  }
}

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
        const catalogSlug =
          mod.catalogSlug ||
          mod.catalog_slug ||
          buildModuleCatalogSlug(level.id, theme.id, mod.id)
        if (!catalogSlug) continue
        for (const lesson of mod.lessons || []) {
          registerLessonModuleKeys(map, lesson, catalogSlug)
        }
      }
    }
  }
  return map
}

export function hasIoaiModuleAccess(
  moduleCatalogSlug,
  { moduleSlugs = [], enrolledSlugs = getPurchasedSlugs(), hasFullTrack = false } = {}
) {
  if (hasFullTrack) return true
  if (!moduleCatalogSlug) return hasFullIOAITrack([...(moduleSlugs || []), ...(enrolledSlugs || [])])
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
  const merged = [...new Set([...(moduleSlugs || []), ...(enrolledSlugs || [])])]
  const moduleSlug =
    lessonModuleMap?.get?.(lessonId) || inferModuleCatalogSlugFromLessonSlug(lessonId)
  if (!moduleSlug) return hasFullIOAITrack(merged)
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

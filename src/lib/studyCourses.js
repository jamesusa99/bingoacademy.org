import { findCourseInList } from './catalogCourse'
import { resolveBundleCoursesCoverUrl } from '../config/bundleCover'
import { COURSES_PORTAL } from '../config/coursesPortal'
import { hasFullIOAITrack, IOAI_FULL_TRACK_SLUG } from './courseAccess'
import { getAllIOAILessonIds, isIOAITrackId, getFirstIOAILessonId } from './ioaiCourseStructure'
import { getTrackProgressStats, getContinueLessonId, getLessonProgress } from './learningProgress'
import { findModule, flattenIoaiModules, isIoaiModulePurchasable, resolveLessonCatalogSlug } from './ioaiStore'
import { studyLessonPath, studyModulePath } from './studyPaths'

function buildFullTrackStudyItem(track, fullBundle, levels) {
  const purchasableModules = flattenIoaiModules(levels).filter(isIoaiModulePurchasable)
  const moduleCount = purchasableModules.length
  const lessonCount = purchasableModules.reduce((n, mod) => n + (mod.lessonCount || 0), 0)
  const title = fullBundle?.title?.trim() || COURSES_PORTAL.fullTrack
  const coverUrl =
    resolveBundleCoursesCoverUrl({
      coverUrl: fullBundle?.cover_url || fullBundle?.coverUrl,
    }) ||
    track?.thumbnail ||
    track?.videoPoster ||
    null
  const hours =
    moduleCount > 0
      ? `${moduleCount} unit${moduleCount === 1 ? '' : 's'} · ${lessonCount} lesson${lessonCount === 1 ? '' : 's'}`
      : track?.hours || ''

  return {
    ...(track || { id: IOAI_FULL_TRACK_SLUG }),
    id: IOAI_FULL_TRACK_SLUG,
    accessType: 'full-track',
    name: title,
    nameEn: title,
    badge: COURSES_PORTAL.fullTrack,
    coverUrl,
    hours,
  }
}

function collectModuleLessonIds(levels, moduleCatalogSlug) {
  const found = findModule(levels, moduleCatalogSlug)
  if (!found?.module?.lessons?.length) return []
  return found.module.lessons.map(resolveLessonCatalogSlug).filter(Boolean)
}

/** Union of IOAI module catalog slugs the user owns. */
export function resolveOwnedIoaiModuleSlugs({ enrollmentSlugs = [], ioaiModuleSlugs = [], catalog = [], levels = [] }) {
  const slugs = new Set(ioaiModuleSlugs || [])

  for (const slug of enrollmentSlugs || []) {
    if (!slug || slug === IOAI_FULL_TRACK_SLUG || slug === 'ioai-track') continue
    if (findModule(levels, slug)) {
      slugs.add(slug)
      continue
    }
    const course = findCourseInList(catalog, slug)
    if (course?.line === 'ioai' && course?.sub === 'module') slugs.add(slug)
  }

  return [...slugs]
}

/** Lesson slugs covered by purchased IOAI modules (hide from per-lesson Study list). */
export function lessonSlugsCoveredByModules(moduleSlugs, levels) {
  const covered = new Set()
  for (const moduleSlug of moduleSlugs || []) {
    for (const lessonId of collectModuleLessonIds(levels, moduleSlug)) {
      covered.add(lessonId)
    }
  }
  return covered
}

/**
 * Build Study Center cards: IOAI modules as units; other purchases as individual courses/lessons.
 * @returns {Array<object>}
 */
export function buildStudyCourses({
  enrollmentSlugs = [],
  ioaiModuleSlugs = [],
  catalog = [],
  levels = [],
  fullBundle = null,
}) {
  const items = []
  const fullTrack = hasFullIOAITrack(enrollmentSlugs)

  if (fullTrack) {
    const track = findCourseInList(catalog, IOAI_FULL_TRACK_SLUG)
    items.push(buildFullTrackStudyItem(track, fullBundle, levels))
  }

  const moduleSlugs = resolveOwnedIoaiModuleSlugs({ enrollmentSlugs, ioaiModuleSlugs, catalog, levels })
  const coveredLessons = lessonSlugsCoveredByModules(moduleSlugs, levels)
  const addedModuleSlugs = new Set()

  for (const moduleSlug of moduleSlugs) {
    if (addedModuleSlugs.has(moduleSlug)) continue
    addedModuleSlugs.add(moduleSlug)

    const fromStore = findModule(levels, moduleSlug)
    const fromCatalog = findCourseInList(catalog, moduleSlug)
    const title =
      fromStore?.module?.title ||
      fromCatalog?.nameEn ||
      fromCatalog?.name ||
      moduleSlug
    const lessonIds = collectModuleLessonIds(levels, moduleSlug)
    const lessonCount = lessonIds.length || fromStore?.module?.lessonCount || fromCatalog?.lessons || 0

    items.push({
      id: moduleSlug,
      name: title,
      nameEn: title,
      hours: lessonCount ? `${lessonCount} lesson${lessonCount === 1 ? '' : 's'}` : fromCatalog?.hours || '',
      badge: 'IOAI Module',
      accessType: 'module',
      moduleSlug,
      lessonIds,
      coverUrl: fromStore?.module?.coverUrl || fromCatalog?.thumbnail || null,
      levelTitle: fromStore?.level?.title || '',
      themeTitle: fromStore?.theme?.categoryLabel || fromStore?.theme?.title || '',
    })
  }

  for (const slug of enrollmentSlugs || []) {
    if (slug === IOAI_FULL_TRACK_SLUG || slug === 'ioai-track') continue
    if (addedModuleSlugs.has(slug)) continue
    if (coveredLessons.has(slug)) continue

    const course = findCourseInList(catalog, slug)
    if (!course) continue
    if (course.line === 'ioai' && course.sub === 'module') continue

    items.push({
      ...course,
      accessType: course.deliveryType === 'video' ? 'lesson' : 'course',
    })
  }

  return items
}

export function studyCourseContinueHref(course, catalog, tree) {
  if (course.accessType === 'module') {
    return studyModulePath(course.moduleSlug || course.id)
  }
  if (isIOAITrackId(course.id)) {
    const lessonId = getContinueLessonId(getAllIOAILessonIds(catalog, tree))
    return lessonId ? studyLessonPath(lessonId, { play: true }) : studyLessonPath(getFirstIOAILessonId(catalog, tree), { play: true })
  }
  return studyLessonPath(course.id, { play: course.accessType === 'lesson' })
}

export function studyCourseProgressLabel(course, catalog, levels, curriculumTree) {
  if (course.accessType === 'module') {
    const lessonIds = course.lessonIds?.length
      ? course.lessonIds
      : collectModuleLessonIds(levels, course.moduleSlug || course.id)
    if (lessonIds.length) {
      const stats = getTrackProgressStats(lessonIds)
      return `${stats.percent}% · ${stats.completed}/${stats.total} lessons`
    }
    return 'All lessons unlocked'
  }
  if (isIOAITrackId(course.id)) {
    const stats = getTrackProgressStats(getAllIOAILessonIds(catalog, curriculumTree))
    return `${stats.percent}% · ${stats.completed}/${stats.total} lessons`
  }
  const p = getLessonProgress(course.id)
  if (p.completed) return 'Completed'
  if (p.lastVisitedAt) return 'In progress'
  return 'Not started'
}

export function studyCourseProgressStats(course, catalog, levels, curriculumTree) {
  if (course.accessType === 'module') {
    const lessonIds = course.lessonIds?.length
      ? course.lessonIds
      : collectModuleLessonIds(levels, course.moduleSlug || course.id)
    return lessonIds.length ? getTrackProgressStats(lessonIds) : null
  }
  if (isIOAITrackId(course.id)) {
    return getTrackProgressStats(getAllIOAILessonIds(catalog, curriculumTree))
  }
  return null
}

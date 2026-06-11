import { findCourseInList } from './catalogCourse'
import { hasFullIOAITrack, IOAI_FULL_TRACK_SLUG } from './courseAccess'
import { getAllIOAILessonIds, isIOAITrackId } from './ioaiCourseStructure'
import { getTrackProgressStats, getContinueLessonId, getLessonProgress } from './learningProgress'
import { findModule, resolveLessonCatalogSlug } from './ioaiStore'

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
export function buildStudyCourses({ enrollmentSlugs = [], ioaiModuleSlugs = [], catalog = [], levels = [] }) {
  const items = []
  const fullTrack = hasFullIOAITrack(enrollmentSlugs)

  if (fullTrack) {
    const track = findCourseInList(catalog, IOAI_FULL_TRACK_SLUG)
    if (track) items.push({ ...track, accessType: 'full-track' })
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
    return `/courses/module/${encodeURIComponent(course.moduleSlug || course.id)}`
  }
  if (isIOAITrackId(course.id)) {
    const lessonId = getContinueLessonId(getAllIOAILessonIds(catalog, tree))
    return lessonId ? `/courses/detail/${lessonId}` : `/courses/detail/${IOAI_FULL_TRACK_SLUG}`
  }
  return `/courses/detail/${course.id}`
}

export function studyCourseProgressLabel(course, catalog, levels) {
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
    const stats = getTrackProgressStats(getAllIOAILessonIds(catalog, tree))
    return `${stats.percent}% · ${stats.completed}/${stats.total} lessons`
  }
  const p = getLessonProgress(course.id)
  if (p.completed) return 'Completed'
  if (p.lastVisitedAt) return 'In progress'
  return 'Not started'
}

export function studyCourseProgressStats(course, catalog, levels) {
  if (course.accessType === 'module') {
    const lessonIds = course.lessonIds?.length
      ? course.lessonIds
      : collectModuleLessonIds(levels, course.moduleSlug || course.id)
    return lessonIds.length ? getTrackProgressStats(lessonIds) : null
  }
  if (isIOAITrackId(course.id)) {
    return getTrackProgressStats(getAllIOAILessonIds(catalog, tree))
  }
  return null
}

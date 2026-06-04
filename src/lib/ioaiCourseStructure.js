import {
  ioaiCurriculum as staticCurriculum,
  IOAI_CURRICULUM_SUMMARY as staticSummary,
  flattenIOAICurriculumLessons,
  findIOAICurriculumLesson,
  parseIOAILessonSlug,
} from '../data/ioaiCurriculum'
import { buildCurriculumSummary } from './ioaiCurriculumDb'

export const IOAI_TRACK_ID = 'ioai-competition-system'

export { staticCurriculum as ioaiCurriculum, parseIOAILessonSlug }

/** @deprecated use buildCurriculumSummary(tree) from DB */
export const IOAI_CURRICULUM_SUMMARY = staticSummary

export function getIOAICurriculumSummary(curriculumTree = null) {
  if (curriculumTree?.length) {
    return buildCurriculumSummary(curriculumTree)
  }
  return staticSummary
}

export function isIOAITrackId(id) {
  return id === IOAI_TRACK_ID
}

export function isIOAILessonInTree(lessonId, curriculumTree) {
  if (!lessonId || !curriculumTree?.length) return false
  for (const level of curriculumTree) {
    for (const theme of level.themes || []) {
      for (const mod of theme.modules || []) {
        if (mod.lessons?.some((l) => l.id === lessonId)) return true
      }
    }
  }
  return false
}

/** IOAI lesson slugs — DB tree, catalog row, or legacy slug pattern */
export function isIOAILessonId(id, courses = null, curriculumTree = null) {
  if (!id || id === IOAI_TRACK_ID) return false
  if (isIOAILessonInTree(id, curriculumTree)) return true
  const row = courses?.find((c) => c.id === id)
  if (row?.line === 'ioai' && row?.sub === 'video' && row.id !== IOAI_TRACK_ID) return true
  return typeof id === 'string' && /^ioai-.+-l\d+$/.test(id)
}

export function isIOAIVideoCourse(id, courses = null, curriculumTree = null) {
  return isIOAITrackId(id) || isIOAILessonId(id, courses, curriculumTree)
}

export function parseIOAILessonId(id) {
  const parsed = parseIOAILessonSlug(id)
  if (!parsed?.levelId) return null
  return {
    levelId: parsed.levelId,
    themeId: parsed.themeId,
    moduleId: parsed.moduleId,
    lesson: parsed.lesson,
    module: parsed.moduleId,
  }
}

function lessonIdsFromTree(curriculumTree) {
  const ids = []
  for (const level of curriculumTree) {
    for (const theme of level.themes || []) {
      for (const mod of theme.modules || []) {
        for (const lesson of mod.lessons || []) {
          if (lesson.id) ids.push(lesson.id)
        }
      }
    }
  }
  return ids
}

function staticLessonIds() {
  return flattenIOAICurriculumLessons().map((l) => l.id)
}

/** Ordered lesson slugs — curriculum tree first, then catalog, then static seed */
export function getAllIOAILessonIds(courses = null, curriculumTree = null) {
  if (curriculumTree?.length) {
    const fromTree = lessonIdsFromTree(curriculumTree)
    if (fromTree.length) return fromTree
  }
  if (courses?.length) {
    const fromCatalog = courses
      .filter((c) => isIOAILessonId(c.id, courses, curriculumTree))
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .map((c) => c.id)
    if (fromCatalog.length) return fromCatalog
  }
  return staticLessonIds()
}

function mergeLessonMeta(lesson, courses, level, theme, mod) {
  const lessonId = lesson.id || lesson.slug
  const row = courses?.find((c) => c.id === lessonId)
  const staticMeta = findIOAICurriculumLesson(lessonId)
  const parsed = parseIOAILessonSlug(lessonId)
  const categoryLabel = theme.categoryLabel || theme.category_label || theme.title

  return {
    id: lessonId,
    title: row?.nameEn || row?.name || lesson.title || staticMeta?.lesson.title || lessonId,
    lessonNum: `${level.title} · ${categoryLabel} · ${mod.title}`,
    levelId: level.id,
    themeId: theme.id,
    moduleId: mod.id,
    categoryLabel,
    catalog: row ?? null,
    cloudflareVideoId: lesson.cloudflareVideoId || row?.cloudflareUid || null,
    knowledgePoints: lesson.knowledgePoints || '',
    contentGoals: lesson.contentGoals || '',
  }
}

function buildFromTree(curriculumTree, courses) {
  return curriculumTree.map((level) => ({
    id: level.id,
    title: level.title,
    emoji: level.emoji || '',
    themes: (level.themes || []).map((theme) => ({
      id: theme.id,
      title: theme.title,
      categoryLabel: theme.categoryLabel || theme.category_label || theme.title,
      modules: (theme.modules || []).map((mod) => ({
        id: mod.id,
        title: mod.title,
        levelId: level.id,
        themeId: theme.id,
        lessons: (mod.lessons || [])
          .map((lesson) => mergeLessonMeta(lesson, courses, level, theme, mod))
          .filter(Boolean),
      })),
    })),
  }))
}

function buildFromStatic(courses) {
  return staticCurriculum.map((level) => ({
    id: level.id,
    title: level.title,
    emoji: level.emoji,
    themes: level.themes.map((theme) => ({
      id: theme.id,
      title: theme.title,
      categoryLabel: theme.title.replace(/主题$/, ''),
      modules: theme.modules.map((mod) => ({
        id: mod.id,
        title: mod.title,
        levelId: level.id,
        themeId: theme.id,
        lessons: mod.lessons
          .map((lesson) =>
            mergeLessonMeta({ id: lesson.id, title: lesson.title }, courses, level, theme, mod)
          )
          .filter(Boolean),
      })),
    })),
  }))
}

/** Structured curriculum: CourseLevel → Theme → Module → Lesson (DB tree when available) */
export function buildIOAICurriculum(courses = null, curriculumTree = null) {
  if (curriculumTree?.length) {
    return buildFromTree(curriculumTree, courses)
  }
  return buildFromStatic(courses)
}

export function getAdjacentLessons(lessonId, courses = null, curriculumTree = null) {
  const all = getAllIOAILessonIds(courses, curriculumTree)
  const index = all.indexOf(lessonId)
  if (index < 0) return { prev: null, next: null, index: -1, total: all.length }
  return {
    prev: all[index - 1] ?? null,
    next: all[index + 1] ?? null,
    index,
    total: all.length,
  }
}

export function findModuleForLesson(lessonId, curriculumTree = null) {
  const tree = curriculumTree?.length ? curriculumTree : staticCurriculum
  for (const level of tree) {
    for (const theme of level.themes || []) {
      for (const mod of theme.modules || []) {
        if (mod.lessons?.some((l) => (l.id || l.slug) === lessonId)) {
          return {
            levelId: level.id,
            levelTitle: level.title,
            themeId: theme.id,
            themeTitle: theme.title,
            categoryLabel: theme.categoryLabel || theme.category_label || theme.title,
            moduleId: mod.id,
            title: mod.title,
          }
        }
      }
    }
  }
  const found = findIOAICurriculumLesson(lessonId)
  if (!found) return null
  return {
    levelId: found.level.id,
    levelTitle: found.level.title,
    themeId: found.theme.id,
    themeTitle: found.theme.title,
    categoryLabel: found.theme.title,
    moduleId: found.module.id,
    title: found.module.title,
  }
}

function catalogRowForLesson(lesson, lessonBySlug) {
  const slug = lesson.id || lesson.slug
  return (
    lessonBySlug.get(slug) ?? {
      slug,
      name: lesson.title || slug,
      line: 'ioai',
      sub: 'video',
      status: 'live',
      sort_order: lesson.sort_order ?? 0,
      _curriculumOnly: true,
    }
  )
}

/** Group catalog rows for admin: level → category → module → lessons (DB tree when available) */
export function groupIOAICatalogByCurriculum(items, curriculumTree = null) {
  const sorted = [...items].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
  const track = sorted.find((r) => r.slug === IOAI_TRACK_ID) ?? null
  const lessonRows = sorted.filter((r) => isIOAILessonId(r.slug, null, curriculumTree))
  const lessonBySlug = new Map(lessonRows.map((r) => [r.slug, r]))

  const tree = curriculumTree?.length ? curriculumTree : staticCurriculum

  const levels = tree.map((level) => ({
    id: level.id,
    title: level.title,
    emoji: level.emoji || '',
    themes: (level.themes || []).map((theme) => ({
      id: theme.id,
      title: theme.categoryLabel || theme.category_label || theme.title,
      modules: (theme.modules || []).map((mod) => ({
        id: mod.id,
        title: mod.title,
        levelId: level.id,
        themeId: theme.id,
        lessons: (mod.lessons || [])
          .map((lesson) => catalogRowForLesson(lesson, lessonBySlug))
          .filter(Boolean),
      })),
    })),
  }))

  const assigned = new Set(
    levels.flatMap((l) => l.themes.flatMap((t) => t.modules.flatMap((m) => m.lessons.map((r) => r.slug))))
  )
  const unassigned = lessonRows.filter((r) => !assigned.has(r.slug))

  return { track, levels, unassigned }
}

export function getFirstIOAILessonId(courses = null, curriculumTree = null) {
  const ids = getAllIOAILessonIds(courses, curriculumTree)
  return ids[0] ?? null
}

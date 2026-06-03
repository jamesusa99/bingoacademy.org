import {
  ioaiCurriculum,
  IOAI_CURRICULUM_SUMMARY,
  flattenIOAICurriculumLessons,
  findIOAICurriculumLesson,
  parseIOAILessonSlug,
} from '../data/ioaiCurriculum'

export const IOAI_TRACK_ID = 'ioai-competition-system'

export { ioaiCurriculum, IOAI_CURRICULUM_SUMMARY, parseIOAILessonSlug }

export function isIOAITrackId(id) {
  return id === IOAI_TRACK_ID
}

/** IOAI lesson slugs: ioai-{level}-{theme}-{module}-l{n} */
export function isIOAILessonId(id) {
  return typeof id === 'string' && /^ioai-.+-l\d+$/.test(id) && id !== IOAI_TRACK_ID
}

export function isIOAIVideoCourse(id) {
  return isIOAITrackId(id) || isIOAILessonId(id)
}

/** @deprecated use parseIOAILessonSlug */
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

function staticLessonIds() {
  return flattenIOAICurriculumLessons().map((l) => l.id)
}

/** Ordered lesson slugs — catalog sortOrder when courses array provided */
export function getAllIOAILessonIds(courses = null) {
  if (courses?.length) {
    const fromCatalog = courses
      .filter((c) => isIOAILessonId(c.id))
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .map((c) => c.id)
    if (fromCatalog.length) return fromCatalog
  }
  return staticLessonIds()
}

function catalogLessonMeta(courses, lessonId) {
  const staticMeta = findIOAICurriculumLesson(lessonId)
  const row = courses?.find((c) => c.id === lessonId)
  const parsed = parseIOAILessonSlug(lessonId)

  if (!staticMeta && !row) return null

  const lessonNum = parsed
    ? `${staticMeta?.level.title ?? ''} · ${staticMeta?.theme.title ?? ''} · ${parsed.lesson}`
    : lessonId

  return {
    id: lessonId,
    title: row?.nameEn || row?.name || staticMeta?.lesson.title || lessonId,
    lessonNum,
    levelId: staticMeta?.level.id ?? parsed?.levelId,
    themeId: staticMeta?.theme.id ?? parsed?.themeId,
    moduleId: staticMeta?.module.id ?? parsed?.moduleId,
    catalog: row ?? null,
  }
}

/** Structured curriculum: CourseLevel → Theme → Module → Lesson */
export function buildIOAICurriculum(courses = null) {
  const orderedIds = getAllIOAILessonIds(courses)
  const lessonMetaById = new Map(orderedIds.map((id) => [id, catalogLessonMeta(courses, id)]))

  return ioaiCurriculum.map((level) => ({
    id: level.id,
    title: level.title,
    emoji: level.emoji,
    themes: level.themes.map((theme) => ({
      id: theme.id,
      title: theme.title,
      modules: theme.modules.map((mod) => ({
        id: mod.id,
        title: mod.title,
        levelId: level.id,
        themeId: theme.id,
        lessons: mod.lessons
          .map((lesson) => lessonMetaById.get(lesson.id) ?? catalogLessonMeta(courses, lesson.id))
          .filter(Boolean),
      })),
    })),
  }))
}

export function getAdjacentLessons(lessonId, courses = null) {
  const all = getAllIOAILessonIds(courses)
  const index = all.indexOf(lessonId)
  if (index < 0) return { prev: null, next: null, index: -1, total: all.length }
  return {
    prev: all[index - 1] ?? null,
    next: all[index + 1] ?? null,
    index,
    total: all.length,
  }
}

export function findModuleForLesson(lessonId) {
  const found = findIOAICurriculumLesson(lessonId)
  if (!found) return null
  return {
    levelId: found.level.id,
    levelTitle: found.level.title,
    themeId: found.theme.id,
    themeTitle: found.theme.title,
    moduleId: found.module.id,
    title: found.module.title,
  }
}

/** Group catalog rows for admin: level → theme → module → lessons */
export function groupIOAICatalogByCurriculum(items) {
  const sorted = [...items].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
  const track = sorted.find((r) => r.slug === IOAI_TRACK_ID) ?? null
  const lessonRows = sorted.filter((r) => isIOAILessonId(r.slug))
  const lessonBySlug = new Map(lessonRows.map((r) => [r.slug, r]))

  const levels = ioaiCurriculum.map((level) => ({
    id: level.id,
    title: level.title,
    emoji: level.emoji,
    themes: level.themes.map((theme) => ({
      id: theme.id,
      title: theme.title,
      modules: theme.modules.map((mod) => ({
        id: mod.id,
        title: mod.title,
        levelId: level.id,
        themeId: theme.id,
        lessons: mod.lessons
          .map((l) => lessonBySlug.get(l.id))
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

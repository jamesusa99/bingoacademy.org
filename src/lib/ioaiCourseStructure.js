import { IOAI_COURSE_SYSTEM } from '../config/ioaiCourseSystem'

export const IOAI_TRACK_ID = 'ioai-competition-system'

const STAGE_BY_ID = Object.fromEntries(IOAI_COURSE_SYSTEM.stages.map((s) => [s.id, s]))

export function lessonSlug(moduleNumber, lessonIndex) {
  return `ioai-${moduleNumber}-${lessonIndex + 1}`
}

export function isIOAITrackId(id) {
  return id === IOAI_TRACK_ID
}

export function isIOAILessonId(id) {
  return /^ioai-\d+-\d+$/.test(id)
}

export function isIOAIVideoCourse(id) {
  return isIOAITrackId(id) || isIOAILessonId(id)
}

function staticLessonIds() {
  const ids = []
  for (const mod of IOAI_COURSE_SYSTEM.modules) {
    mod.lessons.forEach((_title, idx) => {
      ids.push(lessonSlug(mod.number, idx))
    })
  }
  return ids
}

/** Ordered lesson slugs — uses catalog sortOrder when courses array provided */
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
  if (courses?.length) {
    const row = courses.find((c) => c.id === lessonId)
    if (row) {
      const parsed = parseIOAILessonId(lessonId)
      return {
        id: lessonId,
        title: row.nameEn || row.name?.replace(/^\d+\.\d+\s+/, '') || lessonId,
        lessonNum: parsed ? `${parsed.module}.${parsed.lesson}` : lessonId,
        catalog: row,
      }
    }
  }
  return null
}

/** Structured curriculum: stages → modules → lessons */
export function buildIOAICurriculum(courses = null) {
  const orderedIds = getAllIOAILessonIds(courses)
  const idsByModule = new Map()

  for (const id of orderedIds) {
    const parsed = parseIOAILessonId(id)
    if (!parsed) continue
    if (!idsByModule.has(parsed.module)) idsByModule.set(parsed.module, [])
    idsByModule.get(parsed.module).push(id)
  }

  const moduleOrder = [...idsByModule.keys()].sort((a, b) => {
    const firstA = idsByModule.get(a)[0]
    const firstB = idsByModule.get(b)[0]
    const orderA = courses?.find((c) => c.id === firstA)?.sortOrder ?? a
    const orderB = courses?.find((c) => c.id === firstB)?.sortOrder ?? b
    return orderA - orderB
  })

  return IOAI_COURSE_SYSTEM.stages.map((stage) => ({
    ...stage,
    modules: moduleOrder
      .map((num) => IOAI_COURSE_SYSTEM.modules.find((m) => m.number === num))
      .filter((mod) => mod && mod.stage === stage.id)
      .map((mod) => ({
        number: mod.number,
        title: mod.title,
        category: mod.category,
        stage: mod.stage,
        stageLabel: STAGE_BY_ID[mod.stage]?.label,
        lessons: (idsByModule.get(mod.number) || []).map((id, idx) => {
          const fromCatalog = catalogLessonMeta(courses, id)
          if (fromCatalog) return fromCatalog
          const staticIdx = idx
          const title = mod.lessons[staticIdx] ?? `Lesson ${idx + 1}`
          return {
            id,
            title,
            lessonNum: `${mod.number}.${idx + 1}`,
            catalog: courses?.find((c) => c.id === id) ?? null,
          }
        }),
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

export function parseIOAILessonId(id) {
  const match = /^ioai-(\d+)-(\d+)$/.exec(id)
  if (!match) return null
  return { module: Number(match[1]), lesson: Number(match[2]) }
}

export function findModuleForLesson(lessonId) {
  const parsed = parseIOAILessonId(lessonId)
  if (!parsed) return null
  return IOAI_COURSE_SYSTEM.modules.find((m) => m.number === parsed.module) ?? null
}

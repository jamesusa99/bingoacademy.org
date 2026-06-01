import { IOAI_COURSE_SYSTEM } from '../config/ioaiCourseSystem'
import { getCourseById } from '../config/coursesCatalog'

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

export function getAllIOAILessonIds() {
  const ids = []
  for (const mod of IOAI_COURSE_SYSTEM.modules) {
    mod.lessons.forEach((_title, idx) => {
      ids.push(lessonSlug(mod.number, idx))
    })
  }
  return ids
}

/** Structured curriculum: stages → modules → lessons */
export function buildIOAICurriculum() {
  return IOAI_COURSE_SYSTEM.stages.map((stage) => ({
    ...stage,
    modules: IOAI_COURSE_SYSTEM.modules
      .filter((m) => m.stage === stage.id)
      .map((mod) => ({
        number: mod.number,
        title: mod.title,
        category: mod.category,
        stage: mod.stage,
        stageLabel: STAGE_BY_ID[mod.stage]?.label,
        lessons: mod.lessons.map((title, idx) => {
          const id = lessonSlug(mod.number, idx)
          return {
            id,
            title,
            lessonNum: `${mod.number}.${idx + 1}`,
            catalog: getCourseById(id),
          }
        }),
      })),
  }))
}

export function getAdjacentLessons(lessonId) {
  const all = getAllIOAILessonIds()
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

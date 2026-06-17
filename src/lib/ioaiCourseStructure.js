import {
  ioaiCurriculum as staticCurriculum,
  IOAI_CURRICULUM_SUMMARY as staticSummary,
  flattenIOAICurriculumLessons,
  findIOAICurriculumLesson,
  parseIOAILessonSlug,
} from '../data/ioaiCurriculum'
import { buildCurriculumSummary } from './ioaiCurriculumDb'
import { buildModuleCatalogSlug, resolveLessonCatalogSlug } from './ioaiStore'
import { getProgramCurriculum, isCurriculumLine } from '../config/programCurriculum'

export const IOAI_TRACK_ID = 'ioai-competition-system'

export { staticCurriculum as ioaiCurriculum, parseIOAILessonSlug }

/** @deprecated use buildCurriculumSummary(tree) from DB */
export const IOAI_CURRICULUM_SUMMARY = staticSummary

export function getProgramTrackId(productLine = 'ioai') {
  return getProgramCurriculum(productLine).trackSlug
}

export function getProgramCurriculumSummary(curriculumTree = null, productLine = 'ioai') {
  if (curriculumTree?.length) {
    return buildCurriculumSummary(curriculumTree, productLine)
  }
  if (productLine === 'ioai') return staticSummary
  return buildCurriculumSummary([], productLine)
}

/** @deprecated use getProgramCurriculumSummary(tree, 'ioai') */
export function getIOAICurriculumSummary(curriculumTree = null) {
  return getProgramCurriculumSummary(curriculumTree, 'ioai')
}

export function isProgramTrackId(id, productLine = 'ioai') {
  return id === getProgramTrackId(productLine)
}

/** @deprecated use isProgramTrackId(id, 'ioai') */
export function isIOAITrackId(id) {
  return isProgramTrackId(id, 'ioai')
}

function lessonMatchesId(lesson, lessonId) {
  const primary = resolveLessonCatalogSlug(lesson)
  return primary === lessonId || lesson.slug === lessonId || lesson.id === lessonId
}

export function isProgramLessonInTree(lessonId, curriculumTree) {
  if (!lessonId || !curriculumTree?.length) return false
  for (const level of curriculumTree) {
    for (const theme of level.themes || []) {
      for (const mod of theme.modules || []) {
        if (mod.lessons?.some((l) => lessonMatchesId(l, lessonId))) return true
      }
    }
  }
  return false
}

/** @deprecated */
export function isIOAILessonInTree(lessonId, curriculumTree) {
  return isProgramLessonInTree(lessonId, curriculumTree)
}

export function isProgramLessonId(id, courses = null, curriculumTree = null, productLine = 'ioai') {
  if (!id || !isCurriculumLine(productLine)) return false
  const trackId = getProgramTrackId(productLine)
  if (id === trackId) return false
  if (isProgramLessonInTree(id, curriculumTree)) return true
  const config = getProgramCurriculum(productLine)
  const row = courses?.find((c) => c.id === id)
  if (row?.line === config.line && row?.sub === config.catalogSub && row.id !== trackId) return true
  const prefix = config.slugPrefix
  if (typeof id !== 'string' || !id.startsWith(`${prefix}-`) || id === trackId) return false
  return /-(l\d+|c\d+)$/i.test(id) || new RegExp(`^${prefix}-.+-l\\d+$`).test(id)
}

/** @deprecated use isProgramLessonId(..., 'ioai') */
export function isIOAILessonId(id, courses = null, curriculumTree = null) {
  return isProgramLessonId(id, courses, curriculumTree, 'ioai')
}

export function isProgramVideoCourse(id, courses = null, curriculumTree = null, productLine = 'ioai') {
  return isProgramTrackId(id, productLine) || isProgramLessonId(id, courses, curriculumTree, productLine)
}

/** @deprecated use isProgramVideoCourse(..., 'ioai') */
export function isIOAIVideoCourse(id, courses = null, curriculumTree = null) {
  return isProgramVideoCourse(id, courses, curriculumTree, 'ioai')
}

export function detectProgramLineForCourse(id, courses = null, treesByLine = null) {
  if (!id) return null
  for (const line of ['ioai', 'general', 'k12']) {
    const tree = treesByLine?.[line]
    if (isProgramVideoCourse(id, courses, tree, line)) return line
  }
  const row = courses?.find((c) => c.id === id)
  if (row && isCurriculumLine(row.line)) return row.line
  return null
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
          const lessonId = resolveLessonCatalogSlug(lesson)
          if (lessonId) ids.push(lessonId)
        }
      }
    }
  }
  return ids
}

function staticLessonIds() {
  return flattenIOAICurriculumLessons().map((l) => l.id)
}

/** Ordered lesson slugs — curriculum tree first, then catalog, then static seed (IOAI only) */
export function getAllProgramLessonIds(courses = null, curriculumTree = null, productLine = 'ioai') {
  if (curriculumTree?.length) {
    const fromTree = lessonIdsFromTree(curriculumTree)
    if (fromTree.length) return fromTree
  }
  if (courses?.length) {
    const fromCatalog = courses
      .filter((c) => isProgramLessonId(c.id, courses, curriculumTree, productLine))
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .map((c) => c.id)
    if (fromCatalog.length) return fromCatalog
  }
  if (productLine === 'ioai') return staticLessonIds()
  return []
}

/** @deprecated use getAllProgramLessonIds(..., 'ioai') */
export function getAllIOAILessonIds(courses = null, curriculumTree = null) {
  return getAllProgramLessonIds(courses, curriculumTree, 'ioai')
}

function mergeLessonMeta(lesson, courses, level, theme, mod) {
  const lessonId = resolveLessonCatalogSlug(lesson)
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
export function buildProgramCurriculum(courses = null, curriculumTree = null, productLine = 'ioai') {
  if (curriculumTree?.length) {
    return buildFromTree(curriculumTree, courses)
  }
  if (productLine === 'ioai') return buildFromStatic(courses)
  return []
}

/** @deprecated use buildProgramCurriculum(..., 'ioai') */
export function buildIOAICurriculum(courses = null, curriculumTree = null) {
  return buildProgramCurriculum(courses, curriculumTree, 'ioai')
}

export function getAdjacentLessons(lessonId, courses = null, curriculumTree = null, productLine = 'ioai') {
  const all = getAllProgramLessonIds(courses, curriculumTree, productLine)
  const index = all.indexOf(lessonId)
  if (index < 0) return { prev: null, next: null, index: -1, total: all.length }
  return {
    prev: all[index - 1] ?? null,
    next: all[index + 1] ?? null,
    index,
    total: all.length,
  }
}

export function findLessonInTree(lessonId, curriculumTree = null) {
  if (!lessonId || !curriculumTree?.length) return null
  for (const level of curriculumTree) {
    for (const theme of level.themes || []) {
      for (const mod of theme.modules || []) {
        const lesson = (mod.lessons || []).find((l) => {
          const primary = resolveLessonCatalogSlug(l)
          return primary === lessonId || l.slug === lessonId || l.id === lessonId
        })
        if (lesson) {
          return {
            lesson,
            mod,
            theme,
            level,
          }
        }
      }
    }
  }
  return null
}

export function findModuleForLesson(lessonId, curriculumTree = null) {
  const tree = curriculumTree?.length ? curriculumTree : staticCurriculum
  for (const level of tree) {
    for (const theme of level.themes || []) {
      for (const mod of theme.modules || []) {
        if (mod.lessons?.some((l) => lessonMatchesId(l, lessonId))) {
          return {
            levelId: level.id,
            levelTitle: level.title,
            themeId: theme.id,
            themeTitle: theme.title,
            categoryLabel: theme.categoryLabel || theme.category_label || theme.title,
            moduleId: mod.id,
            title: mod.title,
            catalogSlug:
              mod.catalogSlug ||
              mod.catalog_slug ||
              buildModuleCatalogSlug(level.id, theme.id, mod.id) ||
              null,
            priceCents: mod.priceCents ?? null,
            currency: mod.currency || 'usd',
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

function catalogRowForLesson(lesson, lessonBySlug, productLine = 'ioai') {
  const config = getProgramCurriculum(productLine)
  const slug = lesson.id || lesson.slug
  return (
    lessonBySlug.get(slug) ?? {
      slug,
      name: lesson.title || slug,
      line: config.line,
      sub: config.catalogSub,
      status: 'live',
      sort_order: lesson.sort_order ?? 0,
      _curriculumOnly: true,
    }
  )
}

/** Group catalog rows for admin: level → category → module → lessons */
export function groupCatalogByCurriculum(items, curriculumTree = null, productLine = 'ioai') {
  const config = getProgramCurriculum(productLine)
  const sorted = [...items].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
  const track = sorted.find((r) => r.slug === config.trackSlug) ?? null
  const lessonRows = sorted.filter((r) => isProgramLessonId(r.slug, null, curriculumTree, productLine))
  const lessonBySlug = new Map(lessonRows.map((r) => [r.slug, r]))

  const tree = curriculumTree?.length ? curriculumTree : productLine === 'ioai' ? staticCurriculum : []

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
          .map((lesson) => catalogRowForLesson(lesson, lessonBySlug, productLine))
          .filter(Boolean),
      })),
    })),
  }))

  const assigned = new Set(
    levels.flatMap((l) => l.themes.flatMap((t) => t.modules.flatMap((m) => m.lessons.map((r) => r.slug))))
  )
  const unassigned = lessonRows.filter((r) => !assigned.has(r.slug))

  return { track, levels, unassigned, productLine }
}

/** @deprecated use groupCatalogByCurriculum(..., 'ioai') */
export function groupIOAICatalogByCurriculum(items, curriculumTree = null) {
  return groupCatalogByCurriculum(items, curriculumTree, 'ioai')
}

export function getFirstProgramLessonId(courses = null, curriculumTree = null, productLine = 'ioai') {
  const ids = getAllProgramLessonIds(courses, curriculumTree, productLine)
  return ids[0] ?? null
}

/** @deprecated use getFirstProgramLessonId(..., 'ioai') */
export function getFirstIOAILessonId(courses = null, curriculumTree = null) {
  return getFirstProgramLessonId(courses, curriculumTree, 'ioai')
}

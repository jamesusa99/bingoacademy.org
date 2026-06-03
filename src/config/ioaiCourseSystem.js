/**
 * IOAI Competition Course System — generates courses_catalog entries
 * Architecture: CourseLevel → Theme → Module → Lesson (see src/data/ioaiCurriculum.js)
 */

import { DEFAULT_LESSON_VIDEO, DEFAULT_LESSON_POSTER } from './courseVideo.js'
import {
  ioaiCurriculum,
  IOAI_CURRICULUM_SUMMARY,
  flattenIOAICurriculumLessons,
} from '../data/ioaiCurriculum.js'

/** First lesson in the IOAI curriculum (free trial default) */
export const FIRST_IOAI_LESSON_ID =
  flattenIOAICurriculumLessons()[0]?.id ?? 'ioai-intro-math-part-1-linear-algebra-l1'

export { ioaiCurriculum, IOAI_CURRICULUM_SUMMARY }

const THEME_CATEGORY = {
  math: 'ai-fundamentals',
  python: 'ai-fundamentals',
  ai: 'machine-learning',
}

const LEVEL_META = {
  intro: { level: 'beginner', emoji: '🟢' },
  'advanced-1': { level: 'intermediate', emoji: '🟡' },
  'advanced-2': { level: 'intermediate', emoji: '🟠' },
  competition: { level: 'advanced', emoji: '🏆' },
}

export function buildIOAIVideoCatalogEntries() {
  const entries = []
  const { lessons: lessonCount, summary, title } = IOAI_CURRICULUM_SUMMARY

  const fullSyllabus = ioaiCurriculum.map((level) => {
    const themeParts = level.themes.map((theme) => {
      const modParts = theme.modules.map((m) => `${m.title} (${m.lessons.length})`).join(', ')
      return `${theme.title}: ${modParts}`
    })
    return `${level.title}: ${themeParts.join(' · ')}`
  })

  entries.push({
    id: 'ioai-competition-system',
    line: 'ioai',
    sub: 'video',
    status: 'live',
    deliveryType: 'video',
    featured: true,
    name: `${title} — ${lessonCount} Lessons`,
    nameEn: title,
    desc: 'IOAI competition training: intro math/Python/AI foundations, two advanced tiers, and competition sprint modules.',
    price: 'From $2,990',
    hours: summary,
    badge: 'IOAI Full Track',
    category: 'ai-fundamentals',
    level: 'intermediate',
    lessons: lessonCount,
    rating: 4.9,
    students: 3200,
    outcomes: [
      'Build math, Python, and ML foundations for IOAI',
      'Progress through advanced modules toward competition readiness',
      'Complete structured lesson path with video checkpoints',
    ],
    audience: 'Grades 7–12 · Python basics recommended · IOAI & whitelist competition candidates',
    syllabus: fullSyllabus,
    labSlugs: [],
    sortOrder: 0,
    videoUrl: DEFAULT_LESSON_VIDEO,
    videoPoster: DEFAULT_LESSON_POSTER,
    previewSeconds: 120,
  })

  let sortOrder = 1
  for (const level of ioaiCurriculum) {
    const levelMeta = LEVEL_META[level.id] || LEVEL_META.intro
    for (const theme of level.themes) {
      const category = THEME_CATEGORY[theme.id] || 'ai-fundamentals'
      for (const mod of theme.modules) {
        mod.lessons.forEach((lesson, idx) => {
          entries.push({
            id: lesson.id,
            line: 'ioai',
            sub: 'video',
            status: 'live',
            deliveryType: 'video',
            featured: false,
            name: `${level.title} · ${theme.title} · ${mod.title} · ${lesson.title}`,
            nameEn: lesson.title,
            desc: `${levelMeta.emoji} ${level.title} · ${theme.title} · ${mod.title} — ${lesson.title}.`,
            price: 'Included in IOAI Track',
            hours: '1 lesson · ~45 min',
            badge: `${levelMeta.emoji} ${theme.title}`,
            category,
            level: levelMeta.level,
            lessons: 1,
            rating: 4.85,
            students: 400 + sortOrder * 5,
            outcomes: [`Complete ${mod.title} — ${lesson.title}`],
            audience: 'IOAI competition trainees',
            syllabus: [lesson.title, mod.title, theme.title, level.title],
            labSlugs: [],
            sortOrder: sortOrder++,
            videoUrl: DEFAULT_LESSON_VIDEO,
            videoPoster: DEFAULT_LESSON_POSTER,
            previewSeconds: 90,
          })
        })
      }
    }
  }

  return entries
}

export function buildIOAICourseListMeta() {
  const meta = {
    'ioai-competition-system': {
      category: 'ai-fundamentals',
      level: 'intermediate',
      lessons: IOAI_CURRICULUM_SUMMARY.lessons,
      rating: 4.9,
      students: 3200,
    },
  }
  for (const lesson of flattenIOAICurriculumLessons()) {
    meta[lesson.id] = {
      category: 'ai-fundamentals',
      level: 'beginner',
      lessons: 1,
      rating: 4.85,
      students: 400,
    }
  }
  return meta
}

/** @deprecated — use ioaiCurriculum from data/ioaiCurriculum.js */
export const IOAI_COURSE_SYSTEM = {
  title: IOAI_CURRICULUM_SUMMARY.title,
  summary: IOAI_CURRICULUM_SUMMARY.summary,
  stages: ioaiCurriculum.map((l) => ({
    id: l.id,
    emoji: l.emoji,
    label: l.title,
    modules: l.themes.reduce((n, t) => n + t.modules.length, 0),
    lessons: l.themes.reduce(
      (n, t) => n + t.modules.reduce((m, mod) => m + mod.lessons.length, 0),
      0
    ),
    level: LEVEL_META[l.id]?.level || 'beginner',
  })),
  modules: [],
}

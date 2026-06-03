/** @typedef {import('../types/curriculum.js').CourseLevel} CourseLevel */
/** @typedef {import('../types/curriculum.js').Lesson} Lesson */
/** @typedef {import('../types/curriculum.js').Module} Module */

/** @param {number} count @returns {Lesson[]} */
function lessons(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: '',
    title: `课时 ${i + 1}`,
  }))
}

/** @param {string} id @param {string} title @param {number} lessonCount @returns {Module} */
function module(id, title, lessonCount) {
  return { id, title, lessons: lessons(lessonCount) }
}

/** Build slug: ioai-{level}-{theme}-{module}-l{n} */
export function ioaiLessonSlug(levelId, themeId, moduleId, lessonIndex) {
  return `ioai-${levelId}-${themeId}-${moduleId}-l${lessonIndex + 1}`
}

/** @type {CourseLevel[]} */
export const ioaiCurriculum = [
  {
    id: 'intro',
    title: '入门课程',
    emoji: '🟢',
    themes: [
      {
        id: 'math',
        title: '数学主题',
        modules: [
          module('part-1-linear-algebra', 'Part 1: 线性代数', 2),
          module('part-2-probability', 'Part 2: 概率与统计', 2),
          module('part-3-calculus', 'Part 3: 微积分', 2),
          module('part-4', 'Part 4', 2),
        ],
      },
      {
        id: 'python',
        title: 'Python主题',
        modules: [
          module('level-0-basics', 'Level 0: Basics', 2),
          module('level-1-data', 'Level 1: 数据计算', 2),
          module('level-2', 'Level 2', 2),
        ],
      },
      {
        id: 'ai',
        title: 'AI主题',
        modules: [
          module('part-1-ml-basics', 'Part 1-ML 基础', 2),
          module('part-2-supervised', 'Part 2-监督学习', 2),
        ],
      },
    ],
  },
  {
    id: 'advanced-1',
    title: '进阶课程(一)',
    emoji: '🟡',
    themes: [
      {
        id: 'math',
        title: '数学主题',
        modules: [module('part-1', 'Part 1', 2)],
      },
      {
        id: 'python',
        title: 'Python主题',
        modules: [module('part-1', 'Part 1', 2)],
      },
      {
        id: 'ai',
        title: 'AI主题',
        modules: [module('part-1', 'Part 1', 2)],
      },
    ],
  },
  {
    id: 'advanced-2',
    title: '进阶课程(二)',
    emoji: '🟠',
    themes: [
      {
        id: 'math',
        title: '数学主题',
        modules: [module('part-1', 'Part 1', 2)],
      },
      {
        id: 'python',
        title: 'Python主题',
        modules: [module('part-1', 'Part 1', 2)],
      },
      {
        id: 'ai',
        title: 'AI主题',
        modules: [module('part-1', 'Part 1', 2)],
      },
    ],
  },
  {
    id: 'competition',
    title: '竞赛课程',
    emoji: '🏆',
    themes: [
      {
        id: 'python',
        title: 'Python主题',
        modules: [module('part-1', 'Part 1', 2)],
      },
      {
        id: 'ai',
        title: 'AI主题',
        modules: [module('part-1', 'Part 1', 2)],
      },
    ],
  },
]

/** Assign unique lesson slugs across the curriculum tree */
function assignLessonSlugs(levels) {
  for (const level of levels) {
    for (const theme of level.themes) {
      for (const mod of theme.modules) {
        mod.lessons.forEach((lesson, idx) => {
          lesson.id = ioaiLessonSlug(level.id, theme.id, mod.id, idx)
        })
      }
    }
  }
  return levels
}

assignLessonSlugs(ioaiCurriculum)

/** Flat ordered lesson list from static curriculum */
export function flattenIOAICurriculumLessons(levels = ioaiCurriculum) {
  /** @type {Lesson[]} */
  const out = []
  for (const level of levels) {
    for (const theme of level.themes) {
      for (const mod of theme.modules) {
        out.push(...mod.lessons)
      }
    }
  }
  return out
}

export const IOAI_LESSON_COUNT = flattenIOAICurriculumLessons().length

export const IOAI_CURRICULUM_SUMMARY = {
  title: 'IOAI Competition Course System',
  levels: ioaiCurriculum.length,
  themes: ioaiCurriculum.reduce((n, l) => n + l.themes.length, 0),
  modules: ioaiCurriculum.reduce(
    (n, l) => n + l.themes.reduce((m, t) => m + t.modules.length, 0),
    0
  ),
  lessons: IOAI_LESSON_COUNT,
  summary: `${ioaiCurriculum.length} levels · ${ioaiCurriculum.reduce((n, l) => n + l.themes.reduce((m, t) => m + t.modules.length, 0), 0)} modules · ${IOAI_LESSON_COUNT} lessons`,
}

/** @param {string} slug */
export function findIOAICurriculumLesson(slug) {
  for (const level of ioaiCurriculum) {
    for (const theme of level.themes) {
      for (const mod of theme.modules) {
        const lesson = mod.lessons.find((l) => l.id === slug)
        if (lesson) {
          return { level, theme, module: mod, lesson }
        }
      }
    }
  }
  return null
}

/** @param {string} slug */
export function parseIOAILessonSlug(slug) {
  const match = /^ioai-(.+)-l(\d+)$/.exec(slug)
  if (!match) return null
  const path = match[1]
  const lesson = Number(match[2])
  const found = findIOAICurriculumLesson(slug)
  if (!found) return { path, lesson, levelId: null, themeId: null, moduleId: null }
  return {
    path,
    lesson,
    levelId: found.level.id,
    themeId: found.theme.id,
    moduleId: found.module.id,
    levelTitle: found.level.title,
    themeTitle: found.theme.title,
    moduleTitle: found.module.title,
    lessonTitle: found.lesson.title,
  }
}

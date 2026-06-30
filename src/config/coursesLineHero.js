/** Admin-editable hero copy for /courses product-line pages (stored in platform_settings). */

export const COURSES_LINE_HERO_KEYS = {
  ioai: 'courses_ioai_modules_hero',
  general: 'courses_general_hero',
  k12: 'courses_k12_hero',
}

export const DEFAULT_COURSES_LINE_HERO = {
  ioai: {
    modulesTitle: 'Course units',
    modulesSubtitle:
      'Purchase a stage bundle or a course unit to unlock all video lessons inside.',
    statStudents: '800',
    statRating: '4.9',
  },
  general: {
    modulesTitle: 'Course units',
    modulesSubtitle:
      'Purchase a stage bundle or a course unit to unlock all video lessons inside.',
    statStudents: '800',
    statRating: '4.9',
  },
  k12: {
    modulesTitle: 'Course units',
    modulesSubtitle:
      'Purchase a stage bundle or a course unit to unlock all video lessons inside.',
    statStudents: '800',
    statRating: '4.9',
  },
}

/** Superseded hero subtitles still stored in platform_settings — map to current default on read. */
const LEGACY_MODULES_SUBTITLES = [
  'Purchase a course unit (L3) to unlock all video lessons inside. Open a unit to see individual lessons (L4).',
  'Purchase a course unit to unlock all video lessons inside. Open a unit to see individual lessons.',
  'Purchase a classroom course unit to unlock all video lessons. Open a unit to see individual lessons.',
]

function normalizeModulesSubtitle(subtitle, defaults) {
  const text = String(subtitle ?? '').trim()
  if (!text || LEGACY_MODULES_SUBTITLES.includes(text)) {
    return defaults.modulesSubtitle
  }
  return text
}

/** @deprecated Use COURSES_LINE_HERO_KEYS.ioai */
export const COURSES_IOAI_HERO_SETTING_KEY = COURSES_LINE_HERO_KEYS.ioai

/** @deprecated Use DEFAULT_COURSES_LINE_HERO.ioai */
export const DEFAULT_COURSES_IOAI_MODULES_HERO = DEFAULT_COURSES_LINE_HERO.ioai

export function coursesLineHeroKey(lineId) {
  return COURSES_LINE_HERO_KEYS[lineId] || null
}

export function defaultCoursesLineHero(lineId) {
  return DEFAULT_COURSES_LINE_HERO[lineId]
    ? { ...DEFAULT_COURSES_LINE_HERO[lineId] }
    : { ...DEFAULT_COURSES_LINE_HERO.general }
}

export function mergeCoursesLineHero(lineId, value) {
  const defaults = defaultCoursesLineHero(lineId)
  if (!value || typeof value !== 'object') {
    return { ...defaults }
  }
  return {
    modulesTitle: String(value.modulesTitle ?? defaults.modulesTitle).trim(),
    modulesSubtitle: normalizeModulesSubtitle(value.modulesSubtitle, defaults),
    statStudents: String(value.statStudents ?? defaults.statStudents).trim(),
    statRating: String(value.statRating ?? defaults.statRating).trim(),
  }
}

/** @deprecated Use mergeCoursesLineHero('ioai', value) */
export function mergeCoursesIoaiHero(value) {
  return mergeCoursesLineHero('ioai', value)
}

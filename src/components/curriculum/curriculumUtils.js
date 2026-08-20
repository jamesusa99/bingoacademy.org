/** @typedef {{ id: string, title: string, cloudflareVideoId?: string | null, catalogSlug?: string }} CurriculumLesson */
/** @typedef {{ id: string, title: string, lessons: CurriculumLesson[] }} CurriculumModule */
/** @typedef {{ id: string, title: string, modules: CurriculumModule[] }} CurriculumTheme */
/** @typedef {{ id: string, title: string, emoji?: string, themes: CurriculumTheme[] }} CurriculumLevel */

/** @typedef {{ levelId: string, themeId: string, moduleId: string, levelTitle: string, themeTitle: string, moduleTitle: string, levelEmoji?: string, catalogSlug?: string | null, priceCents?: number | null, currency?: string, lessons: CurriculumLesson[] }} SelectedModule */

export function moduleSelectionKey(levelId, themeId, moduleId) {
  return `${levelId}:${themeId}:${moduleId}`
}

/** @param {import('./curriculumUtils.js').CurriculumModule & { catalogSlug?: string | null, priceCents?: number | null, currency?: string }} mod */
export function toSelectedModule(level, theme, mod) {
  if (!level || !theme || !mod) return null
  return {
    levelId: level.id,
    themeId: theme.id,
    moduleId: mod.id,
    levelTitle: level.title,
    themeTitle: theme.title,
    moduleTitle: mod.title,
    levelEmoji: level.emoji,
    catalogSlug: mod.catalogSlug || null,
    priceCents: mod.priceCents ?? null,
    currency: mod.currency || 'usd',
    lessons: mod.lessons || [],
  }
}

/** @param {CurriculumLevel[]} curriculum @returns {SelectedModule | null} */
export function getDefaultSelectedModule(curriculum) {
  const level = curriculum?.[0]
  const theme = level?.themes?.[0]
  const mod = theme?.modules?.[0]
  return toSelectedModule(level, theme, mod)
}

/** @param {SelectedModule | null} selected @param {string} key */
export function isModuleSelected(selected, key) {
  if (!selected) return false
  return moduleSelectionKey(selected.levelId, selected.themeId, selected.moduleId) === key
}

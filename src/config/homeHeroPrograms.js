import { PROGRAMS } from './programs'

export const HOME_HERO_PROGRAMS_KEY = 'home_hero_programs'

export function defaultHomeHeroPrograms() {
  return Object.fromEntries(
    PROGRAMS.map((program) => [program.slug, { coverUrl: '', visible: true }])
  )
}

export function mergeHomeHeroPrograms(value) {
  const defaults = defaultHomeHeroPrograms()
  if (!value || typeof value !== 'object' || Array.isArray(value)) return defaults

  const next = { ...defaults }
  for (const program of PROGRAMS) {
    const row = value[program.slug]
    if (!row || typeof row !== 'object') continue
    next[program.slug] = {
      coverUrl: typeof row.coverUrl === 'string' ? row.coverUrl.trim() : '',
      visible: typeof row.visible === 'boolean' ? row.visible : true,
    }
  }
  return next
}

export function isHomeHeroProgramVisible(heroPrograms, slug) {
  const row = heroPrograms?.[slug]
  if (row && typeof row.visible === 'boolean') return row.visible
  return true
}

/** Filter storefront programs by hero admin visibility toggles. */
export function visibleHomeHeroPrograms(programs, heroPrograms) {
  return (programs || []).filter((program) => isHomeHeroProgramVisible(heroPrograms, program.slug))
}

export function coverUrlForHomeHeroProgram(heroPrograms, slug) {
  const url = heroPrograms?.[slug]?.coverUrl
  return typeof url === 'string' && url.trim() ? url.trim() : ''
}

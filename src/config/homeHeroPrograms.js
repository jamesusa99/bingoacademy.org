import { PROGRAMS } from './programs'

export const HOME_HERO_PROGRAMS_KEY = 'home_hero_programs'

export function defaultHomeHeroPrograms() {
  return Object.fromEntries(PROGRAMS.map((program) => [program.slug, { coverUrl: '' }]))
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
    }
  }
  return next
}

export function coverUrlForHomeHeroProgram(heroPrograms, slug) {
  const url = heroPrograms?.[slug]?.coverUrl
  return typeof url === 'string' && url.trim() ? url.trim() : ''
}

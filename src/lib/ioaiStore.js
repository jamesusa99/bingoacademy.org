import { authFetch } from './checkout'

export const IOAI_FULL_BUNDLE_SLUG = 'ioai-competition-system'

export function buildModuleCatalogSlug(levelSlug, themeSlug, moduleSlug) {
  const slugifyPart = (value) => {
    if (!value || typeof value !== 'string') return null
    const s = value
      .trim()
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
    return s || null
  }
  const level = slugifyPart(levelSlug)
  const theme = slugifyPart(themeSlug)
  const module = slugifyPart(moduleSlug)
  if (!level || !theme || !module) return null
  return `ioai-${level}-${theme}-${module}`
}

export function formatIoaiPrice(cents, currency = 'USD') {
  if (cents == null) return '—'
  const dollars = cents / 100
  const text =
    dollars >= 1000
      ? dollars.toLocaleString('en-US', { maximumFractionDigits: 0 })
      : dollars % 1 === 0
        ? String(dollars)
        : dollars.toFixed(2)
  return currency.toUpperCase() === 'USD' ? `$${text}` : `${text} ${currency}`
}

export async function fetchIoaiStore() {
  const res = await fetch('/api/ioai/store')
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body.error || `Failed to load IOAI store (${res.status})`)
  return body
}

export async function fetchIoaiModule(catalogSlug) {
  const res = await fetch(`/api/ioai/modules/${encodeURIComponent(catalogSlug)}`)
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body.error || `Module not found (${res.status})`)
  return body.module
}

export async function fetchMyIoaiAccess() {
  return authFetch('/api/me/ioai-access')
}

/** Build lessonId → module catalogSlug from store levels */
export function buildLessonModuleMap(levels) {
  const map = new Map()
  for (const level of levels || []) {
    for (const theme of level.themes || []) {
      for (const mod of theme.modules || []) {
        if (!mod.catalogSlug) continue
        for (const lesson of mod.lessons || []) {
          map.set(lesson.id, mod.catalogSlug)
        }
      }
    }
  }
  return map
}

export function findLevel(levels, levelSlug) {
  return (levels || []).find((l) => l.id === levelSlug) || null
}

export function findModule(levels, catalogSlug) {
  for (const level of levels || []) {
    for (const theme of level.themes || []) {
      const mod = theme.modules.find((m) => m.catalogSlug === catalogSlug)
      if (mod) {
        return { level, theme, module: mod }
      }
    }
  }
  return null
}

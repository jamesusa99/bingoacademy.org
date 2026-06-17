import { authFetch } from './checkout'
import { COURSE_STATUS } from '../config/coursesCatalog'

export const IOAI_FULL_BUNDLE_SLUG = 'ioai-competition-system'

/** Canonical courses_catalog slug used in /courses/detail/:id routes */
export function resolveLessonCatalogSlug(lesson) {
  if (!lesson) return ''
  return (
    lesson.catalogSlug ||
    lesson.catalog_slug ||
    lesson.slug ||
    lesson.id ||
    ''
  )
    .trim()
}

function registerLessonModuleKeys(map, lesson, moduleCatalogSlug) {
  const primary = resolveLessonCatalogSlug(lesson)
  if (!primary || !moduleCatalogSlug) return
  map.set(primary, moduleCatalogSlug)
  const legacy = (lesson.slug || lesson.id || '').trim()
  if (legacy && legacy !== primary) map.set(legacy, moduleCatalogSlug)
}

/** e.g. ioai-…-vector-mastery-quest-c1 → ioai-…-vector-mastery-quest */
export function inferModuleCatalogSlugFromLessonSlug(lessonSlug) {
  if (!lessonSlug || typeof lessonSlug !== 'string') return null
  const match = lessonSlug.match(/^(ioai-.+)-(l\d+|c\d+)$/i)
  return match ? match[1] : null
}

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

export function isIoaiModuleComingSoon(modOrStatus) {
  const status = typeof modOrStatus === 'string' ? modOrStatus : modOrStatus?.status
  return status === COURSE_STATUS.COMING_SOON
}

export function isIoaiModulePurchasable(modOrStatus) {
  const status = typeof modOrStatus === 'string' ? modOrStatus : modOrStatus?.status
  return status === COURSE_STATUS.LIVE
}

/** Fallback store module shape when detail API loaded before store tree. */
export function mapDetailToStoreModule(detail) {
  if (!detail?.catalog_slug) return null
  if ([COURSE_STATUS.OFFLINE, 'hidden', 'draft'].includes(detail.status)) return null

  const comingSoon = isIoaiModuleComingSoon(detail)
  const lessons = [...(detail.lessons || [])]
    .filter((l) => l.status !== 'hidden' && l.status !== 'draft')
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((lesson) => {
      const catalogSlug = resolveLessonCatalogSlug(lesson)
      return {
        id: catalogSlug,
        catalogSlug,
        slug: lesson.slug,
        title: lesson.title,
        intro: lesson.intro || '',
        trialEnabled: Boolean(lesson.trial_enabled),
        sortOrder: lesson.sort_order ?? 0,
        cloudflareVideoId: lesson.cloudflare_video_id || null,
      }
    })

  return {
    id: detail.slug,
    catalogSlug: detail.catalog_slug,
    title: detail.title,
    status: detail.status || COURSE_STATUS.LIVE,
    coverUrl: detail.cover_url || null,
    summary: detail.summary || '',
    learningObjectives: detail.learning_objectives || '',
    learningOutcomes: detail.learning_outcomes || '',
    introHtml: detail.summary || '',
    priceCents: comingSoon ? null : detail.price_cents ?? null,
    compareAtCents: comingSoon ? null : detail.compare_at_cents ?? null,
    currency: detail.currency || 'usd',
    marketingTags: detail.marketing_tags || [],
    lessonCount: lessons.length,
    lessons,
  }
}

export function mapDetailToFoundContext(detail) {
  const theme = detail?.theme
  const level = theme?.level
  if (!theme) return null
  return {
    level: {
      id: level?.slug || '',
      title: level?.title || '',
      emoji: level?.emoji || '🏆',
    },
    theme: {
      categoryLabel: theme.category_label || theme.title || '',
      title: theme.title || '',
    },
  }
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
  const text = await res.text()
  let body = {}
  try {
    body = text ? JSON.parse(text) : {}
  } catch {
    if (text.trimStart().startsWith('<!')) {
      throw new Error('IOAI store API unavailable (received HTML instead of JSON). Deploy /api/ioai routes on the server.')
    }
    throw new Error(`Failed to load IOAI store (${res.status})`)
  }
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
        const moduleCatalogSlug =
          mod.catalogSlug || buildModuleCatalogSlug(level.id, theme.id, mod.id)
        if (!moduleCatalogSlug) continue
        for (const lesson of mod.lessons || []) {
          registerLessonModuleKeys(map, lesson, moduleCatalogSlug)
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

/** Flat list of L3 purchasable modules for course catalog views */
export function flattenIoaiModules(levels) {
  /** @type {Array<object>} */
  const modules = []
  for (const level of levels || []) {
    for (const theme of level.themes || []) {
      for (const mod of theme.modules || []) {
        if (!mod.catalogSlug) continue
        modules.push({
          catalogSlug: mod.catalogSlug,
          title: mod.title,
          status: mod.status || COURSE_STATUS.LIVE,
          coverUrl: mod.coverUrl || null,
          introHtml: mod.introHtml || '',
          priceCents: mod.priceCents,
          extrasPriceCents: mod.extrasPriceCents ?? null,
          totalPriceCents: mod.totalPriceCents ?? mod.priceCents,
          compareAtCents: mod.compareAtCents,
          currency: mod.currency || 'usd',
          lessonCount: mod.lessonCount ?? mod.lessons?.length ?? 0,
          levelId: level.id,
          levelTitle: level.title,
          levelEmoji: level.emoji || '🏆',
          themeTitle: theme.categoryLabel || theme.title,
          marketingTags: mod.marketingTags || [],
        })
      }
    }
  }
  return modules
}

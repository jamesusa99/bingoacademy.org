import { parsePriceStringToCents } from './priceUtils.mjs'

export const IOAI_FULL_BUNDLE_SLUG = 'ioai-competition-system'

/** L4 preview length when L3 unit is not purchased (seconds). */
export const IOAI_MODULE_PREVIEW_SECONDS = 30

export function sumCatalogRowsPriceCents(rows) {
  return (rows || []).reduce((sum, row) => {
    const cents =
      row.price_cents != null && row.price_cents > 0 ? row.price_cents : parsePriceStringToCents(row.price)
    return sum + (cents || 0)
  }, 0)
}

const LAB_MATERIAL_SELECT =
  'slug, name, sub, price, price_cents, currency, status, delivery_type, description, thumbnail_url, sort_order, module_id, lesson_id'

/** Lab/material catalog rows bound to an L3 module (module_id or legacy lesson_id) */
export async function listLabMaterialsForModule(admin, moduleId) {
  if (!admin || !moduleId) return []

  const { data: direct, error: directErr } = await admin
    .from('courses_catalog')
    .select(LAB_MATERIAL_SELECT)
    .eq('module_id', moduleId)
    .eq('status', 'live')
    .order('sort_order')

  if (directErr) return []

  const { data: lessons } = await admin.from('lessons').select('id').eq('module_id', moduleId)
  const lessonIds = (lessons || []).map((l) => l.id)

  let legacy = []
  if (lessonIds.length) {
    const { data: legacyRows } = await admin
      .from('courses_catalog')
      .select(LAB_MATERIAL_SELECT)
      .in('lesson_id', lessonIds)
      .is('module_id', null)
      .eq('status', 'live')
      .order('sort_order')
    legacy = legacyRows || []
  }

  const seen = new Set()
  const merged = []
  for (const row of [...(direct || []), ...legacy]) {
    if (seen.has(row.slug)) continue
    seen.add(row.slug)
    merged.push(row)
  }
  return merged
}

export async function sumLabMaterialsPriceCents(admin, moduleId) {
  const rows = await listLabMaterialsForModule(admin, moduleId)
  return sumCatalogRowsPriceCents(rows)
}

/** L3 base price only — lab/material add-ons are optional at checkout */
export async function resolveModuleTotalPriceCents(admin, mod) {
  if (!mod) return 0
  return mod.price_cents ?? 0
}

export function parseAddonSlugs(raw) {
  if (!raw) return []
  if (Array.isArray(raw)) return [...new Set(raw.map((s) => String(s).trim()).filter(Boolean))]
  if (typeof raw === 'string') {
    const trimmed = raw.trim()
    if (!trimmed) return []
    try {
      const parsed = JSON.parse(trimmed)
      if (Array.isArray(parsed)) return parseAddonSlugs(parsed)
    } catch {
      /* comma-separated fallback */
    }
    return [...new Set(trimmed.split(',').map((s) => s.trim()).filter(Boolean))]
  }
  return []
}

/** Validate optional lab/material slugs bound to an L3 module */
export async function validateModuleAddonSlugs(admin, moduleId, addonSlugs = []) {
  const slugs = parseAddonSlugs(addonSlugs)
  if (!slugs.length) return { ok: true, slugs: [] }
  if (!admin || !moduleId) return { ok: false, error: 'Module not found' }

  const available = await listLabMaterialsForModule(admin, moduleId)
  const bySlug = new Map(available.map((row) => [row.slug, row]))
  const validated = []

  for (const slug of slugs) {
    if (!bySlug.has(slug)) {
      return { ok: false, error: `Add-on not available for this unit: ${slug}` }
    }
    validated.push(slug)
  }

  return { ok: true, slugs: validated }
}

export async function resolveSelectedAddonsPriceCents(admin, moduleId, addonSlugs = []) {
  const validation = await validateModuleAddonSlugs(admin, moduleId, addonSlugs)
  if (!validation.ok) return 0

  const available = await listLabMaterialsForModule(admin, moduleId)
  const bySlug = new Map(available.map((row) => [row.slug, row]))
  let sum = 0
  for (const slug of validation.slugs) {
    const row = bySlug.get(slug)
    const cents =
      row?.price_cents != null && row.price_cents > 0 ? row.price_cents : parsePriceStringToCents(row?.price)
    sum += cents || 0
  }
  return sum
}

/** Module checkout total = base + selected optional add-ons */
export async function resolveModuleCheckoutPriceCents(admin, mod, addonSlugs = []) {
  if (!mod) return 0
  const base = mod.price_cents ?? 0
  const extras = mod.id ? await resolveSelectedAddonsPriceCents(admin, mod.id, addonSlugs) : 0
  return base + extras
}

/** Batch extras price by module id for store tree */
export async function mapLabExtrasByModuleId(admin, moduleIds) {
  /** @type {Map<string, number>} */
  const map = new Map()
  if (!admin || !moduleIds?.length) return map

  for (const id of moduleIds) {
    map.set(id, 0)
  }

  const { data: direct } = await admin
    .from('courses_catalog')
    .select('module_id, price_cents, price')
    .in('module_id', moduleIds)
    .eq('status', 'live')

  for (const row of direct || []) {
    if (!row.module_id) continue
    const cents =
      row.price_cents != null && row.price_cents > 0 ? row.price_cents : parsePriceStringToCents(row.price)
    map.set(row.module_id, (map.get(row.module_id) || 0) + (cents || 0))
  }

  const { data: lessons } = await admin.from('lessons').select('id, module_id').in('module_id', moduleIds)
  const lessonToModule = new Map((lessons || []).map((l) => [l.id, l.module_id]))
  const lessonIds = [...lessonToModule.keys()]

  if (lessonIds.length) {
    const { data: legacy } = await admin
      .from('courses_catalog')
      .select('lesson_id, price_cents, price')
      .in('lesson_id', lessonIds)
      .is('module_id', null)
      .eq('status', 'live')

    for (const row of legacy || []) {
      const moduleId = lessonToModule.get(row.lesson_id)
      if (!moduleId) continue
      const cents =
        row.price_cents != null && row.price_cents > 0 ? row.price_cents : parsePriceStringToCents(row.price)
      map.set(moduleId, (map.get(moduleId) || 0) + (cents || 0))
    }
  }

  return map
}

export function mapLabMaterialRow(row) {
  if (!row) return null
  return {
    slug: row.slug,
    name: row.name,
    sub: row.sub,
    price: row.price || null,
    priceCents: row.price_cents ?? null,
    currency: row.currency || 'usd',
    deliveryType: row.delivery_type || null,
    description: row.description || '',
    thumbnailUrl: row.thumbnail_url || null,
  }
}

export function buildModuleCatalogSlug(levelSlug, themeSlug, moduleSlug) {
  if (!levelSlug || !themeSlug || !moduleSlug) return null
  return `ioai-${levelSlug}-${themeSlug}-${moduleSlug}`
}

export function isModuleCatalogSlug(slug) {
  return typeof slug === 'string' && slug.startsWith('ioai-') && !slug.includes('competition-system')
}

export async function getModuleByCatalogSlug(admin, catalogSlug) {
  if (!admin || !catalogSlug?.trim()) return null
  const { data, error } = await admin
    .from('modules')
    .select(
      `
      id, slug, title, catalog_slug, price_cents, compare_at_cents, currency,
      status, cover_url, intro_html, marketing_tags, summary,
      theme:themes (
        id, slug, title, status, hidden,
        level:course_levels ( id, slug, title, product_line, status )
      )
    `
    )
    .eq('catalog_slug', catalogSlug.trim())
    .maybeSingle()
  if (error || !data) return null
  if (data.theme?.level?.product_line !== 'ioai') return null
  return data
}

export async function getBundleBySlug(admin, slug) {
  if (!admin || !slug?.trim()) return null
  const { data, error } = await admin
    .from('ioai_bundles')
    .select('*')
    .eq('slug', slug.trim())
    .maybeSingle()
  if (error || !data) return null
  return data
}

export async function listBundleModuleCatalogSlugs(admin, bundleSlug) {
  const bundle = await getBundleBySlug(admin, bundleSlug)
  if (!bundle) return []

  if (bundle.bundle_type === 'unit' && bundle.module_id) {
    const { data } = await admin.from('modules').select('catalog_slug').eq('id', bundle.module_id).maybeSingle()
    return data?.catalog_slug ? [data.catalog_slug] : []
  }

  const { data: links, error } = await admin
    .from('ioai_bundle_modules')
    .select('module:modules ( catalog_slug )')
    .eq('bundle_id', bundle.id)

  if (error) return []
  return (links || []).map((r) => r.module?.catalog_slug).filter(Boolean)
}

export async function listLessonSlugsForModule(admin, moduleCatalogSlug) {
  const mod = await getModuleByCatalogSlug(admin, moduleCatalogSlug)
  if (!mod) return []
  const { data, error } = await admin.from('lessons').select('slug').eq('module_id', mod.id)
  if (error) return []
  return (data || []).map((r) => r.slug)
}

export async function resolveModuleSlugForLesson(admin, lessonSlug) {
  if (!admin || !lessonSlug?.trim()) return null

  const { data: lesson } = await admin
    .from('lessons')
    .select('module_id, catalog_slug, slug')
    .or(`slug.eq.${lessonSlug.trim()},catalog_slug.eq.${lessonSlug.trim()}`)
    .maybeSingle()

  if (!lesson?.module_id) return null

  const { data: mod } = await admin.from('modules').select('catalog_slug').eq('id', lesson.module_id).maybeSingle()
  return mod?.catalog_slug || null
}

/** Expand enrollments + masterclass into module catalog slugs the user can access */
export async function resolveUnlockedModuleSlugs(admin, userId, enrolledSlugs = []) {
  if (!admin || !userId) return new Set()

  const unlocked = new Set()
  const slugs = [...new Set(enrolledSlugs || [])]

  for (const slug of slugs) {
    if (slug === IOAI_FULL_BUNDLE_SLUG || slug === 'ioai-track') {
      const fullModules = await listBundleModuleCatalogSlugs(admin, IOAI_FULL_BUNDLE_SLUG)
      fullModules.forEach((s) => unlocked.add(s))
      continue
    }

    const bundleModules = await listBundleModuleCatalogSlugs(admin, slug)
    if (bundleModules.length) {
      bundleModules.forEach((s) => unlocked.add(s))
      continue
    }

    const mod = await getModuleByCatalogSlug(admin, slug)
    if (mod?.catalog_slug) {
      unlocked.add(mod.catalog_slug)
      continue
    }

    // Legacy lesson enrollment
    const moduleSlug = await resolveModuleSlugForLesson(admin, slug)
    if (moduleSlug) unlocked.add(moduleSlug)
  }

  const { data: access } = await admin
    .from('user_course_access')
    .select('access_scope')
    .eq('user_id', userId)
    .eq('access_scope', 'ioai_masterclass')
    .maybeSingle()

  if (access) {
    const fullModules = await listBundleModuleCatalogSlugs(admin, IOAI_FULL_BUNDLE_SLUG)
    fullModules.forEach((s) => unlocked.add(s))
  }

  return unlocked
}

export async function userHasModuleAccess(admin, userId, moduleCatalogSlug, { enrolledSlugs } = {}) {
  if (!moduleCatalogSlug?.trim()) return false
  const unlocked = await resolveUnlockedModuleSlugs(admin, userId, enrolledSlugs)
  return unlocked.has(moduleCatalogSlug.trim())
}

export function isPublicIoaiModuleStatus(status) {
  return status === 'live' || status === 'coming-soon'
}

/** IOAI L4 with configured video — preview allowed before L3 purchase (client caps playback). */
export async function userCanPreviewLesson(admin, lessonSlug) {
  if (!admin || !lessonSlug?.trim()) return false

  const { data: lesson } = await admin
    .from('lessons')
    .select(
      `
      status, cloudflare_video_id,
      module:modules (
        status,
        theme:themes (
          level:course_levels ( product_line )
        )
      )
    `
    )
    .or(`slug.eq.${lessonSlug.trim()},catalog_slug.eq.${lessonSlug.trim()}`)
    .maybeSingle()

  if (!lesson || lesson.status === 'hidden' || lesson.status === 'draft') return false
  if (!lesson.cloudflare_video_id?.trim()) return false
  if (!isPublicIoaiModuleStatus(lesson.module?.status)) return false
  if (lesson.module?.theme?.level?.product_line !== 'ioai') return false
  return true
}

export async function userHasLessonAccess(admin, userId, lessonSlug, { enrolledSlugs } = {}) {
  if (!lessonSlug?.trim()) return false

  const slug = lessonSlug.trim()

  const { data: initialLesson } = await admin
    .from('lessons')
    .select('slug, catalog_slug, trial_enabled, module_id, status')
    .or(`slug.eq.${slug},catalog_slug.eq.${slug}`)
    .maybeSingle()

  let lesson = initialLesson

  if (!lesson) {
    const { data: catalogRow } = await admin
      .from('courses_catalog')
      .select('lesson_id')
      .eq('slug', slug)
      .maybeSingle()

    if (catalogRow?.lesson_id) {
      const { data: linkedLesson } = await admin
        .from('lessons')
        .select('slug, catalog_slug, trial_enabled, module_id, status')
        .eq('id', catalogRow.lesson_id)
        .maybeSingle()
      lesson = linkedLesson
    }
  }

  if (!lesson || lesson.status === 'hidden' || lesson.status === 'draft') return false
  if (lesson.trial_enabled) return true

  const { data: mod } = lesson.module_id
    ? await admin.from('modules').select('catalog_slug, status').eq('id', lesson.module_id).maybeSingle()
    : { data: null }

  if (!mod?.catalog_slug) return false
  if (mod.status === 'hidden' || mod.status === 'draft') return false

  return userHasModuleAccess(admin, userId, mod.catalog_slug, { enrolledSlugs })
}

export async function grantModuleEntitlement(admin, { userId, moduleCatalogSlug, addonSlugs = [], orderId = null }) {
  if (!admin || !userId || !moduleCatalogSlug?.trim()) return { granted: [] }

  const mod = await getModuleByCatalogSlug(admin, moduleCatalogSlug.trim())
  if (!mod) return { granted: [], error: 'Module not found' }
  if (mod.status !== 'live') return { granted: [], error: 'Module is not available for purchase' }

  const validation = await validateModuleAddonSlugs(admin, mod.id, addonSlugs)
  if (!validation.ok) return { granted: [], error: validation.error }

  const granted = []
  const rows = [
    mod.catalog_slug,
    ...validation.slugs,
  ]

  for (const slug of rows) {
    const { error } = await admin.from('course_enrollments').upsert(
      {
        user_id: userId,
        course_slug: slug,
        source: 'stripe',
        order_id: orderId,
      },
      { onConflict: 'user_id,course_slug' }
    )
    if (!error) granted.push(slug)
  }

  if (!granted.includes(mod.catalog_slug)) {
    return { granted: [], error: 'Failed to grant module access' }
  }

  return { granted: [...new Set(granted)] }
}

export async function grantBundleEntitlement(admin, { userId, bundleSlug, orderId = null }) {
  if (!admin || !userId || !bundleSlug?.trim()) return { granted: [] }

  const bundle = await getBundleBySlug(admin, bundleSlug.trim())
  if (!bundle) return { granted: [], error: 'Bundle not found' }
  if (bundle.status !== 'live') return { granted: [], error: 'Bundle is not available for purchase' }

  const granted = []

  const { error: bundleErr } = await admin.from('course_enrollments').upsert(
    {
      user_id: userId,
      course_slug: bundle.slug,
      source: 'stripe',
      order_id: orderId,
    },
    { onConflict: 'user_id,course_slug' }
  )
  if (bundleErr) return { granted: [], error: bundleErr.message }
  granted.push(bundle.slug)

  const moduleSlugs = await listBundleModuleCatalogSlugs(admin, bundle.slug)
  for (const moduleSlug of moduleSlugs) {
    const { error } = await admin.from('course_enrollments').upsert(
      {
        user_id: userId,
        course_slug: moduleSlug,
        source: 'stripe',
        order_id: orderId,
      },
      { onConflict: 'user_id,course_slug' }
    )
    if (!error) granted.push(moduleSlug)
  }

  if (bundle.bundle_type === 'full' || bundle.slug === IOAI_FULL_BUNDLE_SLUG) {
    await admin.from('user_course_access').upsert(
      {
        user_id: userId,
        access_scope: 'ioai_masterclass',
        source: 'stripe',
        granted_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,access_scope' }
    )
  }

  return { granted: [...new Set(granted)] }
}

export async function resolveUnlockedLessonSlugs(admin, userId, enrolledSlugs = []) {
  const moduleSlugs = await resolveUnlockedModuleSlugs(admin, userId, enrolledSlugs)
  if (!moduleSlugs.size) return []

  const { data: modules } = await admin
    .from('modules')
    .select('id, catalog_slug')
    .in('catalog_slug', [...moduleSlugs])

  const moduleIds = (modules || []).map((m) => m.id)
  if (!moduleIds.length) return []

  const { data: lessons } = await admin
    .from('lessons')
    .select('slug, catalog_slug, trial_enabled')
    .in('module_id', moduleIds)

  const slugs = new Set()
  for (const lesson of lessons || []) {
    if (lesson.slug) slugs.add(lesson.slug)
    if (lesson.catalog_slug) slugs.add(lesson.catalog_slug)
  }

  const { data: trials } = await admin.from('lessons').select('slug').eq('trial_enabled', true)
  for (const row of trials || []) {
    if (row.slug) slugs.add(row.slug)
  }

  return [...slugs]
}

export function isModulePurchasable(mod, totalPriceCents = null) {
  if (!mod) return false
  if (mod.status !== 'live') return false
  if (mod.theme?.hidden || mod.theme?.status === 'hidden') return false
  if (mod.theme?.level?.status === 'hidden') return false
  const cents = totalPriceCents != null ? totalPriceCents : mod.price_cents ?? 0
  return cents > 0
}

export function isBundlePurchasable(bundle) {
  if (!bundle) return false
  if (bundle.status !== 'live') return false
  if (bundle.promo_starts_at && new Date(bundle.promo_starts_at) > new Date()) return false
  if (bundle.promo_ends_at && new Date(bundle.promo_ends_at) < new Date()) return false
  return (bundle.price_cents ?? 0) > 0
}

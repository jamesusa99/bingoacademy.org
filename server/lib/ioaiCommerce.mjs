/** IOAI L3 module + bundle commerce (server) */

export const IOAI_FULL_BUNDLE_SLUG = 'ioai-competition-system'

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

export async function userHasLessonAccess(admin, userId, lessonSlug, { enrolledSlugs } = {}) {
  if (!lessonSlug?.trim()) return false

  const { data: lesson } = await admin
    .from('lessons')
    .select('slug, catalog_slug, trial_enabled, module_id, status')
    .or(`slug.eq.${lessonSlug.trim()},catalog_slug.eq.${lessonSlug.trim()}`)
    .maybeSingle()

  if (!lesson || lesson.status === 'hidden' || lesson.status === 'draft') return false
  if (lesson.trial_enabled) return true

  const { data: mod } = lesson.module_id
    ? await admin.from('modules').select('catalog_slug, status').eq('id', lesson.module_id).maybeSingle()
    : { data: null }

  if (!mod?.catalog_slug) return false
  if (mod.status === 'hidden' || mod.status === 'draft') return false

  return userHasModuleAccess(admin, userId, mod.catalog_slug, { enrolledSlugs })
}

export async function grantModuleEntitlement(admin, { userId, moduleCatalogSlug, orderId = null }) {
  if (!admin || !userId || !moduleCatalogSlug?.trim()) return { granted: [] }

  const mod = await getModuleByCatalogSlug(admin, moduleCatalogSlug.trim())
  if (!mod) return { granted: [], error: 'Module not found' }
  if (mod.status !== 'live') return { granted: [], error: 'Module is not available for purchase' }

  const { error } = await admin.from('course_enrollments').upsert(
    {
      user_id: userId,
      course_slug: mod.catalog_slug,
      source: 'stripe',
      order_id: orderId,
    },
    { onConflict: 'user_id,course_slug' }
  )

  if (error) return { granted: [], error: error.message }
  return { granted: [mod.catalog_slug] }
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
    .select('slug, trial_enabled')
    .in('module_id', moduleIds)

  const slugs = new Set()
  for (const lesson of lessons || []) {
    if (lesson.slug) slugs.add(lesson.slug)
  }

  const { data: trials } = await admin.from('lessons').select('slug').eq('trial_enabled', true)
  for (const row of trials || []) {
    if (row.slug) slugs.add(row.slug)
  }

  return [...slugs]
}

export function isModulePurchasable(mod) {
  if (!mod) return false
  if (mod.status !== 'live') return false
  if (mod.theme?.hidden || mod.theme?.status === 'hidden') return false
  if (mod.theme?.level?.status === 'hidden') return false
  return (mod.price_cents ?? 0) > 0
}

export function isBundlePurchasable(bundle) {
  if (!bundle) return false
  if (bundle.status !== 'live') return false
  if (bundle.promo_starts_at && new Date(bundle.promo_starts_at) > new Date()) return false
  if (bundle.promo_ends_at && new Date(bundle.promo_ends_at) < new Date()) return false
  return (bundle.price_cents ?? 0) > 0
}

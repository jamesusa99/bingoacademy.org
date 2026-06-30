import { buildStorefrontPackageDefs } from '../../src/config/programStagePackages.js'
import { isCurriculumLine } from '../../src/config/programCurriculum.js'
import { getBundleBySlug, isModulePurchasable } from './ioaiCommerce.mjs'

const MODULE_SELECT = `
  id, catalog_slug, title, price_cents, currency, status,
  theme:themes (
    level:course_levels ( slug, title, product_line, status )
  )
`

export const IOAI_STOREFRONT_PACKAGE_DEFS = buildStorefrontPackageDefs('ioai')

function getPackageDefs(productLine) {
  if (!isCurriculumLine(productLine)) return []
  return buildStorefrontPackageDefs(productLine)
}

function findPackageDef(productLine, slug) {
  return getPackageDefs(productLine).find((item) => item.slug === slug) || null
}

function findPackageDefBySlug(slug) {
  for (const line of ['ioai', 'general', 'k12']) {
    const def = findPackageDef(line, slug)
    if (def) return def
  }
  return null
}

export async function listLiveModulesForLevelSlug(admin, productLine, levelSlug) {
  if (!admin || !isCurriculumLine(productLine)) return []

  let themeQuery = admin
    .from('themes')
    .select('id, level:course_levels!inner ( slug, title, product_line, status )')
    .eq('status', 'live')
    .eq('hidden', false)
    .eq('level.product_line', productLine)
    .eq('level.status', 'live')

  if (levelSlug && levelSlug !== 'all') {
    themeQuery = themeQuery.eq('level.slug', levelSlug)
  }

  const { data: themes, error: themeErr } = await themeQuery
  if (themeErr || !themes?.length) return []

  const themeIds = themes.map((theme) => theme.id)
  const { data: modules, error: modErr } = await admin
    .from('modules')
    .select(MODULE_SELECT)
    .in('theme_id', themeIds)
    .eq('status', 'live')
    .not('catalog_slug', 'is', null)
    .order('sort_order')

  if (modErr) return []

  return (modules || []).filter((mod) => {
    if (!mod.catalog_slug) return false
    if (productLine === 'ioai') {
      return isModulePurchasable(mod, mod.price_cents ?? 0)
    }
    return true
  })
}

export function sumModuleListPriceCents(modules) {
  return (modules || []).reduce((sum, mod) => sum + (mod.price_cents || 0), 0)
}

async function countLessonsForModuleIds(admin, moduleIds) {
  if (!admin || !moduleIds?.length) return 0
  const { count, error } = await admin
    .from('lessons')
    .select('id', { count: 'exact', head: true })
    .in('module_id', moduleIds)
    .neq('status', 'hidden')
    .neq('status', 'draft')
  if (error) return 0
  return count || 0
}

async function listBundleModuleLinks(admin, bundleId) {
  const { data, error } = await admin
    .from('ioai_bundle_modules')
    .select('module:modules ( id, catalog_slug, title, price_cents )')
    .eq('bundle_id', bundleId)
    .order('sort_order')
  if (error) return []
  return (data || []).map((row) => row.module).filter(Boolean)
}

export async function syncCourseBundleModuleLinks(admin, productLine, bundleId, levelSlug) {
  const modules = await listLiveModulesForLevelSlug(admin, productLine, levelSlug)
  await admin.from('ioai_bundle_modules').delete().eq('bundle_id', bundleId)
  if (!modules.length) return modules

  const links = modules.map((mod, sort_order) => ({
    bundle_id: bundleId,
    module_id: mod.id,
    sort_order,
  }))
  const { error } = await admin.from('ioai_bundle_modules').insert(links)
  if (error) throw error

  const moduleIds = modules.map((mod) => mod.id).filter(Boolean)
  const lessonCount = await countLessonsForModuleIds(admin, moduleIds)
  await refreshStaleBundleIntroIfNeeded(admin, bundleId, modules.length, lessonCount)

  return modules
}

export async function ensureStorefrontCourseBundles(admin, productLine = 'ioai') {
  if (!admin || !isCurriculumLine(productLine)) return []

  const packageDefs = getPackageDefs(productLine)
  const results = []

  for (const def of packageDefs) {
    if (!def.slug) continue

    const existing = await getBundleBySlug(admin, def.slug)
    let bundleId = existing?.id

    if (!existing) {
      const modules = await listLiveModulesForLevelSlug(admin, productLine, def.levelSlug)
      const listPriceCents = sumModuleListPriceCents(modules)
      const { data, error } = await admin
        .from('ioai_bundles')
        .insert({
          slug: def.slug,
          bundle_type: def.bundleType,
          title: def.defaultTitle,
          intro_html: '',
          price_cents: listPriceCents > 0 ? listPriceCents : 0,
          compare_at_cents: listPriceCents > 0 ? listPriceCents : null,
          currency: 'usd',
          marketing_tags: [],
          status: 'live',
          sort_order: def.sortOrder ?? 0,
          updated_at: new Date().toISOString(),
        })
        .select('id')
        .single()
      if (error) throw error
      bundleId = data.id
    }

    const modules = await syncCourseBundleModuleLinks(admin, productLine, bundleId, def.levelSlug)
    results.push({ ...def, bundleId, moduleCount: modules.length })
  }

  return results
}

function computeDiscountPercent(priceCents, compareAtCents) {
  if (!priceCents || !compareAtCents || compareAtCents <= priceCents) return null
  return Math.round(((compareAtCents - priceCents) / compareAtCents) * 100)
}

function stripHtml(html) {
  if (!html) return ''
  return String(html)
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function isStaleAutoBundleIntro(introHtml) {
  const text = stripHtml(introHtml)
  if (!text) return true
  return (
    /^All IOAI modules\s*[—-]\s*\d+\s*units?/i.test(text) ||
    /^One purchase unlocks all \d+ course unit/i.test(text)
  )
}

export function buildBundleIntroHtml(moduleCount, lessonCount) {
  if (!moduleCount) return ''
  return `<p>One purchase unlocks all ${moduleCount} course unit${moduleCount === 1 ? '' : 's'} (${lessonCount} lesson${lessonCount === 1 ? '' : 's'}).</p>`
}

export async function refreshStaleBundleIntroIfNeeded(admin, bundleId, moduleCount, lessonCount) {
  if (!admin || !bundleId || !moduleCount) return false

  const { data: row } = await admin.from('ioai_bundles').select('intro_html').eq('id', bundleId).maybeSingle()
  if (!isStaleAutoBundleIntro(row?.intro_html)) return false

  const intro_html = buildBundleIntroHtml(moduleCount, lessonCount)
  const { error } = await admin.from('ioai_bundles').update({ intro_html, updated_at: new Date().toISOString() }).eq('id', bundleId)
  if (error) throw error
  return true
}

async function enrichCourseBundleRow(admin, row, def, productLine) {
  const linkedModules = row?.id ? await listBundleModuleLinks(admin, row.id) : []
  let modules = linkedModules
  if (!modules.length) {
    modules = await listLiveModulesForLevelSlug(admin, productLine, def.levelSlug)
  }

  const moduleSlugs = modules.map((mod) => mod.catalog_slug).filter(Boolean)
  const moduleIds = modules.map((mod) => mod.id).filter(Boolean)
  const listPriceCents = sumModuleListPriceCents(modules)
  const lessonCount = await countLessonsForModuleIds(admin, moduleIds)
  const priceCents = row?.price_cents ?? 0
  const compareAtCents = row?.compare_at_cents ?? (listPriceCents > priceCents ? listPriceCents : null)

  return {
    id: row?.id || null,
    productLine,
    packageId: def.packageId,
    slug: def.slug,
    title: row?.title || def.defaultTitle,
    emoji: def.emoji,
    bundleType: def.bundleType,
    levelSlug: def.levelSlug,
    priceCents,
    compareAtCents,
    listPriceCents,
    currency: row?.currency || 'usd',
    introHtml: row?.intro_html || '',
    shortDesc: stripHtml(row?.intro_html).slice(0, 160),
    marketingTags: row?.marketing_tags || [],
    coverUrl: row?.cover_url || null,
    coverUrlHome: row?.cover_url_home || null,
    status: row?.status || 'draft',
    sortOrder: row?.sort_order ?? def.sortOrder ?? 0,
    moduleCount: moduleSlugs.length,
    lessonCount,
    moduleSlugs,
    linkedModules: modules.map((mod) => ({
      catalogSlug: mod.catalog_slug,
      title: mod.title || mod.catalog_slug,
    })),
    isFullTrack: def.packageId === 'all',
    purchaseType: def.packageId === 'all' && productLine === 'ioai' ? 'ioai_track' : 'bundle',
    discountPercent: computeDiscountPercent(priceCents, compareAtCents),
  }
}

export async function fetchAdminCourseBundles(admin, productLine = 'ioai') {
  if (!isCurriculumLine(productLine)) return []

  await ensureStorefrontCourseBundles(admin, productLine)

  const bundles = []
  for (const def of getPackageDefs(productLine)) {
    if (!def.slug) continue
    const row = await getBundleBySlug(admin, def.slug)
    bundles.push(await enrichCourseBundleRow(admin, row, def, productLine))
  }
  return bundles
}

export async function fetchLiveCourseBundles(admin, productLine = 'ioai') {
  if (!isCurriculumLine(productLine)) return []

  const bundles = []
  for (const def of getPackageDefs(productLine)) {
    if (!def.slug) continue
    const row = await getBundleBySlug(admin, def.slug)
    if (!row || row.status !== 'live') continue
    if (!(row.price_cents > 0)) continue
    const enriched = await enrichCourseBundleRow(admin, row, def, productLine)
    if (!enriched.moduleCount) continue
    bundles.push(enriched)
  }
  return bundles
}

export async function updateAdminCourseBundle(admin, bundleId, body = {}, productLine = null) {
  const patch = {
    title: body.title,
    intro_html: body.intro_html ?? body.introHtml,
    price_cents: body.price_cents ?? body.priceCents,
    compare_at_cents: body.compare_at_cents ?? body.compareAtCents,
    currency: body.currency,
    marketing_tags: body.marketing_tags ?? body.marketingTags,
    status: body.status,
    sort_order: body.sort_order ?? body.sortOrder,
    updated_at: new Date().toISOString(),
  }
  if ('cover_url' in body || 'coverUrl' in body) {
    const raw = body.cover_url ?? body.coverUrl
    patch.cover_url = typeof raw === 'string' ? raw.trim() || null : raw ?? null
  }
  if ('cover_url_home' in body || 'coverUrlHome' in body) {
    const raw = body.cover_url_home ?? body.coverUrlHome
    patch.cover_url_home = typeof raw === 'string' ? raw.trim() || null : raw ?? null
  }
  Object.keys(patch).forEach((key) => {
    if (patch[key] === undefined) delete patch[key]
    if (patch[key] === null && key !== 'cover_url' && key !== 'cover_url_home') delete patch[key]
  })

  const { data, error } = await admin
    .from('ioai_bundles')
    .update(patch)
    .eq('id', bundleId)
    .in('bundle_type', ['full', 'combo'])
    .select('*')
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  const def = findPackageDef(productLine, data.slug) || findPackageDefBySlug(data.slug)
  if (!def) return null
  return enrichCourseBundleRow(admin, data, def, def.productLine)
}

export async function resolveCourseBundleCheckout(admin, slug) {
  const def = findPackageDefBySlug(slug)
  if (!def) return null

  const row = await getBundleBySlug(admin, slug)
  if (!row || row.status !== 'live') return null

  const enriched = await enrichCourseBundleRow(admin, row, def, def.productLine)
  if (!enriched.moduleSlugs?.length) return null

  return {
    slug: enriched.slug,
    title: enriched.title,
    priceCents: enriched.priceCents,
    currency: enriched.currency,
    moduleSlugs: enriched.moduleSlugs,
  }
}

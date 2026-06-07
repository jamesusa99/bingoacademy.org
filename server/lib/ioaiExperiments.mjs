import { IOAI_FULL_BUNDLE_SLUG, userHasModuleAccess } from './ioaiCommerce.mjs'
import { listEnrollmentSlugs } from './courseEntitlements.mjs'

export function mapExperimentRow(row, { materials = [] } = {}) {
  if (!row) return null
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle || null,
    coverUrl: row.cover_url || null,
    introHtml: row.intro_html || null,
    description: row.description || null,
    playType: row.play_type || 'training_lab',
    playTarget: row.play_target || null,
    status: row.status || 'live',
    sortOrder: row.sort_order ?? 0,
    marketingTags: row.marketing_tags || [],
    productLine: row.product_line || 'ioai',
    materials: materials.map(mapExperimentMaterialRow).filter(Boolean),
  }
}

export function mapExperimentMaterialRow(row) {
  if (!row) return null
  return {
    id: row.id,
    fileName: row.file_name,
    fileUrl: row.file_url,
    sortOrder: row.sort_order ?? 0,
  }
}

export function mapLessonMaterialRow(row) {
  if (!row) return null
  return {
    id: row.id,
    fileName: row.file_name,
    fileUrl: row.file_url,
    sortOrder: row.sort_order ?? 0,
  }
}

export function resolveExperimentPlayHref(experiment) {
  if (!experiment) return null
  const type = experiment.playType || experiment.play_type || 'training_lab'
  const target = experiment.playTarget || experiment.play_target
  if (type === 'training_lab' && target) {
    return `/labs/ioai/training-lab/${encodeURIComponent(target)}`
  }
  if (type === 'exploration' && target) {
    return target.startsWith('/') ? target : `/exploration/${target}`
  }
  if (type === 'external_url' && target) return target
  return null
}

export async function listLiveExperiments(admin, { productLine = 'ioai' } = {}) {
  if (!admin) return []
  const { data, error } = await admin
    .from('ioai_experiments')
    .select('*')
    .eq('product_line', productLine)
    .eq('status', 'live')
    .order('sort_order')
  if (error) return []
  return data || []
}

export async function getExperimentBySlug(admin, slug) {
  if (!admin || !slug?.trim()) return null
  const { data, error } = await admin
    .from('ioai_experiments')
    .select('*')
    .eq('slug', slug.trim())
    .maybeSingle()
  if (error || !data) return null
  return data
}

export async function listExperimentMaterials(admin, experimentId) {
  if (!admin || !experimentId) return []
  const { data } = await admin
    .from('ioai_experiment_materials')
    .select('*')
    .eq('experiment_id', experimentId)
    .order('sort_order')
  return data || []
}

export async function listLessonMaterials(admin, lessonId) {
  if (!admin || !lessonId) return []
  const { data } = await admin
    .from('lesson_materials')
    .select('*')
    .eq('lesson_id', lessonId)
    .order('sort_order')
  return data || []
}

export async function getLessonBySlug(admin, lessonSlug) {
  if (!admin || !lessonSlug?.trim()) return null
  const slug = lessonSlug.trim()
  const { data: byCatalog } = await admin
    .from('lessons')
    .select('id, slug, catalog_slug, title, module_id, trial_enabled, status')
    .eq('catalog_slug', slug)
    .maybeSingle()
  if (byCatalog) return byCatalog

  const { data: bySlug } = await admin
    .from('lessons')
    .select('id, slug, catalog_slug, title, module_id, trial_enabled, status')
    .eq('slug', slug)
    .maybeSingle()
  return bySlug || null
}

export async function getModuleCatalogSlugForLesson(admin, lesson) {
  if (!admin || !lesson?.module_id) return null
  const { data: mod } = await admin
    .from('modules')
    .select('catalog_slug, status')
    .eq('id', lesson.module_id)
    .maybeSingle()
  if (!mod?.catalog_slug || mod.status === 'hidden' || mod.status === 'draft') return null
  return mod.catalog_slug
}

export async function userHasLessonContentAccess(admin, userId, lesson, enrolledSlugs = null) {
  if (!admin || !lesson) return false
  if (lesson.status === 'hidden' || lesson.status === 'draft') return false
  if (lesson.trial_enabled) return true

  const slugs = enrolledSlugs ?? (userId ? await listEnrollmentSlugs(admin, userId) : [])
  const moduleSlug = await getModuleCatalogSlugForLesson(admin, lesson)
  if (!moduleSlug) return false

  return userHasModuleAccess(admin, userId, moduleSlug, { enrolledSlugs: slugs })
}

export async function listEnabledLessonExperimentBindings(admin, lessonId) {
  if (!admin || !lessonId) return []
  const { data } = await admin
    .from('lesson_experiment_bindings')
    .select(
      `
      id, enabled, sort_order,
      experiment:ioai_experiments (
        id, slug, title, subtitle, cover_url, intro_html, description,
        play_type, play_target, status, sort_order, marketing_tags, product_line
      )
    `
    )
    .eq('lesson_id', lessonId)
    .eq('enabled', true)
    .order('sort_order')
  return (data || []).filter((row) => row.experiment && row.experiment.status === 'live')
}

export async function listPackExperimentIdsForUser(admin, userId, enrolledSlugs = null) {
  if (!admin || !userId) return new Set()
  const slugs = enrolledSlugs ?? (await listEnrollmentSlugs(admin, userId))

  const { data: packs } = await admin
    .from('ioai_bundles')
    .select('id, slug')
    .eq('bundle_type', 'lab_pack')
    .in('slug', slugs)

  const packIds = (packs || []).map((p) => p.id)
  if (!packIds.length) return new Set()

  const { data: links } = await admin
    .from('ioai_bundle_experiments')
    .select('experiment_id')
    .in('bundle_id', packIds)

  return new Set((links || []).map((r) => r.experiment_id))
}

export async function userHasPackExperimentAccess(admin, userId, experimentId, enrolledSlugs = null) {
  if (!admin || !userId || !experimentId) return false
  const allowed = await listPackExperimentIdsForUser(admin, userId, enrolledSlugs)
  return allowed.has(experimentId)
}

export async function filterExperimentsForUser(admin, userId, experiments, { lesson, enrolledSlugs = null } = {}) {
  if (!experiments?.length) return []
  const slugs = enrolledSlugs ?? (userId ? await listEnrollmentSlugs(admin, userId) : [])

  const hasLessonAccess = lesson
    ? await userHasLessonContentAccess(admin, userId, lesson, slugs)
    : false
  const packIds = userId ? await listPackExperimentIdsForUser(admin, userId, slugs) : new Set()

  return experiments.filter((exp) => {
    const id = exp.id || exp.experiment?.id
    if (hasLessonAccess) return true
    return id && packIds.has(id)
  })
}

export async function getLessonLabContent(admin, { lessonSlug, userId = null }) {
  const lesson = await getLessonBySlug(admin, lessonSlug)
  if (!lesson) return { error: 'Lesson not found' }

  const enrolledSlugs = userId ? await listEnrollmentSlugs(admin, userId) : []
  const hasAccess = await userHasLessonContentAccess(admin, userId, lesson, enrolledSlugs)

  const bindings = await listEnabledLessonExperimentBindings(admin, lesson.id)
  const lessonMaterials = await listLessonMaterials(admin, lesson.id)

  const experiments = []
  for (const binding of bindings) {
    const exp = binding.experiment
    const materials = await listExperimentMaterials(admin, exp.id)
    const mapped = mapExperimentRow(exp, { materials })
    mapped.playHref = resolveExperimentPlayHref(mapped)
    mapped.source = 'lesson'
    mapped.access = hasAccess || (userId && (await userHasPackExperimentAccess(admin, userId, exp.id, enrolledSlugs)))
    if (mapped.access) experiments.push(mapped)
  }

  const materials = hasAccess ? lessonMaterials.map(mapLessonMaterialRow).filter(Boolean) : []

  return {
    lesson: {
      id: lesson.id,
      slug: lesson.catalog_slug || lesson.slug,
      title: lesson.title,
    },
    hasAccess,
    experiments,
    materials,
  }
}

export async function listLiveLabPacks(admin) {
  if (!admin) return []
  const { data, error } = await admin
    .from('ioai_bundles')
    .select(
      `
      id, slug, bundle_type, title, cover_url, intro_html,
      price_cents, compare_at_cents, currency, marketing_tags, status, sort_order
    `
    )
    .eq('bundle_type', 'lab_pack')
    .eq('status', 'live')
    .order('sort_order')
  if (error) return []
  return data || []
}

export async function getLabPackDetail(admin, slug) {
  if (!admin || !slug?.trim()) return null
  const { data: pack, error } = await admin
    .from('ioai_bundles')
    .select(
      `
      id, slug, bundle_type, title, cover_url, intro_html,
      price_cents, compare_at_cents, currency, marketing_tags, status, sort_order
    `
    )
    .eq('slug', slug.trim())
    .eq('bundle_type', 'lab_pack')
    .maybeSingle()
  if (error || !pack) return null

  const { data: expLinks } = await admin
    .from('ioai_bundle_experiments')
    .select(
      `
      sort_order,
      experiment:ioai_experiments (
        id, slug, title, subtitle, cover_url, intro_html, description,
        play_type, play_target, status, sort_order, marketing_tags
      )
    `
    )
    .eq('bundle_id', pack.id)
    .order('sort_order')

  const { data: modLinks } = await admin
    .from('ioai_bundle_recommended_modules')
    .select(
      `
      sort_order,
      module:modules ( id, slug, title, catalog_slug, cover_url, intro_html, price_cents, currency )
    `
    )
    .eq('bundle_id', pack.id)
    .order('sort_order')

  const experiments = []
  for (const link of expLinks || []) {
    if (!link.experiment || link.experiment.status !== 'live') continue
    const materials = await listExperimentMaterials(admin, link.experiment.id)
    const mapped = mapExperimentRow(link.experiment, { materials })
    mapped.playHref = resolveExperimentPlayHref(mapped)
    experiments.push(mapped)
  }

  const recommendedModules = (modLinks || [])
    .map((link) => link.module)
    .filter(Boolean)
    .map((mod) => ({
      id: mod.slug,
      catalogSlug: mod.catalog_slug,
      title: mod.title,
      coverUrl: mod.cover_url || null,
      introHtml: mod.intro_html || null,
      priceCents: mod.price_cents ?? null,
      currency: mod.currency || 'usd',
    }))

  return { pack, experiments, recommendedModules }
}

export async function listUserLabPacks(admin, userId) {
  if (!admin || !userId) return []
  const enrolledSlugs = await listEnrollmentSlugs(admin, userId)
  if (!enrolledSlugs.length) return []

  const { data: packs } = await admin
    .from('ioai_bundles')
    .select('id, slug, title, cover_url, intro_html, price_cents, currency')
    .eq('bundle_type', 'lab_pack')
    .in('slug', enrolledSlugs)
    .order('sort_order')

  const result = []
  for (const pack of packs || []) {
    const detail = await getLabPackDetail(admin, pack.slug)
    if (!detail) continue
    result.push({
      slug: pack.slug,
      title: pack.title,
      coverUrl: pack.cover_url || null,
      introHtml: pack.intro_html || null,
      experimentCount: detail.experiments.length,
      experiments: detail.experiments,
      recommendedModules: detail.recommendedModules,
    })
  }
  return result
}

/** Batch experiment counts per lesson id for store/module views */
export async function mapExperimentCountsByLessonId(admin, lessonIds) {
  const map = new Map()
  if (!admin || !lessonIds?.length) return map
  for (const id of lessonIds) map.set(id, 0)

  const { data } = await admin
    .from('lesson_experiment_bindings')
    .select('lesson_id, experiment:ioai_experiments ( status )')
    .in('lesson_id', lessonIds)
    .eq('enabled', true)

  for (const row of data || []) {
    if (!row.lesson_id || row.experiment?.status !== 'live') continue
    map.set(row.lesson_id, (map.get(row.lesson_id) || 0) + 1)
  }
  return map
}

export async function saveLessonExperimentBindings(admin, lessonId, bindings = []) {
  if (!admin || !lessonId) return { error: 'lessonId required' }

  await admin.from('lesson_experiment_bindings').delete().eq('lesson_id', lessonId)

  const rows = (bindings || [])
    .filter((b) => b.experiment_id)
    .map((b, i) => ({
      lesson_id: lessonId,
      experiment_id: b.experiment_id,
      enabled: b.enabled !== false,
      sort_order: b.sort_order ?? i,
    }))

  if (!rows.length) return { ok: true, count: 0 }

  const { error } = await admin.from('lesson_experiment_bindings').insert(rows)
  if (error) return { error: error.message }
  return { ok: true, count: rows.length }
}

export async function saveLessonMaterials(admin, lessonId, materials = []) {
  if (!admin || !lessonId) return { error: 'lessonId required' }

  await admin.from('lesson_materials').delete().eq('lesson_id', lessonId)

  const rows = (materials || [])
    .filter((m) => m.file_name?.trim() && m.file_url?.trim())
    .map((m, i) => ({
      lesson_id: lessonId,
      file_name: m.file_name.trim(),
      file_url: m.file_url.trim(),
      sort_order: m.sort_order ?? i,
    }))

  if (!rows.length) return { ok: true, count: 0 }

  const { error } = await admin.from('lesson_materials').insert(rows)
  if (error) return { error: error.message }
  return { ok: true, count: rows.length }
}

export async function saveLabPack(admin, { pack, experimentIds = [], recommendedModuleIds = [] }) {
  if (!admin || !pack?.slug?.trim()) return { error: 'slug required' }

  const payload = {
    slug: pack.slug.trim(),
    bundle_type: 'lab_pack',
    title: pack.title?.trim() || pack.slug.trim(),
    cover_url: pack.cover_url || null,
    intro_html: pack.intro_html || null,
    price_cents: pack.price_cents ?? 0,
    compare_at_cents: pack.compare_at_cents ?? null,
    currency: pack.currency || 'usd',
    marketing_tags: pack.marketing_tags || [],
    status: pack.status || 'live',
    sort_order: pack.sort_order ?? 0,
    updated_at: new Date().toISOString(),
  }

  let bundleId = pack.id
  if (bundleId) {
    const { error } = await admin.from('ioai_bundles').update(payload).eq('id', bundleId)
    if (error) return { error: error.message }
  } else {
    payload.created_at = new Date().toISOString()
    const { data, error } = await admin.from('ioai_bundles').insert(payload).select('id').single()
    if (error) return { error: error.message }
    bundleId = data.id
  }

  await admin.from('ioai_bundle_experiments').delete().eq('bundle_id', bundleId)
  await admin.from('ioai_bundle_recommended_modules').delete().eq('bundle_id', bundleId)

  if (experimentIds.length) {
    const expRows = experimentIds.map((experimentId, i) => ({
      bundle_id: bundleId,
      experiment_id: experimentId,
      sort_order: i,
    }))
    const { error } = await admin.from('ioai_bundle_experiments').insert(expRows)
    if (error) return { error: error.message }
  }

  if (recommendedModuleIds.length) {
    const modRows = recommendedModuleIds.map((moduleId, i) => ({
      bundle_id: bundleId,
      module_id: moduleId,
      sort_order: i,
    }))
    const { error } = await admin.from('ioai_bundle_recommended_modules').insert(modRows)
    if (error) return { error: error.message }
  }

  return { ok: true, id: bundleId }
}

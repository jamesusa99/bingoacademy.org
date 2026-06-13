import { getSupabaseAdmin } from '../lib/supabaseAdmin.mjs'
import { verifyAuthUser } from '../lib/supabaseAuth.mjs'
import { listEnrollmentSlugs } from '../lib/courseEntitlements.mjs'
import { resolveUnlockedModuleSlugs, IOAI_FULL_BUNDLE_SLUG } from '../lib/ioaiCommerce.mjs'
import {
  copyPublicExperiment,
  fetchLessonResources,
  fetchLessonResourcesByCatalogSlug,
  fetchPublicExperimentBySlug,
  listPublicExperiments,
  mapPublicExperimentRow,
  pickMaterialFilePayload,
  pickPublicExperimentPayload,
  pickStepPayload,
  saveLessonExperimentBindings,
  saveLessonMaterials,
  savePackExperimentRefs,
} from '../lib/ioaiExperiments.mjs'

async function lessonModuleCatalogSlug(admin, lessonId) {
  const { data } = await admin
    .from('lessons')
    .select('module:modules(catalog_slug)')
    .eq('id', lessonId)
    .maybeSingle()
  return data?.module?.catalog_slug || null
}

async function userOwnsModuleForLesson(admin, userId, lessonId) {
  if (!userId || !lessonId) return false
  const catalogSlug = await lessonModuleCatalogSlug(admin, lessonId)
  if (!catalogSlug) return false
  const enrolled = await listEnrollmentSlugs(admin, userId)
  if (enrolled.includes(IOAI_FULL_BUNDLE_SLUG) || enrolled.includes('ioai-track')) return true
  const moduleSlugs = await resolveUnlockedModuleSlugs(admin, userId, enrolled)
  return moduleSlugs.includes(catalogSlug)
}

async function userOwnsLabPack(admin, userId, packSlug) {
  if (!userId || !packSlug) return false
  const slugs = await listEnrollmentSlugs(admin, userId)
  return slugs.includes(packSlug)
}

export function registerIoaiExperimentRoutes(app, { verifyAdminUser }) {
  app.get('/api/ioai/experiment-library', async (_req, res) => {
    const admin = getSupabaseAdmin()
    if (!admin) return res.status(503).json({ error: 'Database not configured' })

    const result = await listPublicExperiments(admin, { includeDraft: false })
    if (result.error) return res.status(502).json({ error: result.error })
    return res.json({ experiments: result.experiments.filter((e) => e.status === 'live') })
  })

  app.get('/api/ioai/lessons/:catalogSlug/resources', async (req, res) => {
    const admin = getSupabaseAdmin()
    if (!admin) return res.status(503).json({ error: 'Database not configured' })

    const catalogSlug = req.params.catalogSlug?.trim()
    if (!catalogSlug) return res.status(400).json({ error: 'catalogSlug required' })

    const resources = await fetchLessonResourcesByCatalogSlug(admin, catalogSlug)
    if (resources.error) return res.status(502).json({ error: resources.error })

    if (!resources.hasExperiments && !resources.hasLessonMaterials) {
      return res.json({ ...resources, owned: false })
    }

    const auth = await verifyAuthUser(req)
    const { data: lesson } = await admin
      .from('lessons')
      .select('id')
      .or(`catalog_slug.eq.${catalogSlug},slug.eq.${catalogSlug}`)
      .maybeSingle()

    let owned = false
    if (auth.ok && lesson) {
      owned = await userOwnsModuleForLesson(admin, auth.user.id, lesson.id)
    }

    return res.json({ ...resources, owned, lessonId: lesson?.id || null })
  })

  app.get('/api/ioai/experiments/:slug', async (req, res) => {
    const admin = getSupabaseAdmin()
    if (!admin) return res.status(503).json({ error: 'Database not configured' })

    const slug = req.params.slug?.trim()
    const context = String(req.query.context || 'lesson').trim()
    const lessonCatalogSlug = String(req.query.lesson || '').trim()
    const packSlug = String(req.query.pack || '').trim()

    const result = await fetchPublicExperimentBySlug(admin, slug, { includeSteps: false })
    if (result.error) return res.status(404).json({ error: result.error })

    const auth = await verifyAuthUser(req)
    let owned = false

    if (auth.ok) {
      if (context === 'pack' && packSlug) {
        owned = await userOwnsLabPack(admin, auth.user.id, packSlug)
      } else if (lessonCatalogSlug) {
        const { data: lesson } = await admin
          .from('lessons')
          .select('id')
          .or(`catalog_slug.eq.${lessonCatalogSlug},slug.eq.${lessonCatalogSlug}`)
          .maybeSingle()
        if (lesson) owned = await userOwnsModuleForLesson(admin, auth.user.id, lesson.id)
      }
    }

    const full = await fetchPublicExperimentBySlug(admin, slug, { includeSteps: owned })
    return res.json({ experiment: full.experiment, owned })
  })

  app.get('/api/admin/ioai/experiments', async (req, res) => {
    const auth = await verifyAdminUser(req)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

    const admin = getSupabaseAdmin()
    if (!admin) return res.status(503).json({ error: 'Database not configured' })

    const result = await listPublicExperiments(admin, { includeDraft: true })
    if (result.error) return res.status(502).json({ error: result.error })
    return res.json({ experiments: result.experiments })
  })

  app.get('/api/admin/ioai/experiments/:id', async (req, res) => {
    const auth = await verifyAdminUser(req)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

    const admin = getSupabaseAdmin()
    if (!admin) return res.status(503).json({ error: 'Database not configured' })

    const { data, error } = await admin
      .from('ioai_experiments')
      .select(
        `
        id, slug, title, content, purpose, materials_list, runtime_config, sort_order, status,
        material_files:ioai_experiment_materials ( id, title, file_url, file_name, sort_order ),
        steps:ioai_experiment_steps (
          id, title, step_type, body, video_url, cloudflare_video_id, ppt_url,
          external_url, download_url, download_label, programming_config, sort_order
        )
      `
      )
      .eq('id', req.params.id)
      .maybeSingle()

    if (error) return res.status(502).json({ error: error.message })
    if (!data) return res.status(404).json({ error: 'Experiment not found' })
    return res.json({ experiment: mapPublicExperimentRow(data, { includeSteps: true }) })
  })

  app.post('/api/admin/ioai/experiments', async (req, res) => {
    const auth = await verifyAdminUser(req)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

    const admin = getSupabaseAdmin()
    if (!admin) return res.status(503).json({ error: 'Database not configured' })

    const picked = pickPublicExperimentPayload(req.body)
    if (picked.error) return res.status(400).json({ error: picked.error })

    const { data, error } = await admin.from('ioai_experiments').insert(picked.row).select('id').single()
    if (error) return res.status(error.code === '23505' ? 409 : 502).json({ error: error.message })

    const materialFiles = req.body.materialFiles || req.body.material_files || []
    if (materialFiles.length) {
      await admin.from('ioai_experiment_materials').insert(
        materialFiles.map((m, i) => ({
          experiment_id: data.id,
          title: m.title || 'Download',
          file_url: m.fileUrl || m.file_url,
          file_name: m.fileName || m.file_name || null,
          sort_order: m.sortOrder ?? m.sort_order ?? i,
        }))
      )
    }

    const { data: full } = await admin
      .from('ioai_experiments')
      .select(
        `id, slug, title, content, purpose, materials_list, runtime_config, sort_order, status,
        material_files:ioai_experiment_materials ( id, title, file_url, file_name, sort_order ),
        steps:ioai_experiment_steps(count)`
      )
      .eq('id', data.id)
      .single()

    return res.status(201).json({ experiment: mapPublicExperimentRow(full, { includeSteps: false }) })
  })

  app.put('/api/admin/ioai/experiments/:id', async (req, res) => {
    const auth = await verifyAdminUser(req)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

    const admin = getSupabaseAdmin()
    if (!admin) return res.status(503).json({ error: 'Database not configured' })

    const picked = pickPublicExperimentPayload(req.body)
    if (picked.error) return res.status(400).json({ error: picked.error })

    const { error } = await admin.from('ioai_experiments').update(picked.row).eq('id', req.params.id)
    if (error) return res.status(error.code === '23505' ? 409 : 502).json({ error: error.message })

    if (Array.isArray(req.body.materialFiles) || Array.isArray(req.body.material_files)) {
      const materialFiles = req.body.materialFiles || req.body.material_files
      await admin.from('ioai_experiment_materials').delete().eq('experiment_id', req.params.id)
      if (materialFiles.length) {
        await admin.from('ioai_experiment_materials').insert(
          materialFiles.map((m, i) => ({
            experiment_id: req.params.id,
            title: m.title || 'Download',
            file_url: m.fileUrl || m.file_url,
            file_name: m.fileName || m.file_name || null,
            sort_order: m.sortOrder ?? m.sort_order ?? i,
          }))
        )
      }
    }

    const { data: full } = await admin
      .from('ioai_experiments')
      .select(
        `id, slug, title, content, purpose, materials_list, runtime_config, sort_order, status,
        material_files:ioai_experiment_materials ( id, title, file_url, file_name, sort_order ),
        steps:ioai_experiment_steps (
          id, title, step_type, body, video_url, cloudflare_video_id, ppt_url,
          external_url, download_url, download_label, programming_config, sort_order
        )`
      )
      .eq('id', req.params.id)
      .single()

    return res.json({ experiment: mapPublicExperimentRow(full, { includeSteps: true }) })
  })

  app.delete('/api/admin/ioai/experiments/:id', async (req, res) => {
    const auth = await verifyAdminUser(req)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

    const admin = getSupabaseAdmin()
    if (!admin) return res.status(503).json({ error: 'Database not configured' })

    const { error } = await admin.from('ioai_experiments').delete().eq('id', req.params.id)
    if (error) return res.status(502).json({ error: error.message })
    return res.json({ ok: true })
  })

  app.post('/api/admin/ioai/experiments/:id/copy', async (req, res) => {
    const auth = await verifyAdminUser(req)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

    const admin = getSupabaseAdmin()
    if (!admin) return res.status(503).json({ error: 'Database not configured' })

    try {
      const result = await copyPublicExperiment(admin, req.params.id)
      return res.status(201).json(result)
    } catch (e) {
      return res.status(502).json({ error: e.message })
    }
  })

  app.post('/api/admin/ioai/experiments/reorder', async (req, res) => {
    const auth = await verifyAdminUser(req)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

    const admin = getSupabaseAdmin()
    if (!admin) return res.status(503).json({ error: 'Database not configured' })

    const ids = req.body.orderedIds || req.body.ordered_ids || []
    if (!Array.isArray(ids)) return res.status(400).json({ error: 'orderedIds required' })

    await Promise.all(
      ids.map((id, sort_order) =>
        admin.from('ioai_experiments').update({ sort_order, updated_at: new Date().toISOString() }).eq('id', id)
      )
    )
    return res.json({ ok: true })
  })

  app.post('/api/admin/ioai/experiments/:id/steps', async (req, res) => {
    const auth = await verifyAdminUser(req)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

    const admin = getSupabaseAdmin()
    if (!admin) return res.status(503).json({ error: 'Database not configured' })

    const picked = pickStepPayload(req.body)
    if (picked.error) return res.status(400).json({ error: picked.error })

    const { data, error } = await admin
      .from('ioai_experiment_steps')
      .insert({ ...picked.row, experiment_id: req.params.id })
      .select()
      .single()

    if (error) return res.status(502).json({ error: error.message })
    return res.status(201).json({ step: data })
  })

  app.put('/api/admin/ioai/experiments/:experimentId/steps/:stepId', async (req, res) => {
    const auth = await verifyAdminUser(req)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

    const admin = getSupabaseAdmin()
    if (!admin) return res.status(503).json({ error: 'Database not configured' })

    const picked = pickStepPayload(req.body)
    if (picked.error) return res.status(400).json({ error: picked.error })

    const { data, error } = await admin
      .from('ioai_experiment_steps')
      .update(picked.row)
      .eq('id', req.params.stepId)
      .eq('experiment_id', req.params.experimentId)
      .select()
      .single()

    if (error) return res.status(502).json({ error: error.message })
    return res.json({ step: data })
  })

  app.delete('/api/admin/ioai/experiments/:experimentId/steps/:stepId', async (req, res) => {
    const auth = await verifyAdminUser(req)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

    const admin = getSupabaseAdmin()
    if (!admin) return res.status(503).json({ error: 'Database not configured' })

    const { error } = await admin
      .from('ioai_experiment_steps')
      .delete()
      .eq('id', req.params.stepId)
      .eq('experiment_id', req.params.experimentId)

    if (error) return res.status(502).json({ error: error.message })
    return res.json({ ok: true })
  })

  app.get('/api/admin/lessons/:lessonId/resources', async (req, res) => {
    const auth = await verifyAdminUser(req)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

    const admin = getSupabaseAdmin()
    if (!admin) return res.status(503).json({ error: 'Database not configured' })

    const resources = await fetchLessonResources(admin, req.params.lessonId)
    if (resources.error) return res.status(502).json({ error: resources.error })
    return res.json(resources)
  })

  app.put('/api/admin/lessons/:lessonId/experiment-bindings', async (req, res) => {
    const auth = await verifyAdminUser(req)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

    const admin = getSupabaseAdmin()
    if (!admin) return res.status(503).json({ error: 'Database not configured' })

    try {
      await saveLessonExperimentBindings(admin, req.params.lessonId, req.body.bindings || [])
      return res.json(await fetchLessonResources(admin, req.params.lessonId))
    } catch (e) {
      return res.status(502).json({ error: e.message })
    }
  })

  app.put('/api/admin/lessons/:lessonId/materials', async (req, res) => {
    const auth = await verifyAdminUser(req)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

    const admin = getSupabaseAdmin()
    if (!admin) return res.status(503).json({ error: 'Database not configured' })

    try {
      await saveLessonMaterials(admin, req.params.lessonId, req.body.materials || [])
      return res.json(await fetchLessonResources(admin, req.params.lessonId))
    } catch (e) {
      return res.status(502).json({ error: e.message })
    }
  })

  app.put('/api/admin/lab-packs/:packSlug/experiment-refs', async (req, res) => {
    const auth = await verifyAdminUser(req)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

    const admin = getSupabaseAdmin()
    if (!admin) return res.status(503).json({ error: 'Database not configured' })

    try {
      const experimentIds = req.body.experimentIds || req.body.experiment_ids || []
      await savePackExperimentRefs(admin, req.params.packSlug.trim(), experimentIds)
      return res.json({ ok: true, count: experimentIds.length })
    } catch (e) {
      return res.status(502).json({ error: e.message })
    }
  })

  app.get('/api/admin/ioai/lab-bundles', async (req, res) => {
    const auth = await verifyAdminUser(req)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

    const admin = getSupabaseAdmin()
    if (!admin) return res.status(503).json({ error: 'Database not configured' })

    const { data, error } = await admin
      .from('ioai_bundles')
      .select(
        `id, slug, bundle_type, title, cover_url, intro_html, price_cents, compare_at_cents,
        currency, marketing_tags, status, sort_order,
        experiments:ioai_bundle_experiments ( sort_order, experiment:ioai_experiments ( id, slug, title, status ) )`
      )
      .eq('bundle_type', 'lab_pack')
      .order('sort_order')

    if (error) return res.status(502).json({ error: error.message })
    return res.json({ bundles: data || [] })
  })

  app.post('/api/admin/ioai/lab-bundles', async (req, res) => {
    const auth = await verifyAdminUser(req)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

    const admin = getSupabaseAdmin()
    if (!admin) return res.status(503).json({ error: 'Database not configured' })

    const body = req.body || {}
    const slug = String(body.slug || '').trim()
    const title = String(body.title || '').trim()
    if (!slug || !title) return res.status(400).json({ error: 'slug and title required' })

    const { data, error } = await admin
      .from('ioai_bundles')
      .insert({
        slug,
        title,
        bundle_type: 'lab_pack',
        cover_url: body.cover_url || body.coverUrl || null,
        intro_html: body.intro_html || body.introHtml || '',
        price_cents: parseInt(body.price_cents ?? body.priceCents, 10) || 0,
        compare_at_cents: body.compare_at_cents ?? body.compareAtCents ?? null,
        currency: body.currency || 'usd',
        marketing_tags: body.marketing_tags || body.marketingTags || [],
        status: body.status || 'live',
        sort_order: parseInt(body.sort_order ?? body.sortOrder, 10) || 0,
        updated_at: new Date().toISOString(),
      })
      .select('id')
      .single()

    if (error) return res.status(error.code === '23505' ? 409 : 502).json({ error: error.message })

    const experimentIds = body.experimentIds || body.experiment_ids || []
    if (experimentIds.length) {
      await admin.from('ioai_bundle_experiments').insert(
        experimentIds.map((experimentId, sort_order) => ({ bundle_id: data.id, experiment_id: experimentId, sort_order }))
      )
    }

    return res.status(201).json({ id: data.id, slug })
  })

  app.put('/api/admin/ioai/lab-bundles/:id', async (req, res) => {
    const auth = await verifyAdminUser(req)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

    const admin = getSupabaseAdmin()
    if (!admin) return res.status(503).json({ error: 'Database not configured' })

    const body = req.body || {}
    const patch = {
      title: body.title,
      cover_url: body.cover_url ?? body.coverUrl,
      intro_html: body.intro_html ?? body.introHtml,
      price_cents: body.price_cents ?? body.priceCents,
      compare_at_cents: body.compare_at_cents ?? body.compareAtCents,
      currency: body.currency,
      marketing_tags: body.marketing_tags ?? body.marketingTags,
      status: body.status,
      sort_order: body.sort_order ?? body.sortOrder,
      updated_at: new Date().toISOString(),
    }
    Object.keys(patch).forEach((k) => patch[k] === undefined && delete patch[k])

    const { error } = await admin.from('ioai_bundles').update(patch).eq('id', req.params.id).eq('bundle_type', 'lab_pack')
    if (error) return res.status(502).json({ error: error.message })

    if (Array.isArray(body.experimentIds) || Array.isArray(body.experiment_ids)) {
      const experimentIds = body.experimentIds || body.experiment_ids
      await admin.from('ioai_bundle_experiments').delete().eq('bundle_id', req.params.id)
      if (experimentIds.length) {
        await admin.from('ioai_bundle_experiments').insert(
          experimentIds.map((experimentId, sort_order) => ({
            bundle_id: req.params.id,
            experiment_id: experimentId,
            sort_order,
          }))
        )
      }
    }

    return res.json({ ok: true })
  })

  app.get('/api/me/lab-packs', async (req, res) => {
    const auth = await verifyAuthUser(req)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

    const admin = getSupabaseAdmin()
    if (!admin) return res.status(503).json({ error: 'Database not configured' })

    const enrolled = await listEnrollmentSlugs(admin, auth.user.id)

    const LAB_SUBS = ['training-lab', 'online-lab', 'online-lab-kit', 'offline-lab-kit', 'materials-pack']
    const { data: catalogRows } = enrolled.length
      ? await admin
          .from('courses_catalog')
          .select('slug, name, name_en, description, thumbnail_url, sub, line')
          .in('slug', enrolled)
          .in('sub', LAB_SUBS)
      : { data: [] }

    const { data: bundles } = await admin
      .from('ioai_bundles')
      .select('slug, title, cover_url, intro_html, price_cents, currency, bundle_type')
      .eq('bundle_type', 'lab_pack')
      .in('slug', enrolled.length ? enrolled : ['__none__'])

    return res.json({
      packs: catalogRows || [],
      bundles: bundles || [],
      enrolledSlugs: enrolled,
    })
  })
}

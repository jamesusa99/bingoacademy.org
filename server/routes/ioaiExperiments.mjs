import { getSupabaseAdmin } from '../lib/supabaseAdmin.mjs'
import { verifyAuthUser } from '../lib/supabaseAuth.mjs'
import { listEnrollmentSlugs } from '../lib/courseEntitlements.mjs'
import {
  getExperimentBySlug,
  getLabPackDetail,
  getLessonLabContent,
  listExperimentMaterials,
  listLiveExperiments,
  listLiveLabPacks,
  listLessonMaterials,
  listUserLabPacks,
  mapExperimentRow,
  saveLabPack,
  saveLessonExperimentBindings,
  saveLessonMaterials,
} from '../lib/ioaiExperiments.mjs'

export function registerIoaiExperimentsRoutes(app, { verifyAdminUser }) {
  app.get('/api/ioai/experiments', async (_req, res) => {
    const admin = getSupabaseAdmin()
    if (!admin) return res.status(503).json({ error: 'Database not configured' })

    const rows = await listLiveExperiments(admin)
    return res.json({ experiments: rows.map((row) => mapExperimentRow(row)) })
  })

  app.get('/api/ioai/experiments/:slug', async (req, res) => {
    const admin = getSupabaseAdmin()
    if (!admin) return res.status(503).json({ error: 'Database not configured' })

    const row = await getExperimentBySlug(admin, req.params.slug)
    if (!row || row.status !== 'live') return res.status(404).json({ error: 'Experiment not found' })

    const materials = await listExperimentMaterials(admin, row.id)
    return res.json({ experiment: mapExperimentRow(row, { materials }) })
  })

  app.get('/api/ioai/lab-packs', async (_req, res) => {
    const admin = getSupabaseAdmin()
    if (!admin) return res.status(503).json({ error: 'Database not configured' })

    const packs = await listLiveLabPacks(admin)
    return res.json({
      packs: packs.map((p) => ({
        slug: p.slug,
        title: p.title,
        coverUrl: p.cover_url || null,
        introHtml: p.intro_html || null,
        priceCents: p.price_cents,
        compareAtCents: p.compare_at_cents ?? null,
        currency: p.currency || 'usd',
        marketingTags: p.marketing_tags || [],
        sortOrder: p.sort_order ?? 0,
      })),
    })
  })

  app.get('/api/ioai/lab-packs/:slug', async (req, res) => {
    const admin = getSupabaseAdmin()
    if (!admin) return res.status(503).json({ error: 'Database not configured' })

    const detail = await getLabPackDetail(admin, req.params.slug)
    if (!detail || detail.pack.status !== 'live') {
      return res.status(404).json({ error: 'Lab pack not found' })
    }

    const { pack, experiments, recommendedModules } = detail
    return res.json({
      pack: {
        slug: pack.slug,
        title: pack.title,
        coverUrl: pack.cover_url || null,
        introHtml: pack.intro_html || null,
        priceCents: pack.price_cents,
        compareAtCents: pack.compare_at_cents ?? null,
        currency: pack.currency || 'usd',
        marketingTags: pack.marketing_tags || [],
      },
      experiments,
      recommendedModules,
    })
  })

  app.get('/api/ioai/lessons/:lessonSlug/labs', async (req, res) => {
    const admin = getSupabaseAdmin()
    if (!admin) return res.status(503).json({ error: 'Database not configured' })

    const auth = await verifyAuthUser(req)
    const userId = auth.ok ? auth.user.id : null

    const content = await getLessonLabContent(admin, {
      lessonSlug: req.params.lessonSlug,
      userId,
    })
    if (content.error) return res.status(404).json({ error: content.error })

    return res.json(content)
  })

  app.get('/api/me/ioai-lab-access', async (req, res) => {
    const auth = await verifyAuthUser(req)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

    const enrolledSlugs = await listEnrollmentSlugs(auth.admin, auth.user.id)
    const labPacks = await listUserLabPacks(auth.admin, auth.user.id)

    return res.json({
      enrolledSlugs,
      labPacks,
      labPackSlugs: labPacks.map((p) => p.slug),
    })
  })

  // ─── Admin ───────────────────────────────────────────────────────────

  app.get('/api/admin/ioai/experiments', async (req, res) => {
    const auth = await verifyAdminUser(req)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

    const admin = getSupabaseAdmin()
    if (!admin) return res.status(503).json({ error: 'Database not configured' })

    const { data, error } = await admin
      .from('ioai_experiments')
      .select('*')
      .order('sort_order')

    if (error) return res.status(502).json({ error: error.message })

    const experiments = []
    for (const row of data || []) {
      const materials = await listExperimentMaterials(admin, row.id)
      experiments.push(mapExperimentRow(row, { materials }))
    }

    return res.json({ experiments })
  })

  app.post('/api/admin/ioai/experiments', async (req, res) => {
    const auth = await verifyAdminUser(req)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

    const admin = getSupabaseAdmin()
    if (!admin) return res.status(503).json({ error: 'Database not configured' })

    const body = req.body || {}
    if (!body.slug?.trim() || !body.title?.trim()) {
      return res.status(400).json({ error: 'slug and title are required' })
    }

    const payload = {
      slug: body.slug.trim(),
      title: body.title.trim(),
      subtitle: body.subtitle || null,
      cover_url: body.cover_url || null,
      intro_html: body.intro_html || null,
      description: body.description || null,
      play_type: body.play_type || 'training_lab',
      play_target: body.play_target || null,
      status: body.status || 'live',
      sort_order: body.sort_order ?? 0,
      marketing_tags: body.marketing_tags || [],
      product_line: body.product_line || 'ioai',
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await admin.from('ioai_experiments').insert(payload).select('*').single()
    if (error) return res.status(400).json({ error: error.message })

    const materials = (body.materials || [])
      .filter((m) => m.file_name?.trim() && m.file_url?.trim())
      .map((m, i) => ({
        experiment_id: data.id,
        file_name: m.file_name.trim(),
        file_url: m.file_url.trim(),
        sort_order: m.sort_order ?? i,
      }))

    if (materials.length) {
      await admin.from('ioai_experiment_materials').insert(materials)
    }

    const savedMaterials = await listExperimentMaterials(admin, data.id)
    return res.json({ experiment: mapExperimentRow(data, { materials: savedMaterials }) })
  })

  app.put('/api/admin/ioai/experiments/:id', async (req, res) => {
    const auth = await verifyAdminUser(req)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

    const admin = getSupabaseAdmin()
    if (!admin) return res.status(503).json({ error: 'Database not configured' })

    const id = req.params.id
    const body = req.body || {}

    const payload = {
      slug: body.slug?.trim(),
      title: body.title?.trim(),
      subtitle: body.subtitle ?? null,
      cover_url: body.cover_url ?? null,
      intro_html: body.intro_html ?? null,
      description: body.description ?? null,
      play_type: body.play_type,
      play_target: body.play_target ?? null,
      status: body.status,
      sort_order: body.sort_order,
      marketing_tags: body.marketing_tags,
      updated_at: new Date().toISOString(),
    }

    Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k])

    const { data, error } = await admin.from('ioai_experiments').update(payload).eq('id', id).select('*').single()
    if (error) return res.status(400).json({ error: error.message })

    if (Array.isArray(body.materials)) {
      await admin.from('ioai_experiment_materials').delete().eq('experiment_id', id)
      const rows = body.materials
        .filter((m) => m.file_name?.trim() && m.file_url?.trim())
        .map((m, i) => ({
          experiment_id: id,
          file_name: m.file_name.trim(),
          file_url: m.file_url.trim(),
          sort_order: m.sort_order ?? i,
        }))
      if (rows.length) await admin.from('ioai_experiment_materials').insert(rows)
    }

    const savedMaterials = await listExperimentMaterials(admin, id)
    return res.json({ experiment: mapExperimentRow(data, { materials: savedMaterials }) })
  })

  app.delete('/api/admin/ioai/experiments/:id', async (req, res) => {
    const auth = await verifyAdminUser(req)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

    const admin = getSupabaseAdmin()
    if (!admin) return res.status(503).json({ error: 'Database not configured' })

    const { error } = await admin.from('ioai_experiments').delete().eq('id', req.params.id)
    if (error) return res.status(400).json({ error: error.message })
    return res.json({ ok: true })
  })

  app.get('/api/admin/ioai/lessons/:lessonId/experiments', async (req, res) => {
    const auth = await verifyAdminUser(req)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

    const admin = getSupabaseAdmin()
    if (!admin) return res.status(503).json({ error: 'Database not configured' })

    const lessonId = req.params.lessonId
    const { data: bindings } = await admin
      .from('lesson_experiment_bindings')
      .select('id, experiment_id, enabled, sort_order')
      .eq('lesson_id', lessonId)
      .order('sort_order')

    const materials = await listLessonMaterials(admin, lessonId)

    return res.json({
      bindings: bindings || [],
      materials: materials.map((m) => ({
        id: m.id,
        file_name: m.file_name,
        file_url: m.file_url,
        sort_order: m.sort_order ?? 0,
      })),
    })
  })

  app.put('/api/admin/ioai/lessons/:lessonId/experiments', async (req, res) => {
    const auth = await verifyAdminUser(req)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

    const admin = getSupabaseAdmin()
    if (!admin) return res.status(503).json({ error: 'Database not configured' })

    const lessonId = req.params.lessonId
    const { bindings = [], materials = [] } = req.body || {}

    const bindResult = await saveLessonExperimentBindings(admin, lessonId, bindings)
    if (bindResult.error) return res.status(400).json({ error: bindResult.error })

    const matResult = await saveLessonMaterials(admin, lessonId, materials)
    if (matResult.error) return res.status(400).json({ error: matResult.error })

    return res.json({ ok: true, bindings: bindResult.count, materials: matResult.count })
  })

  app.get('/api/admin/ioai/lab-packs', async (req, res) => {
    const auth = await verifyAdminUser(req)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

    const admin = getSupabaseAdmin()
    if (!admin) return res.status(503).json({ error: 'Database not configured' })

    const { data, error } = await admin
      .from('ioai_bundles')
      .select('*')
      .eq('bundle_type', 'lab_pack')
      .order('sort_order')

    if (error) return res.status(502).json({ error: error.message })
    return res.json({ packs: data || [] })
  })

  app.get('/api/admin/ioai/lab-packs/:slug', async (req, res) => {
    const auth = await verifyAdminUser(req)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

    const admin = getSupabaseAdmin()
    if (!admin) return res.status(503).json({ error: 'Database not configured' })

    const detail = await getLabPackDetail(admin, req.params.slug)
    if (!detail) return res.status(404).json({ error: 'Lab pack not found' })

    const { data: expLinks } = await admin
      .from('ioai_bundle_experiments')
      .select('experiment_id, sort_order')
      .eq('bundle_id', detail.pack.id)
      .order('sort_order')

    const { data: modLinks } = await admin
      .from('ioai_bundle_recommended_modules')
      .select('module_id, sort_order')
      .eq('bundle_id', detail.pack.id)
      .order('sort_order')

    return res.json({
      pack: detail.pack,
      experiments: detail.experiments,
      recommendedModules: detail.recommendedModules,
      experimentIds: (expLinks || []).map((l) => l.experiment_id),
      recommendedModuleIds: (modLinks || []).map((l) => l.module_id),
    })
  })

  app.post('/api/admin/ioai/lab-packs', async (req, res) => {
    const auth = await verifyAdminUser(req)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

    const admin = getSupabaseAdmin()
    if (!admin) return res.status(503).json({ error: 'Database not configured' })

    const { pack, experimentIds = [], recommendedModuleIds = [] } = req.body || {}
    const result = await saveLabPack(admin, { pack, experimentIds, recommendedModuleIds })
    if (result.error) return res.status(400).json({ error: result.error })
    return res.json(result)
  })

  app.put('/api/admin/ioai/lab-packs/:id', async (req, res) => {
    const auth = await verifyAdminUser(req)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

    const admin = getSupabaseAdmin()
    if (!admin) return res.status(503).json({ error: 'Database not configured' })

    const { pack, experimentIds = [], recommendedModuleIds = [] } = req.body || {}
    const result = await saveLabPack(admin, {
      pack: { ...pack, id: req.params.id },
      experimentIds,
      recommendedModuleIds,
    })
    if (result.error) return res.status(400).json({ error: result.error })
    return res.json(result)
  })

  app.delete('/api/admin/ioai/lab-packs/:id', async (req, res) => {
    const auth = await verifyAdminUser(req)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

    const admin = getSupabaseAdmin()
    if (!admin) return res.status(503).json({ error: 'Database not configured' })

    const { error } = await admin.from('ioai_bundles').delete().eq('id', req.params.id)
    if (error) return res.status(400).json({ error: error.message })
    return res.json({ ok: true })
  })
}

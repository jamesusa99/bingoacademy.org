import { getSupabaseAdmin } from '../lib/supabaseAdmin.mjs'
import { verifyAuthUser } from '../lib/supabaseAuth.mjs'
import { listEnrollmentSlugs } from '../lib/courseEntitlements.mjs'
import {
  fetchLabPackTree,
  mapExperimentRow,
  mapStepRow,
  pickExperimentPayload,
  pickStepPayload,
} from '../lib/labExperiments.mjs'

function sortByOrder(a, b) {
  return (a.sort_order ?? 0) - (b.sort_order ?? 0)
}

async function userOwnsPack(admin, userId, packSlug) {
  if (!userId || !packSlug) return false
  const slugs = await listEnrollmentSlugs(admin, userId)
  return slugs.includes(packSlug)
}

async function getExperimentPreviewContext(admin, packSlug, experimentSlug) {
  const { data, error } = await admin
    .from('lab_experiments')
    .select('slug, sort_order, status')
    .eq('pack_slug', packSlug)
    .neq('status', 'hidden')
    .order('sort_order')

  if (error) return { index: -1, total: 0, previewUnlocked: false }

  const live = (data || []).filter((e) => e.status === 'live')
  const index = live.findIndex((e) => e.slug === experimentSlug)
  const total = live.length
  const previewCount = Math.max(0, total - 2)
  const previewUnlocked = index >= 0 && index < previewCount

  return { index, total, previewUnlocked }
}

export function registerLabRoutes(app, { verifyAdminUser }) {
  app.get('/api/labs/:packSlug', async (req, res) => {
    const admin = getSupabaseAdmin()
    if (!admin) return res.status(503).json({ error: 'Database not configured' })

    const packSlug = req.params.packSlug?.trim()
    if (!packSlug) return res.status(400).json({ error: 'packSlug required' })

    const result = await fetchLabPackTree(admin, packSlug, { includeSteps: false })
    if (result.error) return res.status(result.error === 'Lab pack not found' ? 404 : 502).json({ error: result.error })

    return res.json({ pack: result.pack })
  })

  app.get('/api/labs/:packSlug/experiments/:experimentSlug', async (req, res) => {
    const admin = getSupabaseAdmin()
    if (!admin) return res.status(503).json({ error: 'Database not configured' })

    const packSlug = req.params.packSlug?.trim()
    const experimentSlug = req.params.experimentSlug?.trim()
    if (!packSlug || !experimentSlug) return res.status(400).json({ error: 'packSlug and experimentSlug required' })

    const auth = await verifyAuthUser(req)
    const owned = auth.ok ? await userOwnsPack(admin, auth.user.id, packSlug) : false
    const preview = await getExperimentPreviewContext(admin, packSlug, experimentSlug)

    const { data: experiment, error } = await admin
      .from('lab_experiments')
      .select(
        `
        id, pack_slug, slug, title, content, purpose, materials_list, runtime_config, sort_order, status,
        steps:lab_experiment_steps (
          id, title, step_type, body, video_url, cloudflare_video_id, ppt_url,
          external_url, download_url, download_label, programming_config, sort_order
        )
      `
      )
      .eq('pack_slug', packSlug)
      .eq('slug', experimentSlug)
      .maybeSingle()

    if (error) return res.status(502).json({ error: error.message })
    if (!experiment || experiment.status === 'hidden') {
      return res.status(404).json({ error: 'Experiment not found' })
    }

    const mapped = mapExperimentRow(experiment, { includeSteps: owned || preview.previewUnlocked })
    return res.json({
      experiment: mapped,
      owned,
      previewUnlocked: preview.previewUnlocked,
      experimentIndex: preview.index,
    })
  })

  app.get('/api/admin/lab-packs/:packSlug/experiments', async (req, res) => {
    const auth = await verifyAdminUser(req)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

    const admin = getSupabaseAdmin()
    if (!admin) return res.status(503).json({ error: 'Database not configured' })

    const packSlug = req.params.packSlug?.trim()
    const result = await fetchLabPackTree(admin, packSlug, { includeSteps: true })
    if (result.error) return res.status(result.error === 'Lab pack not found' ? 404 : 502).json({ error: result.error })

    return res.json({ pack: result.pack, experiments: result.experiments })
  })

  app.post('/api/admin/lab-packs/:packSlug/experiments', async (req, res) => {
    const auth = await verifyAdminUser(req)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

    const admin = getSupabaseAdmin()
    if (!admin) return res.status(503).json({ error: 'Database not configured' })

    const packSlug = req.params.packSlug?.trim()
    const picked = pickExperimentPayload(req.body, packSlug)
    if (picked.error) return res.status(400).json({ error: picked.error })

    const { data: existing } = await admin
      .from('lab_experiments')
      .select('id')
      .eq('pack_slug', packSlug)
      .eq('slug', picked.row.slug)
      .maybeSingle()

    const { data, error } = existing?.id
      ? await admin.from('lab_experiments').update(picked.row).eq('id', existing.id).select().maybeSingle()
      : await admin.from('lab_experiments').insert(picked.row).select().maybeSingle()
    if (error) return res.status(400).json({ error: error.message })
    return res.json({ experiment: mapExperimentRow(data) })
  })

  app.put('/api/admin/lab-experiments/:id', async (req, res) => {
    const auth = await verifyAdminUser(req)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

    const admin = getSupabaseAdmin()
    if (!admin) return res.status(503).json({ error: 'Database not configured' })

    const id = req.params.id?.trim()
    const packSlug = req.body?.pack_slug || req.body?.packSlug
    const picked = pickExperimentPayload(req.body, packSlug)
    if (picked.error) return res.status(400).json({ error: picked.error })

    const { data: slugConflict } = await admin
      .from('lab_experiments')
      .select('id')
      .eq('pack_slug', picked.row.pack_slug)
      .eq('slug', picked.row.slug)
      .neq('id', id)
      .maybeSingle()
    if (slugConflict) {
      return res.status(409).json({
        error: `Experiment slug "${picked.row.slug}" already exists in this pack`,
      })
    }

    const { data, error } = await admin.from('lab_experiments').update(picked.row).eq('id', id).select().maybeSingle()
    if (error) return res.status(400).json({ error: error.message })
    if (!data) return res.status(404).json({ error: 'Experiment not found' })
    return res.json({ experiment: mapExperimentRow(data) })
  })

  app.delete('/api/admin/lab-experiments/:id', async (req, res) => {
    const auth = await verifyAdminUser(req)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

    const admin = getSupabaseAdmin()
    if (!admin) return res.status(503).json({ error: 'Database not configured' })

    const { error } = await admin.from('lab_experiments').delete().eq('id', req.params.id)
    if (error) return res.status(400).json({ error: error.message })
    return res.json({ ok: true })
  })

  app.post('/api/admin/lab-experiments/:experimentId/steps', async (req, res) => {
    const auth = await verifyAdminUser(req)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

    const admin = getSupabaseAdmin()
    if (!admin) return res.status(503).json({ error: 'Database not configured' })

    const experimentId = req.params.experimentId?.trim()
    const picked = pickStepPayload(req.body)
    if (picked.error) return res.status(400).json({ error: picked.error })

    const row = { ...picked.row }
    const explicitOrder = req.body?.sort_order ?? req.body?.sortOrder
    if (explicitOrder == null || explicitOrder === '') {
      const { data: maxRow } = await admin
        .from('lab_experiment_steps')
        .select('sort_order')
        .eq('experiment_id', experimentId)
        .order('sort_order', { ascending: false })
        .limit(1)
        .maybeSingle()
      row.sort_order = (maxRow?.sort_order ?? -1) + 1
    }

    const { data, error } = await admin
      .from('lab_experiment_steps')
      .insert({ ...row, experiment_id: experimentId })
      .select()
      .maybeSingle()

    if (error) return res.status(400).json({ error: error.message })
    return res.json({ step: mapStepRow(data) })
  })

  app.put('/api/admin/lab-experiment-steps/:id', async (req, res) => {
    const auth = await verifyAdminUser(req)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

    const admin = getSupabaseAdmin()
    if (!admin) return res.status(503).json({ error: 'Database not configured' })

    const picked = pickStepPayload(req.body)
    if (picked.error) return res.status(400).json({ error: picked.error })

    const { data, error } = await admin
      .from('lab_experiment_steps')
      .update(picked.row)
      .eq('id', req.params.id)
      .select()
      .maybeSingle()

    if (error) return res.status(400).json({ error: error.message })
    if (!data) return res.status(404).json({ error: 'Step not found' })
    return res.json({ step: mapStepRow(data) })
  })

  app.delete('/api/admin/lab-experiment-steps/:id', async (req, res) => {
    const auth = await verifyAdminUser(req)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

    const admin = getSupabaseAdmin()
    if (!admin) return res.status(503).json({ error: 'Database not configured' })

    const { error } = await admin.from('lab_experiment_steps').delete().eq('id', req.params.id)
    if (error) return res.status(400).json({ error: error.message })
    return res.json({ ok: true })
  })

  app.post('/api/admin/lab-packs/:packSlug/experiments/reorder', async (req, res) => {
    const auth = await verifyAdminUser(req)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

    const admin = getSupabaseAdmin()
    if (!admin) return res.status(503).json({ error: 'Database not configured' })

    const orderedIds = req.body?.orderedIds || req.body?.ordered_ids || []
    if (!Array.isArray(orderedIds) || !orderedIds.length) {
      return res.status(400).json({ error: 'orderedIds required' })
    }

    const updates = orderedIds.map((id, sort_order) =>
      admin.from('lab_experiments').update({ sort_order, updated_at: new Date().toISOString() }).eq('id', id)
    )
    const results = await Promise.all(updates)
    const failed = results.find((r) => r.error)
    if (failed?.error) return res.status(400).json({ error: failed.error.message })

    return res.json({ ok: true })
  })

  app.post('/api/admin/lab-experiments/:experimentId/steps/reorder', async (req, res) => {
    const auth = await verifyAdminUser(req)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

    const admin = getSupabaseAdmin()
    if (!admin) return res.status(503).json({ error: 'Database not configured' })

    const orderedIds = req.body?.orderedIds || req.body?.ordered_ids || []
    if (!Array.isArray(orderedIds) || !orderedIds.length) {
      return res.status(400).json({ error: 'orderedIds required' })
    }

    const updates = orderedIds.map((id, sort_order) =>
      admin.from('lab_experiment_steps').update({ sort_order, updated_at: new Date().toISOString() }).eq('id', id)
    )
    const results = await Promise.all(updates)
    const failed = results.find((r) => r.error)
    if (failed?.error) return res.status(400).json({ error: failed.error.message })

    return res.json({ ok: true })
  })
}

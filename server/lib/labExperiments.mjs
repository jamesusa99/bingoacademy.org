const STEP_TYPES = new Set(['text', 'video', 'ppt', 'link', 'programming', 'download'])

function normalizeRuntimeConfig(raw) {
  const base = {
    type: 'steps_only',
    url: '',
    internalPath: '',
    labId: '',
    downloadLabel: '',
    embedHeight: 520,
    openInNewTab: false,
  }
  if (!raw || typeof raw !== 'object') return base
  const allowed = new Set([
    'steps_only',
    'external_link',
    'iframe',
    'html_page',
    'programming',
    'interactive',
    'install_package',
  ])
  return {
    type: allowed.has(raw.type) ? raw.type : base.type,
    url: String(raw.url || '').trim(),
    internalPath: String(raw.internalPath || raw.internal_path || '').trim(),
    labId: String(raw.labId || raw.lab_id || '').trim(),
    downloadLabel: String(raw.downloadLabel || raw.download_label || '').trim(),
    embedHeight: Math.max(280, parseInt(raw.embedHeight ?? raw.embed_height, 10) || 520),
    openInNewTab: Boolean(raw.openInNewTab ?? raw.open_in_new_tab),
  }
}

function sortByOrder(a, b) {
  return (a.sort_order ?? 0) - (b.sort_order ?? 0)
}

export function normalizeMaterialsList(raw) {
  if (!Array.isArray(raw)) return []
  return raw
    .map((row) => ({
      name: String(row?.name || '').trim(),
      quantity: String(row?.quantity || '').trim(),
      note: String(row?.note || '').trim(),
      required: row?.required !== false,
    }))
    .filter((row) => row.name)
}

export function mapStepRow(row) {
  if (!row) return null
  return {
    id: row.id,
    title: row.title || '',
    stepType: row.step_type,
    body: row.body || '',
    videoUrl: row.video_url || null,
    cloudflareVideoId: row.cloudflare_video_id || null,
    pptUrl: row.ppt_url || null,
    externalUrl: row.external_url || null,
    downloadUrl: row.download_url || null,
    downloadLabel: row.download_label || null,
    programmingConfig: row.programming_config || {},
    sortOrder: row.sort_order ?? 0,
  }
}

export function mapExperimentRow(row, { includeSteps = false } = {}) {
  if (!row) return null
  const stepRows = includeSteps ? row.steps || row.step_rows || [] : []
  const steps = includeSteps
    ? [...stepRows].sort(sortByOrder).map(mapStepRow).filter(Boolean)
    : undefined
  let stepCount = null
  if (includeSteps) {
    stepCount = steps.length
  } else if (Array.isArray(row.steps) && row.steps[0]?.count != null) {
    stepCount = row.steps[0].count
  }
  return {
    id: row.id,
    slug: row.slug,
    packSlug: row.pack_slug,
    title: row.title,
    content: row.content || '',
    purpose: row.purpose || '',
    materialsList: normalizeMaterialsList(row.materials_list),
    runtimeConfig: normalizeRuntimeConfig(row.runtime_config),
    sortOrder: row.sort_order ?? 0,
    status: row.status || 'live',
    stepCount,
    ...(includeSteps ? { steps } : {}),
  }
}

export function mapPackRow(row, experiments = []) {
  if (!row) return null
  const liveExperiments = experiments.filter((e) => e.status !== 'hidden' && e.status !== 'draft')
  return {
    slug: row.slug,
    line: row.line,
    sub: row.sub,
    status: row.status,
    name: row.name,
    nameEn: row.name_en || row.name,
    description: row.description || '',
    price: row.price || '',
    priceCents: row.price_cents ?? null,
    currency: row.currency || 'usd',
    purchasable: row.purchasable ?? null,
    hours: row.hours || '',
    audience: row.audience || '',
    outcomes: row.outcomes || [],
    thumbnailUrl: row.thumbnail_url || null,
    materialsList: normalizeMaterialsList(row.materials_list),
    experimentCount: liveExperiments.length,
    experiments: liveExperiments.map((e) => mapExperimentRow(e)),
  }
}

export function pickStepPayload(body = {}) {
  const stepType = String(body.step_type || body.stepType || 'text').trim()
  if (!STEP_TYPES.has(stepType)) {
    return { error: `Invalid step_type: ${stepType}` }
  }
  return {
    row: {
      title: String(body.title || '').trim(),
      step_type: stepType,
      body: String(body.body || '').trim(),
      video_url: body.video_url || body.videoUrl || null,
      cloudflare_video_id: body.cloudflare_video_id || body.cloudflareVideoId || null,
      ppt_url: body.ppt_url || body.pptUrl || null,
      external_url: body.external_url || body.externalUrl || null,
      download_url: body.download_url || body.downloadUrl || null,
      download_label: body.download_label || body.downloadLabel || null,
      programming_config: body.programming_config || body.programmingConfig || {},
      sort_order: parseInt(body.sort_order ?? body.sortOrder, 10) || 0,
      updated_at: new Date().toISOString(),
    },
  }
}

export function pickExperimentPayload(body = {}, packSlug) {
  const slug = String(body.slug || '').trim()
  const title = String(body.title || '').trim()
  if (!slug) return { error: 'slug is required' }
  if (!title) return { error: 'title is required' }
  return {
    row: {
      pack_slug: packSlug,
      slug,
      title,
      content: String(body.content || '').trim(),
      purpose: String(body.purpose || '').trim(),
      materials_list: normalizeMaterialsList(body.materials_list || body.materialsList),
      runtime_config: normalizeRuntimeConfig(body.runtime_config || body.runtimeConfig),
      sort_order: parseInt(body.sort_order ?? body.sortOrder, 10) || 0,
      status: body.status || 'live',
      updated_at: new Date().toISOString(),
    },
  }
}

export async function fetchLabPackTree(admin, packSlug, { includeSteps = false } = {}) {
  const { data: pack, error: packErr } = await admin
    .from('courses_catalog')
    .select(
      'slug, line, sub, status, name, name_en, description, price, price_cents, currency, purchasable, hours, audience, outcomes, thumbnail_url, materials_list'
    )
    .eq('slug', packSlug)
    .maybeSingle()

  if (packErr) return { error: packErr.message }
  if (!pack) return { error: 'Lab pack not found' }

  const selectBody = includeSteps
    ? `steps:lab_experiment_steps (
        id, title, step_type, body, video_url, cloudflare_video_id, ppt_url,
        external_url, download_url, download_label, programming_config, sort_order
      )`
    : `steps:lab_experiment_steps(count)`

  let query = admin
    .from('lab_experiments')
    .select(`id, pack_slug, slug, title, content, purpose, materials_list, runtime_config, sort_order, status, ${selectBody}`)
    .eq('pack_slug', packSlug)
    .order('sort_order')

  if (!includeSteps) {
    query = query.neq('status', 'hidden')
  }

  const { data: experiments, error: expErr } = await query
  if (expErr) return { error: expErr.message }

  const mappedExperiments = (experiments || [])
    .filter((e) => includeSteps || e.status === 'live')
    .sort(sortByOrder)
    .map((e) => mapExperimentRow(e, { includeSteps }))

  return { pack: mapPackRow(pack, experiments || []), experiments: mappedExperiments }
}

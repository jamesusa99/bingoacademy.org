function mapPublicStepRow(row) {
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

function mapPublicExperimentSummary(row) {
  if (!row) return null
  const stepCount =
    Array.isArray(row.steps) && row.steps[0]?.count != null ? row.steps[0].count : row.stepCount ?? 0
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    content: row.content || '',
    purpose: row.purpose || '',
    sortOrder: row.sort_order ?? row.sortOrder ?? 0,
    status: row.status || 'live',
    stepCount,
  }
}

function mapPublicExperimentDetail(row, { includeSteps = false } = {}) {
  if (!row) return null
  const stepRows = includeSteps ? row.steps || [] : []
  const steps = includeSteps
    ? [...stepRows].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)).map(mapPublicStepRow).filter(Boolean)
    : undefined
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    content: row.content || '',
    purpose: row.purpose || '',
    runtimeConfig: row.runtime_config || row.runtimeConfig || null,
    sortOrder: row.sort_order ?? 0,
    status: row.status || 'live',
    stepCount: includeSteps ? steps.length : mapPublicExperimentSummary(row)?.stepCount ?? 0,
    ...(includeSteps ? { steps } : {}),
  }
}

async function parseJsonResponse(res) {
  const text = await res.text()
  if (!text || text.trimStart().startsWith('<!')) {
    throw new Error('Lab API unavailable')
  }
  try {
    return JSON.parse(text)
  } catch {
    throw new Error('Lab API returned invalid JSON')
  }
}

export async function fetchLabPack(packSlug) {
  const res = await fetch(`/api/labs/${encodeURIComponent(packSlug)}`)
  const body = await parseJsonResponse(res)
  if (!res.ok) throw new Error(body.error || `Failed to load lab pack (${res.status})`)
  return body.pack
}

const LIBRARY_EXP_SELECT =
  'id, slug, title, content, purpose, runtime_config, sort_order, status, steps:ioai_experiment_steps(count)'

const LIBRARY_EXP_WITH_STEPS =
  'id, slug, title, content, purpose, runtime_config, sort_order, status, steps:ioai_experiment_steps(id, title, step_type, body, video_url, cloudflare_video_id, ppt_url, external_url, download_url, download_label, programming_config, sort_order)'

const LEGACY_EXP_SELECT =
  'id, slug, title, content, purpose, runtime_config, sort_order, status, steps:lab_experiment_steps(count)'

const LEGACY_EXP_WITH_STEPS =
  'id, slug, title, content, purpose, runtime_config, sort_order, status, steps:lab_experiment_steps(id, title, step_type, body, video_url, cloudflare_video_id, ppt_url, external_url, download_url, download_label, programming_config, sort_order)'

/** Public read fallback when API pack payload has no experiments yet. */
export async function fetchLabPackExperimentsPublic(packSlug) {
  const { supabase, isSupabaseConfigured } = await import('./supabase')
  if (!isSupabaseConfigured) return []

  const { data: refs, error: refErr } = await supabase
    .from('lab_pack_experiment_refs')
    .select('experiment_id, sort_order')
    .eq('pack_slug', packSlug)
    .order('sort_order')

  if (!refErr && refs?.length) {
    const ids = refs.map((r) => r.experiment_id)
    const { data, error } = await supabase
      .from('ioai_experiments')
      .select(LIBRARY_EXP_SELECT)
      .in('id', ids)
      .eq('status', 'live')

    if (!error && data?.length) {
      const byId = new Map(data.map((row) => [row.id, row]))
      return refs
        .map((ref) => byId.get(ref.experiment_id))
        .filter(Boolean)
        .map(mapPublicExperimentSummary)
        .filter(Boolean)
    }
  }

  const { data, error } = await supabase
    .from('lab_experiments')
    .select(LEGACY_EXP_SELECT)
    .eq('pack_slug', packSlug)
    .eq('status', 'live')
    .order('sort_order')

  if (error) throw new Error(error.message)

  return (data || []).map(mapPublicExperimentSummary).filter(Boolean)
}

/** Direct Supabase read for a single experiment inside a lab pack (API fallback). */
export async function fetchLabExperimentPublic(packSlug, experimentSlug, { includeSteps = false } = {}) {
  const { supabase, isSupabaseConfigured } = await import('./supabase')
  if (!isSupabaseConfigured) return null

  const { data: refs } = await supabase
    .from('lab_pack_experiment_refs')
    .select('experiment_id, sort_order')
    .eq('pack_slug', packSlug)
    .order('sort_order')

  if (refs?.length) {
    const ids = refs.map((r) => r.experiment_id)
    const select = includeSteps ? LIBRARY_EXP_WITH_STEPS : LIBRARY_EXP_SELECT
    const { data, error } = await supabase
      .from('ioai_experiments')
      .select(select)
      .in('id', ids)
      .eq('slug', experimentSlug)
      .neq('status', 'hidden')
      .maybeSingle()

    if (!error && data) {
      const inPack = refs.some((r) => r.experiment_id === data.id)
      if (inPack) return mapPublicExperimentDetail(data, { includeSteps })
    }
  }

  const select = includeSteps ? LEGACY_EXP_WITH_STEPS : LEGACY_EXP_SELECT
  const { data, error } = await supabase
    .from('lab_experiments')
    .select(select)
    .eq('pack_slug', packSlug)
    .eq('slug', experimentSlug)
    .neq('status', 'hidden')
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!data) return null
  return mapPublicExperimentDetail(data, { includeSteps })
}

/** Load L1 pack metadata from courses_catalog when API payload is incomplete */
export async function fetchLabPackCatalogPublic(packSlug) {
  const { supabase, isSupabaseConfigured } = await import('./supabase')
  if (!isSupabaseConfigured) return null

  const { data, error } = await supabase
    .from('courses_catalog')
    .select(
      'slug, line, sub, name, name_en, description, hours, audience, outcomes, price, price_cents, currency, purchasable, materials_list'
    )
    .eq('slug', packSlug)
    .maybeSingle()

  if (error || !data) return null

  return {
    slug: data.slug,
    line: data.line,
    sub: data.sub,
    name: data.name,
    nameEn: data.name_en || data.name,
    description: data.description || '',
    hours: data.hours || '',
    audience: data.audience || '',
    outcomes: data.outcomes || [],
    price: data.price || '',
    priceCents: data.price_cents ?? null,
    currency: data.currency || 'usd',
    purchasable: data.purchasable ?? null,
    materialsList: Array.isArray(data.materials_list) ? data.materials_list : [],
  }
}

async function labAuthFetch(path) {
  const { supabase, isSupabaseConfigured } = await import('./supabase')
  const headers = { Accept: 'application/json' }
  if (isSupabaseConfigured) {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (session?.access_token) {
      headers.Authorization = `Bearer ${session.access_token}`
    }
  }
  const res = await fetch(path, { headers })
  const body = await parseJsonResponse(res)
  if (!res.ok) throw new Error(body.error || `Request failed (${res.status})`)
  return body
}

export async function fetchLabExperiment(packSlug, experimentSlug, { includeSteps = false } = {}) {
  try {
    return await labAuthFetch(
      `/api/labs/${encodeURIComponent(packSlug)}/experiments/${encodeURIComponent(experimentSlug)}`
    )
  } catch (apiErr) {
    const experiment = await fetchLabExperimentPublic(packSlug, experimentSlug, { includeSteps })
    if (!experiment) throw apiErr
    return { experiment, owned: false, previewUnlocked: false, fallback: true }
  }
}

async function adminFetch(path, options = {}) {
  const { authFetch } = await import('./checkout')
  return authFetch(path, options)
}

export async function fetchAdminLabPackExperiments(packSlug) {
  return adminFetch(`/api/admin/lab-packs/${encodeURIComponent(packSlug)}/experiments`)
}

export async function saveLabExperiment(packSlug, payload, { id } = {}) {
  if (id) {
    return adminFetch(`/api/admin/lab-experiments/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify({ ...payload, pack_slug: packSlug }),
    })
  }
  return adminFetch(`/api/admin/lab-packs/${encodeURIComponent(packSlug)}/experiments`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function deleteLabExperiment(id) {
  return adminFetch(`/api/admin/lab-experiments/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export async function saveLabStep(experimentId, payload, { id } = {}) {
  if (id) {
    return adminFetch(`/api/admin/lab-experiment-steps/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  }
  return adminFetch(`/api/admin/lab-experiments/${encodeURIComponent(experimentId)}/steps`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function deleteLabStep(id) {
  return adminFetch(`/api/admin/lab-experiment-steps/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export async function reorderLabExperiments(packSlug, orderedIds) {
  return adminFetch(`/api/admin/lab-packs/${encodeURIComponent(packSlug)}/experiments/reorder`, {
    method: 'POST',
    body: JSON.stringify({ orderedIds }),
  })
}

export async function reorderLabSteps(experimentId, orderedIds) {
  return adminFetch(`/api/admin/lab-experiments/${encodeURIComponent(experimentId)}/steps/reorder`, {
    method: 'POST',
    body: JSON.stringify({ orderedIds }),
  })
}

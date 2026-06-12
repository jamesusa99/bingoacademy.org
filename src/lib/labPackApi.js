export async function fetchLabPack(packSlug) {
  const res = await fetch(`/api/labs/${encodeURIComponent(packSlug)}`)
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body.error || `Failed to load lab pack (${res.status})`)
  return body.pack
}

/** Public read fallback when API pack payload has no experiments yet. */
export async function fetchLabPackExperimentsPublic(packSlug) {
  const { supabase, isSupabaseConfigured } = await import('./supabase')
  if (!isSupabaseConfigured) return []

  const { data, error } = await supabase
    .from('lab_experiments')
    .select('id, slug, title, content, purpose, sort_order, status, steps:lab_experiment_steps(count)')
    .eq('pack_slug', packSlug)
    .eq('status', 'live')
    .order('sort_order')

  if (error) throw new Error(error.message)

  return (data || []).map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    content: row.content || '',
    purpose: row.purpose || '',
    sortOrder: row.sort_order ?? 0,
    stepCount: Array.isArray(row.steps) && row.steps[0]?.count != null ? row.steps[0].count : 0,
  }))
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
  const headers = { 'Content-Type': 'application/json' }
  if (isSupabaseConfigured) {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (session?.access_token) {
      headers.Authorization = `Bearer ${session.access_token}`
    }
  }
  const res = await fetch(path, { headers })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body.error || `Request failed (${res.status})`)
  return body
}

export async function fetchLabExperiment(packSlug, experimentSlug) {
  return labAuthFetch(
    `/api/labs/${encodeURIComponent(packSlug)}/experiments/${encodeURIComponent(experimentSlug)}`
  )
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

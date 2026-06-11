export async function fetchLabPack(packSlug) {
  const res = await fetch(`/api/labs/${encodeURIComponent(packSlug)}`)
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body.error || `Failed to load lab pack (${res.status})`)
  return body.pack
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

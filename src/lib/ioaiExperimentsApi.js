import { adminFetch } from './admin/api'

export async function fetchPublicExperimentLibrary() {
  const res = await fetch('/api/ioai/experiment-library')
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body.error || res.statusText)
  return body
}

export async function fetchLessonResources(catalogSlug) {
  const res = await fetch(`/api/ioai/lessons/${encodeURIComponent(catalogSlug)}/resources`)
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body.error || res.statusText)
  return body
}

export async function fetchPublicExperiment(slug, { lesson, pack, context = 'lesson' } = {}) {
  const params = new URLSearchParams({ context })
  if (lesson) params.set('lesson', lesson)
  if (pack) params.set('pack', pack)
  const res = await fetch(`/api/ioai/experiments/${encodeURIComponent(slug)}?${params}`)
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body.error || res.statusText)
  return body
}

export function adminListExperiments() {
  return adminFetch('/api/admin/ioai/experiments')
}

export function adminGetExperiment(id) {
  return adminFetch(`/api/admin/ioai/experiments/${encodeURIComponent(id)}`)
}

export function adminSaveExperiment(payload, id = null) {
  return adminFetch(`/api/admin/ioai/experiments${id ? `/${encodeURIComponent(id)}` : ''}`, {
    method: id ? 'PUT' : 'POST',
    body: JSON.stringify(payload),
  })
}

export function adminDeleteExperiment(id) {
  return adminFetch(`/api/admin/ioai/experiments/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export function adminCopyExperiment(id) {
  return adminFetch(`/api/admin/ioai/experiments/${encodeURIComponent(id)}/copy`, { method: 'POST' })
}

export function adminReorderExperiments(orderedIds) {
  return adminFetch('/api/admin/ioai/experiments/reorder', {
    method: 'POST',
    body: JSON.stringify({ orderedIds }),
  })
}

export function adminSaveExperimentStep(experimentId, step, stepId = null) {
  const url = stepId
    ? `/api/admin/ioai/experiments/${experimentId}/steps/${stepId}`
    : `/api/admin/ioai/experiments/${experimentId}/steps`
  return adminFetch(url, {
    method: stepId ? 'PUT' : 'POST',
    body: JSON.stringify(step),
  })
}

export function adminDeleteExperimentStep(experimentId, stepId) {
  return adminFetch(`/api/admin/ioai/experiments/${experimentId}/steps/${stepId}`, { method: 'DELETE' })
}

export function adminFetchLessonResources(lessonId) {
  return adminFetch(`/api/admin/lessons/${encodeURIComponent(lessonId)}/resources`)
}

export function adminSaveLessonExperimentBindings(lessonId, bindings) {
  return adminFetch(`/api/admin/lessons/${encodeURIComponent(lessonId)}/experiment-bindings`, {
    method: 'PUT',
    body: JSON.stringify({ bindings }),
  })
}

export function adminSaveLessonMaterials(lessonId, materials) {
  return adminFetch(`/api/admin/lessons/${encodeURIComponent(lessonId)}/materials`, {
    method: 'PUT',
    body: JSON.stringify({ materials }),
  })
}

export function adminSavePackExperimentRefs(packSlug, experimentIds) {
  return adminFetch(`/api/admin/lab-packs/${encodeURIComponent(packSlug)}/experiment-refs`, {
    method: 'PUT',
    body: JSON.stringify({ experimentIds }),
  })
}

export function adminListLabBundles() {
  return adminFetch('/api/admin/ioai/lab-bundles')
}

export function adminSaveLabBundle(payload, id = null) {
  return adminFetch(`/api/admin/ioai/lab-bundles${id ? `/${encodeURIComponent(id)}` : ''}`, {
    method: id ? 'PUT' : 'POST',
    body: JSON.stringify(payload),
  })
}

export async function fetchMyLabPacks() {
  const { supabase } = await import('./supabase')
  const { data: { session } } = await supabase.auth.getSession()
  const res = await fetch('/api/me/lab-packs', {
    headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {},
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body.error || res.statusText)
  return body
}

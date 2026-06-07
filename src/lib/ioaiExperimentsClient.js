import { authFetch } from './checkout'
import { adminFetch } from './admin/api'

export async function fetchIoaiExperiments() {
  const res = await fetch('/api/ioai/experiments')
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body.error || 'Failed to load experiments')
  return body.experiments || []
}

export async function fetchIoaiLabPacks() {
  const res = await fetch('/api/ioai/lab-packs')
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body.error || 'Failed to load lab packs')
  return body.packs || []
}

export async function fetchIoaiLabPack(slug) {
  const res = await fetch(`/api/ioai/lab-packs/${encodeURIComponent(slug)}`)
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body.error || 'Lab pack not found')
  return body
}

export async function fetchLessonLabContent(lessonSlug) {
  const res = await fetch(`/api/ioai/lessons/${encodeURIComponent(lessonSlug)}/labs`)
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body.error || 'Failed to load lesson labs')
  return body
}

export async function fetchMyIoaiLabAccess() {
  return authFetch('/api/me/ioai-lab-access')
}

export async function adminFetchExperiments() {
  return adminFetch('/api/admin/ioai/experiments')
}

export async function adminCreateExperiment(payload) {
  return adminFetch('/api/admin/ioai/experiments', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function adminUpdateExperiment(id, payload) {
  return adminFetch(`/api/admin/ioai/experiments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export async function adminDeleteExperiment(id) {
  return adminFetch(`/api/admin/ioai/experiments/${id}`, { method: 'DELETE' })
}

export async function adminFetchLessonExperiments(lessonId) {
  return adminFetch(`/api/admin/ioai/lessons/${lessonId}/experiments`)
}

export async function adminSaveLessonExperiments(lessonId, { bindings, materials }) {
  return adminFetch(`/api/admin/ioai/lessons/${lessonId}/experiments`, {
    method: 'PUT',
    body: JSON.stringify({ bindings, materials }),
  })
}

export async function adminFetchLabPacks() {
  return adminFetch('/api/admin/ioai/lab-packs')
}

export async function adminFetchLabPack(slug) {
  return adminFetch(`/api/admin/ioai/lab-packs/${encodeURIComponent(slug)}`)
}

export async function adminSaveLabPack(payload) {
  const isUpdate = Boolean(payload.pack?.id)
  const path = isUpdate ? `/api/admin/ioai/lab-packs/${payload.pack.id}` : '/api/admin/ioai/lab-packs'
  return adminFetch(path, {
    method: isUpdate ? 'PUT' : 'POST',
    body: JSON.stringify(payload),
  })
}

export async function adminDeleteLabPack(id) {
  return adminFetch(`/api/admin/ioai/lab-packs/${id}`, { method: 'DELETE' })
}

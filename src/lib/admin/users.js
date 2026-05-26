import { adminFetch } from './api'

export async function fetchAdminUsers({ q = '', role = '', status = '', page = 1, perPage = 25 } = {}) {
  const params = new URLSearchParams()
  if (q) params.set('q', q)
  if (role) params.set('role', role)
  if (status) params.set('status', status)
  params.set('page', String(page))
  params.set('perPage', String(perPage))
  return adminFetch(`/api/admin/users?${params}`)
}

export async function fetchAdminUser(id) {
  return adminFetch(`/api/admin/users/${id}`)
}

export async function updateAdminUser(id, payload) {
  return adminFetch(`/api/admin/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

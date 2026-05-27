import { adminFetch } from './api'

export async function saveCatalogCourse(payload) {
  return adminFetch('/api/admin/courses-catalog', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function deleteCatalogCourse(slug) {
  return adminFetch(`/api/admin/courses-catalog/${encodeURIComponent(slug)}`, {
    method: 'DELETE',
  })
}

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

export async function reorderCatalogCourses(items) {
  return adminFetch('/api/admin/courses-catalog/reorder', {
    method: 'POST',
    body: JSON.stringify({ items }),
  })
}

/** Reorder a scoped subset of catalog rows while preserving global positions of other rows. */
export async function reorderScopedCatalogItems(allItems, reorderedScopedItems) {
  const sortByOrder = (rows) => [...rows].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
  const sorted = sortByOrder(allItems)
  const scopeSet = new Set(reorderedScopedItems.map((row) => row.slug))
  const positions = sorted.map((row, index) => (scopeSet.has(row.slug) ? index : -1)).filter((i) => i >= 0)

  if (positions.length !== reorderedScopedItems.length) {
    throw new Error('Reorder scope mismatch')
  }

  const merged = [...sorted]
  reorderedScopedItems.forEach((row, idx) => {
    merged[positions[idx]] = row
  })

  await reorderCatalogCourses(merged.map((row, sort_order) => ({ slug: row.slug, sort_order })))
}

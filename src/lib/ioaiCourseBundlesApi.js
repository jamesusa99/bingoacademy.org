export async function fetchIoaiCourseBundles() {
  const res = await fetch('/api/ioai/course-bundles')
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body.error || `Failed to load course bundles (${res.status})`)
  return body.bundles || []
}

function adminFetchForLine(productLine, path, options) {
  return import('./admin/api').then(({ adminFetch }) =>
    adminFetch(`/api/admin/${productLine}/course-bundles${path}`, options)
  )
}

export function adminListProgramCourseBundles(productLine) {
  return adminFetchForLine(productLine, '')
}

export function adminUpdateProgramCourseBundle(productLine, id, payload) {
  return adminFetchForLine(productLine, `/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function adminSyncProgramCourseBundleModules(productLine, id, levelSlug) {
  return adminFetchForLine(productLine, `/${encodeURIComponent(id)}/sync-modules`, {
    method: 'POST',
    body: JSON.stringify({ levelSlug }),
  })
}

export function adminEnsureProgramCourseBundles(productLine) {
  return adminFetchForLine(productLine, '/ensure', { method: 'POST' })
}

/** @deprecated use adminListProgramCourseBundles('ioai') */
export function adminListIoaiCourseBundles() {
  return adminListProgramCourseBundles('ioai')
}

/** @deprecated use adminUpdateProgramCourseBundle('ioai', ...) */
export function adminUpdateIoaiCourseBundle(id, payload) {
  return adminUpdateProgramCourseBundle('ioai', id, payload)
}

/** @deprecated use adminSyncProgramCourseBundleModules('ioai', ...) */
export function adminSyncIoaiCourseBundleModules(id, levelSlug) {
  return adminSyncProgramCourseBundleModules('ioai', id, levelSlug)
}

/** @deprecated use adminEnsureProgramCourseBundles('ioai') */
export function adminEnsureIoaiCourseBundles() {
  return adminEnsureProgramCourseBundles('ioai')
}

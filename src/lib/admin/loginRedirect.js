const ADMIN_LOGIN = '/admin/login'

/** Safe internal admin path for post-login redirect */
export function sanitizeAdminNextPath(path) {
  if (typeof path !== 'string' || !path.startsWith('/admin')) return '/admin'
  if (path.startsWith('/admin/login')) return '/admin'
  return path
}

export function adminLoginPath(nextPath) {
  const next = sanitizeAdminNextPath(nextPath)
  if (next === '/admin') return ADMIN_LOGIN
  return `${ADMIN_LOGIN}?next=${encodeURIComponent(next)}`
}

export function readAdminLoginNext(location) {
  const fromState = location.state?.from
  if (fromState) return sanitizeAdminNextPath(fromState)

  const params = new URLSearchParams(location.search)
  const fromQuery = params.get('next')
  if (fromQuery) return sanitizeAdminNextPath(fromQuery)

  return '/admin'
}

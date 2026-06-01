/** Safe post-login redirect (internal paths only) */

export const POST_LOGIN_REDIRECT_KEY = 'bingo-auth-redirect'

export function safeRedirectPath(path, fallback = '/profile') {
  if (typeof path !== 'string' || !path.startsWith('/') || path.startsWith('//')) {
    return fallback
  }
  return path
}

export function storePostLoginRedirect(path) {
  const safe = safeRedirectPath(path, '')
  if (safe) {
    try {
      sessionStorage.setItem(POST_LOGIN_REDIRECT_KEY, safe)
    } catch {
      /* ignore quota / private mode */
    }
  }
}

export function consumePostLoginRedirect(fallback = '/profile') {
  try {
    const stored = sessionStorage.getItem(POST_LOGIN_REDIRECT_KEY)
    sessionStorage.removeItem(POST_LOGIN_REDIRECT_KEY)
    return safeRedirectPath(stored, fallback)
  } catch {
    return fallback
  }
}

export function authLink(path, redirectTo) {
  const base = path.startsWith('/') ? path : `/${path}`
  if (!redirectTo) return base
  const safe = safeRedirectPath(redirectTo, '')
  if (!safe) return base
  return `${base}?redirect=${encodeURIComponent(safe)}`
}

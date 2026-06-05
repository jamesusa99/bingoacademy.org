/** Auth storage: localStorage + cookie mirror so PKCE verifiers survive email-link navigations in the same browser. */

const COOKIE_MAX_AGE_SEC = 60 * 60 * 24 // 24h — covers password-reset email delay

function cookieName(key) {
  return encodeURIComponent(key)
}

function readCookie(key) {
  if (typeof document === 'undefined') return null
  const encoded = cookieName(key)
  const parts = document.cookie.split('; ')
  for (const part of parts) {
    if (part.startsWith(`${encoded}=`)) {
      return decodeURIComponent(part.slice(encoded.length + 1))
    }
  }
  return null
}

function writeCookie(key, value) {
  if (typeof document === 'undefined') return
  const secure = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${cookieName(key)}=${encodeURIComponent(value)}; path=/; max-age=${COOKIE_MAX_AGE_SEC}; SameSite=Lax${secure}`
}

function deleteCookie(key) {
  if (typeof document === 'undefined') return
  document.cookie = `${cookieName(key)}=; path=/; max-age=0`
}

export const dualAuthStorage = {
  getItem(key) {
    try {
      const fromLocal = localStorage.getItem(key)
      if (fromLocal != null) return fromLocal
    } catch {
      /* private mode */
    }
    return readCookie(key)
  },
  setItem(key, value) {
    try {
      localStorage.setItem(key, value)
    } catch {
      /* private mode */
    }
    writeCookie(key, value)
  },
  removeItem(key) {
    try {
      localStorage.removeItem(key)
    } catch {
      /* ignore */
    }
    deleteCookie(key)
  },
}

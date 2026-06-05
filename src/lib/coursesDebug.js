/** Show catalog/access debug panel on /courses */
export function isCoursesDebugEnabled(searchParams) {
  if (import.meta.env.DEV) return true
  if (import.meta.env.VITE_COURSES_DEBUG === 'true') return true
  return searchParams?.get('debug') === '1'
}

export function supabaseProjectRef(url) {
  if (!url || typeof url !== 'string') return 'not configured'
  try {
    const host = new URL(url).hostname
    return host.replace(/\.supabase\.co$/, '') || host
  } catch {
    return url.slice(0, 32)
  }
}

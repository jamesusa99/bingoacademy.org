import { getSupabaseAdmin } from './supabaseAdmin.mjs'

/** Any signed-in Supabase user (checkout, enrollments) */
export async function verifyAuthUser(req) {
  const admin = getSupabaseAdmin()
  if (!admin) {
    return { ok: false, status: 503, error: 'Supabase not configured on server' }
  }

  const token = (req.headers.authorization || '').startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : null
  if (!token) {
    return { ok: false, status: 401, error: 'Sign in required' }
  }

  const {
    data: { user },
    error,
  } = await admin.auth.getUser(token)
  if (error || !user) {
    return { ok: false, status: 401, error: 'Invalid session' }
  }

  return { ok: true, user, admin }
}

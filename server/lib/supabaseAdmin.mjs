import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export function getSupabaseAdmin() {
  if (!url || !serviceKey) return null
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export async function verifyAdminUser(req) {
  const admin = getSupabaseAdmin()
  if (!admin) {
    return { ok: false, status: 503, error: 'Supabase service role not configured' }
  }

  const secret = process.env.ADMIN_API_SECRET
  const authHeader = req.headers.authorization || ''
  if (secret && authHeader === `Bearer ${secret}`) {
    return { ok: true, user: { id: 'service', email: 'service@internal' }, via: 'secret' }
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!token) {
    return { ok: false, status: 401, error: 'Missing authorization' }
  }

  const {
    data: { user },
    error,
  } = await admin.auth.getUser(token)
  if (error || !user) {
    return { ok: false, status: 401, error: 'Invalid session' }
  }

  const { data: profile } = await admin.from('profiles').select('role, email').eq('id', user.id).maybeSingle()
  const allowlist = (process.env.ADMIN_EMAILS || process.env.VITE_ADMIN_EMAILS || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)

  const email = (user.email || '').toLowerCase()
  const roleOk = profile && ['admin', 'editor'].includes(profile.role)
  const allowOk = allowlist.length > 0 && allowlist.includes(email)

  if (!roleOk && !allowOk) {
    return { ok: false, status: 403, error: 'Admin access required' }
  }

  return { ok: true, user, profile, via: roleOk ? 'role' : 'allowlist' }
}

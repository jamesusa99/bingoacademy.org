import { supabase } from '../supabase'
import { isStaffRole, STAFF_ROLES } from './roles'

export { STAFF_ROLES, isStaffRole }

function parseAllowlist() {
  const raw = import.meta.env.VITE_ADMIN_EMAILS || ''
  return raw
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
}

/** @returns {Promise<{ isAdmin: boolean, profile: object | null, via: string | null }>} */
export async function resolveAdminAccess(user) {
  if (!user) {
    return { isAdmin: false, profile: null, via: null }
  }

  const allowlist = parseAllowlist()
  const email = (user.email || '').toLowerCase()

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, avatar_url')
    .eq('id', user.id)
    .maybeSingle()

  if (!error && profile && isStaffRole(profile.role)) {
    return { isAdmin: true, profile, via: 'role' }
  }

  if (allowlist.length > 0 && email && allowlist.includes(email)) {
    return {
      isAdmin: true,
      profile: profile || { id: user.id, email, role: 'admin', full_name: '' },
      via: 'allowlist',
    }
  }

  return { isAdmin: false, profile: profile || null, via: null }
}

export async function logAdminAction(action, resource, resourceId, meta = {}) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('admin_audit_log').insert({
    actor_id: user.id,
    actor_email: user.email,
    action,
    resource,
    resource_id: resourceId ? String(resourceId) : null,
    meta,
  })
}

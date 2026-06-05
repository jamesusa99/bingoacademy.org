import { supabase } from './supabase'

const PROFILE_FIELDS =
  'id, email, full_name, phone, avatar_url, locale, country, school, grade, parent_email, member_tier, created_at, updated_at'

const EDITABLE_KEYS = [
  'full_name',
  'phone',
  'avatar_url',
  'locale',
  'country',
  'school',
  'grade',
  'parent_email',
]

export async function fetchMyProfile(userId) {
  if (!userId) return { data: null, error: new Error('Not signed in') }
  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_FIELDS)
    .eq('id', userId)
    .maybeSingle()
  return { data, error }
}

export async function updateMyProfile(userId, patch) {
  if (!userId) return { data: null, error: new Error('Not signed in') }

  const allowed = { updated_at: new Date().toISOString() }
  for (const key of EDITABLE_KEYS) {
    if (patch[key] !== undefined) {
      allowed[key] = patch[key] === '' ? null : patch[key]
    }
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(allowed)
    .eq('id', userId)
    .select(PROFILE_FIELDS)
    .single()

  return { data, error }
}

export function profileDisplayName(profile, user) {
  return (
    profile?.full_name?.trim() ||
    user?.user_metadata?.full_name?.trim() ||
    user?.user_metadata?.name?.trim() ||
    profile?.email ||
    user?.email ||
    'User'
  )
}

export function profileInitials(profile, user) {
  const name = profileDisplayName(profile, user)
  return name.charAt(0).toUpperCase()
}

export function maskPhone(phone) {
  if (!phone) return ''
  const digits = phone.replace(/\D/g, '')
  if (digits.length >= 7) {
    return `${digits.slice(0, 3)}****${digits.slice(-4)}`
  }
  return phone
}

export function formatAccountId(id) {
  if (!id) return '—'
  const short = id.replace(/-/g, '').slice(0, 8).toUpperCase()
  return `BINGO-${short}`
}

export const MEMBER_TIER_LABELS = {
  free: 'Free Member',
  monthly: 'Monthly Member',
  quarterly: 'Quarterly Member',
  annual: 'Annual Member',
}

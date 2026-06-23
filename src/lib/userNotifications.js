import { supabase, isSupabaseConfigured } from './supabase'

const NOTIFICATION_FIELDS =
  'id, category, title, body, href, read_at, metadata, created_at'

export const NOTIFICATION_CATEGORIES = {
  announcement: { icon: '📢', label: 'Announcement' },
  order: { icon: '📦', label: 'Order' },
  course: { icon: '📚', label: 'Course' },
  community: { icon: '💬', label: 'Community' },
  system: { icon: '⚙️', label: 'System' },
}

export async function fetchMyNotifications(userId, { limit = 50 } = {}) {
  if (!isSupabaseConfigured || !userId) {
    return { data: [], error: new Error('Sign in required') }
  }

  const { data, error } = await supabase
    .from('user_notifications')
    .select(NOTIFICATION_FIELDS)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  return { data: data || [], error }
}

export async function markNotificationRead(userId, notificationId) {
  if (!isSupabaseConfigured || !userId || !notificationId) {
    return { error: new Error('Invalid request') }
  }

  const { error } = await supabase
    .from('user_notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', notificationId)
    .eq('user_id', userId)
    .is('read_at', null)

  return { error }
}

export async function markAllNotificationsRead(userId) {
  if (!isSupabaseConfigured || !userId) {
    return { error: new Error('Sign in required') }
  }

  const { error } = await supabase
    .from('user_notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', userId)
    .is('read_at', null)

  return { error }
}

export function isNotificationUnread(row) {
  return !row?.read_at
}

export function formatNotificationTime(iso) {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''

  const now = Date.now()
  const diffMs = now - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

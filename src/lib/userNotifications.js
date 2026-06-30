import { authFetch } from './checkout'

export const NOTIFICATION_CATEGORIES = {
  announcement: { icon: '📢', label: 'Announcement' },
  order: { icon: '📦', label: 'Order' },
  course: { icon: '📚', label: 'Course' },
  community: { icon: '💬', label: 'Community' },
  system: { icon: '⚙️', label: 'System' },
}

export async function fetchMyNotifications(_userId, { limit = 50 } = {}) {
  try {
    const body = await authFetch(`/api/me/notifications?limit=${limit}`)
    return { data: body.notifications || [], error: null }
  } catch (err) {
    return { data: [], error: err }
  }
}

export async function markNotificationRead(_userId, notificationId) {
  if (!notificationId) {
    return { error: new Error('Invalid request') }
  }

  try {
    await authFetch(`/api/me/notifications/${encodeURIComponent(notificationId)}/read`, {
      method: 'PATCH',
    })
    return { error: null }
  } catch (err) {
    return { error: err }
  }
}

export async function markAllNotificationsRead(_userId) {
  try {
    await authFetch('/api/me/notifications/mark-all-read', { method: 'POST' })
    return { error: null }
  } catch (err) {
    return { error: err }
  }
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

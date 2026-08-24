import { adminFetch } from './admin/api'
import { authFetch } from './checkout'

export async function fetchAdminChannels() {
  return adminFetch('/api/admin/channels')
}

export async function createAdminChannel(payload) {
  return adminFetch('/api/admin/channels', { method: 'POST', body: JSON.stringify(payload) })
}

export async function updateAdminChannel(id, payload) {
  return adminFetch(`/api/admin/channels/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export async function deleteAdminChannel(id) {
  return adminFetch(`/api/admin/channels/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export async function addAdminChannelMember(channelId, { email, role }) {
  return adminFetch(`/api/admin/channels/${encodeURIComponent(channelId)}/members`, {
    method: 'POST',
    body: JSON.stringify({ email, role }),
  })
}

export async function removeAdminChannelMember(channelId, userId) {
  return adminFetch(
    `/api/admin/channels/${encodeURIComponent(channelId)}/members/${encodeURIComponent(userId)}`,
    { method: 'DELETE' }
  )
}

export async function fetchAdminChannelPolicy() {
  return adminFetch('/api/admin/channel-policy')
}

export async function saveAdminChannelPolicy(payload) {
  return adminFetch('/api/admin/channel-policy', { method: 'PATCH', body: JSON.stringify(payload) })
}

export async function fetchAdminCommissionDashboard() {
  return adminFetch('/api/admin/commissions/dashboard')
}

export async function settleAdminPayout(id, action, adminNotes) {
  return adminFetch(`/api/admin/payouts/${encodeURIComponent(id)}/${encodeURIComponent(action)}`, {
    method: 'POST',
    body: JSON.stringify({ adminNotes }),
  })
}

export async function fetchChannelMe() {
  return authFetch('/api/channel/me')
}

export async function enrollPersonalChannel() {
  return authFetch('/api/channel/enroll', { method: 'POST', body: JSON.stringify({}) })
}

export async function fetchChannelDashboard(channelId) {
  const q = channelId ? `?channelId=${encodeURIComponent(channelId)}` : ''
  return authFetch(`/api/channel/dashboard${q}`)
}

export async function requestChannelPayout({ channelId, notes }) {
  return authFetch('/api/channel/payouts', {
    method: 'POST',
    body: JSON.stringify({ channelId, notes }),
  })
}

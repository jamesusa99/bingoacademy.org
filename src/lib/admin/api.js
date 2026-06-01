import { supabase } from '../supabase'

/**
 * Authenticated fetch to Railway / local Express admin API.
 * Sends the Supabase access token when a session exists.
 */
export async function adminFetch(path, options = {}) {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }

  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`
  }

  const res = await fetch(path, { ...options, headers })
  const text = await res.text()
  let body = null
  if (text) {
    try {
      body = JSON.parse(text)
    } catch {
      body = { raw: text }
    }
  }

  if (!res.ok) {
    let message = body?.error || body?.message || `Request failed (${res.status})`
    if (res.status === 405) {
      message =
        'Admin API is not available for this request (405). Run npm run dev locally, or deploy with api/server.js and set SUPABASE_SERVICE_ROLE_KEY on Vercel.'
    }
    const err = new Error(message)
    err.status = res.status
    err.body = body
    throw err
  }

  return body
}

export async function fetchAdminHealth() {
  return adminFetch('/api/admin/health')
}

export async function createStreamUploadUrl(payload) {
  return adminFetch('/api/admin/stream/upload-url', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function syncStreamVideo(payload) {
  return adminFetch('/api/admin/stream/sync', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function assignStreamToCourse(payload) {
  return adminFetch('/api/admin/stream/assign', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function importSiteData({ force = false } = {}) {
  return adminFetch('/api/admin/seed', {
    method: 'POST',
    body: JSON.stringify({ force }),
  })
}

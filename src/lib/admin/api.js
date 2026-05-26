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
    const err = new Error(body?.error || body?.message || `Request failed (${res.status})`)
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

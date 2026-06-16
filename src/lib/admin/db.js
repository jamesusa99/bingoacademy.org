import { adminFetch } from './api'
import { supabase, isSupabaseConfigured } from '../supabase'

const NOT_CONFIGURED =
  'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local, then restart npm run dev.'

function assertConfigured() {
  if (!isSupabaseConfigured) throw new Error(NOT_CONFIGURED)
}

function ensureRows(table, action, error, data) {
  if (error) throw new Error(error.message)
  if (!data?.length) {
    throw new Error(
      `No rows ${action} in "${table}". Refresh the page, confirm you are signed in as admin, and check Platform → health shows service role ready.`
    )
  }
  return data
}

async function cmsRequest(table, body) {
  return adminFetch(`/api/admin/cms/${encodeURIComponent(table)}`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

/** Use direct Supabase client when admin API is unavailable or lacks table allowlist. */
function shouldFallbackToClient(err) {
  if (!err?.status) return true
  if (err.status === 503 || err.status === 502) return true
  if (err.status === 400 && /table not allowed/i.test(err.message || '')) return true
  return false
}

async function clientInsert(table, payload) {
  const { data, error } = await supabase.from(table).insert(payload).select()
  return ensureRows(table, 'inserted', error, data)[0]
}

async function clientUpdate(table, id, payload) {
  const { data, error } = await supabase.from(table).update(payload).eq('id', id).select()
  return ensureRows(table, 'updated', error, data)[0]
}

async function clientDelete(table, id) {
  const { data, error } = await supabase.from(table).delete().eq('id', id).select()
  return ensureRows(table, 'deleted', error, data)[0]
}

/** Insert via admin API (service role); falls back to client if API unavailable */
export async function adminInsert(table, payload) {
  assertConfigured()
  try {
    const result = await cmsRequest(table, { action: 'insert', payload })
    return result.row
  } catch (err) {
    if (err.status === 403) {
      throw new Error(
        'Your account needs profiles.role = admin or editor to save changes. Ask an administrator to update your role.'
      )
    }
    if (!shouldFallbackToClient(err)) {
      throw err
    }
    return clientInsert(table, payload)
  }
}

/** Update via admin API (service role); falls back to client if API unavailable */
export async function adminUpdate(table, id, payload) {
  assertConfigured()
  if (!id) throw new Error('Missing record id')
  try {
    const result = await cmsRequest(table, { action: 'update', id, payload })
    return result.row
  } catch (err) {
    if (err.status === 403) {
      throw new Error(
        'Your account needs profiles.role = admin or editor to save changes. Ask an administrator to update your role.'
      )
    }
    if (!shouldFallbackToClient(err)) {
      throw err
    }
    return clientUpdate(table, id, payload)
  }
}

/** Delete via admin API (service role); falls back to client if API unavailable */
export async function adminDelete(table, id) {
  assertConfigured()
  if (!id) throw new Error('Missing record id')
  try {
    const result = await cmsRequest(table, { action: 'delete', id })
    return result.row
  } catch (err) {
    if (err.status === 403) {
      throw new Error(
        'Your account needs profiles.role = admin or editor to delete records. Ask an administrator to update your role.'
      )
    }
    if (!shouldFallbackToClient(err)) {
      throw err
    }
    return clientDelete(table, id)
  }
}

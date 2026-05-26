import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

/** Resolves like Supabase queries so existing `.then()` chains keep working without env vars. */
const emptyResponse = Promise.resolve({ data: [], error: null, count: 0 })

function createStubQuery() {
  const query = {
    select: () => query,
    insert: () => query,
    update: () => query,
    delete: () => query,
    upsert: () => query,
    eq: () => query,
    order: () => query,
    limit: () => query,
    single: () => query,
    maybeSingle: () => query,
    then(onFulfilled, onRejected) {
      return emptyResponse.then(onFulfilled, onRejected)
    },
    catch(onRejected) {
      return emptyResponse.catch(onRejected)
    },
  }
  return query
}

const authNotConfigured = { message: '[BingoAcademy] Supabase auth is not configured.' }

const stubAuth = {
  signInWithPassword: async () => ({
    data: { user: null, session: null },
    error: authNotConfigured,
  }),
  signUp: async () => ({
    data: { user: null, session: null },
    error: authNotConfigured,
  }),
  signInWithOAuth: async () => ({
    data: { provider: null, url: null },
    error: authNotConfigured,
  }),
  resetPasswordForEmail: async () => ({
    data: {},
    error: authNotConfigured,
  }),
  getSession: async () => ({ data: { session: null }, error: null }),
  signOut: async () => ({ error: null }),
  onAuthStateChange: () => ({
    data: { subscription: { unsubscribe: () => {} } },
  }),
}

const stubClient = {
  from: () => createStubQuery(),
  auth: stubAuth,
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : stubClient

if (!isSupabaseConfigured && import.meta.env.PROD) {
  console.warn(
    '[BingoAcademy] VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are not set. CMS data will use fallbacks; admin writes are disabled until env vars are configured.'
  )
}

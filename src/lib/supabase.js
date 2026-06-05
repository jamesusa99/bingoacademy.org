import { createClient } from '@supabase/supabase-js'
import { dualAuthStorage } from './authStorage'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

const stubWriteError = {
  message:
    '[BingoAcademy] Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local, then restart npm run dev.',
}

/** Resolves like Supabase queries so existing `.then()` chains keep working without env vars. */
function createStubQuery() {
  let operation = 'select'
  const query = {
    select: () => {
      operation = 'select'
      return query
    },
    insert: () => {
      operation = 'write'
      return query
    },
    update: () => {
      operation = 'write'
      return query
    },
    delete: () => {
      operation = 'write'
      return query
    },
    upsert: () => {
      operation = 'write'
      return query
    },
    eq: () => query,
    order: () => query,
    limit: () => query,
    single: () => query,
    maybeSingle: () => query,
    then(onFulfilled, onRejected) {
      const response =
        operation === 'select'
          ? { data: [], error: null, count: 0 }
          : { data: null, error: stubWriteError, count: null }
      return Promise.resolve(response).then(onFulfilled, onRejected)
    },
    catch(onRejected) {
      return this.then(undefined, onRejected)
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
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        // Implicit avoids PKCE verifier storage issues on email links / OAuth return URLs.
        flowType: 'implicit',
        detectSessionInUrl: true,
        persistSession: true,
        autoRefreshToken: true,
        storage: dualAuthStorage,
      },
    })
  : stubClient

if (!isSupabaseConfigured && import.meta.env.PROD) {
  console.warn(
    '[BingoAcademy] VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are not set. CMS data will use fallbacks; admin writes are disabled until env vars are configured.'
  )
}

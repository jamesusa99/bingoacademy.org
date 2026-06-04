import { supabase, isSupabaseConfigured } from './supabase'

const NOT_CONFIGURED =
  'Sign-in is not available yet. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.'

export function getAuthCallbackUrl() {
  return `${window.location.origin}/auth/callback`
}

export function getPasswordResetRedirectUrl() {
  return `${window.location.origin}/auth/callback?next=${encodeURIComponent('/reset-password')}`
}

/** Finish OAuth / email-confirm / recovery after redirect to /auth/callback */
export async function completeAuthFromUrl(searchParams) {
  if (!isSupabaseConfigured) {
    return { session: null, error: { message: NOT_CONFIGURED } }
  }

  const code = searchParams.get('code')
  if (code) {
    return supabase.auth.exchangeCodeForSession(code)
  }

  return supabase.auth.getSession()
}

export async function updatePassword(password) {
  if (!isSupabaseConfigured) {
    return { data: { user: null }, error: { message: NOT_CONFIGURED } }
  }
  return supabase.auth.updateUser({ password })
}

export async function signInWithEmail(email, password) {
  if (!isSupabaseConfigured) {
    return { data: { user: null, session: null }, error: { message: NOT_CONFIGURED } }
  }
  return supabase.auth.signInWithPassword({ email: email.trim(), password })
}

export async function signUpWithEmail(email, password) {
  if (!isSupabaseConfigured) {
    return { data: { user: null, session: null }, error: { message: NOT_CONFIGURED } }
  }
  return supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      emailRedirectTo: getAuthCallbackUrl(),
    },
  })
}

export async function signInWithGoogle() {
  if (!isSupabaseConfigured) {
    return { data: { provider: null, url: null }, error: { message: NOT_CONFIGURED } }
  }
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: getAuthCallbackUrl(),
      queryParams: { access_type: 'offline', prompt: 'consent' },
    },
  })
}

export async function sendPasswordReset(email) {
  if (!isSupabaseConfigured) {
    return { data: {}, error: { message: NOT_CONFIGURED } }
  }
  return supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: getPasswordResetRedirectUrl(),
  })
}

export async function getSession() {
  if (!isSupabaseConfigured) {
    return { data: { session: null }, error: null }
  }
  return supabase.auth.getSession()
}

export async function signOut() {
  if (!isSupabaseConfigured) {
    return { error: null }
  }
  return supabase.auth.signOut()
}

export function onAuthStateChange(callback) {
  if (!isSupabaseConfigured) {
    return { data: { subscription: { unsubscribe: () => {} } } }
  }
  return supabase.auth.onAuthStateChange(callback)
}

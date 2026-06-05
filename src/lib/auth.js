import { supabase, isSupabaseConfigured } from './supabase'

const NOT_CONFIGURED =
  'Sign-in is not available yet. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.'

export function getAuthCallbackUrl() {
  return `${window.location.origin}/auth/callback`
}

/** Password-reset links should land here (not /auth/callback) so recovery can finish before the login gate. */
export function getPasswordResetRedirectUrl() {
  return `${window.location.origin}/reset-password`
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** True when the URL may carry a password-recovery or auth handoff (query or hash). */
export function hasRecoveryParams(searchParams) {
  if (searchParams?.get('token_hash') && searchParams.get('type') === 'recovery') return true
  if (searchParams?.get('code')) return true
  if (typeof window === 'undefined') return false
  const hash = window.location.hash
  return hash.includes('access_token=') || hash.includes('type=recovery')
}

/** Remove sensitive tokens from the address bar after a successful handoff. */
export function clearRecoveryParamsFromUrl() {
  if (typeof window === 'undefined') return
  window.history.replaceState(null, '', window.location.pathname)
}

/**
 * Wait for Supabase detectSessionInUrl to finish (PKCE code or implicit hash).
 * Do NOT call exchangeCodeForSession here — the client already does that on init,
 * and a second call removes the verifier and throws "PKCE code verifier not found".
 */
async function waitForAuthHandoff(maxWaitMs = 6000) {
  const { data: initial, error: initialError } = await supabase.auth.getSession()
  if (initial.session) {
    return { data: { session: initial.session, user: initial.session.user }, error: null }
  }

  return new Promise((resolve) => {
    let settled = false

    const finish = async (session, error = null) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      subscription.unsubscribe()
      if (session) {
        resolve({ data: { session, user: session.user }, error: null })
        return
      }
      const { data, error: lastError } = await supabase.auth.getSession()
      resolve({
        data: { session: data.session, user: data.session?.user ?? null },
        error: data.session ? null : error || lastError || initialError,
      })
    }

    const timer = setTimeout(() => finish(null), maxWaitMs)

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED')) {
        finish(session)
      }
    })
  })
}

/** Establish a recovery session from email link params (token_hash or URL handoff). */
export async function establishRecoverySession(searchParams) {
  if (!isSupabaseConfigured) {
    return { data: { session: null, user: null }, error: { message: NOT_CONFIGURED } }
  }

  const tokenHash = searchParams?.get('token_hash')
  const type = searchParams?.get('type')

  if (tokenHash && type === 'recovery') {
    return supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'recovery' })
  }

  if (hasRecoveryParams(searchParams)) {
    return waitForAuthHandoff()
  }

  return { data: { session: null, user: null }, error: null }
}

/** Finish OAuth / email-confirm after redirect to /auth/callback */
export async function completeAuthFromUrl(searchParams) {
  if (!isSupabaseConfigured) {
    return { data: { session: null, user: null }, error: { message: NOT_CONFIGURED } }
  }

  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  if (tokenHash && type === 'recovery') {
    return supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'recovery' })
  }

  const hasHandoff =
    searchParams.get('code') ||
    (typeof window !== 'undefined' && window.location.hash.includes('access_token='))

  if (hasHandoff) {
    return waitForAuthHandoff()
  }

  const { data, error } = await supabase.auth.getSession()
  return { data: { session: data.session, user: data.session?.user ?? null }, error }
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

export function formatAuthError(error) {
  if (!error?.message) return 'Something went wrong. Please try again.'

  let msg = error.message
  try {
    const parsed = JSON.parse(msg)
    if (parsed.msg) msg = parsed.msg
  } catch {
    /* plain string */
  }

  if (/provider is not enabled/i.test(msg)) {
    return (
      'Google sign-in is not enabled for this site yet. In Supabase go to Authentication → Providers → Google, ' +
      'turn it on, and paste a Google Cloud OAuth Client ID and secret. See .env.example for redirect URI details.'
    )
  }

  if (/pkce code verifier not found/i.test(msg)) {
    return (
      'This sign-in link was opened in a different browser or tab than where you started. ' +
      'Go back to the site, start sign-in again, and complete it in the same browser without clearing cookies.'
    )
  }

  return msg
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

export const PASSWORD_RESET_EMAIL_TEMPLATE_HINT =
  'Use a reset link with token_hash in Supabase → Authentication → Email Templates → Reset password: ' +
  '<a href="{{ .SiteURL }}/reset-password?token_hash={{ .TokenHash }}&type=recovery">Reset password</a>'

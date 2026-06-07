import { supabase, isSupabaseConfigured } from './supabase'

export class AuthRequiredError extends Error {
  constructor(message = 'Sign in required') {
    super(message)
    this.name = 'AuthRequiredError'
  }
}

export async function authFetch(path, options = {}) {
  if (!isSupabaseConfigured) {
    throw new Error('Sign-in is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
  }

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
  const body = await res.json().catch(() => ({}))
  if (res.status === 401) {
    throw new AuthRequiredError(body.error || 'Sign in required')
  }
  if (!res.ok) {
    throw new Error(body.error || `Request failed (${res.status})`)
  }
  return body
}

export async function fetchPaymentsConfig() {
  const res = await fetch('/api/payments/config')
  return res.json()
}

export async function fetchMyEnrollments() {
  return authFetch('/api/me/enrollments')
}

export async function startCourseCheckout({ courseSlug, purchaseType, returnPath, addonSlugs = [] }) {
  return authFetch('/api/checkout/course', {
    method: 'POST',
    body: JSON.stringify({ courseSlug, purchaseType, returnPath, addonSlugs }),
  })
}

export async function startMallCheckout({ items }) {
  return authFetch('/api/checkout/mall', {
    method: 'POST',
    body: JSON.stringify({ items }),
  })
}

export async function startIOAIMasterclassCheckout() {
  return authFetch('/api/checkout', {
    method: 'POST',
    body: JSON.stringify({
      courseSlug: 'ioai-competition-system',
      purchaseType: 'ioai_track',
      returnPath: '/curriculum',
    }),
  })
}

export async function fetchVideoStreamToken({ cloudflareVideoId, lessonSlug }) {
  return authFetch('/api/video/token', {
    method: 'POST',
    body: JSON.stringify({ cloudflareVideoId, lessonSlug }),
  })
}

export async function confirmCheckoutSession(sessionId) {
  return authFetch('/api/checkout/confirm', {
    method: 'POST',
    body: JSON.stringify({ sessionId }),
  })
}

export async function resetMyEnrollments() {
  return authFetch('/api/me/enrollments', { method: 'DELETE' })
}

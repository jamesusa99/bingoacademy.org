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

export async function fetchMyOrders() {
  return authFetch('/api/me/orders')
}

async function checkoutJson(path, body) {
  const headers = { 'Content-Type': 'application/json' }
  if (isSupabaseConfigured) {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (session?.access_token) {
      headers.Authorization = `Bearer ${session.access_token}`
    }
  }

  const res = await fetch(path, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
  const payload = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(payload.error || `Request failed (${res.status})`)
  }
  return payload
}

export async function fetchCheckoutQuote({ courseSlug, purchaseType, addonSlugs = [] }) {
  return checkoutJson('/api/checkout/quote', { courseSlug, purchaseType, addonSlugs })
}

export async function fetchCheckoutQuotes(items) {
  const body = await checkoutJson('/api/checkout/quotes', { items })
  return body.quotes || []
}

export async function startCourseCheckout({ courseSlug, purchaseType, returnPath, addonSlugs = [], promoCode }) {
  return authFetch('/api/checkout/course', {
    method: 'POST',
    body: JSON.stringify({ courseSlug, purchaseType, returnPath, addonSlugs, promoCode }),
  })
}

export async function startMallCheckout({ items, promoCode }) {
  return authFetch('/api/checkout/mall', {
    method: 'POST',
    body: JSON.stringify({ items, promoCode }),
  })
}

export async function startIOAIMasterclassCheckout({ promoCode } = {}) {
  return authFetch('/api/checkout', {
    method: 'POST',
    body: JSON.stringify({
      courseSlug: 'ioai-competition-system',
      purchaseType: 'ioai_track',
      returnPath: '/curriculum',
      promoCode,
    }),
  })
}

export async function fetchVideoStreamToken({ cloudflareVideoId, lessonSlug, adminPreview = false }) {
  const headers = { 'Content-Type': 'application/json' }
  if (isSupabaseConfigured) {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (session?.access_token) {
      headers.Authorization = `Bearer ${session.access_token}`
    }
  }

  const res = await fetch('/api/video/token', {
    method: 'POST',
    headers,
    body: JSON.stringify({ cloudflareVideoId, lessonSlug, adminPreview }),
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(body.error || `Request failed (${res.status})`)
  }
  return body
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

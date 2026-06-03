import { supabase } from './supabase'

async function authFetch(path, options = {}) {
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

export async function startCourseCheckout({ courseSlug, purchaseType }) {
  return authFetch('/api/checkout/course', {
    method: 'POST',
    body: JSON.stringify({ courseSlug, purchaseType }),
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

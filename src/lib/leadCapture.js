const LEAD_STORAGE_KEY = 'bingo-marketing-leads-local'

function readUtmParams() {
  if (typeof window === 'undefined') return {}
  const params = new URLSearchParams(window.location.search)
  const utm = {}
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']) {
    const value = params.get(key)
    if (value) utm[key] = value
  }
  return utm
}

function persistLocalLead(entry) {
  try {
    const raw = localStorage.getItem(LEAD_STORAGE_KEY)
    const list = raw ? JSON.parse(raw) : []
    localStorage.setItem(LEAD_STORAGE_KEY, JSON.stringify([...list, entry]))
  } catch {
    /* ignore */
  }
}

export async function submitMarketingLead({ email, source, campaign, name = '' }) {
  const trimmed = email?.trim()
  if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    throw new Error('Please enter a valid email address')
  }

  const payload = {
    email: trimmed,
    name: name?.trim() || null,
    source: source || 'unknown',
    campaign: campaign || null,
    utm: readUtmParams(),
    page: typeof window !== 'undefined' ? window.location.pathname : null,
  }

  persistLocalLead({ ...payload, submittedAt: Date.now() })

  const res = await fetch('/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(body.error || 'Could not submit — try again')
  }

  return body
}

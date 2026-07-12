import { getConversionAttribution, readCurrentUtms, trackConversion } from './analytics'

const LEAD_STORAGE_KEY = 'bingo-marketing-leads-local'

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

  const attribution = getConversionAttribution()
  const payload = {
    email: trimmed,
    name: name?.trim() || null,
    source: source || 'unknown',
    campaign: campaign || null,
    utm: { ...attribution.utm, ...readCurrentUtms() },
    page: typeof window !== 'undefined' ? window.location.pathname : null,
    attribution,
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

  trackConversion('lead', { source: payload.source, campaign: payload.campaign })

  return body
}

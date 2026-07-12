import { AI_CHANNEL_DEFS, ORGANIC_SEARCH_HOSTS } from '../../config/measurement/aiChannels.js'

const SESSION_KEY = 'bingo-attribution-session'
const FIRST_TOUCH_KEY = 'bingo-attribution-first-touch'
const SESSION_ID_KEY = 'bingo-analytics-session-id'
const TOUCH_TTL_MS = 30 * 24 * 60 * 60 * 1000

function readQueryUtms() {
  if (typeof window === 'undefined') return {}
  const params = new URLSearchParams(window.location.search)
  const utm = {}
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']) {
    const value = params.get(key)
    if (value) utm[key] = value
  }
  return utm
}

function hostFromUrl(url) {
  if (!url) return ''
  try {
    return new URL(url).hostname.replace(/^www\./, '').toLowerCase()
  } catch {
    return ''
  }
}

function matchList(value, list) {
  const v = (value || '').toLowerCase()
  return list.some((item) => v === item || v.includes(item))
}

export function classifyChannel({ utm = {}, referrer = '' } = {}) {
  const source = (utm.utm_source || '').toLowerCase()
  const medium = (utm.utm_medium || '').toLowerCase()
  const refHost = hostFromUrl(referrer)

  for (const [channelId, def] of Object.entries(AI_CHANNEL_DEFS)) {
    if (matchList(source, def.utmSources) || matchList(refHost, def.referrerHosts)) {
      return channelId
    }
  }

  if (medium === 'organic' || ORGANIC_SEARCH_HOSTS.some((h) => refHost.includes(h.replace(/\.$/, '')))) {
    return 'organic_search'
  }

  if (source) return 'paid_or_tagged'
  if (referrer) return 'referral'
  return 'direct'
}

function isAiChannel(channel) {
  return channel?.startsWith('ai_')
}

function buildTouch() {
  const utm = readQueryUtms()
  const referrer = typeof document !== 'undefined' ? document.referrer || '' : ''
  const channel = classifyChannel({ utm, referrer })
  return {
    capturedAt: Date.now(),
    landingPath: typeof window !== 'undefined' ? window.location.pathname : '/',
    referrer,
    utm,
    channel,
    isAiReferral: isAiChannel(channel),
  }
}

export function getOrCreateSessionId() {
  if (typeof window === 'undefined') return null
  try {
    let id = sessionStorage.getItem(SESSION_ID_KEY)
    if (!id) {
      id = `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`
      sessionStorage.setItem(SESSION_ID_KEY, id)
    }
    return id
  } catch {
    return null
  }
}

/** Capture first-touch and session attribution on landing */
export function captureAttribution() {
  if (typeof window === 'undefined') return null
  const touch = buildTouch()
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(touch))
    const raw = localStorage.getItem(FIRST_TOUCH_KEY)
    if (!raw) {
      localStorage.setItem(FIRST_TOUCH_KEY, JSON.stringify(touch))
      return touch
    }
    const existing = JSON.parse(raw)
    if (Date.now() - (existing.capturedAt || 0) > TOUCH_TTL_MS) {
      localStorage.setItem(FIRST_TOUCH_KEY, JSON.stringify(touch))
      return touch
    }
    return existing
  } catch {
    return touch
  }
}

export function getAttribution() {
  if (typeof window === 'undefined') return {}
  try {
    const session = sessionStorage.getItem(SESSION_KEY)
    const firstTouch = localStorage.getItem(FIRST_TOUCH_KEY)
    return {
      session: session ? JSON.parse(session) : null,
      firstTouch: firstTouch ? JSON.parse(firstTouch) : null,
      sessionId: getOrCreateSessionId(),
    }
  } catch {
    return { sessionId: getOrCreateSessionId() }
  }
}

export function getConversionAttribution() {
  const { session, firstTouch, sessionId } = getAttribution()
  const primary = firstTouch || session || {}
  return {
    sessionId,
    channel: primary.channel || 'direct',
    isAiReferral: Boolean(primary.isAiReferral),
    landingPath: primary.landingPath || null,
    referrer: primary.referrer || null,
    utm: primary.utm || {},
  }
}

export function readCurrentUtms() {
  return readQueryUtms()
}

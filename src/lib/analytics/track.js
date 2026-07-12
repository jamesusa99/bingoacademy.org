import { captureAttribution, getConversionAttribution } from './attribution.js'
import { resolvePageType } from '../../config/measurement/pageTypes.js'
import { initWebVitals } from './webVitals.js'

let gtagReady = false
const eventQueue = []

function getGaId() {
  return import.meta.env.VITE_GA_MEASUREMENT_ID?.trim() || ''
}

function loadGtag(gaId) {
  if (typeof window === 'undefined' || gtagReady) return
  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag() {
    window.dataLayer.push(arguments)
  }
  window.gtag('js', new Date())
  window.gtag('config', gaId, { send_page_view: false })

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`
  document.head.appendChild(script)
  gtagReady = true
}

function flushQueue() {
  while (eventQueue.length) {
    const item = eventQueue.shift()
    sendEvent(item.name, item.properties)
  }
}

function gaEvent(name, properties = {}) {
  if (!gtagReady || typeof window.gtag !== 'function') return
  window.gtag('event', name, properties)
}

async function postEvent(name, properties = {}) {
  if (typeof window === 'undefined') return
  const attribution = getConversionAttribution()
  const payload = {
    event_name: name,
    page: properties.page || window.location.pathname,
    page_type: properties.page_type || resolvePageType(window.location.pathname),
    properties,
    attribution,
    session_id: attribution.sessionId,
  }

  try {
    await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    })
  } catch {
    /* non-blocking */
  }
}

function sendEvent(name, properties = {}) {
  gaEvent(name, properties)
  void postEvent(name, properties)
}

export function initAnalytics() {
  if (typeof window === 'undefined') return
  captureAttribution()
  const gaId = getGaId()
  if (gaId) loadGtag(gaId)
  initWebVitals(sendEvent)
  flushQueue()
}

export function trackEvent(name, properties = {}) {
  if (typeof window === 'undefined') return
  if (!gtagReady && getGaId()) {
    eventQueue.push({ name, properties })
    return
  }
  sendEvent(name, properties)
}

export function trackPageView(pathname, { title } = {}) {
  if (typeof window === 'undefined') return
  const page = pathname || window.location.pathname
  const pageType = resolvePageType(page)
  const props = { page, page_type: pageType, title: title || document.title }

  if (gtagReady && typeof window.gtag === 'function') {
    window.gtag('event', 'page_view', {
      page_path: page,
      page_title: props.title,
      page_type: pageType,
    })
  }

  void postEvent('page_view', props)
}

/**
 * Product conversions for SEO/GEO funnel reporting.
 * @param {'register'|'trial'|'assessment_start'|'assessment_complete'|'lead'|'demo_intent'} conversionType
 */
export function trackConversion(conversionType, extra = {}) {
  const attribution = getConversionAttribution()
  trackEvent('conversion', {
    conversion_type: conversionType,
    ...extra,
    channel: attribution.channel,
    is_ai_referral: attribution.isAiReferral,
    landing_path: attribution.landingPath,
  })
}

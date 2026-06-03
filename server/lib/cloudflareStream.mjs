/** Cloudflare Stream API helpers (server-only) */

/** Cloudflare direct upload: up to 30 GB per file (browser uploads: stay under ~4 GB). */
export const STREAM_MAX_FILE_BYTES = 30 * 1024 * 1024 * 1024
/** Practical limit for browser POST uploads (memory / timeouts). */
export const STREAM_RECOMMENDED_MAX_FILE_BYTES = 4 * 1024 * 1024 * 1024
/** Default maxDurationSeconds on direct_upload (6 h). Override per request if needed. */
export const STREAM_DEFAULT_MAX_DURATION_SECONDS = 21_600

export function isStreamConfigured() {
  return Boolean(process.env.CLOUDFLARE_ACCOUNT_ID && process.env.CLOUDFLARE_API_TOKEN)
}

/**
 * Normalize CLOUDFLARE_STREAM_CUSTOMER_CODE — accept either:
 * - `uoz4rj725ijgv17s`
 * - `customer-uoz4rj725ijgv17s`
 * - `customer-uoz4rj725ijgv17s.cloudflarestream.com` (full host; fixes double-prefix bugs)
 * @returns {string|null} e.g. customer-xxx.cloudflarestream.com
 */
export function normalizeStreamCustomerHost() {
  const raw = process.env.CLOUDFLARE_STREAM_CUSTOMER_CODE?.trim()
  if (!raw) return null

  let host = raw.replace(/^https?:\/\//i, '').replace(/\/+$/, '')
  if (host.includes('.cloudflarestream.com')) {
    return host
  }

  const id = host.replace(/^customer-/, '')
  if (!id) return null
  return `customer-${id}.cloudflarestream.com`
}

export function buildStreamManifestUrl(uid) {
  const host = normalizeStreamCustomerHost()
  if (!host || !uid?.trim()) return null
  return `https://${host}/${encodeURIComponent(uid.trim())}/manifest/video.m3u8`
}

export function buildStreamThumbnailUrl(uid) {
  const host = normalizeStreamCustomerHost()
  if (!host || !uid?.trim()) return null
  return `https://${host}/${encodeURIComponent(uid.trim())}/thumbnails/thumbnail.jpg`
}

export function buildStreamWatchUrl(uid) {
  const host = normalizeStreamCustomerHost()
  if (!host || !uid?.trim()) return null
  return `https://${host}/${encodeURIComponent(uid.trim())}/watch`
}

function streamHeaders() {
  return {
    Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
    'Content-Type': 'application/json',
  }
}

/**
 * @param {string} uid Cloudflare Stream video UID
 * @returns {Promise<{ ok: boolean, error?: string, video?: object }>}
 */
export async function fetchStreamVideo(uid) {
  if (!isStreamConfigured()) {
    return { ok: false, error: 'Cloudflare Stream not configured' }
  }
  if (!uid?.trim()) {
    return { ok: false, error: 'uid is required' }
  }

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/${encodeURIComponent(uid.trim())}`,
    { headers: streamHeaders() }
  )
  const json = await res.json()

  if (!res.ok || !json.success) {
    return {
      ok: false,
      error: json.errors?.[0]?.message || `Cloudflare API error (${res.status})`,
    }
  }

  return { ok: true, video: json.result }
}

/**
 * Normalize Cloudflare Stream API result → playback fields for DB + frontend.
 * @param {object} video Cloudflare Stream video object
 */
export function streamVideoToPlayback(video) {
  const uid = video?.uid
  const state = video?.status?.state || (video?.readyToStream ? 'ready' : 'inprogress')
  const hls = video?.playback?.hls || null
  const dash = video?.playback?.dash || null

  let thumbnailUrl = typeof video?.thumbnail === 'string' ? video.thumbnail : null
  if (!thumbnailUrl && uid) {
    thumbnailUrl = buildStreamThumbnailUrl(uid)
  }

  let hlsUrl = hls || null
  if (!hlsUrl && uid) {
    hlsUrl = buildStreamManifestUrl(uid)
  }

  const durationSeconds = video?.duration != null ? Math.round(Number(video.duration)) : null
  const ready = state === 'ready' || video?.readyToStream === true

  return {
    uid,
    state,
    ready,
    hlsUrl,
    dashUrl: dash,
    thumbnailUrl,
    watchUrl: buildStreamWatchUrl(uid),
    durationSeconds,
    title: video?.meta?.name || video?.meta?.title || null,
  }
}

export async function syncStreamPlayback(uid, { maxAttempts = 24, delayMs = 2500 } = {}) {
  let lastPlayback = null

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const { ok, error, video } = await fetchStreamVideo(uid)
    if (!ok) return { ok: false, error }

    lastPlayback = streamVideoToPlayback(video)
    if (lastPlayback.ready && lastPlayback.hlsUrl) {
      return { ok: true, playback: lastPlayback, video, pending: false }
    }

    if (lastPlayback.state === 'error') {
      return { ok: false, error: 'Cloudflare Stream reported encoding error' }
    }

    if (attempt < maxAttempts - 1) {
      await new Promise((r) => setTimeout(r, delayMs))
    }
  }

  return {
    ok: true,
    playback: lastPlayback,
    pending: true,
    message: 'Video still processing on Cloudflare — try Sync again in a minute',
  }
}

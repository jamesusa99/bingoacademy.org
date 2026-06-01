/** Cloudflare Stream API helpers (server-only) */

export function isStreamConfigured() {
  return Boolean(process.env.CLOUDFLARE_ACCOUNT_ID && process.env.CLOUDFLARE_API_TOKEN)
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
  if (!thumbnailUrl && uid && process.env.CLOUDFLARE_STREAM_CUSTOMER_CODE) {
    const code = process.env.CLOUDFLARE_STREAM_CUSTOMER_CODE
    thumbnailUrl = `https://customer-${code}.cloudflarestream.com/${uid}/thumbnails/thumbnail.jpg`
  }

  let hlsUrl = hls
  if (!hlsUrl && uid && process.env.CLOUDFLARE_STREAM_CUSTOMER_CODE) {
    const code = process.env.CLOUDFLARE_STREAM_CUSTOMER_CODE
    hlsUrl = `https://customer-${code}.cloudflarestream.com/${uid}/manifest/video.m3u8`
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
    durationSeconds,
    title: video?.meta?.name || video?.meta?.title || null,
  }
}

export async function syncStreamPlayback(uid, { maxAttempts = 8, delayMs = 1500 } = {}) {
  let lastPlayback = null

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const { ok, error, video } = await fetchStreamVideo(uid)
    if (!ok) return { ok: false, error }

    lastPlayback = streamVideoToPlayback(video)
    if (lastPlayback.ready && lastPlayback.hlsUrl) {
      return { ok: true, playback: lastPlayback, video }
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

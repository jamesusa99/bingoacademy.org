/** Client helpers for Cloudflare Stream playback URLs (uses VITE env when set) */

function customerHost() {
  const raw = import.meta.env.VITE_CLOUDFLARE_STREAM_CUSTOMER_CODE?.trim()
  if (!raw) return null
  let host = raw.replace(/^https?:\/\//i, '').replace(/\/+$/, '')
  if (host.includes('.cloudflarestream.com')) return host
  const id = host.replace(/^customer-/, '')
  return id ? `customer-${id}.cloudflarestream.com` : null
}

export function buildStreamManifestUrl(videoUid) {
  const host = customerHost()
  if (!host || !videoUid?.trim()) return null
  return `https://${host}/${encodeURIComponent(videoUid.trim())}/manifest/video.m3u8`
}

export function buildStreamIframeUrl(videoUid, token = null) {
  if (!videoUid?.trim()) return null
  const base = `https://iframe.cloudflarestream.com/${encodeURIComponent(videoUid.trim())}`
  return token ? `${base}?token=${encodeURIComponent(token)}` : base
}

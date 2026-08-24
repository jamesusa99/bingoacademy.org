import { CHANNEL_CODE_STORAGE_KEY } from '../config/funnel'

export function normalizeChannelCode(raw) {
  return String(raw || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '')
}

export function storeChannelCode(code) {
  try {
    const normalized = normalizeChannelCode(code)
    if (!normalized) {
      localStorage.removeItem(CHANNEL_CODE_STORAGE_KEY)
      return
    }
    localStorage.setItem(CHANNEL_CODE_STORAGE_KEY, normalized)
  } catch {
    /* ignore */
  }
}

export function getStoredChannelCode() {
  try {
    return normalizeChannelCode(localStorage.getItem(CHANNEL_CODE_STORAGE_KEY) || '')
  } catch {
    return ''
  }
}

export function captureChannelCodeFromSearch(search) {
  const params = search instanceof URLSearchParams ? search : new URLSearchParams(String(search || '').replace(/^\?/, ''))
  const code = params.get('ref') || params.get('channel') || params.get('via')
  if (code) storeChannelCode(code)
  return normalizeChannelCode(code)
}

export function channelSharePath(code) {
  const normalized = normalizeChannelCode(code)
  return normalized ? `/?ref=${encodeURIComponent(normalized)}` : '/'
}

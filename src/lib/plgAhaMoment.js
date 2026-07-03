import { PLG_AHA_STORAGE_KEY } from '../config/plgAhaMoments'

function readSeenIds() {
  try {
    const raw = sessionStorage.getItem(PLG_AHA_STORAGE_KEY)
    const list = raw ? JSON.parse(raw) : []
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

export function hasSeenPlgAhaMoment(triggerId) {
  if (!triggerId) return true
  return readSeenIds().includes(triggerId)
}

export function markPlgAhaMomentSeen(triggerId) {
  if (!triggerId) return
  const seen = readSeenIds()
  if (seen.includes(triggerId)) return
  sessionStorage.setItem(PLG_AHA_STORAGE_KEY, JSON.stringify([...seen, triggerId]))
}

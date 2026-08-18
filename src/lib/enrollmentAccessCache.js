import { fetchMyEnrollments } from './checkout'
import { fetchMyIoaiAccess } from './ioaiStore'

const TTL_MS = 30_000

/** @type {{ promise: Promise<any>|null, data: any, at: number }} */
const enrollmentsCache = { promise: null, data: null, at: 0 }

/** @type {{ promise: Promise<any>|null, data: any, at: number }} */
const ioaiAccessCache = { promise: null, data: null, at: 0 }

function isFresh(entry) {
  return entry.data && Date.now() - entry.at < TTL_MS
}

export function invalidateEnrollmentAccessCache() {
  enrollmentsCache.promise = null
  enrollmentsCache.data = null
  enrollmentsCache.at = 0
  ioaiAccessCache.promise = null
  ioaiAccessCache.data = null
  ioaiAccessCache.at = 0
}

export async function fetchMyEnrollmentsCached({ force = false } = {}) {
  if (!force && isFresh(enrollmentsCache)) return enrollmentsCache.data
  if (!force && enrollmentsCache.promise) return enrollmentsCache.promise

  enrollmentsCache.promise = fetchMyEnrollments()
    .then((data) => {
      enrollmentsCache.data = data
      enrollmentsCache.at = Date.now()
      return data
    })
    .finally(() => {
      enrollmentsCache.promise = null
    })

  return enrollmentsCache.promise
}

export async function fetchMyIoaiAccessCached({ force = false } = {}) {
  if (!force && isFresh(ioaiAccessCache)) return ioaiAccessCache.data
  if (!force && ioaiAccessCache.promise) return ioaiAccessCache.promise

  ioaiAccessCache.promise = fetchMyIoaiAccess()
    .then((data) => {
      ioaiAccessCache.data = data
      ioaiAccessCache.at = Date.now()
      return data
    })
    .finally(() => {
      ioaiAccessCache.promise = null
    })

  return ioaiAccessCache.promise
}

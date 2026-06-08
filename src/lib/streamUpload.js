/** Client-side upload to Cloudflare Stream (basic POST ≤200 MB, tus for larger files) */

import * as tus from 'tus-js-client'
import { supabase } from './supabase'

/** Cloudflare basic direct_upload limit — larger files require tus */
export const STREAM_BASIC_UPLOAD_MAX_BYTES = 200 * 1024 * 1024

export function formatBytes(bytes) {
  if (bytes == null || Number.isNaN(bytes)) return '—'
  const gb = bytes / (1024 * 1024 * 1024)
  if (gb >= 1) return `${gb.toFixed(2)} GB`
  const mb = bytes / (1024 * 1024)
  if (mb >= 1) return `${mb.toFixed(1)} MB`
  return `${Math.round(bytes / 1024)} KB`
}

export function extractStreamUidFromUrl(url) {
  if (!url) return null
  const text = String(url)
  const tusMatch = text.match(/\/tus\/([a-f0-9]{32})/i)
  if (tusMatch) return tusMatch[1]
  const directMatch = text.match(/upload\.videodelivery\.net\/([a-f0-9]{32})/i)
  if (directMatch) return directMatch[1]
  return null
}

function bytesFullySent(loaded, total) {
  return total > 0 && loaded >= total * 0.99
}

/**
 * Basic POST upload (Cloudflare limit: 200 MB).
 * @param {string} uploadURL
 * @param {File} file
 * @param {{ onProgress?: (pct: number) => void, signal?: AbortSignal }} [opts]
 */
export function uploadFileToStreamBasic(uploadURL, file, opts = {}) {
  const { onProgress, signal } = opts

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', uploadURL)

    let loaded = 0
    let total = 0

    if (signal) {
      if (signal.aborted) {
        reject(new Error('Upload cancelled'))
        return
      }
      signal.addEventListener('abort', () => {
        xhr.abort()
        reject(new Error('Upload cancelled'))
      })
    }

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        loaded = e.loaded
        total = e.total
        if (onProgress) {
          onProgress(Math.round((e.loaded / e.total) * 100))
        }
      }
    }

    const maybeResolveDespiteCors = () => {
      if (bytesFullySent(loaded, total)) {
        resolve()
        return true
      }
      return false
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve()
        return
      }
      if (xhr.status === 413 || xhr.status === 400) {
        reject(
          new Error(
            `File is ${formatBytes(file.size)} — Cloudflare basic upload supports up to ${formatBytes(STREAM_BASIC_UPLOAD_MAX_BYTES)}. Use a smaller export or compress the video.`
          )
        )
        return
      }
      if (maybeResolveDespiteCors()) return

      let detail = xhr.responseText?.slice(0, 200) || ''
      try {
        const json = JSON.parse(xhr.responseText)
        detail = json.errors?.[0]?.message || json.error || detail
      } catch {
        /* ignore */
      }
      reject(
        new Error(
          detail
            ? `Cloudflare upload failed (${xhr.status}): ${detail}`
            : `Cloudflare upload failed (${xhr.status}). Try a smaller file or compress the video.`
        )
      )
    }

    xhr.onerror = () => {
      if (maybeResolveDespiteCors()) return
      reject(
        new Error(
          file.size > STREAM_BASIC_UPLOAD_MAX_BYTES
            ? `Upload failed. Files over ${formatBytes(STREAM_BASIC_UPLOAD_MAX_BYTES)} must use resumable upload — retrying with tus is automatic on the next attempt.`
            : 'Network error during upload. If progress reached 100%, save the lesson and refresh — the video may still be processing on Cloudflare.'
        )
      )
    }

    xhr.ontimeout = () => {
      if (maybeResolveDespiteCors()) return
      reject(new Error('Upload timed out. Try a smaller file or a faster connection.'))
    }

    xhr.timeout = 0

    const fd = new FormData()
    fd.append('file', file)
    xhr.send(fd)
  })
}

/**
 * Resumable tus upload for files over 200 MB (Cloudflare requirement).
 * @returns {Promise<string>} Cloudflare video UID
 */
export async function uploadFileToStreamTus(file, { onProgress, maxDurationSeconds, onUid } = {}) {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return new Promise((resolve, reject) => {
    let uidReported = false

    const upload = new tus.Upload(file, {
      endpoint: '/api/admin/stream/tus-create',
      chunkSize: 50 * 1024 * 1024,
      retryDelays: [0, 2000, 5000, 10000, 20000],
      metadata: {
        filename: file.name,
        filetype: file.type || 'video/mp4',
      },
      onBeforeRequest: (req) => {
        if (session?.access_token) {
          req.setHeader('Authorization', `Bearer ${session.access_token}`)
        }
        if (maxDurationSeconds && req.getMethod() === 'POST') {
          req.setHeader('X-Stream-Max-Duration', String(maxDurationSeconds))
        }
      },
      onUploadUrlAvailable: () => {
        const uid = extractStreamUidFromUrl(upload.url)
        if (uid && !uidReported) {
          uidReported = true
          onUid?.(uid)
        }
      },
      onProgress: (bytesUploaded, bytesTotal) => {
        if (onProgress && bytesTotal) {
          onProgress(Math.round((bytesUploaded / bytesTotal) * 100))
        }
      },
      onError: (err) => {
        reject(err instanceof Error ? err : new Error(err?.message || 'Tus upload failed'))
      },
      onSuccess: () => {
        const uid = extractStreamUidFromUrl(upload.url)
        if (uid) {
          if (!uidReported) onUid?.(uid)
          resolve(uid)
          return
        }
        reject(new Error('Upload finished but Cloudflare video ID was not found'))
      },
    })

    upload.start()
  })
}

/**
 * Pick basic or tus upload based on file size.
 * @returns {Promise<{ uid: string, method: 'basic' | 'tus' }>}
 */
export async function uploadVideoToCloudflare({
  file,
  uploadURL,
  uid: basicUid,
  maxDurationSeconds,
  onProgress,
  onUid,
  basicMaxBytes = STREAM_BASIC_UPLOAD_MAX_BYTES,
}) {
  if (file.size > basicMaxBytes) {
    const uid = await uploadFileToStreamTus(file, {
      onProgress,
      maxDurationSeconds,
      onUid,
    })
    return { uid, method: 'tus' }
  }

  onUid?.(basicUid)
  await uploadFileToStreamBasic(uploadURL, file, { onProgress })
  return { uid: basicUid, method: 'basic' }
}

/** @deprecated use uploadFileToStreamBasic */
export function uploadFileToStream(uploadURL, file, opts) {
  return uploadFileToStreamBasic(uploadURL, file, opts)
}

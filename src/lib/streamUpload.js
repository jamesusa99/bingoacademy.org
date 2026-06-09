/** Client-side upload to Cloudflare Stream (basic POST ≤200 MB, tus for larger files) */

import * as tus from 'tus-js-client'
import { supabase } from './supabase'

/** Cloudflare basic direct_upload limit — larger files require tus */
export const STREAM_BASIC_UPLOAD_MAX_BYTES = 200 * 1024 * 1024
/** Prefer tus at this size+ — more reliable than single POST for ~50–200 MB files */
export const STREAM_TUS_RECOMMENDED_MIN_BYTES = 50 * 1024 * 1024

const TUS_CHUNK_BYTES = 5 * 1024 * 1024
const TUS_MAX_ATTEMPTS = 3

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

/** Stale tus-js-client fingerprints can trigger broken HEAD resume to Cloudflare. */
function clearStaleTusStorage() {
  try {
    const keys = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith('tus::')) keys.push(key)
    }
    keys.forEach((key) => localStorage.removeItem(key))
  } catch {
    /* private mode / quota */
  }
}

function isTusResumeOrNetworkError(err) {
  const msg = String(err?.message || err || '').toLowerCase()
  return (
    msg.includes('failed to resume') ||
    msg.includes('response code: n/a') ||
    (msg.includes('tus:') && msg.includes('head'))
  )
}

function formatTusNetworkError(err, attempt, maxAttempts) {
  const base =
    '无法连接 Cloudflare 视频上传节点（upload.cloudflarestream.com），可能被网络、防火墙或地区限制拦截。请更换稳定网络或使用 VPN 后重试。'
  if (attempt >= maxAttempts) {
    return new Error(`${base} （已重试 ${maxAttempts} 次）`)
  }
  return err instanceof Error ? err : new Error(String(err || 'Tus upload failed'))
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

function runSingleTusUpload(file, { onProgress, maxDurationSeconds, onUid } = {}) {
  return new Promise((resolve, reject) => {
    let uidReported = false
    let uploadRef = null

    const upload = new tus.Upload(file, {
      endpoint: '/api/admin/stream/tus-create',
      chunkSize: TUS_CHUNK_BYTES,
      retryDelays: [0, 1000, 3000, 5000, 10000],
      /** Avoid stale localStorage resume → broken HEAD to expired Cloudflare URLs */
      storeFingerprintForResuming: false,
      removeFingerprintOnSuccess: true,
      metadata: {
        filename: file.name,
        filetype: file.type || 'video/mp4',
      },
      onShouldRetry(err, retryAttempt) {
        const method = err?.originalRequest?.getMethod?.()
        const status = err?.originalResponse?.getStatus?.()
        if (method === 'HEAD' && (status == null || status === 404 || status === 410)) {
          return false
        }
        return retryAttempt <= 5
      },
      onBeforeRequest: async (req) => {
        if (req.getMethod() === 'POST') {
          const {
            data: { session },
          } = await supabase.auth.getSession()
          if (session?.access_token) {
            req.setHeader('Authorization', `Bearer ${session.access_token}`)
          }
          if (maxDurationSeconds) {
            req.setHeader('X-Stream-Max-Duration', String(maxDurationSeconds))
          }
        }
      },
      onUploadUrlAvailable: () => {
        const uid = extractStreamUidFromUrl(uploadRef?.url)
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
        const uid = extractStreamUidFromUrl(uploadRef?.url)
        if (uid) {
          if (!uidReported) onUid?.(uid)
          resolve(uid)
          return
        }
        reject(new Error('Upload finished but Cloudflare video ID was not found'))
      },
    })

    uploadRef = upload
    upload.start()
  })
}

/**
 * Resumable tus upload (≥50 MB). Retries with a fresh Cloudflare session if resume HEAD fails.
 * @returns {Promise<string>} Cloudflare video UID
 */
export async function uploadFileToStreamTus(file, { onProgress, maxDurationSeconds, onUid } = {}) {
  clearStaleTusStorage()

  let lastErr = null
  for (let attempt = 1; attempt <= TUS_MAX_ATTEMPTS; attempt += 1) {
    try {
      if (attempt > 1) {
        clearStaleTusStorage()
        onProgress?.(0)
      }
      return await runSingleTusUpload(file, { onProgress, maxDurationSeconds, onUid })
    } catch (err) {
      lastErr = err
      if (isTusResumeOrNetworkError(err) && attempt < TUS_MAX_ATTEMPTS) {
        await new Promise((r) => setTimeout(r, 800 * attempt))
        continue
      }
      if (isTusResumeOrNetworkError(err)) {
        throw formatTusNetworkError(err, attempt, TUS_MAX_ATTEMPTS)
      }
      throw err instanceof Error ? err : new Error(String(err || 'Tus upload failed'))
    }
  }

  throw formatTusNetworkError(lastErr, TUS_MAX_ATTEMPTS, TUS_MAX_ATTEMPTS)
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
  tusMinBytes = STREAM_TUS_RECOMMENDED_MIN_BYTES,
}) {
  const useTus = file.size > basicMaxBytes || file.size >= tusMinBytes

  if (useTus) {
    const uid = await uploadFileToStreamTus(file, {
      onProgress,
      maxDurationSeconds,
      onUid,
    })
    return { uid, method: 'tus' }
  }

  if (onUid && basicUid) {
    await Promise.resolve(onUid(basicUid))
  }
  await uploadFileToStreamBasic(uploadURL, file, { onProgress })
  return { uid: basicUid, method: 'basic' }
}

/** @deprecated use uploadFileToStreamBasic */
export function uploadFileToStream(uploadURL, file, opts) {
  return uploadFileToStreamBasic(uploadURL, file, opts)
}

/** Client-side upload to Cloudflare Stream direct_upload URL */

export function formatBytes(bytes) {
  if (bytes == null || Number.isNaN(bytes)) return '—'
  const gb = bytes / (1024 * 1024 * 1024)
  if (gb >= 1) return `${gb.toFixed(2)} GB`
  const mb = bytes / (1024 * 1024)
  if (mb >= 1) return `${mb.toFixed(1)} MB`
  return `${Math.round(bytes / 1024)} KB`
}

/**
 * @param {string} uploadURL
 * @param {File} file
 * @param {{ onProgress?: (pct: number) => void, signal?: AbortSignal }} [opts]
 */
export function uploadFileToStream(uploadURL, file, opts = {}) {
  const { onProgress, signal } = opts

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', uploadURL)

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
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100))
      }
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve()
        return
      }
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
            : `Cloudflare upload failed (${xhr.status}). Large files may time out — try under 4 GB or compress the video.`
        )
      )
    }

    xhr.onerror = () => {
      reject(
        new Error(
          'Network error during upload. Check your connection; for files over ~4 GB use a smaller export or wired network.'
        )
      )
    }

    xhr.ontimeout = () => {
      reject(new Error('Upload timed out. Try a smaller file or a faster connection.'))
    }

    xhr.timeout = 0

    const fd = new FormData()
    fd.append('file', file)
    xhr.send(fd)
  })
}

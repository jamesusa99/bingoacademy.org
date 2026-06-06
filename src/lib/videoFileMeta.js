/** Read duration and dimensions from a local video file before upload. */

export function formatDuration(seconds) {
  if (seconds == null || !Number.isFinite(seconds) || seconds <= 0) return '—'
  const total = Math.round(seconds)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

export function readVideoFileMeta(file) {
  if (!file) {
    return Promise.reject(new Error('No file selected'))
  }

  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const video = document.createElement('video')
    video.preload = 'metadata'

    const cleanup = () => {
      video.removeAttribute('src')
      video.load()
      URL.revokeObjectURL(url)
    }

    video.onloadedmetadata = () => {
      const durationSeconds = Number.isFinite(video.duration) ? video.duration : null
      const meta = {
        durationSeconds,
        width: video.videoWidth || null,
        height: video.videoHeight || null,
      }
      cleanup()
      resolve(meta)
    }

    video.onerror = () => {
      cleanup()
      reject(new Error('Could not read video metadata'))
    }

    video.src = url
  })
}

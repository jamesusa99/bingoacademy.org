import { useCallback, useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import CourseStreamVideo from '../courses/CourseStreamVideo'
import { fetchAdminStreamPlayback } from '../../lib/admin/api'
import { buildStreamIframeUrl, buildStreamManifestUrl } from '../../lib/streamPlayback'
import { formatDuration } from '../../lib/videoFileMeta'

export default function AdminStreamVideoPreview({ uid, labels, className = '' }) {
  const [playback, setPlayback] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadPlayback = useCallback(async () => {
    if (!uid?.trim()) return
    setLoading(true)
    setError(null)
    try {
      const data = await fetchAdminStreamPlayback(uid.trim())
      setPlayback(data.playback || null)
    } catch (err) {
      setError(err.message || 'Preview failed')
      setPlayback(null)
    } finally {
      setLoading(false)
    }
  }, [uid])

  useEffect(() => {
    loadPlayback()
  }, [loadPlayback])

  if (!uid?.trim()) return null

  const hlsUrl = playback?.hlsUrl || buildStreamManifestUrl(uid)
  const poster = playback?.thumbnailUrl || null
  const iframeSrc = buildStreamIframeUrl(uid)
  const ready = playback?.ready && hlsUrl
  const durationLabel =
    playback?.durationSeconds != null ? formatDuration(playback.durationSeconds) : null

  return (
    <div className={`rounded-lg border border-slate-200 bg-black/95 overflow-hidden ${className}`.trim()}>
      <div className="flex items-center justify-between gap-2 px-3 py-2 bg-slate-900/80 border-b border-slate-700/60">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-300">
          {labels.previewVideo}
          {durationLabel ? <span className="font-normal normal-case text-slate-400 ml-2">{durationLabel}</span> : null}
        </p>
        <button
          type="button"
          onClick={loadPlayback}
          disabled={loading}
          className="inline-flex items-center gap-1 text-[10px] text-slate-400 hover:text-white disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          {labels.videoPreviewRefresh}
        </button>
      </div>

      {error ? (
        <p className="text-xs text-red-400 px-3 py-4">{error}</p>
      ) : ready ? (
        <div className="aspect-video bg-black">
          <CourseStreamVideo src={hlsUrl} poster={poster} controls preload="metadata" className="w-full h-full" />
        </div>
      ) : iframeSrc ? (
        <div className="aspect-video bg-black">
          {loading ? (
            <p className="text-xs text-slate-400 px-3 py-8 text-center">{labels.videoPreviewProcessing}</p>
          ) : (
            <iframe
              title={labels.previewVideo}
              src={iframeSrc}
              className="w-full h-full border-0"
              allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>
      ) : (
        <p className="text-xs text-slate-400 px-3 py-4">{labels.videoPreviewProcessing}</p>
      )}
    </div>
  )
}

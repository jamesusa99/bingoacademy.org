import { useEffect, useRef, useState } from 'react'
import { X, Loader2, AlertCircle } from 'lucide-react'
import { fetchVideoStreamToken } from '../../lib/checkout'
import CourseStreamVideo from '../courses/CourseStreamVideo'
import VideoPlayerControls from '../courses/VideoPlayerControls'
import { buildStreamManifestUrl } from '../../lib/streamPlayback'

/**
 * @param {{
 *   open: boolean,
 *   lesson: { id: string, title: string, cloudflareVideoId?: string | null } | null,
 *   onClose: () => void,
 * }} props
 */
export default function LessonVideoModal({ open, lesson, onClose }) {
  const videoRef = useRef(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [playback, setPlayback] = useState(null)

  useEffect(() => {
    if (!open || !lesson) {
      setPlayback(null)
      setError(null)
      return undefined
    }

    const videoId = lesson.cloudflareVideoId
    if (!videoId) {
      setError('Video not configured for this lesson yet.')
      setPlayback(null)
      return undefined
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    fetchVideoStreamToken({ cloudflareVideoId: videoId, lessonSlug: lesson.id })
      .then((data) => {
        if (cancelled) return
        const manifest = buildStreamManifestUrl(data.videoId)
        if (data.token && manifest) {
          setPlayback({
            src: `${manifest}?token=${encodeURIComponent(data.token)}`,
            iframeSrc: `https://iframe.cloudflarestream.com/${encodeURIComponent(data.videoId)}?token=${encodeURIComponent(data.token)}`,
            useIframe: false,
          })
        } else if (data.iframeSrc) {
          setPlayback({ iframeSrc: data.iframeSrc, useIframe: true })
        } else if (manifest) {
          setPlayback({ src: manifest, useIframe: false })
        } else {
          setError('Unable to build playback URL')
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Failed to load video')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [open, lesson])

  if (!open || !lesson) return null

  return (
    <div
      className="fixed inset-0 z-[210] flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label={lesson.title}
    >
      <div className="relative w-full max-w-5xl flex flex-col max-h-[95vh]">
        <div className="flex items-center justify-between gap-4 mb-3 px-1">
          <h2 className="text-lg sm:text-xl font-bold text-white truncate">{lesson.title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
            aria-label="Close video"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div
          data-video-shell
          className="relative flex-1 min-h-0 rounded-2xl overflow-hidden border border-slate-700/80 bg-black shadow-[0_0_80px_rgba(0,0,0,0.8)] aspect-video w-full"
        >
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 className="w-10 h-10 animate-spin text-cyan-400" />
              <p className="text-sm">Loading secure stream…</p>
            </div>
          ) : null}

          {error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
              <AlertCircle className="w-10 h-10 text-amber-400" />
              <p className="text-sm text-slate-300 max-w-sm">{error}</p>
            </div>
          ) : null}

          {!loading && !error && playback?.useIframe && playback.iframeSrc ? (
            <iframe
              src={playback.iframeSrc}
              title={lesson.title}
              className="absolute inset-0 w-full h-full border-0"
              allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          ) : null}

          {!loading && !error && playback?.src && !playback.useIframe ? (
            <>
              <CourseStreamVideo
                videoRef={videoRef}
                src={playback.src}
                className="absolute inset-0 w-full h-full object-contain bg-black"
                controls
                playsInline
                preload="metadata"
              />
              <VideoPlayerControls videoRef={videoRef} />
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}

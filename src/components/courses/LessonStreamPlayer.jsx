import { Loader2 } from 'lucide-react'
import { useStreamPlayback } from '../../hooks/useStreamPlayback'
import CourseStreamVideo from './CourseStreamVideo'

/**
 * Cloudflare Stream player for a single lesson (module page or inline embed).
 */
export default function LessonStreamPlayer({
  lessonSlug,
  cloudflareUid,
  lessonTitle = 'Lesson video',
  fetchToken = true,
  className = '',
}) {
  const course = { id: lessonSlug, cloudflareUid }
  const { playbackSrc, iframeSrc, poster, loading, error, hasCustomVideo } = useStreamPlayback({
    course,
    lessonSlug,
    fetchToken,
  })

  if (!cloudflareUid?.trim()) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
        Video not configured for this lesson yet.
      </div>
    )
  }

  return (
    <div className={`rounded-xl overflow-hidden border border-slate-200 bg-black ${className}`.trim()}>
      <div className="relative aspect-video">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
            <p className="text-xs">Loading video…</p>
          </div>
        ) : null}

        {!loading && error && !playbackSrc && !iframeSrc ? (
          <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
            <p className="text-sm text-amber-300 max-w-sm">{error}</p>
          </div>
        ) : null}

        {!loading && iframeSrc && !playbackSrc ? (
          <iframe
            title={lessonTitle}
            src={iframeSrc}
            className="absolute inset-0 w-full h-full border-0"
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        ) : null}

        {!loading && playbackSrc ? (
          <CourseStreamVideo
            src={playbackSrc}
            poster={poster}
            className="w-full h-full object-contain"
            playsInline
            preload="metadata"
            controls
          />
        ) : null}

        {!loading && !playbackSrc && !iframeSrc && !error && hasCustomVideo ? (
          <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-slate-400 text-sm">
            Unable to start playback.
          </div>
        ) : null}
      </div>
    </div>
  )
}

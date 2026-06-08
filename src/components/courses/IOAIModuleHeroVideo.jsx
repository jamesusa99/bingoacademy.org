import { useRef } from 'react'
import { Loader2, Lock, Play, RotateCcw } from 'lucide-react'
import { COURSES_PORTAL } from '../../config/coursesPortal'
import { useStreamPlayback } from '../../hooks/useStreamPlayback'
import { useVideoPreviewLimit } from '../../hooks/useVideoPreviewLimit'
import CourseStreamVideo from './CourseStreamVideo'
import ModuleCoverImage from './ModuleCoverImage'
import { IOAI_MODULE_PREVIEW_SECONDS } from '../../config/ioaiPreview'

function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

/**
 * Hero media: full lesson when purchased, 15s preview when not.
 */
export default function IOAIModuleHeroVideo({
  lesson,
  owned,
  coverUrl,
  moduleTitle,
  onBuy,
  checkoutLoading,
}) {
  const videoRef = useRef(null)
  const canPlayFull = owned && lesson?.cloudflareVideoId
  const canPreview = !owned && lesson?.cloudflareVideoId
  const previewSeconds = lesson?.previewSeconds ?? IOAI_MODULE_PREVIEW_SECONDS

  const {
    playbackSrc,
    iframeSrc,
    poster,
    loading: videoLoading,
    error: videoError,
  } = useStreamPlayback({
    course: lesson
      ? { id: lesson.id, cloudflareUid: lesson.cloudflareVideoId, previewSeconds }
      : null,
    lessonSlug: lesson?.id,
    fetchToken: Boolean(canPlayFull || canPreview),
    limitPreview: canPreview,
  })

  const preview = useVideoPreviewLimit({
    enabled: canPreview,
    previewSeconds,
    videoReadyKey: playbackSrc || '',
  })

  const useIframe = Boolean(iframeSrc && !playbackSrc && canPlayFull)

  if (!lesson?.cloudflareVideoId) {
    return (
      <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-lg">
        <ModuleCoverImage
          coverUrl={coverUrl}
          alt={moduleTitle || ''}
          className="w-full h-full object-cover"
        />
      </div>
    )
  }

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-black shadow-lg">
      <div className="absolute top-3 left-3 z-20 flex gap-2">
        {canPreview ? (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/95 text-slate-800 shadow">
            {COURSES_PORTAL.modulePreviewBadge(previewSeconds)}
          </span>
        ) : null}
        {canPlayFull ? (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/90 text-white">
            {COURSES_PORTAL.videoFullBadge}
          </span>
        ) : null}
      </div>

      <div className="relative aspect-video bg-slate-950">
        {videoLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
            <p className="text-xs">Loading video…</p>
          </div>
        ) : null}

        {!videoLoading && videoError && !playbackSrc && !useIframe ? (
          <div className="absolute inset-0">
            <ModuleCoverImage
              coverUrl={coverUrl}
              alt={moduleTitle || ''}
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 flex items-center justify-center p-6 text-center bg-black/40">
              <p className="text-sm text-white max-w-sm">{videoError}</p>
            </div>
          </div>
        ) : null}

        {!videoLoading && useIframe ? (
          <iframe
            title={lesson.title}
            src={iframeSrc}
            className="absolute inset-0 w-full h-full border-0"
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        ) : null}

        {!videoLoading && playbackSrc ? (
          <CourseStreamVideo
            key={playbackSrc}
            videoRef={videoRef}
            src={playbackSrc}
            poster={poster || coverUrl}
            className="w-full h-full object-contain"
            playsInline
            preload="metadata"
            controls={canPlayFull}
            controlsList={canPlayFull ? undefined : 'nodownload noplaybackrate nofullscreen'}
            onLoadedMetadata={(e) => preview.setDuration(e.currentTarget.duration || 0)}
            onPlay={() => preview.setPlaying(true)}
            onPause={() => preview.setPlaying(false)}
            onEnded={() => preview.setPlaying(false)}
            onTimeUpdate={canPreview ? preview.onTimeUpdate : undefined}
            onSeeking={canPreview ? preview.onSeeking : undefined}
            onSeeked={canPreview ? preview.onSeeked : undefined}
          />
        ) : null}

        {!preview.playing && !preview.showLock && playbackSrc && !videoLoading ? (
          <button
            type="button"
            onClick={() => preview.play(videoRef.current)}
            className="absolute inset-0 flex items-center justify-center bg-black/25 hover:bg-black/35 transition group z-10"
            aria-label={canPlayFull ? COURSES_PORTAL.moduleContinueWatching : COURSES_PORTAL.moduleWatchPreview}
          >
            <span className="w-16 h-16 rounded-full bg-white/95 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Play className="w-7 h-7 text-slate-900 fill-slate-900 ml-1" />
            </span>
          </button>
        ) : null}

        {preview.showLock ? (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/85 backdrop-blur-sm p-6 text-center">
            <Lock className="w-10 h-10 text-amber-400 mb-3" aria-hidden />
            <p className="text-lg font-bold text-white mb-1">{COURSES_PORTAL.previewEndedTitle}</p>
            <p className="text-sm text-slate-400 max-w-sm mb-4">{COURSES_PORTAL.moduleUnlockAllDesc}</p>
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                type="button"
                onClick={onBuy}
                disabled={checkoutLoading}
                className="btn-primary text-sm px-4 py-2 disabled:opacity-60"
              >
                {checkoutLoading ? COURSES_PORTAL.redirecting : COURSES_PORTAL.buyModuleShort}
              </button>
              <button
                type="button"
                onClick={() => preview.replay(videoRef.current)}
                className="inline-flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {COURSES_PORTAL.replayPreview}
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {canPreview && preview.duration > 0 && !preview.showLock ? (
        <div className="relative h-1.5 bg-slate-800">
          <div
            className="absolute inset-y-0 left-0 bg-cyan-500/80 transition-all"
            style={{ width: `${Math.min(100, (preview.currentTime / preview.duration) * 100)}%` }}
          />
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-10"
            style={{ left: `${preview.previewProgress}%` }}
            title={COURSES_PORTAL.previewCutoff(previewSeconds)}
          />
        </div>
      ) : null}

      {canPreview && !preview.showLock ? (
        <div className="px-4 py-2 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>
            {formatTime(preview.currentTime)} / {formatTime(previewSeconds)} {COURSES_PORTAL.previewLabel}
          </span>
          <span className="text-amber-400/90">{COURSES_PORTAL.previewUpgradeHint}</span>
        </div>
      ) : null}
    </div>
  )
}

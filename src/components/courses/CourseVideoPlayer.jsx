import { useRef } from 'react'
import { Lock, Play, RotateCcw, Loader2 } from 'lucide-react'
import { COURSES_PORTAL } from '../../config/coursesPortal'
import { IOAI_MODULE_PREVIEW_SECONDS } from '../../config/ioaiPreview'
import { useStreamPlayback } from '../../hooks/useStreamPlayback'
import { useVideoPreviewLimit } from '../../hooks/useVideoPreviewLimit'
import CoursePurchasePanel from './CoursePurchasePanel'
import CourseStreamVideo from './CourseStreamVideo'

function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function CourseVideoPlayer({
  course,
  hasAccess,
  hasTrack,
  onUnlockLesson,
  onUnlockTrack,
  isAuthenticated,
  stripeCheckout,
  checkoutLoading,
  setCheckoutLoading,
}) {
  const videoRef = useRef(null)
  const canPreviewVideo = Boolean(course?.cloudflareUid) && !hasAccess
  const {
    playbackSrc,
    iframeSrc,
    poster,
    previewSeconds: streamPreviewSeconds,
    isStream,
    hasCustomVideo,
    loading: videoLoading,
    error: videoError,
  } = useStreamPlayback({
    course,
    lessonSlug: course?.id,
    fetchToken: hasAccess || canPreviewVideo,
    limitPreview: canPreviewVideo,
  })

  const previewSeconds = course?.previewSeconds ?? streamPreviewSeconds ?? IOAI_MODULE_PREVIEW_SECONDS

  const preview = useVideoPreviewLimit({
    enabled: canPreviewVideo,
    previewSeconds,
    videoReadyKey: playbackSrc || '',
  })

  const useIframe = Boolean(iframeSrc && !playbackSrc && hasAccess)

  return (
    <section className="course-video-player mb-6">
      <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-black shadow-2xl">
        <div className="absolute top-3 left-3 z-20 flex gap-2">
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
              hasAccess ? 'bg-emerald-500/90 text-white' : 'bg-amber-500/90 text-slate-900'
            }`}
          >
            {hasAccess ? COURSES_PORTAL.videoFullBadge : COURSES_PORTAL.videoPreviewBadge}
          </span>
          {!hasAccess ? (
            <span className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-black/60 text-slate-300 backdrop-blur">
              {COURSES_PORTAL.previewLength(previewSeconds)}
            </span>
          ) : isStream && hasCustomVideo ? (
            <span className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-black/60 text-slate-300 backdrop-blur">
              Cloudflare Stream
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
            <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
              <p className="text-sm text-amber-300 max-w-sm">{videoError}</p>
            </div>
          ) : null}

          {!videoLoading && useIframe ? (
            <iframe
              title={course.nameEn || course.name}
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
              poster={poster}
              className="w-full h-full object-contain"
              playsInline
              preload="metadata"
              controls={hasAccess}
              controlsList={hasAccess ? undefined : 'nodownload noplaybackrate nofullscreen'}
              onLoadedMetadata={(e) => preview.setDuration(e.currentTarget.duration || 0)}
              onPlay={() => preview.setPlaying(true)}
              onPause={() => preview.setPlaying(false)}
              onEnded={() => preview.setPlaying(false)}
              onTimeUpdate={canPreviewVideo ? preview.onTimeUpdate : undefined}
              onSeeking={canPreviewVideo ? preview.onSeeking : undefined}
              onSeeked={canPreviewVideo ? preview.onSeeked : undefined}
            />
          ) : null}

          {!preview.playing && !preview.showLock && playbackSrc && !videoLoading ? (
            <button
              type="button"
              onClick={() => preview.play(videoRef.current)}
              className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition group"
              aria-label={COURSES_PORTAL.watchPreview}
            >
              <span className="w-16 h-16 rounded-full bg-white/95 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <Play className="w-7 h-7 text-slate-900 fill-slate-900 ml-1" />
              </span>
            </button>
          ) : null}

          {preview.showLock ? (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/85 backdrop-blur-sm p-6 text-center">
              <Lock className="w-10 h-10 text-amber-400 mb-3" aria-hidden />
              <p className="text-lg font-bold text-white mb-1">{COURSES_PORTAL.previewEndedTitle}</p>
              <p className="text-sm text-slate-400 max-w-sm mb-4">{COURSES_PORTAL.previewEndedDesc}</p>
              <div className="flex flex-wrap gap-2 justify-center">
                <button
                  type="button"
                  onClick={onUnlockLesson}
                  className="btn-primary text-sm px-4 py-2"
                >
                  {COURSES_PORTAL.unlockLessonShort}
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

        {!hasAccess && preview.duration > 0 ? (
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

        {!hasAccess && !preview.showLock ? (
          <div className="px-4 py-2 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>
              {formatTime(preview.currentTime)} / {formatTime(previewSeconds)}{' '}
              {COURSES_PORTAL.previewLabel}
            </span>
            <span className="text-amber-400/90">{COURSES_PORTAL.previewUpgradeHint}</span>
          </div>
        ) : null}
      </div>

      <div className="mt-4">
        <CoursePurchasePanel
          course={course}
          hasAccess={hasAccess}
          hasTrack={hasTrack}
          onUnlockLesson={onUnlockLesson}
          onUnlockTrack={onUnlockTrack}
          isAuthenticated={isAuthenticated}
          stripeCheckout={stripeCheckout}
          checkoutLoading={checkoutLoading}
          setCheckoutLoading={setCheckoutLoading}
        />
      </div>
    </section>
  )
}

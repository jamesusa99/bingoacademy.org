import { useCallback, useEffect, useRef, useState } from 'react'
import { Lock, Play, RotateCcw } from 'lucide-react'
import { COURSES_PORTAL } from '../../config/coursesPortal'
import { getCourseVideo } from '../../config/courseVideo'
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
  const { url, poster, previewSeconds, isStream, hasCustomVideo } = getCourseVideo(course)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [previewEnded, setPreviewEnded] = useState(false)
  const [duration, setDuration] = useState(0)

  const previewLimit = hasAccess ? duration : previewSeconds
  const showLock = !hasAccess && (previewEnded || currentTime >= previewSeconds - 0.5)

  useEffect(() => {
    setPreviewEnded(false)
    setCurrentTime(0)
    setPlaying(false)
    if (videoRef.current) {
      videoRef.current.currentTime = 0
      videoRef.current.pause()
    }
  }, [course?.id, hasAccess])

  useEffect(() => {
    if (hasAccess) return undefined
    const video = videoRef.current
    if (!video) return undefined

    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime)
      if (video.currentTime >= previewSeconds) {
        video.pause()
        video.currentTime = previewSeconds
        setPreviewEnded(true)
        setPlaying(false)
      }
    }

    video.addEventListener('timeupdate', onTimeUpdate)
    return () => video.removeEventListener('timeupdate', onTimeUpdate)
  }, [hasAccess, previewSeconds, course?.id])

  const handlePlay = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    if (!hasAccess && previewEnded) return
    video.play().catch(() => {})
    setPlaying(true)
  }, [hasAccess, previewEnded])

  const handleReplayPreview = useCallback(() => {
    const video = videoRef.current
    if (!video || hasAccess) return
    video.currentTime = 0
    setPreviewEnded(false)
    setCurrentTime(0)
    video.play().catch(() => {})
    setPlaying(true)
  }, [hasAccess])

  const previewProgress = hasAccess
    ? 100
    : duration
      ? Math.min(100, (previewSeconds / duration) * 100)
      : 0

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
          <CourseStreamVideo
            videoRef={videoRef}
            src={url}
            poster={poster}
            className="w-full h-full object-contain"
            playsInline
            preload="metadata"
            controls={hasAccess}
            controlsList={hasAccess ? undefined : 'nodownload noplaybackrate'}
            onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onEnded={() => setPlaying(false)}
          />

          {!playing && !showLock ? (
            <button
              type="button"
              onClick={handlePlay}
              className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition group"
              aria-label={COURSES_PORTAL.watchPreview}
            >
              <span className="w-16 h-16 rounded-full bg-white/95 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <Play className="w-7 h-7 text-slate-900 fill-slate-900 ml-1" />
              </span>
            </button>
          ) : null}

          {showLock ? (
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
                  onClick={handleReplayPreview}
                  className="inline-flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  {COURSES_PORTAL.replayPreview}
                </button>
              </div>
            </div>
          ) : null}
        </div>

        {!hasAccess && duration > 0 ? (
          <div className="relative h-1.5 bg-slate-800">
            <div
              className="absolute inset-y-0 left-0 bg-cyan-500/80 transition-all"
              style={{ width: `${Math.min(100, (currentTime / duration) * 100)}%` }}
            />
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-10"
              style={{ left: `${previewProgress}%` }}
              title={COURSES_PORTAL.previewCutoff(previewSeconds)}
            />
          </div>
        ) : null}

        {!hasAccess && !showLock ? (
          <div className="px-4 py-2 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>
              {formatTime(currentTime)} / {hasAccess ? formatTime(duration) : formatTime(previewSeconds)}{' '}
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

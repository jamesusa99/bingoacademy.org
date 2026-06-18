import { useCallback, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Lock, Play, RotateCcw, ChevronLeft, ChevronRight, Check, Loader2 } from 'lucide-react'
import { COURSES_PORTAL } from '../../config/coursesPortal'
import { IOAI_MODULE_PREVIEW_SECONDS } from '../../config/ioaiPreview'
import { LESSON_SEGMENTS } from '../../config/lessonSegments'
import LessonExerciseSegment, { useLessonExerciseCount } from './LessonExerciseSegment'
import { useLessonProgress } from '../../hooks/useLearningProgress'
import { useStreamPlayback } from '../../hooks/useStreamPlayback'
import { useVideoPreviewLimit } from '../../hooks/useVideoPreviewLimit'
import { getProgramCurriculum, isCurriculumLine } from '../../config/programCurriculum'
import { getAdjacentLessons } from '../../lib/ioaiCourseStructure'
import { studyLessonPath } from '../../lib/studyPaths'
import VideoPlayerControls from './VideoPlayerControls'
import CourseStreamVideo from './CourseStreamVideo'

function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

function activeSegments(hasExercises) {
  return hasExercises ? LESSON_SEGMENTS : LESSON_SEGMENTS.filter((s) => s.id !== 'checkpoint')
}

function segmentAtIndex(index, hasExercises) {
  if (!hasExercises && index >= 2) return LESSON_SEGMENTS[index + 1] || LESSON_SEGMENTS[3]
  return LESSON_SEGMENTS[index] || LESSON_SEGMENTS[LESSON_SEGMENTS.length - 1]
}

function SegmentStepper({ currentIndex, segmentsDone, onSelect, hasAccess, hasExercises }) {
  const segments = activeSegments(hasExercises)
  return (
    <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-1 -mx-1 px-1">
      {segments.map((seg, i) => {
        const storageIndex = hasExercises ? i : i >= 2 ? i + 1 : i
        const done = segmentsDone[seg.id]
        const active = storageIndex === currentIndex
        const canClick =
          seg.id === 'checkpoint'
            ? hasExercises
            : hasAccess && (done || storageIndex <= currentIndex)

        return (
          <button
            key={seg.id}
            type="button"
            disabled={!canClick}
            onClick={() => canClick && onSelect(storageIndex)}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition shrink-0 ${
              active
                ? 'bg-primary text-white shadow-sm'
                : done
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : canClick
                    ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    : 'bg-slate-50 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span aria-hidden>{done && !active ? '✓' : seg.icon}</span>
            <span className="hidden sm:inline">{seg.label}</span>
            <span className="sm:hidden">{seg.shortLabel}</span>
          </button>
        )
      })}
    </div>
  )
}

function IntroSegment({ course, onContinue }) {
  return (
    <div className="p-6 sm:p-8">
      <p className="text-xs font-bold uppercase tracking-wide text-primary mb-2">Lesson overview</p>
      <h3 className="text-lg font-bold text-white mb-3">{course.nameEn || course.name}</h3>
      <p className="text-sm text-slate-300 leading-relaxed mb-5">{course.desc}</p>
      {course.outcomes?.length > 0 ? (
        <ul className="space-y-2 mb-6">
          {course.outcomes.map((o) => (
            <li key={o} className="text-sm text-slate-300 flex gap-2">
              <span className="text-emerald-400 shrink-0">✓</span>
              {o}
            </li>
          ))}
        </ul>
      ) : null}
      <p className="text-xs text-slate-500 mb-4">{course.hours} · {course.audience}</p>
      <button type="button" onClick={onContinue} className="btn-primary text-sm px-5 py-2.5">
        Start video lesson →
      </button>
    </div>
  )
}

function SummarySegment({ course, onComplete, nextLessonId, courses = null, curriculumTree = null, studyCenter = false }) {
  const productLine = isCurriculumLine(course?.line) ? course.line : 'ioai'
  const { index, total } = getAdjacentLessons(course.id, courses, curriculumTree, productLine)

  return (
    <div className="p-6 sm:p-8 text-center">
      <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
        <Check className="w-7 h-7 text-emerald-400" />
      </div>
      <p className="text-xs font-bold uppercase tracking-wide text-emerald-400 mb-2">Lesson complete</p>
      <h3 className="text-lg font-bold text-white mb-2">{course.nameEn || course.name}</h3>
      <p className="text-sm text-slate-400 mb-2">
        Lesson {index + 1} of {total} in this track
      </p>
      {course.outcomes?.[0] ? (
        <p className="text-sm text-slate-300 max-w-md mx-auto mb-6">{course.outcomes[0]}</p>
      ) : null}
      <div className="flex flex-wrap gap-2 justify-center">
        <button type="button" onClick={onComplete} className="btn-primary text-sm px-5 py-2.5">
          Mark lesson complete
        </button>
        {nextLessonId ? (
          <Link
            to={studyCenter ? studyLessonPath(nextLessonId, { play: true }) : `/courses/detail/${nextLessonId}`}
            className="text-sm px-5 py-2.5 rounded-xl border border-slate-600 text-slate-200 hover:bg-slate-800 transition"
          >
            Next lesson →
          </Link>
        ) : null}
      </div>
    </div>
  )
}

export default function SegmentPlayer({
  course,
  hasAccess,
  hasTrack,
  onUnlockLesson,
  onUnlockTrack,
  isAuthenticated,
  stripeCheckout,
  checkoutLoading,
  setCheckoutLoading,
  courses = null,
  curriculumTree = null,
  moduleContext = null,
  previewMode = false,
  startAtVideo = false,
  studyCenter = false,
}) {
  const videoRef = useRef(null)
  const { progress, completeSegment, saveVideoPosition, goToSegment, completeLesson } =
    useLessonProgress(course.id)
  const canPreviewVideo = Boolean(course?.cloudflareUid) && !hasAccess && !previewMode
  const {
    playbackSrc,
    iframeSrc,
    poster,
    previewSeconds: streamPreviewSeconds,
    hasCustomVideo,
    loading: videoLoading,
    error: videoError,
  } = useStreamPlayback({
    course,
    lessonSlug: course.id,
    fetchToken: hasAccess || canPreviewVideo || previewMode,
    adminPreview: Boolean(previewMode),
    limitPreview: canPreviewVideo,
  })

  const previewSeconds = course?.previewSeconds ?? streamPreviewSeconds ?? IOAI_MODULE_PREVIEW_SECONDS

  const preview = useVideoPreviewLimit({
    enabled: canPreviewVideo,
    previewSeconds,
    videoReadyKey: playbackSrc || '',
  })

  const useIframe = Boolean(iframeSrc && !playbackSrc && hasAccess)

  const segmentIndex = progress.currentSegment
  const { hasExercises } = useLessonExerciseCount(course.id)
  const currentSegment = segmentAtIndex(segmentIndex, hasExercises)
  const productLine = isCurriculumLine(course?.line) ? course.line : 'ioai'
  const { next: nextLessonId } = getAdjacentLessons(course.id, courses, curriculumTree, productLine)

  const showLock = !hasAccess && preview.showLock

  useEffect(() => {
    if (!startAtVideo) return
    if (!hasAccess && !canPreviewVideo) return
    goToSegment(1)
  }, [startAtVideo, hasAccess, canPreviewVideo, course.id, goToSegment])

  useEffect(() => {
    if (segmentIndex !== 1 || !hasAccess) return undefined
    const video = videoRef.current
    if (!video) return undefined

    const onTimeUpdate = () => {
      saveVideoPosition(video.currentTime)
    }

    video.addEventListener('timeupdate', onTimeUpdate)
    return () => video.removeEventListener('timeupdate', onTimeUpdate)
  }, [segmentIndex, hasAccess, course?.id, saveVideoPosition, playbackSrc])

  const handlePlay = useCallback(() => {
    preview.play(videoRef.current)
  }, [preview])

  const handleReplayPreview = useCallback(() => {
    preview.replay(videoRef.current)
  }, [preview])

  const goNextSegment = useCallback(() => {
    if (currentSegment) completeSegment(currentSegment.id)
    let next = segmentIndex + 1
    if (!hasExercises && next === 2) next = 3
    goToSegment(Math.min(next, LESSON_SEGMENTS.length - 1))
  }, [completeSegment, currentSegment, goToSegment, segmentIndex, hasExercises])

  const goPrevSegment = useCallback(() => {
    let prev = segmentIndex - 1
    if (!hasExercises && prev === 2) prev = 1
    goToSegment(Math.max(0, prev))
  }, [goToSegment, segmentIndex, hasExercises])

  const handleVideoEnded = useCallback(() => {
    preview.setPlaying(false)
    if (hasAccess) {
      completeSegment('video')
      goToSegment(hasExercises ? 2 : 3)
    }
  }, [hasAccess, hasExercises, completeSegment, goToSegment, preview.setPlaying])

  const previewProgress = preview.previewProgress
  const currentTime = preview.currentTime
  const duration = preview.duration

  return (
    <section className="segment-player mb-6">
      <div className="rounded-2xl overflow-hidden border border-slate-700 bg-slate-900 shadow-2xl">
        <div className="px-4 pt-4 pb-3 border-b border-slate-800 bg-slate-900/95">
          <SegmentStepper
            currentIndex={segmentIndex}
            segmentsDone={progress.segmentsDone}
            onSelect={goToSegment}
            hasAccess={hasAccess}
            hasExercises={hasExercises}
          />
        </div>

        {currentSegment?.type === 'intro' ? (
          <IntroSegment course={course} onContinue={goNextSegment} />
        ) : null}

        {currentSegment?.type === 'video' ? (
          <div>
            <div className="relative aspect-video bg-black" data-video-shell>
              <div className="absolute top-3 left-3 z-20 flex gap-2">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                    hasAccess ? 'bg-emerald-500/90 text-white' : 'bg-amber-500/90 text-slate-900'
                  }`}
                >
                  {hasAccess ? COURSES_PORTAL.videoFullBadge : COURSES_PORTAL.videoPreviewBadge}
                </span>
              </div>

              {videoLoading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
                  <p className="text-xs">Loading video…</p>
                </div>
              ) : null}

              {!videoLoading && videoError && !playbackSrc && !iframeSrc ? (
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
                  onLoadedMetadata={(e) => {
                    preview.setDuration(e.currentTarget.duration || 0)
                    if (hasAccess && progress.videoPosition > 0) {
                      e.currentTarget.currentTime = progress.videoPosition
                    }
                  }}
                  onPlay={() => preview.setPlaying(true)}
                  onPause={() => preview.setPlaying(false)}
                  onEnded={handleVideoEnded}
                  onTimeUpdate={canPreviewVideo ? preview.onTimeUpdate : undefined}
                  onSeeking={canPreviewVideo ? preview.onSeeking : undefined}
                  onSeeked={canPreviewVideo ? preview.onSeeked : undefined}
                />
              ) : null}

              {!videoLoading && !playbackSrc && !iframeSrc && !videoError && hasAccess ? (
                <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-slate-400 text-sm">
                  {hasCustomVideo
                    ? 'Video is processing or unavailable — try again shortly.'
                    : 'No video has been assigned to this lesson yet.'}
                </div>
              ) : null}

              {!videoLoading && !playbackSrc && !iframeSrc && !videoError && hasCustomVideo && !hasAccess ? (
                <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-slate-400 text-sm">
                  Purchase this unit to watch the full lesson video.
                </div>
              ) : null}

              {!preview.playing && !showLock && playbackSrc && !videoLoading ? (
                <button
                  type="button"
                  onClick={handlePlay}
                  className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition group z-10"
                  aria-label={COURSES_PORTAL.watchPreview}
                >
                  <span className="w-16 h-16 rounded-full bg-white/95 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                    <Play className="w-7 h-7 text-slate-900 fill-slate-900 ml-1" />
                  </span>
                </button>
              ) : null}

              {hasAccess ? <VideoPlayerControls videoRef={videoRef} /> : null}

              {showLock ? (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/85 backdrop-blur-sm p-6 text-center">
                  <Lock className="w-10 h-10 text-amber-400 mb-3" aria-hidden />
                  <p className="text-lg font-bold text-white mb-1">{COURSES_PORTAL.previewEndedTitle}</p>
                  <p className="text-sm text-slate-400 max-w-sm mb-4">{COURSES_PORTAL.previewEndedDesc}</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <button type="button" onClick={onUnlockLesson} className="btn-primary text-sm px-4 py-2">
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
                  className="absolute inset-y-0 left-0 bg-cyan-500/80"
                  style={{ width: `${Math.min(100, (currentTime / duration) * 100)}%` }}
                />
                <div className="absolute top-0 bottom-0 w-0.5 bg-amber-400" style={{ left: `${previewProgress}%` }} />
              </div>
            ) : null}

            {hasAccess ? (
              <div className="px-4 py-3 border-t border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={goPrevSegment}
                  className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white"
                >
                  <ChevronLeft className="w-4 h-4" /> Overview
                </button>
                <span className="text-xs text-slate-500">
                  {progress.videoPosition > 0 ? `Resumed at ${formatTime(progress.videoPosition)}` : 'Watch to continue'}
                </span>
                {hasExercises ? (
                  <button
                    type="button"
                    onClick={() => {
                      completeSegment('video')
                      goToSegment(2)
                    }}
                    className="inline-flex items-center gap-1 text-xs text-primary hover:text-cyan-300 font-semibold"
                  >
                    随堂习题 <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      completeSegment('video')
                      goToSegment(3)
                    }}
                    className="inline-flex items-center gap-1 text-xs text-primary hover:text-cyan-300 font-semibold"
                  >
                    Summary <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : null}
          </div>
        ) : null}

        {currentSegment?.type === 'checkpoint' && hasExercises ? (
          <LessonExerciseSegment
            lessonRef={course.id}
            hasAccess={hasAccess}
            onAllComplete={() => {
              completeSegment('checkpoint')
              goNextSegment()
            }}
          />
        ) : null}

        {currentSegment?.type === 'summary' ? (
          <SummarySegment
            course={course}
            nextLessonId={nextLessonId}
            courses={courses}
            curriculumTree={curriculumTree}
            onComplete={() => completeLesson()}
            studyCenter={studyCenter}
          />
        ) : null}
      </div>

      {!hasAccess ? (
        <div className="mt-4">
          <CoursePurchasePanel
            course={course}
            hasAccess={hasAccess}
            hasTrack={hasTrack}
            onUnlockLesson={onUnlockLesson}
            onUnlockTrack={onUnlockTrack}
            moduleContext={moduleContext}
            isAuthenticated={isAuthenticated}
            stripeCheckout={stripeCheckout}
            checkoutLoading={checkoutLoading}
            setCheckoutLoading={setCheckoutLoading}
          />
        </div>
      ) : null}
    </section>
  )
}

import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Lock, Play, RotateCcw, ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { COURSES_PORTAL } from '../../config/coursesPortal'
import { getCourseVideo } from '../../config/courseVideo'
import { LESSON_SEGMENTS, getCheckpointQuestion } from '../../config/lessonSegments'
import { useLessonProgress } from '../../hooks/useLearningProgress'
import { getAdjacentLessons } from '../../lib/ioaiCourseStructure'
import CoursePurchasePanel from './CoursePurchasePanel'
import CourseStreamVideo from './CourseStreamVideo'

function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

function SegmentStepper({ currentIndex, segmentsDone, onSelect, hasAccess }) {
  return (
    <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-1 -mx-1 px-1">
      {LESSON_SEGMENTS.map((seg, i) => {
        const done = segmentsDone[seg.id]
        const active = i === currentIndex
        const canClick = hasAccess && (done || i <= currentIndex)

        return (
          <button
            key={seg.id}
            type="button"
            disabled={!canClick}
            onClick={() => canClick && onSelect(i)}
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

function CheckpointSegment({ course, onComplete }) {
  const question = getCheckpointQuestion(course)
  const [selected, setSelected] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const correct = submitted && selected === question.correctId

  const handleSubmit = () => {
    if (!selected) return
    setSubmitted(true)
    if (selected === question.correctId) {
      setTimeout(onComplete, 600)
    }
  }

  return (
    <div className="p-6 sm:p-8">
      <p className="text-xs font-bold uppercase tracking-wide text-amber-400 mb-2">Knowledge checkpoint</p>
      <h3 className="text-base font-bold text-white mb-4">{question.prompt}</h3>
      <div className="space-y-2 mb-5">
        {question.options.map((opt) => (
          <label
            key={opt.id}
            className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
              selected === opt.id
                ? 'border-primary bg-primary/10'
                : 'border-slate-700 hover:border-slate-500'
            } ${submitted && opt.id === question.correctId ? 'border-emerald-500 bg-emerald-500/10' : ''}
            ${submitted && selected === opt.id && opt.id !== question.correctId ? 'border-red-500/60 bg-red-500/10' : ''}`}
          >
            <input
              type="radio"
              name="checkpoint"
              value={opt.id}
              checked={selected === opt.id}
              onChange={() => !submitted && setSelected(opt.id)}
              className="mt-1"
              disabled={submitted}
            />
            <span className="text-sm text-slate-200">{opt.text}</span>
          </label>
        ))}
      </div>
      {submitted ? (
        <p className={`text-sm mb-4 ${correct ? 'text-emerald-400' : 'text-amber-400'}`}>
          {correct ? 'Correct! Moving to summary…' : 'Not quite — review the video and try again.'}
        </p>
      ) : null}
      {!submitted || !correct ? (
        <button
          type="button"
          onClick={submitted && !correct ? () => { setSubmitted(false); setSelected(null) } : handleSubmit}
          disabled={!selected && !submitted}
          className="btn-primary text-sm px-5 py-2.5 disabled:opacity-50"
        >
          {submitted && !correct ? 'Try again' : 'Submit answer'}
        </button>
      ) : null}
    </div>
  )
}

function SummarySegment({ course, onComplete, nextLessonId }) {
  const { index, total } = getAdjacentLessons(course.id)

  return (
    <div className="p-6 sm:p-8 text-center">
      <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
        <Check className="w-7 h-7 text-emerald-400" />
      </div>
      <p className="text-xs font-bold uppercase tracking-wide text-emerald-400 mb-2">Lesson complete</p>
      <h3 className="text-lg font-bold text-white mb-2">{course.nameEn || course.name}</h3>
      <p className="text-sm text-slate-400 mb-2">
        Lesson {index + 1} of {total} in the IOAI track
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
            to={`/courses/detail/${nextLessonId}`}
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
}) {
  const videoRef = useRef(null)
  const { url, poster, previewSeconds, isStream, hasCustomVideo } = getCourseVideo(course)
  const { progress, completeSegment, saveVideoPosition, goToSegment, completeLesson } =
    useLessonProgress(course.id)

  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [previewEnded, setPreviewEnded] = useState(false)
  const [duration, setDuration] = useState(0)

  const segmentIndex = progress.currentSegment
  const currentSegment = LESSON_SEGMENTS[segmentIndex]
  const { next: nextLessonId } = getAdjacentLessons(course.id)

  const showLock = !hasAccess && (previewEnded || currentTime >= previewSeconds - 0.5)

  useEffect(() => {
    setPreviewEnded(false)
    setCurrentTime(0)
    setPlaying(false)
  }, [course?.id, hasAccess, segmentIndex])

  useEffect(() => {
    if (segmentIndex !== 1) return undefined
    const video = videoRef.current
    if (!video) return undefined

    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime)
      if (!hasAccess && video.currentTime >= previewSeconds) {
        video.pause()
        video.currentTime = previewSeconds
        setPreviewEnded(true)
        setPlaying(false)
        return
      }
      if (hasAccess) saveVideoPosition(video.currentTime)
    }

    video.addEventListener('timeupdate', onTimeUpdate)
    return () => video.removeEventListener('timeupdate', onTimeUpdate)
  }, [segmentIndex, hasAccess, previewSeconds, course?.id, saveVideoPosition])

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

  const goNextSegment = useCallback(() => {
    if (currentSegment) completeSegment(currentSegment.id)
    goToSegment(Math.min(segmentIndex + 1, LESSON_SEGMENTS.length - 1))
  }, [completeSegment, currentSegment, goToSegment, segmentIndex])

  const goPrevSegment = useCallback(() => {
    goToSegment(Math.max(0, segmentIndex - 1))
  }, [goToSegment, segmentIndex])

  const handleVideoEnded = useCallback(() => {
    setPlaying(false)
    if (hasAccess) {
      completeSegment('video')
      goToSegment(2)
    }
  }, [hasAccess, completeSegment, goToSegment])

  const previewProgress = duration ? Math.min(100, (previewSeconds / duration) * 100) : 0

  return (
    <section className="segment-player mb-6">
      <div className="rounded-2xl overflow-hidden border border-slate-700 bg-slate-900 shadow-2xl">
        <div className="px-4 pt-4 pb-3 border-b border-slate-800 bg-slate-900/95">
          <SegmentStepper
            currentIndex={segmentIndex}
            segmentsDone={progress.segmentsDone}
            onSelect={goToSegment}
            hasAccess={hasAccess}
          />
        </div>

        {currentSegment?.type === 'intro' ? (
          <IntroSegment course={course} onContinue={goNextSegment} />
        ) : null}

        {currentSegment?.type === 'video' ? (
          <div>
            <div className="relative aspect-video bg-black">
              <div className="absolute top-3 left-3 z-20 flex gap-2">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                    hasAccess ? 'bg-emerald-500/90 text-white' : 'bg-amber-500/90 text-slate-900'
                  }`}
                >
                  {hasAccess ? COURSES_PORTAL.videoFullBadge : COURSES_PORTAL.videoPreviewBadge}
                </span>
              </div>

              <CourseStreamVideo
                videoRef={videoRef}
                src={url}
                poster={poster}
                className="w-full h-full object-contain"
                playsInline
                preload="metadata"
                controls={hasAccess}
                controlsList={hasAccess ? undefined : 'nodownload noplaybackrate'}
                onLoadedMetadata={(e) => {
                  const d = e.currentTarget.duration || 0
                  setDuration(d)
                  if (hasAccess && progress.videoPosition > 0) {
                    e.currentTarget.currentTime = progress.videoPosition
                  }
                }}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onEnded={handleVideoEnded}
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
                <button
                  type="button"
                  onClick={() => {
                    completeSegment('video')
                    goToSegment(2)
                  }}
                  className="inline-flex items-center gap-1 text-xs text-primary hover:text-cyan-300 font-semibold"
                >
                  Checkpoint <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ) : null}
          </div>
        ) : null}

        {currentSegment?.type === 'checkpoint' ? (
          <CheckpointSegment course={course} onComplete={goNextSegment} />
        ) : null}

        {currentSegment?.type === 'summary' ? (
          <SummarySegment
            course={course}
            nextLessonId={nextLessonId}
            onComplete={() => completeLesson()}
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

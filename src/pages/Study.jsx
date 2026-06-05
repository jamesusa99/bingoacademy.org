import { useMemo } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { PlayCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useIOAICourseContext } from '../hooks/useIOAICourseContext'
import { usePurchasedCourses } from '../hooks/usePurchasedCourses'
import { findCourseInList } from '../lib/catalogCourse'
import { hasFullIOAITrack, IOAI_FULL_TRACK_SLUG } from '../lib/courseAccess'
import { authLink } from '../lib/authRedirect'
import { claimFreeTrial, hasClaimedFreeTrial, FREE_TRIAL_COURSE_HREF } from '../lib/freeTrial'
import {
  getAllIOAILessonIds,
  getFirstIOAILessonId,
  isIOAITrackId,
} from '../lib/ioaiCourseStructure'
import { getTrackProgressStats, getLessonProgress, getContinueLessonId } from '../lib/learningProgress'

function ProgressBar({ percent }) {
  return (
    <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden mt-2">
      <div
        className="h-full bg-primary transition-all"
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}

function buildStudyCourses(slugs, catalog) {
  const fullTrack = hasFullIOAITrack(slugs)
  const items = []

  if (fullTrack) {
    const track = findCourseInList(catalog, IOAI_FULL_TRACK_SLUG)
    if (track) items.push({ ...track, accessType: 'full-track' })
  }

  for (const slug of slugs) {
    if (slug === IOAI_FULL_TRACK_SLUG || slug === 'ioai-track') continue
    const course = findCourseInList(catalog, slug)
    if (course) items.push({ ...course, accessType: 'lesson' })
  }

  return items
}

function courseContinueHref(course, catalog, tree) {
  if (isIOAITrackId(course.id)) {
    const lessonId = getContinueLessonId(getAllIOAILessonIds(catalog, tree))
    return lessonId ? `/courses/detail/${lessonId}` : `/courses/detail/${IOAI_FULL_TRACK_SLUG}`
  }
  return `/courses/detail/${course.id}`
}

function courseProgressLabel(course, catalog, tree) {
  if (isIOAITrackId(course.id)) {
    const stats = getTrackProgressStats(getAllIOAILessonIds(catalog, tree))
    return `${stats.percent}% · ${stats.completed}/${stats.total} lessons`
  }
  const p = getLessonProgress(course.id)
  if (p.completed) return 'Completed'
  if (p.lastVisitedAt) return 'In progress'
  return 'Not started'
}

export default function Study() {
  const { isAuthenticated, loading } = useAuth()
  const { courses: catalog, tree, loading: catalogLoading } = useIOAICourseContext()
  const { purchased, refresh, stripeCheckout } = usePurchasedCourses()
  const courses = useMemo(() => buildStudyCourses(purchased, catalog), [purchased, catalog])
  const firstLessonId = getFirstIOAILessonId(catalog, tree)
  const trialActive = hasClaimedFreeTrial()
  const trialLessonHref = firstLessonId ? `/courses/detail/${firstLessonId}` : FREE_TRIAL_COURSE_HREF

  const handleClaimTrial = () => {
    claimFreeTrial()
    refresh()
  }

  if (loading || catalogLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500 text-sm">Loading…</div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to={authLink('/login', '/profile/study')} replace />
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/profile" className="text-slate-500 hover:text-primary text-sm">← Profile</Link>
      </div>
      <h1 className="text-2xl font-bold text-bingo-dark mb-2">Study Center</h1>
      <p className="text-slate-600 mb-8">
        Your enrolled courses — watch lessons, take notes, and track progress.
      </p>

      <section className="mb-10">
        <h2 className="section-title">My Courses</h2>
        <p className="text-slate-600 text-sm mb-4">
          {courses.length
            ? `${courses.length} course${courses.length === 1 ? '' : 's'} unlocked — pick up where you left off`
            : 'Unlock a lesson or purchase a track to start learning'}
        </p>

        {courses.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => {
              const href = courseContinueHref(course, catalog, tree)
              const progressText = courseProgressLabel(course, catalog, tree)
              const trackStats = isIOAITrackId(course.id)
                ? getTrackProgressStats(getAllIOAILessonIds(catalog, tree))
                : null

              return (
                <Link
                  key={course.id}
                  to={href}
                  className="card p-5 hover:shadow-md hover:border-primary/30 transition group flex flex-col"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-primary">
                      {course.accessType === 'full-track' ? 'Full track' : course.badge || 'Lesson'}
                    </span>
                    <PlayCircle className="w-4 h-4 text-slate-400 group-hover:text-primary shrink-0" aria-hidden />
                  </div>
                  <h3 className="font-semibold text-bingo-dark text-sm group-hover:text-primary transition flex-1">
                    {course.nameEn || course.name}
                  </h3>
                  {course.hours ? (
                    <p className="text-xs text-slate-500 mt-2">{course.hours}</p>
                  ) : null}
                  <p className="text-xs text-slate-600 mt-2">{progressText}</p>
                  {trackStats ? <ProgressBar percent={trackStats.percent} /> : null}
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary mt-4">
                    Continue learning <span aria-hidden>→</span>
                  </span>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="card p-6 border-primary/20 space-y-5">
            <p className="text-slate-600 text-sm">
              Courses appear here after you unlock or purchase them. Choose one of the options below:
            </p>
            <ol className="text-sm text-slate-700 space-y-3 list-decimal list-inside">
              <li>
                <strong>Free trial</strong> — unlock your first IOAI lesson at no cost.
              </li>
              <li>
                <strong>Single lesson</strong> — open a course, watch the preview, then click{' '}
                <strong>Unlock This Lesson</strong> or <strong>Enroll Now</strong>.
              </li>
              <li>
                <strong>Full IOAI track</strong> — on the{' '}
                <Link to={`/courses/detail/${IOAI_FULL_TRACK_SLUG}`} className="text-primary hover:underline">
                  IOAI track page
                </Link>
                , choose <strong>Get IOAI Full Track</strong>.
              </li>
            </ol>
            {!stripeCheckout ? (
              <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                Demo mode: purchases unlock instantly in your browser (no Stripe payment required).
              </p>
            ) : null}
            <div className="flex flex-wrap gap-3">
              {!trialActive ? (
                <button type="button" onClick={handleClaimTrial} className="btn-primary text-sm px-4 py-2">
                  Claim free trial
                </button>
              ) : (
                <Link to={trialLessonHref} className="btn-primary text-sm px-4 py-2">
                  Open free trial lesson
                </Link>
              )}
              <Link
                to="/courses?line=ioai&sub=video"
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                Browse &amp; purchase courses
              </Link>
              <Link
                to={`/courses/detail/${IOAI_FULL_TRACK_SLUG}`}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                IOAI full track
              </Link>
            </div>
          </div>
        )}
      </section>

      <section className="mb-10">
        <h2 className="section-title">Features</h2>
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <li className="card p-5">
            <span className="font-semibold text-primary">Playback</span>
            <p className="text-sm text-slate-600 mt-1">Video/live replay, resume from last position</p>
          </li>
          <li className="card p-5">
            <span className="font-semibold text-primary">Speed</span>
            <p className="text-sm text-slate-600 mt-1">0.75x–2x playback</p>
          </li>
          <li className="card p-5">
            <span className="font-semibold text-primary">Notes</span>
            <p className="text-sm text-slate-600 mt-1">Take notes during lessons; export and review</p>
          </li>
          <li className="card p-5">
            <span className="font-semibold text-primary">Q&A</span>
            <p className="text-sm text-slate-600 mt-1">Ask questions; mentor/TA answers</p>
          </li>
          <li className="card p-5">
            <span className="font-semibold text-primary">Assignments</span>
            <p className="text-sm text-slate-600 mt-1">Submit online; grading and feedback</p>
          </li>
        </ul>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link to="/courses" className="btn-primary">Browse Courses</Link>
        <Link to="/profile" className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
          Back to Profile
        </Link>
      </div>
    </div>
  )
}

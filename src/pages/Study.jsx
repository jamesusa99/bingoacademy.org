import { useMemo } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { PlayCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useIOAICourseContext } from '../hooks/useIOAICourseContext'
import { useIOAIStore } from '../hooks/useIOAIStore'
import { usePurchasedCourses } from '../hooks/usePurchasedCourses'
import { hasFullIOAITrack, IOAI_FULL_TRACK_SLUG } from '../lib/courseAccess'
import { authLink } from '../lib/authRedirect'
import { claimFreeTrial, hasClaimedFreeTrial } from '../lib/freeTrial'
import { useFreeTrialLesson } from '../hooks/useFreeTrialLesson'
import { studyLessonPath } from '../lib/studyPaths'
import {
  buildStudyCourses,
  studyCourseContinueHref,
  studyCourseProgressLabel,
  studyCourseProgressStats,
} from '../lib/studyCourses'
import ModuleCoverImage from '../components/courses/ModuleCoverImage'

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

function accessTypeLabel(accessType) {
  if (accessType === 'full-track') return 'Full track'
  if (accessType === 'module') return 'Module unit'
  return 'Lesson'
}

export default function Study() {
  const { isAuthenticated, loading } = useAuth()
  const { courses: catalog, tree, loading: catalogLoading } = useIOAICourseContext()
  const { levels, loading: storeLoading } = useIOAIStore()
  const { enrollmentSlugs, ioaiModuleSlugs, refresh, stripeCheckout } = usePurchasedCourses()
  const courses = useMemo(
    () =>
      buildStudyCourses({
        enrollmentSlugs,
        ioaiModuleSlugs,
        catalog,
        levels,
      }),
    [enrollmentSlugs, ioaiModuleSlugs, catalog, levels]
  )
  const { catalogSlug: trialCatalogSlug } = useFreeTrialLesson()
  const trialActive = hasClaimedFreeTrial()
  const trialLessonHref = studyLessonPath(trialCatalogSlug, { play: true })

  const handleClaimTrial = () => {
    claimFreeTrial(trialCatalogSlug)
    refresh()
  }

  if (loading || catalogLoading || storeLoading) {
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
              const href = studyCourseContinueHref(course, catalog, tree)
              const progressText = studyCourseProgressLabel(course, catalog, levels, tree)
              const trackStats = studyCourseProgressStats(course, catalog, levels, tree)

              return (
                <Link
                  key={course.id}
                  to={href}
                  className="card p-5 hover:shadow-md hover:border-primary/30 transition group flex flex-col overflow-hidden"
                >
                  {course.accessType === 'module' && course.coverUrl ? (
                    <div className="relative -mx-5 -mt-5 mb-3 aspect-[16/9] bg-slate-100 overflow-hidden">
                      <ModuleCoverImage
                        coverUrl={course.coverUrl}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                      />
                    </div>
                  ) : null}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-primary">
                      {course.badge || accessTypeLabel(course.accessType)}
                    </span>
                    <PlayCircle className="w-4 h-4 text-slate-400 group-hover:text-primary shrink-0" aria-hidden />
                  </div>
                  <h3 className="font-semibold text-bingo-dark text-sm group-hover:text-primary transition flex-1">
                    {course.nameEn || course.name}
                  </h3>
                  {course.accessType === 'module' && (course.levelTitle || course.themeTitle) ? (
                    <p className="text-[10px] text-slate-500 mt-1">
                      {[course.levelTitle, course.themeTitle].filter(Boolean).join(' · ')}
                    </p>
                  ) : null}
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
                <strong>IOAI module unit</strong> — purchase a module on the{' '}
                <Link to="/courses?line=ioai" className="text-primary hover:underline">
                  IOAI courses page
                </Link>{' '}
                to unlock every lesson inside.
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

      <div className="flex flex-wrap gap-3">
        <Link to="/courses" className="btn-primary">Browse Courses</Link>
        <Link to="/profile" className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
          Back to Profile
        </Link>
      </div>
    </div>
  )
}

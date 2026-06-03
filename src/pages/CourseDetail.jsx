import { Link, useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getProductLine, isCourseComingSoon, subcategoryLabel } from '../config/products'
import { EXPLORATION_EXPERIMENTS } from '../config/explorationLab'
import { COURSES_PORTAL } from '../config/coursesPortal'
import { useCourseCatalog } from '../hooks/useCourseCatalog'
import { useCourseAccess } from '../hooks/useCourseAccess'
import { useAuth } from '../contexts/AuthContext'
import { findCourseInList } from '../lib/catalogCourse'
import { isVideoCourse } from '../lib/courseAccess'
import { isPurchasableCourse, resolvePurchaseType, getCheckoutPriceLabel } from '../lib/coursePricing'
import { initiateCoursePurchase } from '../lib/coursePurchase'
import {
  isIOAILessonId,
  isIOAITrackId,
  isIOAIVideoCourse,
  getAllIOAILessonIds,
} from '../lib/ioaiCourseStructure'
import { getContinueLessonId } from '../lib/learningProgress'
import CourseComingSoon from '../components/CourseComingSoon'
import CourseVideoPlayer from '../components/courses/CourseVideoPlayer'
import CoursePurchasePanel from '../components/courses/CoursePurchasePanel'
import SegmentPlayer from '../components/courses/SegmentPlayer'
import CourseLessonList from '../components/courses/CourseLessonList'
import CourseTrackOverview from '../components/courses/CourseTrackOverview'
import CoursePreviewBar from '../components/courses/CoursePreviewBar'
import PageContent from '../components/PageContent'
import { confirmCheckoutSession } from '../lib/checkout'

export default function CourseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [checkoutMessage, setCheckoutMessage] = useState(null)
  const { courses, loading } = useCourseCatalog()
  const { isAuthenticated } = useAuth()
  const item = findCourseInList(courses, id)
  const line = getProductLine(item?.line ?? 'general')
  const {
    hasAccess,
    hasTrack,
    purchased,
    unlockLesson,
    unlockTrack,
    refresh,
    stripeCheckout,
    checkoutLoading,
    setCheckoutLoading,
  } = useCourseAccess(item?.id)

  useEffect(() => {
    const status = searchParams.get('checkout')
    const sessionId = searchParams.get('session_id')
    if (status === 'success' && sessionId && isAuthenticated) {
      confirmCheckoutSession(sessionId)
        .then(() => {
          setCheckoutMessage('Payment successful — your course is unlocked!')
          refresh()
        })
        .catch(() => {
          setCheckoutMessage('Payment received — refreshing access…')
          refresh()
        })
        .finally(() => {
          searchParams.delete('checkout')
          searchParams.delete('session_id')
          setSearchParams(searchParams, { replace: true })
        })
    } else if (status === 'canceled') {
      setCheckoutMessage('Checkout canceled.')
      searchParams.delete('checkout')
      setSearchParams(searchParams, { replace: true })
    }
  }, [searchParams, setSearchParams, isAuthenticated, refresh])

  const previewMode = searchParams.get('preview') === '1'
  const fromAdmin = searchParams.get('from') === 'admin' || previewMode

  const purchaseProps = {
    stripeCheckout,
    checkoutLoading,
    setCheckoutLoading,
    isAuthenticated,
    previewMode,
  }

  const handleEnrollClick = () => {
    if (!item) return
    initiateCoursePurchase({
      course: item,
      purchaseType: resolvePurchaseType(item),
      stripeCheckout,
      isAuthenticated,
      navigate,
      setCheckoutLoading,
      onDemoUnlock: { lesson: unlockLesson, track: unlockTrack },
    })
  }

  if (loading) {
    return (
      <PageContent className="py-12 text-center text-slate-500 text-sm">Loading course…</PageContent>
    )
  }

  if (!item) {
    return (
      <PageContent className="py-12 text-center">
        <p className="text-slate-600 mb-4">{COURSES_PORTAL.notFound}</p>
        <Link to="/courses" className="btn-primary text-sm px-5 py-2">
          {COURSES_PORTAL.backToCourses}
        </Link>
      </PageContent>
    )
  }

  const comingSoon = isCourseComingSoon(item)
  const isIOAI = isIOAIVideoCourse(item.id)
  const isTrack = isIOAITrackId(item.id)
  const isLesson = isIOAILessonId(item.id)
  const showSegmentLearning = isLesson && isVideoCourse(item) && !comingSoon
  const showTrackOverview = isTrack && !comingSoon
  const showLegacyVideo = isVideoCourse(item) && !comingSoon && !isIOAI
  const linkedLabs = (item.labSlugs ?? [])
    .map((slug) => EXPLORATION_EXPERIMENTS.find((e) => e.id === slug))
    .filter(Boolean)

  const pageWidth = isIOAI ? 'max-w-6xl' : 'max-w-4xl'

  return (
    <PageContent className={`py-6 sm:py-8 ${pageWidth} mx-auto`}>
      {previewMode ? <CoursePreviewBar course={item} fromAdmin={fromAdmin} /> : null}

      {!previewMode ? (
        <Link to={`/courses?line=${item.line}&sub=${item.sub}`} className="text-primary text-sm hover:underline">
          ← {COURSES_PORTAL.backTo} {line.name}
        </Link>
      ) : null}

      <div className="card p-5 mt-4 mb-6">
        <div className="flex gap-4 flex-wrap">
          <div
            className={`w-20 h-20 rounded-xl bg-gradient-to-br ${line.gradient} flex items-center justify-center text-3xl shrink-0 border ${line.border} overflow-hidden`}
          >
            {item.thumbnail ? (
              <img src={item.thumbnail} alt="" className="w-full h-full object-cover" />
            ) : (
              line.icon
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">
                {item.badge}
              </span>
              {comingSoon ? (
                <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                  {COURSES_PORTAL.statusComingSoon}
                </span>
              ) : hasAccess ? (
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  {COURSES_PORTAL.videoFullBadge}
                </span>
              ) : (
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  {COURSES_PORTAL.statusEnrolling}
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-bingo-dark">{item.name}</h1>
            {item.nameEn && item.nameEn !== item.name && (
              <p className="text-xs text-slate-500 mt-0.5">{item.nameEn}</p>
            )}
            <p className="text-xs text-slate-500 mt-2">
              {subcategoryLabel(item.line, item.sub)} · {item.hours} · {item.price}
            </p>
          </div>
        </div>
      </div>

      {checkoutMessage ? (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {checkoutMessage}
        </div>
      ) : null}

      {comingSoon ? (
        <CourseComingSoon course={item} line={line} />
      ) : (
        <>
          {showTrackOverview ? (
            <>
              {!hasAccess ? (
                <CoursePurchasePanel
                  course={item}
                  hasAccess={hasAccess}
                  hasTrack={hasTrack}
                  onUnlockLesson={unlockLesson}
                  onUnlockTrack={unlockTrack}
                  {...purchaseProps}
                />
              ) : null}
              <CourseTrackOverview
                track={item}
                purchasedSlugs={purchased}
                hasAccess={hasAccess}
                courses={courses}
              />
            </>
          ) : null}

          {showSegmentLearning ? (
            <div className="grid lg:grid-cols-5 gap-6 mb-6">
              <div className="lg:col-span-3">
                <SegmentPlayer
                  course={item}
                  hasAccess={hasAccess}
                  hasTrack={hasTrack}
                  onUnlockLesson={unlockLesson}
                  onUnlockTrack={unlockTrack}
                  courses={courses}
                  {...purchaseProps}
                />
              </div>
              <div className="lg:col-span-2">
                <CourseLessonList
                  activeLessonId={item.id}
                  purchasedSlugs={purchased}
                  courses={courses}
                />
              </div>
            </div>
          ) : null}

          {showLegacyVideo ? (
            <CourseVideoPlayer
              course={item}
              hasAccess={hasAccess}
              hasTrack={hasTrack}
              onUnlockLesson={unlockLesson}
              onUnlockTrack={unlockTrack}
              {...purchaseProps}
            />
          ) : null}

          {!showTrackOverview && !showSegmentLearning ? (
            <p className="text-sm text-slate-700 leading-relaxed mb-6">{item.desc}</p>
          ) : null}

          {!isIOAI && item.audience ? (
            <section className="card p-5 mb-4">
              <h2 className="font-bold text-bingo-dark text-sm mb-2">{COURSES_PORTAL.audience}</h2>
              <p className="text-sm text-slate-600">{item.audience}</p>
            </section>
          ) : null}

          {!isIOAI && item.outcomes?.length > 0 ? (
            <section className="card p-5 mb-4">
              <h2 className="font-bold text-bingo-dark text-sm mb-3">{COURSES_PORTAL.outcomes}</h2>
              <ul className="space-y-2">
                {item.outcomes.map((o) => (
                  <li key={o} className="text-sm text-slate-600 flex gap-2">
                    <span className="text-emerald-500 shrink-0">✓</span>
                    {o}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {!isIOAI && item.syllabus?.length > 0 ? (
            <section className="card overflow-hidden mb-6">
              <div className="p-4 border-b border-slate-100 font-semibold text-bingo-dark text-sm">
                {COURSES_PORTAL.syllabus}
              </div>
              <ol className="divide-y divide-slate-100">
                {item.syllabus.map((unit, i) => (
                  <li key={unit} className="p-4 flex gap-3 text-sm text-slate-700">
                    <span className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    {unit}
                  </li>
                ))}
              </ol>
            </section>
          ) : null}

          {linkedLabs.length > 0 && (
            <section className="card p-5 mb-6 border-violet-200/60 bg-violet-50/30">
              <h2 className="font-bold text-bingo-dark text-sm mb-2">{COURSES_PORTAL.linkedLabs}</h2>
              <p className="text-xs text-slate-600 mb-3">{COURSES_PORTAL.linkedLabsDesc}</p>
              <div className="flex flex-wrap gap-2">
                {linkedLabs.map((lab) => (
                  <Link
                    key={lab.id}
                    to={lab.playPath ?? '/exploration'}
                    className="text-xs font-semibold px-3 py-2 rounded-xl bg-white border border-violet-200 text-violet-800 hover:border-violet-400 transition"
                  >
                    {lab.emoji} {lab.title}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {!showTrackOverview && !showSegmentLearning && !showLegacyVideo ? (
            <CoursePurchasePanel
              course={item}
              hasAccess={hasAccess}
              hasTrack={hasTrack}
              onUnlockLesson={unlockLesson}
              onUnlockTrack={unlockTrack}
              {...purchaseProps}
            />
          ) : null}

          <div className="flex flex-wrap gap-3 justify-center mt-6">
            {hasAccess ? (
              <Link
                to={
                  isTrack
                    ? `/courses/detail/${getContinueLessonId(getAllIOAILessonIds(courses)) ?? 'ioai-1-1'}`
                    : '/profile/study'
                }
                className="btn-primary text-sm px-5 py-2.5"
              >
                {COURSES_PORTAL.continueLearning}
              </Link>
            ) : isPurchasableCourse(item) ? (
              <button
                type="button"
                onClick={handleEnrollClick}
                disabled={checkoutLoading}
                className="btn-primary text-sm px-5 py-2.5 disabled:opacity-60"
              >
                {checkoutLoading
                  ? 'Redirecting…'
                  : stripeCheckout
                    ? COURSES_PORTAL.purchaseCourse(getCheckoutPriceLabel(item, resolvePurchaseType(item)))
                    : COURSES_PORTAL.enrollCta}
              </button>
            ) : (
              <Link to="/contact" className="btn-primary text-sm px-5 py-2.5">
                {COURSES_PORTAL.contactSales}
              </Link>
            )}
            {isTrack ? (
              <Link
                to="/courses?line=ioai&sub=video"
                className="text-sm px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                Browse all lessons
              </Link>
            ) : null}
            <Link
              to="/assessment"
              className="text-sm px-5 py-2.5 rounded-xl border border-primary text-primary hover:bg-primary/5"
            >
              {COURSES_PORTAL.freeAssessment}
            </Link>
          </div>
        </>
      )}
    </PageContent>
  )
}

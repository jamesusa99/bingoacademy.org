import { Link, Navigate, useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useState, useCallback } from 'react'
import { getProductLine, isCourseComingSoon, isCourseOffline, subcategoryLabel } from '../config/products'
import { EXPLORATION_EXPERIMENTS } from '../config/explorationLab'
import { COURSES_PORTAL } from '../config/coursesPortal'
import { useCourseCatalog } from '../hooks/useCourseCatalog'
import { useProgramCurriculum } from '../hooks/useProgramCurriculum'
import { isCurriculumLine } from '../config/programCurriculum'
import { useCourseAccess } from '../hooks/useCourseAccess'
import { useAuth } from '../contexts/AuthContext'
import { findCourseInList, isLabMaterialCatalogCourse } from '../lib/catalogCourse'
import { isVideoCourse } from '../lib/courseAccess'
import { isPurchasableCourse, resolvePurchaseType, getCheckoutPriceLabel } from '../lib/coursePricing'
import { initiateCoursePurchase } from '../lib/coursePurchase'
import {
  isProgramLessonId,
  isProgramTrackId,
  isProgramVideoCourse,
  getFirstProgramLessonId,
  getAllProgramLessonIds,
  buildProgramCurriculum,
  getProgramCurriculumSummary,
  findModuleForLesson,
} from '../lib/ioaiCourseStructure'
import { buildModuleCatalogSlug, formatIoaiPrice } from '../lib/ioaiStore'
import { getContinueLessonId } from '../lib/learningProgress'
import CourseComingSoon from '../components/CourseComingSoon'
import CourseVideoPlayer from '../components/courses/CourseVideoPlayer'
import CoursePurchasePanel from '../components/courses/CoursePurchasePanel'
import SegmentPlayer from '../components/courses/SegmentPlayer'
import CourseLessonList from '../components/courses/CourseLessonList'
import CourseTrackOverview from '../components/courses/CourseTrackOverview'
import CoursePreviewBar from '../components/courses/CoursePreviewBar'
import LabMaterialCourseDetail from '../components/courses/LabMaterialCourseDetail'
import PageContent from '../components/PageContent'
import { confirmCheckoutSession } from '../lib/checkout'
import { labMaterialTypeLabel, normalizeLabMaterialSub } from '../config/labMaterials'
import { labsPath } from '../config/productLabs'

export default function CourseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [checkoutMessage, setCheckoutMessage] = useState(null)
  const { courses, loading: catalogLoading, reload } = useCourseCatalog()
  const item = findCourseInList(courses, id)
  const isLabMaterial = item ? isLabMaterialCatalogCourse(item) : false
  const progLine = item?.line && isCurriculumLine(item.line) && !isLabMaterial ? item.line : null
  const { tree, loading: treeLoading, reload: reloadTree } = useProgramCurriculum(progLine)
  const curriculum = useMemo(
    () => (progLine ? buildProgramCurriculum(courses, tree, progLine) : []),
    [courses, tree, progLine]
  )
  const summary = useMemo(
    () => (progLine ? getProgramCurriculumSummary(tree, progLine) : null),
    [tree, progLine]
  )
  const loading = catalogLoading || (progLine ? treeLoading : false)
  const { isAuthenticated } = useAuth()

  const moduleContext = useMemo(() => {
    if (!item?.id || isLabMaterial) return null
    const isLesson =
      progLine && isProgramLessonId(item.id, courses, tree, progLine)
    if (!isLesson) return null
    const found = findModuleForLesson(item.id, tree)
    if (!found) return null
    const catalogSlug =
      found.catalogSlug ||
      buildModuleCatalogSlug(found.levelId, found.themeId, found.moduleId)
    if (!catalogSlug) return null
    return { ...found, catalogSlug }
  }, [item?.id, isLabMaterial, progLine, courses, tree])

  const reloadAll = useCallback(async () => {
    await Promise.all([reload(), progLine ? reloadTree() : Promise.resolve()])
  }, [reload, reloadTree, progLine])

  const previewMode = searchParams.get('preview') === '1'
  const fromAdmin = searchParams.get('from') === 'admin' || previewMode
  const adminReloadToken = searchParams.get('reload')

  useEffect(() => {
    reloadAll()
  }, [id, reloadAll])

  useEffect(() => {
    if (!fromAdmin) return
    reloadAll()
    const timer = window.setTimeout(() => reloadAll(), 600)
    return () => window.clearTimeout(timer)
  }, [fromAdmin, id, reloadAll, adminReloadToken])

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

  if (!item || (isCourseOffline(item) && !previewMode)) {
    return (
      <PageContent className="py-12 text-center">
        <p className="text-slate-600 mb-4">{COURSES_PORTAL.notFound}</p>
        <Link to="/courses" className="btn-primary text-sm px-5 py-2">
          {COURSES_PORTAL.backToCourses}
        </Link>
      </PageContent>
    )
  }

  if (item.sub === 'module' && item.line === 'ioai') {
    return <Navigate to={`/courses/module/${encodeURIComponent(item.id)}`} replace />
  }

  const comingSoon = isCourseComingSoon(item)
  const isProgram = progLine && !isLabMaterial && isProgramVideoCourse(item.id, courses, tree, progLine)
  const isTrack = progLine && isProgramTrackId(item.id, progLine)
  const isLesson = progLine && isProgramLessonId(item.id, courses, tree, progLine)
  const showSegmentLearning = isLesson && isVideoCourse(item) && !comingSoon
  const showTrackOverview = isTrack && !comingSoon
  const showLegacyVideo = isVideoCourse(item) && !comingSoon && !isProgram
  const linkedLabs = (item.labSlugs ?? [])
    .map((slug) => EXPLORATION_EXPERIMENTS.find((e) => e.id === slug))
    .filter(Boolean)

  const pageWidth = isProgram ? 'max-w-6xl' : 'max-w-4xl'
  const backHref = isLabMaterial
    ? labsPath(item.line, normalizeLabMaterialSub(item.sub, item.line))
    : `/courses?line=${item.line}&sub=${item.sub}`

  if (isLabMaterial && !comingSoon) {
    return (
      <PageContent className={`py-6 sm:py-8 ${pageWidth} mx-auto`}>
        {previewMode ? <CoursePreviewBar course={item} fromAdmin={fromAdmin} /> : null}

        {!previewMode ? (
          <Link to={backHref} className="text-primary text-sm hover:underline">
            ← {COURSES_PORTAL.backToLabs}
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
                  {labMaterialTypeLabel(item.sub, item.line)}
                </span>
                {hasAccess ? (
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
              {item.nameEn && item.nameEn !== item.name ? (
                <p className="text-xs text-slate-500 mt-0.5">{item.nameEn}</p>
              ) : null}
              <p className="text-xs text-slate-500 mt-2">
                {line.name} · {item.hours}
                {item.price ? ` · ${item.price}` : ''}
              </p>
            </div>
          </div>
        </div>

        {checkoutMessage ? (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {checkoutMessage}
          </div>
        ) : null}

        <LabMaterialCourseDetail
          item={item}
          hasAccess={hasAccess}
          hasTrack={hasTrack}
          onUnlockLesson={unlockLesson}
          onUnlockTrack={unlockTrack}
          purchaseProps={purchaseProps}
        />
      </PageContent>
    )
  }

  const pageWidthDefault = isProgram ? 'max-w-6xl' : 'max-w-4xl'

  return (
    <PageContent className={`py-6 sm:py-8 ${pageWidthDefault} mx-auto`}>
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
                  moduleContext={moduleContext}
                  {...purchaseProps}
                />
              ) : null}
              <CourseTrackOverview
                track={item}
                purchasedSlugs={purchased}
                hasAccess={hasAccess}
                courses={courses}
                curriculum={curriculum}
                summary={summary}
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
                  curriculumTree={tree}
                  moduleContext={moduleContext}
                  {...purchaseProps}
                />
              </div>
              <div className="lg:col-span-2">
                <CourseLessonList
                  activeLessonId={item.id}
                  purchasedSlugs={purchased}
                  curriculum={curriculum}
                  summaryText={summary.summary}
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

          {!isProgram && item.audience ? (
            <section className="card p-5 mb-4">
              <h2 className="font-bold text-bingo-dark text-sm mb-2">{COURSES_PORTAL.audience}</h2>
              <p className="text-sm text-slate-600">{item.audience}</p>
            </section>
          ) : null}

          {!isProgram && item.outcomes?.length > 0 ? (
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

          {!isProgram && item.syllabus?.length > 0 ? (
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
              moduleContext={moduleContext}
              {...purchaseProps}
            />
          ) : null}

          <div className="flex flex-wrap gap-3 justify-center mt-6">
            {hasAccess ? (
              <Link
                to={
                  isTrack
                    ? `/courses/detail/${getContinueLessonId(getAllProgramLessonIds(courses, tree, progLine)) ?? getFirstProgramLessonId(courses, tree, progLine) ?? ''}`
                    : '/profile/study'
                }
                className="btn-primary text-sm px-5 py-2.5"
              >
                {COURSES_PORTAL.continueLearning}
              </Link>
            ) : moduleContext?.catalogSlug ? (
              <Link
                to={`/courses/module/${encodeURIComponent(moduleContext.catalogSlug)}`}
                className="btn-primary text-sm px-5 py-2.5"
              >
                {moduleContext.priceCents
                  ? COURSES_PORTAL.purchaseCourse(formatIoaiPrice(moduleContext.priceCents, moduleContext.currency))
                  : 'View unit & purchase'}
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

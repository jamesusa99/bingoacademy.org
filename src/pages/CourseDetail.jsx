import { Link, useParams } from 'react-router-dom'
import { getProductLine, isCourseComingSoon, subcategoryLabel } from '../config/products'
import { EXPLORATION_EXPERIMENTS } from '../config/explorationLab'
import { COURSES_PORTAL } from '../config/coursesPortal'
import { useCourseCatalog } from '../hooks/useCourseCatalog'
import { useCourseAccess } from '../hooks/useCourseAccess'
import { useAuth } from '../contexts/AuthContext'
import { findCourseInList } from '../lib/catalogCourse'
import { isVideoCourse } from '../lib/courseAccess'
import CourseComingSoon from '../components/CourseComingSoon'
import CourseVideoPlayer from '../components/courses/CourseVideoPlayer'
import CoursePurchasePanel from '../components/courses/CoursePurchasePanel'
import PageContent from '../components/PageContent'

export default function CourseDetail() {
  const { id } = useParams()
  const { courses, loading } = useCourseCatalog()
  const { isAuthenticated } = useAuth()
  const item = findCourseInList(courses, id)
  const line = getProductLine(item?.line ?? 'general')
  const { hasAccess, hasTrack, unlockLesson, unlockTrack } = useCourseAccess(item?.id)

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
  const showVideo = isVideoCourse(item) && !comingSoon
  const linkedLabs = (item.labSlugs ?? [])
    .map((slug) => EXPLORATION_EXPERIMENTS.find((e) => e.id === slug))
    .filter(Boolean)

  return (
    <PageContent className="py-6 sm:py-8 max-w-4xl mx-auto">
      <Link to={`/courses?line=${item.line}&sub=${item.sub}`} className="text-primary text-sm hover:underline">
        ← {COURSES_PORTAL.backTo} {line.name}
      </Link>

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

      {comingSoon ? (
        <CourseComingSoon course={item} line={line} />
      ) : (
        <>
          {showVideo ? (
            <CourseVideoPlayer
              course={item}
              hasAccess={hasAccess}
              hasTrack={hasTrack}
              onUnlockLesson={unlockLesson}
              onUnlockTrack={unlockTrack}
              isAuthenticated={isAuthenticated}
            />
          ) : null}

          <p className="text-sm text-slate-700 leading-relaxed mb-6">{item.desc}</p>

          {item.audience && (
            <section className="card p-5 mb-4">
              <h2 className="font-bold text-bingo-dark text-sm mb-2">{COURSES_PORTAL.audience}</h2>
              <p className="text-sm text-slate-600">{item.audience}</p>
            </section>
          )}

          {item.outcomes?.length > 0 && (
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
          )}

          {item.syllabus?.length > 0 && (
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
          )}

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

          {!showVideo ? (
            <CoursePurchasePanel
              course={item}
              hasAccess={hasAccess}
              hasTrack={hasTrack}
              onUnlockLesson={unlockLesson}
              onUnlockTrack={unlockTrack}
              isAuthenticated={isAuthenticated}
            />
          ) : null}

          <div className="flex flex-wrap gap-3 justify-center mt-6">
            {hasAccess ? (
              <Link to="/profile/study" className="btn-primary text-sm px-5 py-2.5">
                {COURSES_PORTAL.continueLearning}
              </Link>
            ) : (
              <button type="button" onClick={unlockLesson} className="btn-primary text-sm px-5 py-2.5">
                {COURSES_PORTAL.enrollCta}
              </button>
            )}
            <Link
              to="/assessment"
              className="text-sm px-5 py-2.5 rounded-xl border border-primary text-primary hover:bg-primary/5"
            >
              {COURSES_PORTAL.freeAssessment}
            </Link>
            <Link
              to="/cert"
              className="text-sm px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              {COURSES_PORTAL.contactSales}
            </Link>
          </div>
        </>
      )}
    </PageContent>
  )
}

import { useMemo } from 'react'
import { Link, useSearchParams, Navigate } from 'react-router-dom'
import {
  PRODUCT_LINES,
  getProductLine,
  subcategoryLabel,
  isCourseComingSoon,
} from '../config/products'
import { isVideoCoursesSub } from '../config/courseListFilters'
import { COURSES_PORTAL } from '../config/coursesPortal'
import { useCourseCatalog } from '../hooks/useCourseCatalog'
import { useProgramCurriculum } from '../hooks/useProgramCurriculum'
import { isCurriculumLine } from '../config/programCurriculum'
import PageBanner from '../components/PageBanner'
import PageContent from '../components/PageContent'
import CourseListView from '../components/courses/CourseListView'
import PageMeta from '../components/PageMeta'
import { ProgramBadge, ModuleBadge, UseCaseTag } from '../components/courses/ProgramBadges'
import { PAGE_SEO } from '../config/programs'
import { isProductLabSub, labsPath } from '../config/productLabs'

function CourseCard({ item }) {
  const soon = isCourseComingSoon(item)

  return (
    <div
      className={`card p-5 flex flex-col transition h-full ${
        soon ? 'opacity-95 border-amber-200/80 bg-amber-50/20' : 'hover:shadow-md hover:border-primary/30'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
        <div className="flex flex-wrap gap-1.5 items-center">
          <ProgramBadge lineId={item.line} />
          <ModuleBadge lineId={item.line} subId={item.sub} />
        </div>
        {soon ? (
          <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full shrink-0">
            {COURSES_PORTAL.comingSoonBadge}
          </span>
        ) : (
          <span className="font-bold text-primary text-sm shrink-0">{item.price}</span>
        )}
      </div>
      <h3 className="font-semibold text-bingo-dark text-sm leading-snug mb-1">{item.name}</h3>
      <UseCaseTag lineId={item.line} className="block mb-2" />
      <p className="text-[10px] text-slate-400 mb-2">
        {item.badge && <span className="mr-2">{item.badge}</span>}
        {subcategoryLabel(item.line, item.sub)} · {item.hours}
      </p>
      <p className="text-xs text-slate-600 leading-relaxed flex-1 mb-4 line-clamp-3">{item.desc}</p>
      <div className="flex gap-2 flex-wrap">
        <Link
          to={`/courses/detail/${item.id}`}
          className={`text-xs px-3 py-1.5 rounded-lg font-semibold min-h-[40px] inline-flex items-center ${
            soon ? 'border border-amber-400 text-amber-800 hover:bg-amber-50' : 'btn-primary'
          }`}
        >
          {COURSES_PORTAL.viewDetails}
        </Link>
        {!soon && (
          <Link
            to="/mall"
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition min-h-[40px] inline-flex items-center"
          >
            {COURSES_PORTAL.materialsMall}
          </Link>
        )}
      </div>
    </div>
  )
}

export default function Courses() {
  const [params, setParams] = useSearchParams()
  const lineId = params.get('line') || 'ioai'
  const subId = params.get('sub') || ''
  const line = getProductLine(lineId)
  const videoListMode = isVideoCoursesSub(line.id, subId)
  const { courses, loading: catalogLoading } = useCourseCatalog()
  const curriculumLine = isCurriculumLine(line.id) ? line.id : null
  const { summary: curriculumSummary } = useProgramCurriculum(videoListMode ? curriculumLine : null)

  const filtered = useMemo(() => {
    let list = courses.filter((c) => c.line === line.id)
    if (subId) list = list.filter((c) => c.sub === subId)
    return list
  }, [courses, line.id, subId])

  const bannerSlides = PRODUCT_LINES.map((pl) => ({
    id: pl.id,
    gradient: pl.gradient,
    icon: pl.icon,
    eyebrow: COURSES_PORTAL.bannerEyebrow,
    title: pl.name,
    subtitle: pl.tagline,
    ctaLabel: COURSES_PORTAL.browseCourses,
    href: `/courses?line=${pl.id}`,
  }))

  const subCounts = useMemo(() => {
    const counts = {}
    for (const s of line.subcategories) {
      counts[s.id] = courses.filter((c) => c.line === line.id && c.sub === s.id).length
    }
    return counts
  }, [courses, line.id, line.subcategories])

  if (subId && isProductLabSub(lineId, subId)) {
    return <Navigate to={labsPath(lineId, subId)} replace />
  }

  if (videoListMode) {
    return (
      <div className="w-full">
        <PageMeta title={PAGE_SEO.courses.title} description={PAGE_SEO.courses.description} />
        {catalogLoading ? (
          <div className="courses-page-dark py-16 text-center text-slate-400 text-sm">Loading courses…</div>
        ) : (
          <CourseListView line={line} subId={subId} courses={courses} curriculumSummary={curriculumSummary} />
        )}
        <PageContent className="py-8">
          <section className="card p-6 bg-slate-50 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-bingo-dark">{COURSES_PORTAL.certTitle}</h3>
              <p className="text-sm text-slate-600 mt-1">{COURSES_PORTAL.certDesc}</p>
            </div>
            <Link to="/cert" className="btn-primary px-5 py-2.5 text-sm min-h-[44px] inline-flex items-center">
              {COURSES_PORTAL.certCta}
            </Link>
          </section>
        </PageContent>
      </div>
    )
  }

  return (
    <div className="w-full">
      <PageMeta title={PAGE_SEO.courses.title} description={PAGE_SEO.courses.description} />
      <PageBanner slides={bannerSlides} autoPlayMs={8000} />

      <PageContent className="py-6 sm:py-8">
        <div className="flex flex-wrap gap-2 mb-4">
          <Link
            to="/assessment"
            className="text-xs font-semibold px-3 py-2 rounded-full bg-violet-100 text-violet-800 hover:bg-violet-200 transition"
          >
            🧠 {COURSES_PORTAL.assessmentChip}
          </Link>
          <Link
            to="/labs"
            className="text-xs font-semibold px-3 py-2 rounded-full bg-cyan-100 text-cyan-800 hover:bg-cyan-200 transition"
          >
            🧪 {COURSES_PORTAL.labChip}
          </Link>
          <Link
            to="/exploration"
            className="text-xs font-semibold px-3 py-2 rounded-full bg-violet-100 text-violet-800 hover:bg-violet-200 transition"
          >
            🧭 {COURSES_PORTAL.explorationChip}
          </Link>
        </div>

        <div
          className="flex gap-2 mb-6 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {PRODUCT_LINES.map((pl) => (
            <button
              key={pl.id}
              type="button"
              onClick={() => setParams({ line: pl.id })}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition shrink-0 min-h-[44px] ${
                line.id === pl.id ? 'bg-primary text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {pl.icon} {pl.name}
            </button>
          ))}
        </div>

        <div className={`card p-5 mb-6 border-2 ${line.border} bg-gradient-to-r ${line.gradient}`}>
          <h2 className="font-bold text-bingo-dark text-lg">{line.name}</h2>
          <p className="text-sm text-slate-600 mt-1">{line.tagline}</p>
          {(line.id === 'general' || line.id === 'k12') && (
            <p className="text-xs text-amber-700 mt-2 font-medium">{COURSES_PORTAL.comingSoonHint}</p>
          )}
        </div>

        <div
          className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-none"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <button
            type="button"
            onClick={() => setParams({ line: line.id })}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition shrink-0 min-h-[40px] ${
              !subId ? 'bg-bingo-dark text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {COURSES_PORTAL.allTypes}
          </button>
          {line.subcategories.map((s) =>
            isProductLabSub(line.id, s.id) ? (
              <Link
                key={s.id}
                to={labsPath(line.id, s.id)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition shrink-0 min-h-[40px] inline-flex items-center ${
                  subId === s.id ? 'bg-bingo-dark text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {s.icon} {s.name}
              </Link>
            ) : (
              <button
                key={s.id}
                type="button"
                onClick={() => setParams({ line: line.id, sub: s.id })}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition shrink-0 min-h-[40px] ${
                  subId === s.id ? 'bg-bingo-dark text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {s.icon} {s.name}
              </button>
            )
          )}
        </div>

        {!subId && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
            {line.subcategories.map((s) =>
              isProductLabSub(line.id, s.id) ? (
                <Link
                  key={s.id}
                  to={labsPath(line.id, s.id)}
                  className="card p-4 text-left hover:border-primary/40 hover:shadow-sm transition block"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-lg">{s.icon}</span>
                    {subCounts[s.id] > 0 ? (
                      <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        {subCounts[s.id]}
                      </span>
                    ) : null}
                  </div>
                  <p className="font-semibold text-bingo-dark text-sm mt-1">{s.name}</p>
                  <p className="text-xs text-slate-500">{s.desc}</p>
                  <span className="text-[10px] text-primary font-medium mt-2 inline-block">View in Labs →</span>
                </Link>
              ) : (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setParams({ line: line.id, sub: s.id })}
                  className="card p-4 text-left hover:border-primary/40 hover:shadow-sm transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-lg">{s.icon}</span>
                    {subCounts[s.id] > 0 ? (
                      <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        {subCounts[s.id]}
                      </span>
                    ) : null}
                  </div>
                  <p className="font-semibold text-bingo-dark text-sm mt-1">{s.name}</p>
                  <p className="text-xs text-slate-500">{s.desc}</p>
                </button>
              )
            )}
          </div>
        )}

        <section>
          <h3 className="text-sm font-semibold text-slate-500 mb-4">
            {COURSES_PORTAL.courseCount(filtered.length)}
            {subId ? ` · ${subcategoryLabel(line.id, subId)}` : ''}
          </h3>
          {catalogLoading ? (
            <div className="card p-10 text-center text-slate-500 text-sm">Loading courses…</div>
          ) : filtered.length === 0 ? (
            <div className="card p-10 text-center text-slate-500 text-sm">{COURSES_PORTAL.emptyCategory}</div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
              {filtered.map((item) => (
                <CourseCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </section>

        <section className="card p-6 bg-slate-50 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-bingo-dark">{COURSES_PORTAL.certTitle}</h3>
            <p className="text-sm text-slate-600 mt-1">{COURSES_PORTAL.certDesc}</p>
          </div>
          <Link to="/cert" className="btn-primary px-5 py-2.5 text-sm min-h-[44px] inline-flex items-center">
            {COURSES_PORTAL.certCta}
          </Link>
        </section>
      </PageContent>
    </div>
  )
}

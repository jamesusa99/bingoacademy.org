import { useMemo, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { subcategoryLabel } from '../../config/products'
import { isProductLabSub, labsPath } from '../../config/productLabs'
import { LABS_STOREFRONT_VISIBLE } from '../../config/labsStorefront'
import { VIDEO_COURSE_SUB_BY_LINE } from '../../config/courseListFilters'
import { filterAndSortCourses, paginateCourses } from '../../lib/courseListUtils'
import { useCourseFilters } from '../../hooks/useCourseFilters'
import { COURSES_PORTAL } from '../../config/coursesPortal'
import { usePurchasedCourses } from '../../hooks/usePurchasedCourses'
import { useProductLineVisibility } from '../../contexts/ProductLineVisibilityContext'
import CoursesHero from './CoursesHero'
import { useCoursesLineHero, buildLineHeroStats } from '../../hooks/useCoursesLineHero'
import FilterBar from './FilterBar'
import CourseGrid from './CourseGrid'
import Pagination from './Pagination'
import EmptyState from './EmptyState'

export default function CourseListView({ line, subId, courses = [], curriculumSummary = null }) {
  const [, setParams] = useSearchParams()
  const { filters, setFilters, perPage } = useCourseFilters()
  const purchase = usePurchasedCourses()
  const { hero } = useCoursesLineHero(line.id)
  const { visibleProductLines } = useProductLineVisibility()

  const baseCourses = useMemo(
    () => courses.filter((c) => c.line === line.id && c.sub === subId),
    [courses, line.id, subId]
  )

  const filtered = useMemo(() => filterAndSortCourses(baseCourses, filters), [baseCourses, filters])
  const { items, page, totalPages, total } = useMemo(
    () => paginateCourses(filtered, filters.page, perPage),
    [filtered, filters.page, perPage]
  )

  const heroStats = useMemo(
    () => buildLineHeroStats(filtered.length, hero),
    [filtered.length, hero]
  )

  const sub = line.subcategories.find((s) => s.id === subId)
  const subName = subcategoryLabel(line.id, subId)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [page, filters.category, filters.level, filters.search])

  const clearFilters = () => {
    setParams({ line: line.id, sub: subId })
  }

  return (
    <div className="courses-page-dark min-h-[60vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <nav className="flex flex-wrap gap-2 mb-4 text-xs" aria-label="Breadcrumb">
          <Link to="/courses" className="text-slate-400 hover:text-white transition">
            {COURSES_PORTAL.backToCourses}
          </Link>
          <span className="text-slate-600">/</span>
          <Link to={`/courses?line=${line.id}`} className="text-slate-400 hover:text-white transition">
            {line.name}
          </Link>
          <span className="text-slate-600">/</span>
          <span className="text-cyan-400 font-medium">{subName}</span>
        </nav>

        <div
          className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-none"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {visibleProductLines.map((pl) => (
            <Link
              key={pl.id}
              to={`/courses?line=${pl.id}&sub=${VIDEO_COURSE_SUB_BY_LINE[pl.id] || subId}`}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition shrink-0 min-h-[44px] inline-flex items-center ${
                line.id === pl.id
                  ? 'bg-cyan-500 text-white shadow'
                  : 'bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-500'
              }`}
            >
              {pl.icon} {pl.name}
            </Link>
          ))}
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-none">
          <Link
            to={`/courses?line=${line.id}`}
            className="px-3 py-2 rounded-lg text-xs font-medium shrink-0 min-h-[40px] inline-flex items-center bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-500"
          >
            {COURSES_PORTAL.allTypes}
          </Link>
          {line.subcategories
            .filter((s) => LABS_STOREFRONT_VISIBLE || !isProductLabSub(line.id, s.id))
            .map((s) =>
            isProductLabSub(line.id, s.id) ? (
              <Link
                key={s.id}
                to={labsPath(line.id, s.id)}
                className="px-3 py-2 rounded-lg text-xs font-medium shrink-0 min-h-[40px] inline-flex items-center transition bg-slate-800 text-slate-300 border border-slate-700 hover:border-cyan-500/50"
              >
                {s.icon} {s.name}
              </Link>
            ) : (
              <Link
                key={s.id}
                to={`/courses?line=${line.id}&sub=${s.id}`}
                className={`px-3 py-2 rounded-lg text-xs font-medium shrink-0 min-h-[40px] inline-flex items-center transition ${
                  subId === s.id
                    ? 'bg-white text-slate-900'
                    : 'bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-500'
                }`}
              >
                {s.icon} {s.name}
              </Link>
            )
          )}
        </div>

        <CoursesHero
          title={`${line.icon} ${line.name} · ${hero.modulesTitle}`}
          subtitle={hero.modulesSubtitle}
          stats={heroStats}
        />

        <div className="flex flex-wrap gap-3 mb-6">
          <Link
            to={`/courses?line=${line.id}`}
            className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-4 py-2.5 text-sm font-semibold text-cyan-300 hover:bg-cyan-500/20 transition"
          >
            🎬 {COURSES_PORTAL.ioaiModulesTitle}
          </Link>
          {purchase?.isAuthenticated ? (
            <Link
              to="/profile/study"
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-300 hover:bg-emerald-500/20 transition"
            >
              📚 {COURSES_PORTAL.continueLearning}
            </Link>
          ) : null}
        </div>

        <FilterBar filters={filters} onFiltersChange={setFilters} />

        <p className="text-sm text-slate-400 mt-6 mb-4">
          {COURSES_PORTAL.courseCount(total)}
          {filters.search ? ` · “${filters.search}”` : ''}
        </p>

        {items.length === 0 ? (
          <EmptyState onClear={clearFilters} />
        ) : (
          <>
            <CourseGrid courses={items} purchase={purchase} />
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => setFilters({ page: p })} />
          </>
        )}
      </div>
    </div>
  )
}

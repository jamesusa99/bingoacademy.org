import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { PRODUCT_LINES, getProductLine, subcategoryLabel, COURSE_CATALOG } from '../config/products'
import PageBanner from '../components/PageBanner'
import PageContent from '../components/PageContent'

const CATALOG = COURSE_CATALOG

function CourseCard({ item }) {
  return (
    <div className="card p-5 flex flex-col hover:shadow-md hover:border-primary/30 transition h-full">
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-[10px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded">{item.badge}</span>
        <span className="font-bold text-primary text-sm shrink-0">{item.price}</span>
      </div>
      <h3 className="font-semibold text-bingo-dark text-sm leading-snug mb-1">{item.name}</h3>
      <p className="text-[10px] text-slate-400 mb-2">
        {subcategoryLabel(item.line, item.sub)} · {item.hours}
      </p>
      <p className="text-xs text-slate-600 leading-relaxed flex-1 mb-4">{item.desc}</p>
      <div className="flex gap-2 flex-wrap">
        <Link to={`/courses/detail/${item.id}`} className="btn-primary text-xs px-3 py-1.5">View Details</Link>
        <Link to="/mall" className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition">Materials in Mall</Link>
      </div>
    </div>
  )
}

export default function Courses() {
  const [params, setParams] = useSearchParams()
  const lineId = params.get('line') || 'general'
  const subId = params.get('sub') || ''
  const line = getProductLine(lineId)

  const filtered = useMemo(() => {
    let list = CATALOG.filter((c) => c.line === line.id)
    if (subId) list = list.filter((c) => c.sub === subId)
    return list
  }, [line.id, subId])

  const bannerSlides = PRODUCT_LINES.map((pl) => ({
    id: pl.id,
    gradient: pl.gradient,
    icon: pl.icon,
    eyebrow: 'AI Courses',
    title: pl.name,
    subtitle: pl.tagline,
    ctaLabel: 'View courses',
    href: `/courses?line=${pl.id}`,
  }))

  return (
    <div className="w-full">
      <PageBanner slides={bannerSlides} autoPlayMs={8000} />

      <PageContent className="py-6 sm:py-8">
      {/* Product line tabs — scroll on mobile */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none" style={{ WebkitOverflowScrolling: 'touch' }}>
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

      {/* Active line intro */}
      <div className={`card p-5 mb-6 border-2 ${line.border} bg-gradient-to-r ${line.gradient}`}>
        <h2 className="font-bold text-bingo-dark text-lg">{line.name}</h2>
        <p className="text-sm text-slate-600 mt-1">{line.tagline}</p>
      </div>

      {/* Subcategory filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-none" style={{ WebkitOverflowScrolling: 'touch' }}>
        <button
          type="button"
          onClick={() => setParams({ line: line.id })}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition shrink-0 min-h-[40px] ${
              !subId ? 'bg-bingo-dark text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All types
          </button>
        {line.subcategories.map((s) => (
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
        ))}
      </div>

      {/* Subcategory legend when showing all */}
      {!subId && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
          {line.subcategories.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setParams({ line: line.id, sub: s.id })}
              className="card p-4 text-left hover:border-primary/40 hover:shadow-sm transition"
            >
              <span className="text-lg">{s.icon}</span>
              <p className="font-semibold text-bingo-dark text-sm mt-1">{s.name}</p>
              <p className="text-xs text-slate-500">{s.desc}</p>
            </button>
          ))}
        </div>
      )}

      {/* Course grid */}
      <section>
        <h3 className="text-sm font-semibold text-slate-500 mb-4">
          {filtered.length} item{filtered.length !== 1 ? 's' : ''}
          {subId ? ` · ${subcategoryLabel(line.id, subId)}` : ''}
        </h3>
        {filtered.length === 0 ? (
          <div className="card p-10 text-center text-slate-500 text-sm">No courses in this category yet. Check back soon.</div>
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
          <h3 className="font-semibold text-bingo-dark">Earn a certificate</h3>
          <p className="text-sm text-slate-600 mt-1">Complete courses and labs, then apply for Bingo AI certification.</p>
        </div>
        <Link to="/cert" className="btn-primary px-5 py-2.5 text-sm min-h-[44px] inline-flex items-center">Certification →</Link>
      </section>
      </PageContent>
    </div>
  )
}

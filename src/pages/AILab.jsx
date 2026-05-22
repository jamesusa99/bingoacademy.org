import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { PRODUCT_LINES, getProductLine, subcategoryLabel, COURSE_CATALOG } from '../config/products'
import PageBanner from '../components/PageBanner'
import PageContent from '../components/PageContent'

const LAB_SUBS = ['online-lab', 'offline-lab']

const LAB_CATALOG = COURSE_CATALOG.filter((c) => LAB_SUBS.includes(c.sub))

const LAB_FEATURES = [
  { icon: '🧪', title: 'Guided Experiments', desc: 'Step-by-step cloud labs with auto-graded tasks' },
  { icon: '🤖', title: 'AI Coach', desc: 'In-lab tutor adapts hints to your level' },
  { icon: '📊', title: 'Progress Tracking', desc: 'See milestones and completion in your profile' },
]

function LabCard({ item }) {
  return (
    <div className="card p-5 flex flex-col hover:shadow-md hover:border-primary/30 transition h-full">
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-[10px] font-semibold bg-violet-100 text-violet-800 px-2 py-0.5 rounded">
          {subcategoryLabel(item.line, item.sub)}
        </span>
        <span className="font-bold text-primary text-sm shrink-0">{item.price}</span>
      </div>
      <h3 className="font-semibold text-bingo-dark text-sm leading-snug mb-1">{item.name}</h3>
      <p className="text-[10px] text-slate-400 mb-2">
        {subcategoryLabel(item.line, item.sub)} · {item.hours}
      </p>
      <p className="text-xs text-slate-600 leading-relaxed flex-1 mb-4">{item.desc}</p>
      <div className="flex gap-2 flex-wrap">
        <Link to={`/courses/detail/${item.id}`} className="btn-primary text-xs px-3 py-1.5">View Details</Link>
        <Link to="/mall" className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition">
          Lab access in Mall
        </Link>
      </div>
    </div>
  )
}

export default function AILab() {
  const [params, setParams] = useSearchParams()
  const lineId = params.get('line') || 'general'
  const subId = params.get('sub') || ''
  const line = getProductLine(lineId)

  const labSubsForLine = useMemo(
    () => line.subcategories.filter((s) => LAB_SUBS.includes(s.id)),
    [line]
  )

  const filtered = useMemo(() => {
    let list = LAB_CATALOG.filter((c) => c.line === line.id)
    if (subId) list = list.filter((c) => c.sub === subId)
    return list
  }, [line.id, subId])

  const bannerSlides = PRODUCT_LINES.map((pl) => ({
    id: pl.id,
    gradient: pl.gradient,
    icon: '🧪',
    eyebrow: 'AI Exploration Lab',
    title: `${pl.name} · Labs`,
    subtitle: pl.subcategories.find((s) => s.id === 'online-lab')?.desc ?? 'Hands-on practice in the cloud and classroom',
    ctaLabel: 'Browse labs',
    href: `/lab?line=${pl.id}`,
  }))

  return (
    <div className="w-full">
      <PageBanner slides={bannerSlides} autoPlayMs={8000} />

      <PageContent className="py-6 sm:py-8">
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1 -mx-1 px-1" style={{ WebkitOverflowScrolling: 'touch' }}>
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
          <h2 className="font-bold text-bingo-dark text-lg">🧪 {line.name} — AI Exploration Lab</h2>
          <p className="text-sm text-slate-600 mt-1">
            Online cloud labs and practice tasks aligned with {line.name}. Pair with courses or use standalone.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-3 mb-8">
          {LAB_FEATURES.map((f) => (
            <div key={f.title} className="card p-4 text-center">
              <div className="text-2xl mb-2">{f.icon}</div>
              <p className="font-semibold text-bingo-dark text-sm">{f.title}</p>
              <p className="text-xs text-slate-500 mt-1">{f.desc}</p>
            </div>
          ))}
        </div>

        {labSubsForLine.length > 0 && (
          <div className="flex gap-2 mb-6 overflow-x-auto pb-1" style={{ WebkitOverflowScrolling: 'touch' }}>
            <button
              type="button"
              onClick={() => setParams({ line: line.id })}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition shrink-0 min-h-[40px] ${
                !subId ? 'bg-bingo-dark text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All lab types
            </button>
            {labSubsForLine.map((s) => (
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
        )}

        <section>
          <h3 className="text-sm font-semibold text-slate-500 mb-4">
            {filtered.length} lab{filtered.length !== 1 ? 's' : ''}
            {subId ? ` · ${subcategoryLabel(line.id, subId)}` : ''}
          </h3>
          {filtered.length === 0 ? (
            <div className="card p-10 text-center text-slate-500 text-sm">
              No labs listed for this line yet.{' '}
              <Link to={`/courses?line=${line.id}`} className="text-primary hover:underline">
                Browse courses
              </Link>{' '}
              or{' '}
              <Link to="/mall" className="text-primary hover:underline">
                AI Mall
              </Link>{' '}
              for cloud lab access.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
              {filtered.map((item) => (
                <LabCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </section>

        <section className="card p-6 bg-violet-50/40 border-violet-200/60 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-bingo-dark">Cloud lab subscriptions</h3>
            <p className="text-sm text-slate-600 mt-1">Personal and family AI Digital Lab plans — instant access after purchase.</p>
          </div>
          <Link to="/mall" className="btn-primary px-5 py-2.5 text-sm min-h-[44px] inline-flex items-center">
            Shop lab access →
          </Link>
        </section>
      </PageContent>
    </div>
  )
}

import { Link, useParams, Navigate } from 'react-router-dom'
import PageMeta from '../../components/PageMeta'
import PageContent from '../../components/PageContent'
import {
  getProgram,
  programModules,
  coursesPathForProgram,
  PAGE_SEO,
  PROGRAM_SLUG_TO_LINE,
} from '../../config/programs'
import { getProductLine } from '../../config/products'
import { useCourseCatalog } from '../../hooks/useCourseCatalog'

function LearningPath({ steps }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
      {steps.map((step, i) => (
        <div key={step.label} className="flex items-center gap-2 sm:gap-3">
          <div className="card px-3 py-2 sm:px-4 sm:py-3 text-center min-w-[88px]">
            <div className="text-xl">{step.icon}</div>
            <div className="text-[10px] sm:text-xs font-medium text-slate-700 mt-1">{step.label}</div>
          </div>
          {i < steps.length - 1 ? (
            <span className="text-slate-300 text-lg hidden sm:inline" aria-hidden>
              →
            </span>
          ) : null}
        </div>
      ))}
    </div>
  )
}

export default function ProgramPage() {
  const { slug } = useParams()
  if (!PROGRAM_SLUG_TO_LINE[slug]) {
    return <Navigate to="/courses" replace />
  }

  const program = getProgram(slug)
  const line = getProductLine(program.lineId)
  const modules = programModules(slug)
  const { courses } = useCourseCatalog()
  const seo = PAGE_SEO[slug] || PAGE_SEO.courses

  const moduleCounts = Object.fromEntries(
    modules.map((m) => [m.id, courses.filter((c) => c.line === program.lineId && c.sub === m.id).length])
  )

  return (
    <div className="w-full">
      <PageMeta title={seo.title} description={seo.description} />

      <section className={`border-b border-slate-200 bg-gradient-to-br ${line.gradient} py-10 sm:py-14`}>
        <div className="page-content">
          <p className="text-xs font-bold tracking-widest text-slate-500 uppercase mb-2">{line.nameEn}</p>
          <div className="flex flex-wrap items-start gap-4">
            <span className="text-5xl">{program.icon}</span>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-black text-bingo-dark">{program.heroHeadline}</h1>
              <p className="text-slate-600 mt-2 max-w-2xl">{program.heroBody}</p>
              <p className="text-sm text-slate-500 mt-2">{program.audience}</p>
              <div className="flex flex-wrap gap-3 mt-6">
                <Link to={coursesPathForProgram(slug)} className="btn-primary px-5 py-2.5 text-sm min-h-[44px]">
                  {program.cta}
                </Link>
                <Link
                  to={program.secondaryHref || '/compare'}
                  className="px-5 py-2.5 text-sm rounded-xl border border-slate-300 text-slate-700 hover:bg-white/80 transition min-h-[44px] inline-flex items-center"
                >
                  {program.ctaSecondary}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PageContent className="py-8 sm:py-10">
        <section className="mb-12">
          <h2 className="section-title mb-2 text-center">Your learning path</h2>
          <p className="text-sm text-slate-500 text-center mb-6">Typical progression for {program.shortTitle}</p>
          <LearningPath steps={program.learningPath} />
        </section>

        <section className="mb-12">
          <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
            <div>
              <h2 className="section-title mb-1">Modules</h2>
              <p className="text-sm text-slate-500">Browse by content type within this program</p>
            </div>
            <Link to={coursesPathForProgram(slug)} className="text-sm text-primary font-medium hover:underline">
              View all courses →
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {modules.map((m) => (
              <Link
                key={m.id}
                to={m.href}
                className="card p-5 hover:border-primary/40 hover:shadow-md transition group"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-2xl">{m.icon}</span>
                  {moduleCounts[m.id] > 0 ? (
                    <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      {moduleCounts[m.id]} items
                    </span>
                  ) : null}
                </div>
                <h3 className="font-semibold text-bingo-dark mt-2 group-hover:text-primary transition">{m.name}</h3>
                <p className="text-xs text-slate-500 mt-1">{m.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="card p-6 sm:p-8 bg-slate-50 text-center">
          <h2 className="font-bold text-bingo-dark mb-2">Not sure this is the right fit?</h2>
          <p className="text-sm text-slate-600 mb-4">Compare Foundations, IOAI, and K12 side by side.</p>
          <Link to="/compare" className="btn-primary px-5 py-2.5 text-sm inline-flex min-h-[44px] items-center">
            Compare programs →
          </Link>
        </section>
      </PageContent>
    </div>
  )
}

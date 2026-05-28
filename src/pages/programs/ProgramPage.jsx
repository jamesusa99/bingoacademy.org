import { Link, useParams, Navigate } from 'react-router-dom'
import PageMeta from '../../components/PageMeta'
import PageContent from '../../components/PageContent'
import ProductLineCard from '../../components/ProductLineCard'
import {
  PROGRAM_SLUG_TO_LINE,
  programMetaForSlug,
  getProgramLine,
  coursesHref,
} from '../../config/programs'
import { PORTAL_LEARNING_PATH } from '../../config/homePortal'

export default function ProgramPage() {
  const { slug } = useParams()
  if (!PROGRAM_SLUG_TO_LINE[slug]) {
    return <Navigate to="/courses" replace />
  }

  const line = getProgramLine(slug)
  const meta = programMetaForSlug(slug)

  return (
    <div className="w-full">
      <PageMeta title={meta.title} description={meta.description} />

      <section className={`border-b border-slate-200 bg-gradient-to-r ${line.gradient}`}>
        <PageContent className="py-12 sm:py-16">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">{line.icon} Program</p>
          <h1 className="text-3xl sm:text-4xl font-black text-bingo-dark mb-3">{line.name}</h1>
          <p className="text-slate-600 max-w-2xl text-lg">{line.tagline}</p>
          <div className="flex flex-wrap gap-3 mt-8">
            <Link to={coursesHref(line.id)} className="btn-primary px-6 py-3 text-sm min-h-[44px]">
              Browse courses
            </Link>
            <Link
              to="/compare"
              className="px-6 py-3 rounded-xl border border-slate-300 text-sm font-medium hover:bg-white/80 min-h-[44px] inline-flex items-center"
            >
              Compare programs
            </Link>
          </div>
        </PageContent>
      </section>

      <PageContent className="py-10 sm:py-12">
        <section className="mb-12">
          <h2 className="section-title mb-4">Modules in this program</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {line.subcategories.map((mod) => (
              <Link
                key={mod.id}
                to={coursesHref(line.id, mod.id)}
                className="card p-5 hover:border-primary/40 hover:shadow-md transition"
              >
                <span className="text-2xl">{mod.icon}</span>
                <h3 className="font-semibold text-bingo-dark mt-2">{mod.name}</h3>
                <p className="text-xs text-slate-500 mt-1">{mod.desc}</p>
                <span className="text-xs text-primary font-medium mt-3 inline-block">View module →</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="section-title mb-4">Learning path</h2>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {PORTAL_LEARNING_PATH.slice(0, 4).map((step, i) => (
              <div key={step.title} className="flex items-center gap-2 sm:gap-3">
                {i > 0 ? <span className="text-slate-300 hidden sm:inline" aria-hidden>→</span> : null}
                <div className="card px-4 py-3 text-center min-w-[120px]">
                  <span className="text-lg">{step.icon}</span>
                  <p className="text-xs font-semibold text-bingo-dark mt-1">{step.title}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid md:grid-cols-2 gap-6 items-start">
          <ProductLineCard line={line} />
          <div className="card p-6 bg-slate-50">
            <h3 className="font-semibold text-bingo-dark mb-2">Also explore</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/exploration" className="text-primary hover:underline">
                  🧪 AI Exploration Lab (free)
                </Link>
              </li>
              <li>
                <Link to="/assessment" className="text-primary hover:underline">
                  🧠 AI placement assessment
                </Link>
              </li>
              <li>
                <Link to="/cert" className="text-primary hover:underline">
                  📜 Certification
                </Link>
              </li>
            </ul>
          </div>
        </section>
      </PageContent>
    </div>
  )
}

import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import PageMeta from '../../components/PageMeta'
import PageContent from '../../components/PageContent'
import LabEnvironmentPreview from '../../components/landing/LabEnvironmentPreview'
import { IOAI_SAMPLE_LAB } from '../../config/ioaiSampleLab'

export default function IoaiSampleLabPage() {
  const copy = IOAI_SAMPLE_LAB

  return (
    <div className="bg-slate-50 min-h-screen">
      <PageMeta
        title={copy.seo.title}
        description={copy.seo.description}
        ogUrl={`https://www.bingoacademy.org${copy.path}`}
      />

      <section className="bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950 text-white px-4 sm:px-6 py-12 sm:py-16">
        <PageContent className="max-w-4xl mx-auto text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400 mb-4">{copy.hero.eyebrow}</p>
          <h1 className="text-3xl sm:text-4xl font-black leading-tight mb-4">{copy.hero.headline}</h1>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">{copy.hero.subhead}</p>
        </PageContent>
      </section>

      <section className="px-4 sm:px-6 py-10 sm:py-14">
        <PageContent className="max-w-5xl mx-auto">
          <LabEnvironmentPreview />
          <p className="text-xs text-slate-500 text-center mt-4">
            Static preview — enrolled students run live Python cells with autograding in the full IOAI workspace.
          </p>
        </PageContent>
      </section>

      <section className="px-4 sm:px-6 pb-14">
        <PageContent className="max-w-3xl mx-auto">
          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 mb-10">
            <Link to={copy.ctas.primary.to} className="btn-primary px-6 py-3 rounded-xl font-bold inline-flex items-center justify-center gap-2">
              {copy.ctas.primary.label}
              <ArrowRight className="w-4 h-4" aria-hidden />
            </Link>
            <Link
              to={copy.ctas.secondary.to}
              className="btn-secondary px-6 py-3 rounded-xl font-bold inline-flex items-center justify-center gap-2"
            >
              {copy.ctas.secondary.label}
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {copy.resources.map((item) => (
              <Link key={item.to} to={item.to} className="card p-5 hover:border-cyan-200 transition-colors">
                <h2 className="font-bold text-bingo-dark mb-1">{item.label}</h2>
                <p className="text-sm text-slate-600">{item.desc}</p>
              </Link>
            ))}
          </div>
        </PageContent>
      </section>
    </div>
  )
}

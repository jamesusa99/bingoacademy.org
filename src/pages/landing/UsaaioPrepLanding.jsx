import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import PageMeta from '../../components/PageMeta'
import LandingShell from '../../components/landing/LandingShell'
import LeadEmailCapture from '../../components/landing/LeadEmailCapture'
import { USAAIO_PREP_LANDING } from '../../config/landingUsaaioPrep'

export default function UsaaioPrepLanding() {
  const copy = USAAIO_PREP_LANDING

  return (
    <LandingShell variant="light">
      <PageMeta
        title={copy.seo.title}
        description={copy.seo.description}
        keywords={copy.seo.keywords}
        ogTitle={copy.seo.ogTitle}
        ogDescription={copy.seo.ogDescription}
        ogUrl={`https://www.bingoacademy.org${copy.path}`}
      />

      {/* P1 — Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950 text-white px-4 sm:px-6 py-14 sm:py-20">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400 mb-4">{copy.hero.eyebrow}</p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight mb-5">{copy.hero.headline}</h1>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed mb-8 max-w-3xl mx-auto">{copy.hero.subhead}</p>
          <ul className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-6 mb-10 text-sm text-slate-200">
            {copy.hero.bullets.map((b) => (
              <li key={b} className="flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden />
                {b}
              </li>
            ))}
          </ul>
          <Link
            to="/assessment"
            className="btn-primary px-8 py-4 text-base font-bold rounded-xl inline-flex items-center gap-2 min-h-[52px]"
          >
            {copy.hero.cta}
            <ArrowRight className="w-5 h-5" aria-hidden />
          </Link>
          <p className="text-xs text-slate-500 mt-4">{copy.hero.footnote}</p>
        </div>
      </section>

      {/* P2 — Why Parents */}
      <section className="px-4 sm:px-6 py-14 sm:py-20 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-bingo-dark mb-4">{copy.whyParents.title}</h2>
          <p className="text-slate-600 leading-relaxed mb-4 max-w-3xl">{copy.whyParents.intro}</p>
          <p className="text-slate-600 leading-relaxed mb-10 max-w-3xl">{copy.whyParents.pathway}</p>
          <div className="grid sm:grid-cols-2 gap-5">
            {copy.whyParents.cards.map((card) => (
              <article key={card.title} className="card p-6">
                <span className="text-3xl mb-3 block" aria-hidden>
                  {card.icon}
                </span>
                <h3 className="font-bold text-bingo-dark mb-2">{card.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{card.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* P3 — Curriculum */}
      <section className="px-4 sm:px-6 py-14 sm:py-20 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-bingo-dark mb-8">{copy.curriculum.title}</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {copy.curriculum.modules.map((m) => (
              <article key={m.num} className="card p-6">
                <span className="inline-block text-[10px] font-bold uppercase tracking-wide bg-primary text-white px-2.5 py-1 rounded-full mb-3">
                  Module {m.num}
                </span>
                <h3 className="font-bold text-bingo-dark mb-2">{m.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{m.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Core pillars */}
      <section className="px-4 sm:px-6 py-14 sm:py-20 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-bingo-dark mb-8">{copy.pillars.title}</h2>
          <div className="space-y-6">
            {copy.pillars.items.map((p) => (
              <article key={p.num} className="flex gap-5 p-6 rounded-2xl border border-slate-200">
                <span className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-white font-black flex items-center justify-center">
                  {p.num}
                </span>
                <div>
                  <h3 className="font-bold text-bingo-dark mb-2">{p.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{p.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* P4 — Roadmap */}
      <section className="px-4 sm:px-6 py-14 sm:py-20 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-bingo-dark mb-8">{copy.roadmap.title}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {copy.roadmap.steps.map((s) => (
              <article key={s.step} className="card p-5">
                <p className="text-[10px] font-bold uppercase tracking-wide text-primary mb-2">Step {s.step}</p>
                <h3 className="font-bold text-bingo-dark text-sm mb-3">{s.title}</h3>
                <ul className="space-y-1">
                  {s.items.map((item) => (
                    <li key={item} className="text-xs text-slate-600 flex gap-1.5">
                      <span className="text-primary">·</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* P5 — Methodology */}
      <section className="px-4 sm:px-6 py-14 sm:py-20 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-bingo-dark mb-4">{copy.methodology.title}</h2>
          <p className="text-slate-600 leading-relaxed mb-10 max-w-3xl">{copy.methodology.body}</p>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold text-bingo-dark mb-4">{copy.methodology.audience.title}</h3>
              <ul className="space-y-2">
                {copy.methodology.audience.items.map((item) => (
                  <li key={item} className="flex gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-bingo-dark mb-4">{copy.methodology.parentBenefits.title}</h3>
              <ul className="space-y-2">
                {copy.methodology.parentBenefits.items.map((item) => (
                  <li key={item} className="flex gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Assessment offer */}
      <section className="px-4 sm:px-6 py-14 sm:py-20 bg-gradient-to-br from-cyan-50 to-slate-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-black text-bingo-dark mb-6">{copy.assessment.title}</h2>
          <ul className="text-left inline-block space-y-3 mb-8">
            {copy.assessment.items.map((item) => (
              <li key={item} className="flex items-center gap-3 text-slate-700">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0" aria-hidden />
                <span className="text-sm sm:text-base">{item}</span>
              </li>
            ))}
          </ul>
          <Link
            to="/assessment"
            className="btn-primary px-8 py-4 text-base font-bold rounded-xl inline-flex items-center gap-2 min-h-[52px]"
          >
            {copy.assessment.cta}
            <ArrowRight className="w-5 h-5" aria-hidden />
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 sm:px-6 py-14 sm:py-20 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-bingo-dark mb-8">{copy.faq.title}</h2>
          <div className="space-y-6">
            {copy.faq.items.map((item) => (
              <article key={item.q}>
                <h3 className="font-bold text-bingo-dark mb-2">{item.q}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{item.a}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Closing + lead capture */}
      <section className="px-4 sm:px-6 py-14 sm:py-20 bg-slate-900 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-black mb-4">{copy.closing.headline}</h2>
          <p className="text-slate-300 leading-relaxed mb-8">{copy.closing.subhead}</p>
          <Link
            to="/assessment"
            className="btn-primary px-8 py-4 text-base font-bold rounded-xl inline-flex items-center gap-2 min-h-[52px] mb-4"
          >
            {copy.closing.cta}
            <ArrowRight className="w-5 h-5" aria-hidden />
          </Link>
          <p className="text-xs text-slate-500 mb-12">{copy.closing.footnote}</p>

          <LeadEmailCapture
            source={copy.leadCapture.source}
            campaign={copy.leadCapture.campaign}
            title={copy.leadCapture.title}
            subtitle={copy.leadCapture.subtitle}
            cta={copy.leadCapture.cta}
            successMessage={copy.leadCapture.success}
            variant="dark"
          />
        </div>
      </section>
    </LandingShell>
  )
}

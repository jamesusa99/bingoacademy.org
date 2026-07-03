import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import PageMeta from '../../components/PageMeta'
import LandingShell from '../../components/landing/LandingShell'
import LeadEmailCapture from '../../components/landing/LeadEmailCapture'
import { US_PARENTS_LANDING } from '../../config/landingUsParents'
import { HOME_SEED_TESTIMONIALS } from '../../config/homeTrust'
import { claimFreeTrial, hasClaimedFreeTrial } from '../../lib/freeTrial'
import { useFreeTrialLesson } from '../../hooks/useFreeTrialLesson'

export default function UsParentsLanding() {
  const copy = US_PARENTS_LANDING
  const navigate = useNavigate()
  const { catalogSlug, href: trialHref } = useFreeTrialLesson()
  const [claiming, setClaiming] = useState(false)
  const [heroImgFailed, setHeroImgFailed] = useState(false)

  const handleTrial = () => {
    if (!catalogSlug) {
      navigate('/assessment')
      return
    }
    setClaiming(true)
    if (!hasClaimedFreeTrial()) {
      claimFreeTrial(catalogSlug)
    }
    navigate(trialHref)
  }

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
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-cyan-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400 mb-4">
              AI Classes for Kids · Free Trial
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight mb-4">{copy.hero.headline}</h1>
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed mb-6">{copy.hero.subhead}</p>
            <ul className="space-y-2 mb-8">
              {copy.hero.bullets.map((b) => (
                <li key={b} className="flex items-center gap-2 text-sm text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden />
                  {b}
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={handleTrial}
              disabled={claiming}
              className="btn-primary px-8 py-4 text-base font-bold rounded-xl inline-flex items-center gap-2 min-h-[52px] disabled:opacity-70"
            >
              {claiming ? 'Starting…' : copy.hero.cta}
              <ArrowRight className="w-5 h-5" aria-hidden />
            </button>
          </div>

          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-gradient-to-br from-cyan-500/20 to-indigo-600/30">
            {!heroImgFailed ? (
              <img
                src={copy.hero.image}
                alt={copy.hero.imageAlt}
                className="absolute inset-0 w-full h-full object-cover"
                onError={() => setHeroImgFailed(true)}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                <span className="text-6xl mb-4" aria-hidden>
                  🤖
                </span>
                <p className="text-sm text-slate-300 font-medium">Live AI classes for teens</p>
                <p className="text-xs text-slate-500 mt-2">Project-based · Ages 13–18</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* P2 — Why Parents */}
      <section className="px-4 sm:px-6 py-14 sm:py-20 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-bingo-dark mb-4">{copy.whyParents.title}</h2>
          <p className="text-slate-600 leading-relaxed mb-10 max-w-3xl">{copy.whyParents.body}</p>
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
              <article key={m.num} className="card p-6 relative">
                <span className="absolute -top-3 left-4 text-[10px] font-bold bg-primary text-white px-2 py-0.5 rounded-full">
                  Module {m.num}
                </span>
                <h3 className="font-bold text-bingo-dark mb-2 mt-1">{m.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{m.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* P4 — Ages */}
      <section className="px-4 sm:px-6 py-14 sm:py-20 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-bingo-dark mb-8">{copy.ages.title}</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {copy.ages.tiers.map((tier) => (
              <article key={tier.label} className="rounded-2xl border border-slate-200 p-6 bg-gradient-to-b from-white to-slate-50">
                <p className="text-xs font-bold uppercase tracking-wide text-primary mb-1">{tier.grades}</p>
                <h3 className="text-lg font-bold text-bingo-dark mb-2">{tier.label}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{tier.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* P5 — Testimonials */}
      <section className="px-4 sm:px-6 py-14 sm:py-20 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-bingo-dark mb-8">{copy.testimonials.title}</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {HOME_SEED_TESTIMONIALS.items.map((t) => (
              <blockquote key={t.id} className="card p-6 flex flex-col h-full">
                <p className="text-sm text-slate-600 leading-relaxed flex-1 italic">&ldquo;{t.quote}&rdquo;</p>
                <footer className="mt-4 pt-4 border-t border-slate-100">
                  <p className="font-semibold text-bingo-dark text-sm">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* P6 — Why Early */}
      <section className="px-4 sm:px-6 py-14 sm:py-20 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-bingo-dark mb-8">{copy.whyEarly.title}</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {copy.whyEarly.points.map((p) => (
              <article key={p.title} className="flex gap-4 p-5 rounded-xl border border-slate-100">
                <span className="text-2xl shrink-0" aria-hidden>
                  {p.icon}
                </span>
                <div>
                  <h3 className="font-bold text-bingo-dark mb-1">{p.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{p.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* P7 — Free Trial + Lead capture */}
      <section className="px-4 sm:px-6 py-14 sm:py-20 bg-gradient-to-br from-cyan-50 to-indigo-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-black text-bingo-dark mb-6">{copy.freeTrial.title}</h2>
          <ul className="text-left inline-block space-y-3 mb-8">
            {copy.freeTrial.items.map((item) => (
              <li key={item} className="flex items-center gap-3 text-slate-700">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0" aria-hidden />
                <span className="text-sm sm:text-base">{item}</span>
              </li>
            ))}
          </ul>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
            <button
              type="button"
              onClick={handleTrial}
              disabled={claiming}
              className="btn-primary px-8 py-4 text-base font-bold rounded-xl min-h-[52px] disabled:opacity-70"
            >
              {copy.freeTrial.cta}
            </button>
            <button
              type="button"
              onClick={() => navigate('/exploration')}
              className="px-8 py-4 text-base font-bold rounded-xl border-2 border-primary text-primary hover:bg-primary/5 transition min-h-[52px]"
            >
              {copy.freeTrial.secondaryCta}
            </button>
          </div>

          <LeadEmailCapture
            source={copy.leadCapture.source}
            campaign={copy.leadCapture.campaign}
            title={copy.leadCapture.title}
            subtitle={copy.leadCapture.subtitle}
            cta={copy.leadCapture.cta}
            successMessage={copy.leadCapture.success}
            variant="light"
          />
        </div>
      </section>
    </LandingShell>
  )
}

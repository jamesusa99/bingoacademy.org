import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Quote } from 'lucide-react'
import {
  HOME_TRUST_AUTHORITY,
  HOME_PROOF_OF_WORK,
  HOME_INDUSTRIAL_STACK,
  HOME_SEED_TESTIMONIALS,
  HOME_TRUST_BADGES,
} from '../../config/homeTrust'

function AcademicLineageBlock() {
  const { academicLineage } = HOME_TRUST_AUTHORITY
  if (!academicLineage) return null

  return (
    <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-white to-cyan-50/40 p-6 sm:p-8 mb-10 lg:mb-12">
      <h3 className="text-lg sm:text-xl font-black text-bingo-dark mb-2">{academicLineage.title}</h3>
      <p className="text-sm text-slate-600 leading-relaxed mb-6 max-w-3xl">{academicLineage.body}</p>

      <div className="grid lg:grid-cols-2 gap-6">
        <ul className="space-y-3">
          {academicLineage.labs.map((lab) => (
            <li key={lab.name} className="flex gap-3 text-sm">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" aria-hidden />
              <div>
                {lab.href ? (
                  <Link to={lab.href} className="font-semibold text-bingo-dark hover:text-primary transition">
                    {lab.name}
                  </Link>
                ) : (
                  <span className="font-semibold text-bingo-dark">{lab.name}</span>
                )}
                <span className="text-slate-500"> — {lab.focus}</span>
              </div>
            </li>
          ))}
        </ul>

        <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-3">VUA framework</p>
          <div className="flex flex-col sm:flex-row gap-3">
            {academicLineage.vuaSteps.map((step, i) => (
              <div key={step.label} className="flex-1 relative">
                {i > 0 ? (
                  <span
                    className="hidden sm:block absolute -left-2 top-1/2 -translate-y-1/2 text-slate-300 text-xs"
                    aria-hidden
                  >
                    →
                  </span>
                ) : null}
                <div className="rounded-lg bg-slate-50 border border-slate-100 p-3 h-full">
                  <p className="text-xs font-black text-primary mb-1">{step.label}</p>
                  <p className="text-[11px] text-slate-500 leading-snug">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function IndustrialStackBlock() {
  const { eyebrow, title, subtitle, categories } = HOME_INDUSTRIAL_STACK

  return (
    <div className="mb-10 lg:mb-12 rounded-2xl border border-slate-800 bg-bingo-dark text-white overflow-hidden">
      <div className="px-6 sm:px-8 pt-8 pb-6 border-b border-white/10">
        <p className="text-[10px] font-bold tracking-[0.2em] text-cyan-400 uppercase mb-2">{eyebrow}</p>
        <h3 className="text-xl sm:text-2xl font-black">{title}</h3>
        <p className="text-sm text-slate-400 mt-2 max-w-2xl leading-relaxed">{subtitle}</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
        {categories.map((cat) => (
          <div key={cat.id} className="p-5 sm:p-6">
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400/90 mb-3">{cat.label}</p>
            <ul className="flex flex-wrap gap-2">
              {cat.items.map((item) => (
                <li
                  key={item}
                  className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-cyan-200/90"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

function SeedTestimonialsBlock() {
  const { eyebrow, title, items } = HOME_SEED_TESTIMONIALS

  return (
    <div className="mb-10 lg:mb-12">
      <p className="text-xs font-bold tracking-[0.2em] text-primary uppercase mb-2">{eyebrow}</p>
      <h3 className="text-xl sm:text-2xl font-black text-bingo-dark mb-6">{title}</h3>
      <div className="grid md:grid-cols-3 gap-4">
        {items.map((t) => (
          <blockquote
            key={t.id}
            className="card p-5 sm:p-6 border-slate-200/80 bg-white flex flex-col h-full"
          >
            <Quote className="w-8 h-8 text-primary/20 mb-3 shrink-0" aria-hidden />
            <p className="text-sm text-slate-600 leading-relaxed flex-1 mb-4">&ldquo;{t.quote}&rdquo;</p>
            <footer className="flex items-center gap-3 pt-4 border-t border-slate-100">
              <span className="text-2xl" aria-hidden>
                {t.avatar}
              </span>
              <div>
                <p className="text-sm font-bold text-bingo-dark">{t.name}</p>
                <p className="text-[11px] text-slate-500">{t.role}</p>
              </div>
            </footer>
          </blockquote>
        ))}
      </div>
    </div>
  )
}

function TrustBadgesRow() {
  return (
    <div className="mb-10 lg:mb-12 flex flex-wrap justify-center gap-3 sm:gap-4">
      {HOME_TRUST_BADGES.map((badge) => (
        <Link
          key={badge.id}
          to={badge.href}
          title={badge.desc}
          className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 sm:px-5 sm:py-3.5 shadow-sm hover:border-primary/40 hover:shadow-md transition min-w-[140px] sm:min-w-[160px]"
        >
          <span className="text-2xl shrink-0" aria-hidden>
            {badge.icon}
          </span>
          <div className="text-left min-w-0">
            <p className="text-xs font-bold text-bingo-dark leading-tight">{badge.label}</p>
            <p className="text-[10px] text-slate-500 leading-snug mt-0.5">{badge.desc}</p>
          </div>
        </Link>
      ))}
    </div>
  )
}

export default function HomeTrustAuthority({ showIoaiLink = true }) {
  const { credentials, proofTitle, proofSubtitle, showcaseCta, ioaiCta, outcomesCta, outcomesHref } =
    HOME_TRUST_AUTHORITY

  return (
    <section className="w-full border-b border-slate-200 bg-gradient-to-b from-white via-slate-50/80 to-white">
      <div className="page-content py-12 sm:py-16 lg:py-20">
        {/* Academic authority */}
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-start mb-10">
          <div className="lg:col-span-5">
            <p className="text-xs font-bold tracking-[0.2em] text-primary uppercase mb-3">
              {HOME_TRUST_AUTHORITY.eyebrow}
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-bingo-dark leading-tight mb-4">
              {HOME_TRUST_AUTHORITY.title}
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-4">
              {HOME_TRUST_AUTHORITY.body}
            </p>
            <p className="text-sm text-slate-500 leading-relaxed border-l-4 border-primary/40 pl-4 mb-4">
              {HOME_TRUST_AUTHORITY.peerReview}
            </p>
            {HOME_TRUST_AUTHORITY.verifyHref ? (
              <Link
                to={HOME_TRUST_AUTHORITY.verifyHref}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
              >
                {HOME_TRUST_AUTHORITY.verifyCta}
                <ArrowRight className="w-4 h-4" aria-hidden />
              </Link>
            ) : null}
          </div>

          <div className="lg:col-span-7 grid sm:grid-cols-3 gap-4">
            {credentials.map((item) => (
              <Link
                key={item.title}
                to={item.href || '/about'}
                className="card p-5 sm:p-6 border-slate-200/80 bg-white shadow-sm hover:shadow-md hover:border-primary/30 transition block"
              >
                <span className="text-3xl block mb-3" aria-hidden>
                  {item.icon}
                </span>
                <h3 className="font-bold text-bingo-dark text-sm sm:text-base mb-2">{item.title}</h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">{item.desc}</p>
              </Link>
            ))}
          </div>
        </div>

        <AcademicLineageBlock />
        <IndustrialStackBlock />
        <SeedTestimonialsBlock />
        <TrustBadgesRow />

        {/* Proof of work */}
        <div className="rounded-2xl border border-slate-200 bg-bingo-dark text-white overflow-hidden">
          <div className="px-6 sm:px-8 pt-8 pb-6 border-b border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold tracking-[0.2em] text-cyan-400 uppercase mb-2">
                  Proof of Work
                </p>
                <h3 className="text-xl sm:text-2xl font-bold">{proofTitle}</h3>
                <p className="text-sm text-slate-400 mt-2 max-w-2xl">{proofSubtitle}</p>
              </div>
              <div className="flex flex-wrap gap-3 shrink-0">
                <Link
                  to="/showcase"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-300 hover:text-cyan-200 transition"
                >
                  {showcaseCta}
                  <ArrowRight className="w-4 h-4" aria-hidden />
                </Link>
                {showIoaiLink ? (
                  <Link
                    to="/courses/ioai"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-300 hover:text-amber-200 transition"
                  >
                    {ioaiCta}
                    <ArrowRight className="w-4 h-4" aria-hidden />
                  </Link>
                ) : null}
                {outcomesHref ? (
                  <Link
                    to={outcomesHref}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-300 hover:text-emerald-200 transition"
                  >
                    {outcomesCta}
                    <ArrowRight className="w-4 h-4" aria-hidden />
                  </Link>
                ) : null}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10">
            {HOME_PROOF_OF_WORK.map((item) => (
              <Link
                key={item.id}
                to={item.to}
                className="group block p-6 sm:p-8 hover:bg-white/5 transition min-h-[44px]"
              >
                <div className="flex items-start justify-between gap-2 mb-4">
                  <span className="text-3xl" aria-hidden>
                    {item.icon}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-200 border border-amber-400/30">
                    {item.tag}
                  </span>
                </div>
                <h4 className="font-bold text-base sm:text-lg text-white group-hover:text-cyan-200 transition leading-snug mb-1">
                  {item.title}
                </h4>
                <p className="text-xs text-cyan-400/90 font-medium mb-3">{item.student}</p>
                <p className="text-sm text-slate-400 leading-relaxed mb-4">{item.desc}</p>
                <ul className="space-y-1.5">
                  {item.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" aria-hidden />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-400 mt-4 group-hover:underline">
                  See outcomes
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

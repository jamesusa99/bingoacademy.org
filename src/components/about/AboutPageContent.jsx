import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, ChevronRight, Globe2, Mail, Zap } from 'lucide-react'
import PageContent from '../PageContent'
import {
  ABOUT_CTA,
  ABOUT_METHODOLOGY,
  ABOUT_PAGE_HERO,
  ABOUT_PARTNERS,
  ABOUT_PRODUCTS,
  ABOUT_STATS,
  ABOUT_STORY,
  ABOUT_TEAM,
  ABOUT_WHY_EXIST,
} from '../../config/aboutPage'

const PAIN_ICONS = { '📚': BookOpen, '🌍': Globe2, '⚡': Zap }

const PRODUCT_STYLES = {
  cyan: 'border-cyan-200/80 bg-gradient-to-br from-cyan-50/90 to-white',
  amber: 'border-amber-200/80 bg-gradient-to-br from-amber-50/90 to-white',
  violet: 'border-violet-200/80 bg-gradient-to-br from-violet-50/90 to-white',
  emerald: 'border-emerald-200/80 bg-gradient-to-br from-emerald-50/90 to-white',
}

function AboutShell({ id, children, className = '', innerClassName = 'max-w-6xl mx-auto' }) {
  return (
    <section id={id} className={className}>
      <PageContent className={innerClassName}>{children}</PageContent>
    </section>
  )
}

function SectionLabel({ children }) {
  return <p className="text-xs font-bold tracking-widest text-primary uppercase mb-2">{children}</p>
}

function AboutHero() {
  const hero = ABOUT_PAGE_HERO
  return (
    <AboutShell className="border-b border-cyan-500/10 bg-gradient-to-br from-white via-cyan-50/30 to-sky-50/50" innerClassName="max-w-6xl mx-auto py-10 sm:py-14">
      <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-8 lg:gap-12 items-center">
        <div>
          <SectionLabel>{hero.eyebrow}</SectionLabel>
          <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-black text-bingo-dark leading-[1.12] mb-4">
            We teach kids to <span className="text-primary">build AI</span>, not just use it.
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-6 max-w-xl">{hero.subtitle}</p>
          <div className="flex flex-wrap gap-3 mb-8">
            <Link to={hero.primaryCta.href} className="btn-primary px-5 py-2.5">
              {hero.primaryCta.label}
              <ArrowRight className="w-4 h-4 ml-2" aria-hidden />
            </Link>
            <a
              href={hero.secondaryCta.href}
              className="inline-flex items-center min-h-[44px] px-5 py-2.5 rounded-lg border border-slate-300 text-sm font-semibold text-bingo-dark hover:bg-white transition"
            >
              {hero.secondaryCta.label}
            </a>
          </div>
          <dl className="grid grid-cols-3 gap-3 sm:gap-4 pt-6 border-t border-slate-200/80">
            {ABOUT_STATS.items.map((item) => (
              <div key={item.label} className="min-w-0">
                <dt className="sr-only">{item.label}</dt>
                <dd className={`text-xl sm:text-2xl font-black tabular-nums ${item.value === 'TBD' ? 'text-slate-400' : 'text-primary'}`}>
                  {item.value}
                </dd>
                <dd className="text-[10px] sm:text-xs uppercase tracking-wide text-slate-500 mt-0.5">{item.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative order-first lg:order-none">
          <div className="aspect-[4/3] sm:aspect-[5/4] rounded-2xl overflow-hidden shadow-lg ring-1 ring-slate-200/80 bg-slate-100">
            <img
              src={hero.image.src}
              alt={hero.image.alt}
              className="w-full h-full object-cover"
              loading="eager"
              fetchPriority="high"
            />
          </div>
        </div>
      </div>
    </AboutShell>
  )
}

function MissionAndWhy() {
  const section = ABOUT_WHY_EXIST
  return (
    <AboutShell className="py-12 sm:py-16 bg-white border-b border-slate-100">
      <div className="grid lg:grid-cols-12 gap-8 lg:gap-10">
        <div className="lg:col-span-4 lg:sticky lg:top-20 lg:self-start">
          <SectionLabel>{section.eyebrow}</SectionLabel>
          <h2 className="text-2xl sm:text-3xl font-bold text-bingo-dark mb-3">{section.title}</h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">{section.intro}</p>
        </div>
        <div className="lg:col-span-8 space-y-3">
          {section.pains.map((pain, index) => {
            const Icon = PAIN_ICONS[pain.icon] || BookOpen
            return (
              <div key={pain.title} className="card p-4 sm:p-5 flex gap-4 items-start">
                <div className="shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                    0{index + 1}
                  </p>
                  <h3 className="text-base sm:text-lg font-bold text-bingo-dark mb-1">{pain.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{pain.body}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </AboutShell>
  )
}

function OurStory() {
  const section = ABOUT_STORY
  return (
    <AboutShell id={section.id} className="py-12 sm:py-16 scroll-mt-24">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 sm:mb-10">
          <SectionLabel>{section.eyebrow}</SectionLabel>
          <h2 className="text-2xl sm:text-3xl font-bold text-bingo-dark mb-3">{section.title}</h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">{section.intro}</p>
        </div>

        <ol className="relative space-y-0">
          {section.timeline.map((item, index) => (
            <li key={item.title} className="relative flex gap-4 sm:gap-6 pb-8 last:pb-0">
              {index < section.timeline.length - 1 ? (
                <div className="absolute left-[15px] sm:left-[19px] top-10 bottom-0 w-px bg-gradient-to-b from-primary/40 to-emerald-400/40" aria-hidden />
              ) : null}
              <div
                className={`relative z-10 shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full border-4 border-white shadow-md flex items-center justify-center ${
                  item.highlight ? 'bg-amber-500' : item.dot === 'emerald' ? 'bg-emerald-500' : 'bg-primary'
                }`}
                aria-hidden
              >
                <span className="w-2 h-2 rounded-full bg-white/90" />
              </div>
              <div className={`flex-1 card p-4 sm:p-5 ${item.highlight ? 'border-primary/25 bg-cyan-50/40' : ''}`}>
                <time className="text-xs font-bold text-primary font-mono">{item.when}</time>
                <h3 className="text-base sm:text-lg font-bold text-bingo-dark mt-1 mb-1.5">{item.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{item.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </AboutShell>
  )
}

function WhatWeTeach() {
  const section = ABOUT_PRODUCTS
  return (
    <AboutShell className="py-12 sm:py-16 bg-white border-y border-slate-100">
      <div className="text-center mb-8 sm:mb-10 max-w-2xl mx-auto">
        <SectionLabel>{section.eyebrow}</SectionLabel>
        <h2 className="text-2xl sm:text-3xl font-bold text-bingo-dark mb-3">{section.title}</h2>
        <p className="text-sm sm:text-base text-slate-600">{section.intro}</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 sm:gap-5 max-w-5xl mx-auto">
        {section.items.map((item) => (
          <Link
            key={item.title}
            to={item.href}
            className={`group card p-5 sm:p-6 border-2 flex flex-col h-full transition hover:-translate-y-0.5 ${PRODUCT_STYLES[item.accent] ?? PRODUCT_STYLES.cyan}`}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <span className="text-3xl" aria-hidden>
                {item.icon}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-white/80 px-2 py-1 rounded-full border border-slate-100">
                {item.tag}
              </span>
            </div>
            <h3 className="text-lg font-bold text-bingo-dark mb-2 group-hover:text-primary transition">{item.title}</h3>
            <p className="text-sm text-slate-600 leading-relaxed flex-1">{item.body}</p>
            <p className="text-xs text-slate-500 mt-3 mb-3">{item.audience}</p>
            <span className="text-sm font-semibold text-primary inline-flex items-center gap-1">
              Learn more <ChevronRight className="w-4 h-4" aria-hidden />
            </span>
          </Link>
        ))}
      </div>
    </AboutShell>
  )
}

function HowWeTeach() {
  const section = ABOUT_METHODOLOGY
  return (
    <AboutShell className="py-12 sm:py-16">
      <div className="section-tech max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <SectionLabel>{section.eyebrow}</SectionLabel>
          <h2 className="text-2xl sm:text-3xl font-bold text-bingo-dark mb-2">{section.title}</h2>
          <p className="text-sm text-slate-600">{section.intro}</p>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-none -mx-1 px-1">
          {section.steps.map((step, idx) => (
            <div
              key={step.title}
              className="snap-start shrink-0 w-[140px] sm:w-[160px] text-center"
            >
              <div
                className={`w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-full text-white flex items-center justify-center text-lg font-bold mb-2 shadow-md ${
                  idx < 2 ? 'bg-primary' : idx < 4 ? 'bg-emerald-600' : 'bg-amber-500'
                }`}
              >
                {step.n}
              </div>
              <h3 className="font-bold text-sm text-bingo-dark">{step.title}</h3>
              <p className="text-xs text-slate-600 mt-1 leading-snug">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </AboutShell>
  )
}

function TeamAndPartners() {
  const team = ABOUT_TEAM
  const partners = ABOUT_PARTNERS
  const [founder, ...advisors] = team.members

  return (
    <AboutShell className="py-12 sm:py-16 bg-white border-t border-slate-100">
      <div className="grid lg:grid-cols-12 gap-10 lg:gap-12">
        <div className="lg:col-span-7">
          <SectionLabel>{team.eyebrow}</SectionLabel>
          <h2 className="text-2xl sm:text-3xl font-bold text-bingo-dark mb-6">{team.title}</h2>

          <div className="card p-5 sm:p-6 flex gap-4 sm:gap-5 mb-5 border-primary/15 bg-gradient-to-br from-cyan-50/50 to-white">
            <div className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
              <span className="text-xl sm:text-2xl font-black text-primary">{founder.initials}</span>
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-bingo-dark">{founder.name}</h3>
              <p className="text-sm text-primary font-semibold mb-2">{founder.role}</p>
              <p className="text-sm text-slate-600">{founder.bio}</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {advisors.map((member) => (
              <div key={member.name} className="card p-4 text-center sm:text-left">
                <div className="w-12 h-12 mx-auto sm:mx-0 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
                  <span className="text-sm font-black text-primary">{member.initials}</span>
                </div>
                <h3 className="font-bold text-sm text-bingo-dark">{member.name}</h3>
                <p className="text-xs text-primary font-semibold mt-0.5 mb-1">{member.role}</p>
                <p className="text-xs text-slate-600 leading-snug">{member.bio}</p>
              </div>
            ))}
          </div>

          <p className="text-sm text-slate-500 mt-5">
            {team.hiringNote}{' '}
            <a href={`mailto:${team.hiringEmail}`} className="text-primary font-semibold hover:underline">
              Join us →
            </a>
          </p>
        </div>

        <div className="lg:col-span-5">
          <SectionLabel>{partners.eyebrow}</SectionLabel>
          <h2 className="text-xl sm:text-2xl font-bold text-bingo-dark mb-4">{partners.title}</h2>
          <p className="text-sm text-slate-600 mb-5">{partners.intro}</p>

          <a
            href={partners.featured.href}
            target="_blank"
            rel="noopener noreferrer"
            className="card p-5 sm:p-6 flex items-center gap-4 hover:-translate-y-0.5 transition mb-4"
          >
            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-white font-black text-2xl shrink-0">
              I
            </div>
            <div className="min-w-0">
              <div className="text-lg font-bold text-bingo-dark">{partners.featured.name}</div>
              <div className="text-xs text-slate-500 leading-snug">{partners.featured.subtitle}</div>
              <div className="text-xs text-primary font-semibold mt-1">{partners.featured.cta}</div>
            </div>
          </a>

          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-500 text-center">
            Additional university, school, and media partners — coming soon.
          </div>
        </div>
      </div>
    </AboutShell>
  )
}

function AboutCta() {
  const cta = ABOUT_CTA
  return (
    <AboutShell
      id={cta.id}
      className="py-12 sm:py-14 bg-gradient-to-br from-primary via-primary-600 to-primary-700 text-white scroll-mt-24"
      innerClassName="max-w-4xl mx-auto text-center"
    >
      <h2 className="text-2xl sm:text-3xl font-black mb-3">{cta.title}</h2>
      <p className="text-sm sm:text-base text-cyan-100 mb-6 leading-relaxed">{cta.body}</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          to={cta.primary.href}
          className="inline-flex items-center justify-center min-h-[44px] bg-white text-primary px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-cyan-50 transition"
        >
          {cta.primary.label}
          <ArrowRight className="w-4 h-4 ml-2" aria-hidden />
        </Link>
        <a
          href={cta.secondary.href}
          className="inline-flex items-center justify-center min-h-[44px] gap-2 border-2 border-white/90 text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-white hover:text-primary transition"
        >
          <Mail className="w-4 h-4" aria-hidden />
          {cta.secondary.label}
        </a>
      </div>
      <p className="text-xs text-cyan-200/90 mt-5">{cta.footnote}</p>
    </AboutShell>
  )
}

export default function AboutPageContent() {
  return (
    <>
      <AboutHero />
      <MissionAndWhy />
      <OurStory />
      <WhatWeTeach />
      <HowWeTeach />
      <TeamAndPartners />
      <AboutCta />
    </>
  )
}

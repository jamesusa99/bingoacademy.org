import { Link } from 'react-router-dom'
import { ArrowRight, ChevronRight, Mail, Shield } from 'lucide-react'
import PageContent from '../PageContent'
import { TrustDisclaimer, TrustMetaFooter, TrustVerifyNav } from '../trust/TrustPageSections'
import { ABOUT_ORG, aboutAtAGlanceRows } from '../../config/trust/about'
import {
  ABOUT_AUDIENCE_CTA,
  ABOUT_COMPETITION_DISCLAIMER,
  ABOUT_EVIDENCE,
  ABOUT_INSTRUCTORS,
  ABOUT_LEARNING,
  ABOUT_METHODOLOGY,
  ABOUT_PAGE_HERO,
  ABOUT_PRODUCTS,
  ABOUT_SAFETY,
  ABOUT_STATS,
  ABOUT_STORY,
  ABOUT_TEAM,
} from '../../config/aboutPage'

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
            {hero.title}
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
                <dd className="text-[10px] sm:text-xs leading-snug text-slate-500 mt-0.5">{item.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative order-first lg:order-none">
          <div className="aspect-video rounded-2xl overflow-hidden shadow-lg ring-1 ring-slate-200/80 bg-slate-100">
            <img
              src={hero.image.src}
              alt={hero.image.alt}
              className="w-full h-full object-cover object-center"
              loading="eager"
              fetchPriority="high"
            />
          </div>
        </div>
      </div>
    </AboutShell>
  )
}

function AboutAtAGlance() {
  const rows = aboutAtAGlanceRows(ABOUT_ORG)

  return (
    <AboutShell className="py-8 sm:py-10 bg-white border-b border-slate-100">
      <div className="max-w-4xl">
        <h2 className="text-lg sm:text-xl font-bold text-bingo-dark mb-4">Bingo Academy at a glance</h2>
        <dl className="card divide-y divide-slate-100 overflow-hidden">
          {rows.map((row) => (
            <div key={row.label} className="grid sm:grid-cols-[11rem_1fr] gap-1 sm:gap-4 px-4 sm:px-5 py-3 text-sm">
              <dt className="font-semibold text-slate-500">{row.label}</dt>
              <dd className="text-slate-700 leading-relaxed">
                {row.href ? (
                  <a href={row.href} className="text-primary font-medium hover:underline">
                    {row.value}
                  </a>
                ) : (
                  row.value
                )}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-sm text-slate-600 leading-relaxed border-l-4 border-primary/30 pl-4">
          {ABOUT_ORG.programs.ageClarification}
        </p>
      </div>
    </AboutShell>
  )
}

function WhatStudentsLearn() {
  const section = ABOUT_LEARNING
  return (
    <AboutShell className="py-12 sm:py-16 bg-slate-50/80 border-b border-slate-100">
      <div className="max-w-4xl">
        <SectionLabel>{section.eyebrow}</SectionLabel>
        <h2 className="text-2xl sm:text-3xl font-bold text-bingo-dark mb-3">{section.title}</h2>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-8">{section.intro}</p>
        <ol className="space-y-4">
          {section.items.map((item, index) => (
            <li key={item.title} className="card p-4 sm:p-5 flex gap-4">
              <span className="shrink-0 w-8 h-8 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center">
                {index + 1}
              </span>
              <div>
                <h3 className="font-bold text-bingo-dark mb-1">{item.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{item.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </AboutShell>
  )
}

function HowWeTeach() {
  const section = ABOUT_METHODOLOGY
  return (
    <AboutShell className="py-12 sm:py-16 bg-white border-b border-slate-100">
      <div className="section-tech max-w-5xl mx-auto">
        <div className="text-center mb-8 max-w-3xl mx-auto">
          <SectionLabel>{section.eyebrow}</SectionLabel>
          <h2 className="text-2xl sm:text-3xl font-bold text-bingo-dark mb-2">{section.headline}</h2>
          {section.tagline ? (
            <p className="text-sm sm:text-base text-slate-600">{section.tagline}</p>
          ) : null}
          {section.flow ? (
            <p className="text-xs sm:text-sm text-primary font-semibold mt-2 tracking-wide">{section.flow}</p>
          ) : null}
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-none -mx-1 px-1">
          {section.steps.map((step, idx) => (
            <div key={step.title} className="snap-start shrink-0 w-[155px] sm:w-[180px] text-center">
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

        <p className="text-center mt-6">
          <Link to={section.methodologyHref} className="text-sm font-semibold text-primary hover:underline">
            Full teaching methodology →
          </Link>
        </p>
      </div>
    </AboutShell>
  )
}

function EvidenceOutcomes() {
  const section = ABOUT_EVIDENCE
  return (
    <AboutShell className="py-12 sm:py-16 border-b border-slate-100">
      <div className="max-w-4xl mx-auto">
        <SectionLabel>{section.eyebrow}</SectionLabel>
        <h2 className="text-2xl sm:text-3xl font-bold text-bingo-dark mb-3">{section.title}</h2>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-8">{section.intro}</p>

        <dl className="grid grid-cols-3 gap-4 mb-8">
          {ABOUT_STATS.items.map((item) => (
            <div key={item.label} className="card p-4 text-center">
              <dd className="text-2xl font-black text-primary tabular-nums">{item.value}</dd>
              <dt className="text-xs text-slate-500 mt-1 leading-snug">{item.label}</dt>
            </div>
          ))}
        </dl>

        <ul className="space-y-3">
          {section.links.map((link) => (
            <li key={link.href}>
              <Link to={link.href} className="card p-4 flex items-start justify-between gap-4 hover:border-primary/30 transition group">
                <div>
                  <h3 className="font-bold text-sm text-bingo-dark group-hover:text-primary transition">{link.label}</h3>
                  <p className="text-xs text-slate-500 mt-1">{link.desc}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary shrink-0" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>

        <p className="text-xs text-slate-500 mt-6">{section.footnote}</p>
      </div>
    </AboutShell>
  )
}

function LearningPaths() {
  const section = ABOUT_PRODUCTS
  return (
    <AboutShell id={section.id} className="py-12 sm:py-16 bg-white border-b border-slate-100 scroll-mt-24">
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

function InstructorsReview() {
  const section = ABOUT_INSTRUCTORS
  const team = ABOUT_TEAM
  const [founder, ...advisors] = team.members

  return (
    <AboutShell className="py-12 sm:py-16 border-b border-slate-100">
      <div className="max-w-5xl mx-auto">
        <SectionLabel>{section.eyebrow}</SectionLabel>
        <h2 className="text-2xl sm:text-3xl font-bold text-bingo-dark mb-3">{section.title}</h2>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-8 max-w-2xl">{section.intro}</p>

        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-3">
            <div className="card p-5 sm:p-6 flex gap-4 border-primary/15 bg-gradient-to-br from-cyan-50/50 to-white">
              <div className="shrink-0 w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <span className="text-lg font-black text-primary">{founder.initials}</span>
              </div>
              <div>
                <h3 className="font-bold text-bingo-dark">{founder.name}</h3>
                <p className="text-xs text-primary font-semibold">{founder.role}</p>
                <p className="text-sm text-slate-600 mt-1">{founder.bio}</p>
                {founder.slug ? (
                  <Link to={`/instructors/${founder.slug}`} className="text-xs font-semibold text-primary hover:underline mt-2 inline-block">
                    Full profile →
                  </Link>
                ) : null}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {advisors.map((member) => (
                <div key={member.name} className="card p-4">
                  <h3 className="font-bold text-sm text-bingo-dark">{member.name}</h3>
                  <p className="text-xs text-primary font-semibold">{member.role}</p>
                  <p className="text-xs text-slate-600 mt-1 leading-snug">{member.bio}</p>
                  {member.slug ? (
                    <Link to={`/instructors/${member.slug}`} className="text-xs font-semibold text-primary hover:underline mt-2 inline-block">
                      Full profile →
                    </Link>
                  ) : null}
                </div>
              ))}
            </div>

            <Link to={section.profilesHref} className="text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1">
              {section.profilesCta}
            </Link>
          </div>

          <div className="lg:col-span-5">
            <h3 className="text-sm font-bold text-bingo-dark mb-3">Academic review & guides</h3>
            <ul className="space-y-2">
              {section.reviewLinks.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-sm text-primary hover:underline">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </AboutShell>
  )
}

function ChildSafety() {
  const section = ABOUT_SAFETY
  return (
    <AboutShell className="py-12 sm:py-16 bg-slate-50/80 border-b border-slate-100">
      <div className="max-w-3xl">
        <div className="flex items-start gap-4 mb-4">
          <div className="shrink-0 w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
            <Shield className="w-5 h-5 text-emerald-700" aria-hidden />
          </div>
          <div>
            <SectionLabel>{section.eyebrow}</SectionLabel>
            <h2 className="text-2xl sm:text-3xl font-bold text-bingo-dark">{section.title}</h2>
          </div>
        </div>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-5">{section.intro}</p>
        <ul className="space-y-2 mb-6">
          {section.highlights.map((item) => (
            <li key={item} className="text-sm text-slate-700 flex gap-2">
              <span className="text-emerald-600 shrink-0">✓</span>
              {item}
            </li>
          ))}
        </ul>
        <Link to={section.href} className="text-sm font-semibold text-primary hover:underline">
          {section.cta}
        </Link>
      </div>
    </AboutShell>
  )
}

function OurStory() {
  const section = ABOUT_STORY
  return (
    <AboutShell id={section.id} className="py-12 sm:py-16 bg-white border-b border-slate-100 scroll-mt-24">
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

function CompetitionDisclaimer() {
  const section = ABOUT_COMPETITION_DISCLAIMER
  return (
    <AboutShell className="py-10 sm:py-12 border-b border-slate-100">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-lg sm:text-xl font-bold text-bingo-dark mb-4">{section.title}</h2>

        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5 mb-4">
          <h3 className="text-sm font-bold text-bingo-dark mb-1.5">{section.reference.title}</h3>
          <p className="text-sm text-slate-600 leading-relaxed">{section.reference.body}</p>
        </div>

        <a
          href={section.ioai.href}
          target="_blank"
          rel="noopener noreferrer"
          className="card p-4 flex items-center gap-4 hover:border-primary/30 transition mb-4 max-w-md"
        >
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white font-black text-xl shrink-0">
            I
          </div>
          <div>
            <div className="font-bold text-bingo-dark">{section.ioai.name}</div>
            <div className="text-xs text-slate-500">{section.ioai.subtitle}</div>
            <div className="text-xs text-primary font-semibold mt-0.5">{section.ioai.cta}</div>
          </div>
        </a>

        <TrustDisclaimer>{section.disclaimer}</TrustDisclaimer>
      </div>
    </AboutShell>
  )
}

function AudienceCta() {
  const cta = ABOUT_AUDIENCE_CTA
  return (
    <AboutShell
      id={cta.id}
      className="py-12 sm:py-14 bg-gradient-to-br from-primary via-primary-600 to-primary-700 text-white scroll-mt-24"
      innerClassName="max-w-5xl mx-auto"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-black mb-2">{cta.title}</h2>
        <p className="text-sm sm:text-base text-cyan-100 max-w-2xl mx-auto">{cta.intro}</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {cta.audiences.map((audience) =>
          audience.external ? (
            <a
              key={audience.label}
              href={audience.href}
              className="rounded-xl bg-white/10 border border-white/20 p-5 flex flex-col hover:bg-white/15 transition"
            >
              <h3 className="font-bold text-lg mb-2">{audience.label}</h3>
              <p className="text-sm text-cyan-100 leading-relaxed flex-1 mb-4">{audience.desc}</p>
              <span className="text-sm font-semibold inline-flex items-center gap-1">
                {audience.cta} <ArrowRight className="w-4 h-4" aria-hidden />
              </span>
            </a>
          ) : (
            <Link
              key={audience.label}
              to={audience.href}
              className="rounded-xl bg-white/10 border border-white/20 p-5 flex flex-col hover:bg-white/15 transition"
            >
              <h3 className="font-bold text-lg mb-2">{audience.label}</h3>
              <p className="text-sm text-cyan-100 leading-relaxed flex-1 mb-4">{audience.desc}</p>
              <span className="text-sm font-semibold inline-flex items-center gap-1">
                {audience.cta} <ArrowRight className="w-4 h-4" aria-hidden />
              </span>
            </Link>
          )
        )}
      </div>

      <p className="text-xs text-cyan-200/90 text-center">{cta.footnote}</p>
    </AboutShell>
  )
}

function LegalIdentity() {
  const org = ABOUT_ORG
  const rows = aboutAtAGlanceRows(org)

  return (
    <AboutShell className="py-12 sm:py-14 bg-white">
      <div className="max-w-4xl">
        <h2 className="text-lg sm:text-xl font-bold text-bingo-dark mb-6">Legal identity & contact</h2>

        <dl className="card divide-y divide-slate-100 overflow-hidden mb-8">
          {rows.map((row) => (
            <div key={row.label} className="grid sm:grid-cols-[11rem_1fr] gap-1 sm:gap-4 px-4 sm:px-5 py-3 text-sm">
              <dt className="font-semibold text-slate-500">{row.label}</dt>
              <dd className="text-slate-700 leading-relaxed">
                {row.href ? (
                  <a href={row.href} className="text-primary font-medium hover:underline">
                    {row.value}
                  </a>
                ) : (
                  row.value
                )}
              </dd>
            </div>
          ))}
          <div className="grid sm:grid-cols-[11rem_1fr] gap-1 sm:gap-4 px-4 sm:px-5 py-3 text-sm">
            <dt className="font-semibold text-slate-500">Legacy alternate name</dt>
            <dd className="text-slate-700">{org.alsoKnownAs}</dd>
          </div>
        </dl>

        <div className="grid sm:grid-cols-2 gap-6 mb-8 text-sm">
          <div>
            <h3 className="font-bold text-bingo-dark mb-2">Additional contact</h3>
            <ul className="space-y-1 text-slate-600">
              <li>
                Privacy:{' '}
                <a href={`mailto:${org.contact.privacy}`} className="text-primary hover:underline">
                  {org.contact.privacy}
                </a>
              </li>
              <li>
                Schools:{' '}
                <a href={`mailto:${org.contact.schools}`} className="text-primary hover:underline">
                  {org.contact.schools}
                </a>
              </li>
              <li>
                Support:{' '}
                <a href={`mailto:${org.contact.support}`} className="text-primary hover:underline">
                  {org.contact.support}
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-bingo-dark mb-2">General inquiry</h3>
            <a
              href={`mailto:${org.contact.general}`}
              className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
            >
              <Mail className="w-4 h-4" aria-hidden />
              {org.contact.general}
            </a>
          </div>
        </div>

        <TrustVerifyNav links={org.verifyLinks} title="Verify credibility claims" />
        <TrustMetaFooter version={org.version} updatedAt={org.updatedAt} />
      </div>
    </AboutShell>
  )
}

export default function AboutPageContent() {
  return (
    <>
      <AboutHero />
      <AboutAtAGlance />
      <WhatStudentsLearn />
      <HowWeTeach />
      <EvidenceOutcomes />
      <LearningPaths />
      <InstructorsReview />
      <ChildSafety />
      <OurStory />
      <CompetitionDisclaimer />
      <AudienceCta />
      <LegalIdentity />
    </>
  )
}

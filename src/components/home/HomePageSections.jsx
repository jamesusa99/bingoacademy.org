import { Link } from 'react-router-dom'
import { ArrowRight, Brain, CheckCircle2, ChevronDown, ClipboardList, Code2, User } from 'lucide-react'
import { useState } from 'react'
import HomePlatformWorkspacePreview from './HomePlatformWorkspacePreview'
import HomePrimaryCtaPair from './HomePrimaryCtaPair'
import {
  HOME_QUICK_FACTS,
  HOME_WHY_PROGRAM,
  HOME_CURRICULUM_ROADMAP,
  HOME_HOW_LEARNING_WORKS,
  HOME_PLATFORM,
  HOME_STUDENT_WORK,
  HOME_AUDIENCE,
  HOME_INSTRUCTORS,
  HOME_TUITION,
  HOME_FAQ,
  HOME_FINAL_CTA,
  HOME_SECTION_IDS,
} from '../../config/homePage'
import { HOME_PRIMARY_CTAS } from '../../config/homeCtas'

function SectionHeader({ eyebrow, title, intro, dark = false }) {
  return (
    <div className="max-w-3xl mx-auto text-center mb-8 sm:mb-10">
      {eyebrow ? (
        <p
          className={`text-xs font-bold tracking-widest uppercase mb-2 ${
            dark ? 'text-cyan-400' : 'text-primary'
          }`}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2 className={`text-xl sm:text-2xl lg:text-3xl font-bold mb-3 ${dark ? 'text-white' : 'text-bingo-dark'}`}>
        {title}
      </h2>
      {intro ? (
        <p className={`text-sm sm:text-base leading-relaxed ${dark ? 'text-slate-300' : 'text-slate-600'}`}>{intro}</p>
      ) : null}
    </div>
  )
}

const QUICK_FACT_ICONS = {
  student: User,
  code: Code2,
  brain: Brain,
  assessment: ClipboardList,
}

export function HomeQuickFactsSection() {
  return (
    <section
      id={HOME_SECTION_IDS.quickFacts}
      className="scroll-mt-24 w-full border-b border-slate-200 bg-slate-50/90"
      aria-label="Course quick facts"
    >
      <div className="page-content py-5 sm:py-6">
        <ul className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto">
          {HOME_QUICK_FACTS.items.map((item) => {
            const Icon = QUICK_FACT_ICONS[item.icon]
            return (
              <li
                key={item.label}
                className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white px-3 py-3 sm:px-4 sm:py-3.5 min-h-[44px]"
              >
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
                  aria-hidden
                >
                  <Icon className="h-4 w-4" strokeWidth={2.25} />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{item.label}</p>
                  <p className="text-sm font-semibold text-bingo-dark leading-snug">{item.value}</p>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

export function HomeWhyProgramSection() {
  const { eyebrow, title, body, values } = HOME_WHY_PROGRAM
  return (
    <section id={HOME_SECTION_IDS.whyProgram} className="scroll-mt-24 w-full border-b border-slate-200 bg-white">
      <div className="page-content py-10 sm:py-14 lg:py-16">
        <SectionHeader eyebrow={eyebrow} title={title} intro={body} />
        <div className="grid md:grid-cols-3 gap-4 sm:gap-5 max-w-5xl mx-auto">
          {values.map((card, index) => (
            <article key={card.title} className="card p-5 sm:p-6 flex flex-col h-full text-left">
              <p className="text-xs font-bold text-primary mb-2">{String(index + 1).padStart(2, '0')}</p>
              <h3 className="font-bold text-bingo-dark text-base sm:text-lg leading-snug mb-3">{card.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{card.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export function HomeCurriculumRoadmapSection() {
  const { eyebrow, title, flow, stages, ctaPrompt } = HOME_CURRICULUM_ROADMAP
  const { assessment } = HOME_PRIMARY_CTAS

  return (
    <section id={HOME_SECTION_IDS.curriculum} className="scroll-mt-24 w-full border-b border-slate-200 bg-slate-50/60">
      <div className="page-content py-12 sm:py-16">
        <SectionHeader eyebrow={eyebrow} title={title} />

        {flow?.length ? (
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-8 sm:mb-10 text-sm sm:text-base font-bold text-bingo-dark">
            {flow.map((stage, index) => (
              <span key={stage} className="inline-flex items-center gap-2 sm:gap-3">
                {index > 0 ? (
                  <span className="text-slate-300 font-normal" aria-hidden>
                    →
                  </span>
                ) : null}
                <span className="rounded-full border border-primary/25 bg-white px-4 py-2 text-primary">{stage}</span>
              </span>
            ))}
          </div>
        ) : null}

        <div className="max-w-3xl mx-auto space-y-4 sm:space-y-5">
          {stages.map((stage) => (
            <article key={stage.stage} className="card p-5 sm:p-6 text-left">
              <p className="text-xs font-bold text-primary mb-1">
                Stage {stage.stage} — {stage.title}
              </p>
              <p className="text-sm sm:text-base font-medium text-bingo-dark mb-3 leading-snug">{stage.subtitle}</p>
              <ul className="grid sm:grid-cols-2 gap-x-4 gap-y-1.5">
                {stage.topics.map((topic) => (
                  <li key={topic} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="text-primary shrink-0 mt-0.5" aria-hidden>
                      ·
                    </span>
                    <span>{topic}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <div className="mt-10 sm:mt-12 text-center max-w-md mx-auto">
          <p className="text-sm font-medium text-slate-700 mb-4">{ctaPrompt}</p>
          <Link
            to={assessment.to}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-bold transition min-h-[44px] w-full sm:w-auto"
          >
            {assessment.label}
            <ArrowRight className="w-4 h-4 shrink-0" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  )
}

export function HomeHowLearningWorksSection() {
  const { eyebrow, title, intro, steps, outcome, methodologyLink } = HOME_HOW_LEARNING_WORKS
  return (
    <section id={HOME_SECTION_IDS.howItWorks} className="scroll-mt-24 w-full border-b border-slate-200 bg-slate-50/80">
      <div className="page-content py-12 sm:py-16">
        <SectionHeader eyebrow={eyebrow} title={title} intro={intro} />

        <div className="max-w-5xl mx-auto mb-8 overflow-x-auto pb-2">
          <div className="flex items-center justify-center gap-1 sm:gap-2 min-w-max px-1 mx-auto text-[10px] sm:text-xs font-bold uppercase tracking-wide text-primary">
            {steps.map((step, index) => (
              <span key={step.key} className="inline-flex items-center gap-1 sm:gap-2 shrink-0">
                {index > 0 ? (
                  <span className="text-slate-300 font-normal px-0.5" aria-hidden>
                    →
                  </span>
                ) : null}
                <span>{step.title}</span>
              </span>
            ))}
          </div>
        </div>

        <ol className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 max-w-6xl mx-auto mb-8 list-none p-0 m-0">
          {steps.map((step, index) => (
            <li key={step.key} className="card p-5 flex flex-col h-full">
              <p className="text-xs font-bold text-primary mb-2">{String(index + 1).padStart(2, '0')}</p>
              <h3 className="font-bold text-bingo-dark text-base leading-snug mb-2">{step.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{step.desc}</p>
            </li>
          ))}
        </ol>

        <div className="text-sm text-slate-600 leading-relaxed text-center max-w-3xl mx-auto rounded-xl border border-slate-200 bg-white px-5 py-4">
          <p>{outcome}</p>
          {methodologyLink ? (
            <p className="mt-3">
              <Link to={methodologyLink.href} className="font-semibold text-primary hover:underline">
                {methodologyLink.label} →
              </Link>
            </p>
          ) : null}
        </div>
      </div>
    </section>
  )
}

export function HomePlatformSection() {
  const { eyebrow, title, intro, features } = HOME_PLATFORM
  return (
    <section id={HOME_SECTION_IDS.platform} className="scroll-mt-24 w-full border-b border-slate-200 bg-white">
      <div className="page-content py-12 sm:py-16">
        <SectionHeader eyebrow={eyebrow} title={title} intro={intro} />
        <div className="max-w-5xl mx-auto mb-8 sm:mb-10 lg:hidden">
          <HomePlatformWorkspacePreview />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {features.map((f, index) => (
            <article key={f.title} className="card p-5 text-left">
              <p className="text-xs font-bold text-primary mb-2">{String(index + 1).padStart(2, '0')}</p>
              <h3 className="font-bold text-bingo-dark text-base mb-2">{f.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{f.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export function HomeStudentWorkSection() {
  const { eyebrow, title, deliverables, samples } = HOME_STUDENT_WORK
  return (
    <section id={HOME_SECTION_IDS.studentWork} className="scroll-mt-24 w-full border-b border-slate-200 bg-white">
      <div className="page-content py-12 sm:py-16">
        <SectionHeader eyebrow={eyebrow} title={title} />
        <div className="grid sm:grid-cols-2 gap-4 max-w-4xl mx-auto mb-8">
          {deliverables.map((item, index) => (
            <article key={item.title} className="card p-5 sm:p-6 text-left">
              <p className="text-xs font-bold text-primary mb-2">{String(index + 1).padStart(2, '0')}</p>
              <h3 className="font-bold text-bingo-dark text-base mb-2">{item.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
            </article>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 max-w-3xl mx-auto">
          {samples.map((sample) => (
            <Link
              key={sample.label}
              to={sample.href}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-primary text-primary hover:bg-primary/5 text-sm font-semibold transition min-h-[44px] w-full sm:w-auto"
            >
              {sample.label}
              <ArrowRight className="w-4 h-4 shrink-0" aria-hidden />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

function AudienceList({ heading, items, variant = 'default' }) {
  return (
    <div className={variant === 'primary' ? 'card p-6 sm:p-7 border-primary/20 h-full' : 'mb-6 last:mb-0'}>
      <h3 className="text-sm font-bold text-bingo-dark mb-3">{heading}</h3>
      <ul className="space-y-2.5">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-sm text-slate-600 leading-relaxed">
            <CheckCircle2
              className={`w-4 h-4 shrink-0 mt-0.5 ${variant === 'primary' ? 'text-primary' : 'text-emerald-500'}`}
              aria-hidden
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function HomeAudienceSection() {
  const { eyebrow, title, goodFit, startingLevel, whatStudentsNeed } = HOME_AUDIENCE
  return (
    <section id={HOME_SECTION_IDS.audience} className="scroll-mt-24 w-full border-b border-slate-200 bg-slate-50/80">
      <div className="page-content py-12 sm:py-16">
        <SectionHeader eyebrow={eyebrow} title={title} />
        <div className="grid lg:grid-cols-2 gap-5 sm:gap-6 max-w-5xl mx-auto">
          <AudienceList heading={goodFit.heading} items={goodFit.items} variant="primary" />
          <div className="card p-6 sm:p-7 h-full">
            <AudienceList heading={startingLevel.heading} items={startingLevel.items} />
            <AudienceList heading={whatStudentsNeed.heading} items={whatStudentsNeed.items} />
          </div>
        </div>
      </div>
    </section>
  )
}

export function HomeInstructorsSection() {
  const { eyebrow, title, instructors, supportHeading, support, cta } = HOME_INSTRUCTORS
  return (
    <section id={HOME_SECTION_IDS.instructors} className="scroll-mt-24 w-full border-b border-slate-200 bg-white">
      <div className="page-content py-12 sm:py-16">
        <SectionHeader eyebrow={eyebrow} title={title} />
        <div className="grid md:grid-cols-3 gap-4 sm:gap-5 mb-10 max-w-5xl mx-auto">
          {instructors.map((person) => (
            <Link
              key={person.slug}
              to={`/instructors/${person.slug}`}
              className="card p-5 sm:p-6 hover:shadow-md hover:border-primary/30 transition flex flex-col group"
            >
              {person.photo ? (
                <img
                  src={person.photo}
                  alt={person.name}
                  className="w-20 h-20 rounded-full object-cover mb-4 bg-slate-100"
                  loading="lazy"
                  width={80}
                  height={80}
                />
              ) : null}
              <h3 className="font-bold text-bingo-dark group-hover:text-primary transition">{person.name}</h3>
              <p className="text-xs font-medium text-slate-700 mt-1">{person.currentRole}</p>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">{person.background}</p>
              <p className="text-[11px] font-semibold text-primary mt-3">
                <span className="text-slate-400 font-normal">Stages · </span>
                {person.stages}
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary mt-auto pt-4">
                View profile
                <ArrowRight className="w-3 h-3" aria-hidden />
              </span>
            </Link>
          ))}
        </div>
        <div className="max-w-3xl mx-auto">
          <h3 className="text-sm font-bold text-bingo-dark text-center mb-4">{supportHeading}</h3>
          <ul className="grid sm:grid-cols-2 gap-3 mb-8">
            {support.map((item) => (
              <li key={item.label} className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" aria-hidden />
                <div>
                  <p className="text-sm font-semibold text-bingo-dark">{item.label}</p>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="text-center">
            <Link to={cta.href} className="btn-primary inline-flex items-center justify-center gap-2 px-6 py-3 text-sm min-h-[44px]">
              {cta.label}
              <ArrowRight className="w-4 h-4 shrink-0" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export function HomeTuitionSectionHeader() {
  const { eyebrow, title } = HOME_TUITION
  return <SectionHeader eyebrow={eyebrow} title={title} dark />
}

export function HomeFaqSection() {
  const { eyebrow, title, items } = HOME_FAQ
  return (
    <section id={HOME_SECTION_IDS.faq} className="scroll-mt-24 w-full border-b border-slate-200 bg-white">
      <div className="page-content py-12 sm:py-16 max-w-3xl mx-auto">
        <SectionHeader eyebrow={eyebrow} title={title} />
        <div className="space-y-3">
          {items.map((item) => (
            <FaqItem key={item.q} question={item.q} answer={item.a} />
          ))}
        </div>
      </div>
    </section>
  )
}

function FaqItem({ question, answer }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 p-4 sm:p-5 text-left min-h-[44px]"
        aria-expanded={open}
      >
        <span className="font-semibold text-bingo-dark text-sm sm:text-base">{question}</span>
        <ChevronDown
          className={`w-5 h-5 text-slate-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>
      {open ? (
        <div className="px-4 sm:px-5 pb-4 sm:pb-5 -mt-1">
          <p className="text-sm text-slate-600 leading-relaxed">{answer}</p>
        </div>
      ) : null}
    </div>
  )
}

export function HomeFinalCtaSection() {
  const { eyebrow, title, body, footnotes, assessmentOnly } = HOME_FINAL_CTA
  return (
    <section id={HOME_SECTION_IDS.finalCta} className="scroll-mt-24 w-full bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white">
      <div className="page-content py-12 sm:py-16 text-center">
        <SectionHeader eyebrow={eyebrow} title={title} intro={body} dark />
        <HomePrimaryCtaPair variant="dark" footnotes={footnotes} hideCurriculum={assessmentOnly} />
      </div>
    </section>
  )
}

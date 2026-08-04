import { Link } from 'react-router-dom'
import { decisionFaqJsonLd, decisionPagePlainText } from '../../config/courseDecisionPages'

export { decisionFaqJsonLd, decisionPagePlainText }

const QUICK_FACT_LABELS = {
  audience: 'Audience',
  prerequisites: 'Prerequisites',
  format: 'Format',
  duration: 'Duration',
  deliverables: 'Deliverables',
  assessment: 'Assessment',
  instructor: 'Instructor',
  price: 'Price',
  certificate: 'Certificate',
}

function SectionHeading({ id, children, theme }) {
  const cls = theme === 'dark' ? 'text-white' : 'text-bingo-dark'
  return (
    <h2 id={id} className={`text-lg sm:text-xl font-bold ${cls} scroll-mt-24`}>
      {children}
    </h2>
  )
}

/** Collapsed-by-default section — content stays in DOM for SEO. */
function CollapsibleSection({ id, headingId, title, theme, children }) {
  const isDark = theme === 'dark'
  const border = isDark ? 'border-slate-700' : 'border-slate-200'
  const titleCls = isDark ? 'text-white' : 'text-bingo-dark'
  const chevron = isDark ? 'text-slate-400' : 'text-slate-400'

  return (
    <details id={id} className={`group border ${border} rounded-xl scroll-mt-24`}>
      <summary
        className={`list-none cursor-pointer flex items-center justify-between gap-3 p-4 sm:p-5 select-none [&::-webkit-details-marker]:hidden ${titleCls}`}
      >
        <h2 id={headingId} className="text-lg sm:text-xl font-bold m-0">
          {title}
        </h2>
        <span
          className={`${chevron} text-base leading-none transition-transform group-open:rotate-180 shrink-0`}
          aria-hidden
        >
          ▾
        </span>
      </summary>
      <div className={`px-4 sm:px-5 pb-4 sm:pb-5 border-t ${border}`}>{children}</div>
    </details>
  )
}

function QuickFactsTable({ facts, theme }) {
  if (!facts) return null
  const rows = Object.entries(QUICK_FACT_LABELS)
    .map(([key, label]) => {
      const value = facts[key]
      if (!value) return null
      return { key, label, value, href: key === 'instructor' ? facts.instructorHref : null }
    })
    .filter(Boolean)

  if (!rows.length) return null

  const border = theme === 'dark' ? 'border-slate-700' : 'border-slate-200'
  const labelCls = theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
  const valueCls = theme === 'dark' ? 'text-slate-100' : 'text-bingo-dark'

  return (
    <dl className={`grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm border ${border} rounded-xl p-4 sm:p-5`}>
      {rows.map(({ key, label, value, href }) => (
        <div key={key} className="min-w-0">
          <dt className={`text-xs font-semibold uppercase tracking-wide ${labelCls}`}>{label}</dt>
          <dd className={`mt-1 font-medium ${valueCls}`}>
            {href ? (
              <Link to={href} className="text-primary hover:underline">
                {value}
              </Link>
            ) : (
              value
            )}
            {key === 'price' && facts.priceNote ? (
              <span className={`block text-xs font-normal mt-0.5 ${labelCls}`}>{facts.priceNote}</span>
            ) : null}
          </dd>
        </div>
      ))}
    </dl>
  )
}

/**
 * Decision-page sections — crawlable HTML for SEO and pre-purchase answers.
 * @param {{ decision: object, theme?: 'light'|'dark', showCta?: boolean, className?: string, parts?: 'all'|'intro'|'details' }} props
 * parts: 'intro' = Overview + Quick facts; 'details' = syllabus/samples/faculty/results/FAQ; 'all' = everything
 */
export default function CourseDecisionSections({
  decision,
  theme = 'light',
  showCta = true,
  className = '',
  parts = 'all',
}) {
  if (!decision) return null

  const isDark = theme === 'dark'
  const wrap = isDark ? 'text-slate-200' : 'text-slate-700'
  const card = isDark ? 'bg-slate-800/60 border-slate-700' : 'card'
  const muted = isDark ? 'text-slate-400' : 'text-slate-500'
  const showIntro = parts === 'all' || parts === 'intro'
  const showDetails = parts === 'all' || parts === 'details'
  const Wrapper = parts === 'details' ? 'div' : 'article'
  const schemaProps =
    parts === 'details' ? {} : { itemScope: true, itemType: 'https://schema.org/Course' }

  return (
    <Wrapper className={`space-y-3 sm:space-y-4 ${wrap} ${className}`} {...schemaProps}>
      {showIntro ? (
        <>
          {/* Direct answer — always expanded */}
          <section id="decision-overview" aria-labelledby="decision-overview-heading" className="mb-6 sm:mb-8">
            <SectionHeading id="decision-overview-heading" theme={theme}>
              Overview
            </SectionHeading>
            <p className="mt-3 text-sm sm:text-base leading-relaxed" itemProp="description">
              {decision.directAnswer}
            </p>
          </section>

          {/* Quick facts */}
          <CollapsibleSection
            id="decision-quick-facts"
            headingId="decision-facts-heading"
            title="Quick facts"
            theme={theme}
          >
            <div className="mt-4">
              <QuickFactsTable facts={decision.quickFacts} theme={theme} />
            </div>
          </CollapsibleSection>
        </>
      ) : null}

      {showDetails && decision.outline?.length ? (
        <CollapsibleSection
          id="decision-outline"
          headingId="decision-outline-heading"
          title="Full syllabus"
          theme={theme}
        >
          <p className={`text-sm mt-4 mb-4 ${muted}`}>
            Stable section anchors for each module — expandable in the app, fully indexed here.
          </p>
          <div className="space-y-4">
            {decision.outline.map((module) => (
              <div key={module.id} id={module.id} className={`${card} p-4 sm:p-5 scroll-mt-24`}>
                <h3 className={`font-semibold text-base ${isDark ? 'text-white' : 'text-bingo-dark'}`}>
                  {module.title}
                </h3>
                {module.summary ? <p className={`text-sm mt-1 ${muted}`}>{module.summary}</p> : null}
                {module.items?.length ? (
                  <ol className="mt-3 space-y-2 list-none">
                    {module.items.map((item, idx) => (
                      <li key={item.id} id={item.id} className="text-sm scroll-mt-24">
                        <span className="font-medium text-primary mr-2">{idx + 1}.</span>
                        <span className={isDark ? 'text-slate-100' : 'text-bingo-dark'}>{item.title}</span>
                        {item.summary ? (
                          <span className={`block ml-6 mt-0.5 ${muted}`}>{item.summary}</span>
                        ) : null}
                      </li>
                    ))}
                  </ol>
                ) : null}
              </div>
            ))}
          </div>
        </CollapsibleSection>
      ) : null}

      {/* Samples */}
      {showDetails && decision.samples?.length ? (
        <CollapsibleSection
          id="decision-samples"
          headingId="decision-samples-heading"
          title="Samples & previews"
          theme={theme}
        >
          <div className="mt-4 grid sm:grid-cols-2 gap-4">
            {decision.samples.map((sample) => (
              <div key={sample.href + sample.title} className={`${card} p-4 sm:p-5 flex flex-col`}>
                <p className="text-[10px] font-bold uppercase tracking-wide text-primary">
                  {sample.type === 'experiment' ? 'Sample experiment' : 'Sample lesson'}
                </p>
                <h3 className={`font-semibold mt-1 ${isDark ? 'text-white' : 'text-bingo-dark'}`}>
                  {sample.title}
                </h3>
                <p className={`text-sm mt-1 flex-1 ${muted}`}>{sample.description}</p>
                <dl className={`text-xs mt-3 space-y-1 ${muted}`}>
                  <div>
                    <dt className="inline font-semibold">Input: </dt>
                    <dd className="inline">{sample.input}</dd>
                  </div>
                  <div>
                    <dt className="inline font-semibold">Process: </dt>
                    <dd className="inline">{sample.process}</dd>
                  </div>
                  <div>
                    <dt className="inline font-semibold">Output: </dt>
                    <dd className="inline">{sample.output}</dd>
                  </div>
                </dl>
                <Link
                  to={sample.href}
                  className="text-sm font-semibold text-primary hover:underline mt-3 inline-flex"
                >
                  Open preview →
                </Link>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      ) : null}

      {/* Faculty & methodology */}
      {showDetails && (decision.faculty?.length || decision.methodology) && (
        <CollapsibleSection
          id="decision-faculty"
          headingId="decision-faculty-heading"
          title="Faculty & method"
          theme={theme}
        >
          {decision.methodology ? (
            <div className={`${card} p-4 sm:p-5 mt-4`}>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-bingo-dark'}`}>
                {decision.methodology.title}
              </h3>
              <p className={`text-sm mt-2 leading-relaxed ${muted}`}>{decision.methodology.body}</p>
              {decision.methodology.href ? (
                <Link to={decision.methodology.href} className="text-sm text-primary font-medium hover:underline mt-2 inline-block">
                  Read teaching approach →
                </Link>
              ) : null}
            </div>
          ) : null}
          {decision.faculty?.length ? (
            <ul className="mt-4 grid sm:grid-cols-2 gap-3">
              {decision.faculty.map((person) => (
                <li key={person.href + person.name}>
                  <Link
                    to={person.href}
                    className={`${card} p-4 block hover:border-primary/40 transition`}
                  >
                    <p className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-bingo-dark'}`}>
                      {person.name}
                    </p>
                    <p className={`text-xs mt-0.5 ${muted}`}>{person.title}</p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </CollapsibleSection>
      )}

      {/* Results */}
      {showDetails && decision.results?.length ? (
        <CollapsibleSection
          id="decision-results"
          headingId="decision-results-heading"
          title="Results & evidence"
          theme={theme}
        >
          <div className="mt-4 grid sm:grid-cols-2 gap-4">
            {decision.results.map((result) => (
              <Link
                key={result.href + result.title}
                to={result.href}
                className={`${card} p-4 sm:p-5 hover:border-primary/40 transition block`}
              >
                <h3 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-bingo-dark'}`}>
                  {result.title}
                </h3>
                <p className={`text-sm mt-1 ${muted}`}>{result.description}</p>
                {result.metric ? (
                  <p className="text-xs font-semibold text-primary mt-2">{result.metric}</p>
                ) : null}
              </Link>
            ))}
          </div>
        </CollapsibleSection>
      ) : null}

      {/* FAQ */}
      {showDetails && decision.faq?.length ? (
        <CollapsibleSection
          id="decision-faq"
          headingId="decision-faq-heading"
          title="FAQ"
          theme={theme}
        >
          <div className={`mt-4 ${card} divide-y ${isDark ? 'divide-slate-700' : 'divide-slate-100'}`}>
            {decision.faq.map((item) => (
              <details key={item.q} className="group/faq p-4 sm:p-5">
                <summary className={`font-semibold text-sm cursor-pointer list-none flex justify-between gap-2 ${isDark ? 'text-white' : 'text-bingo-dark'}`}>
                  {item.q}
                  <span className="text-slate-400 group-open/faq:rotate-180 transition" aria-hidden>
                    ▾
                  </span>
                </summary>
                <p className={`text-sm mt-3 leading-relaxed ${muted}`}>{item.a}</p>
              </details>
            ))}
          </div>
        </CollapsibleSection>
      ) : null}

      {/* Audience-specific CTA */}
      {showDetails && showCta && decision.primaryCta ? (
        <div className={`flex flex-wrap gap-3 pt-2 ${isDark ? '' : ''}`}>
          <Link
            to={decision.primaryCta.href}
            className="btn-primary px-5 py-2.5 text-sm min-h-[44px] inline-flex items-center"
          >
            {decision.primaryCta.label}
          </Link>
          {decision.secondaryCta ? (
            <Link
              to={decision.secondaryCta.href}
              className={`px-5 py-2.5 text-sm rounded-xl border min-h-[44px] inline-flex items-center transition ${
                isDark
                  ? 'border-slate-600 text-slate-200 hover:bg-slate-800'
                  : 'border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {decision.secondaryCta.label}
            </Link>
          ) : null}
        </div>
      ) : null}
    </Wrapper>
  )
}

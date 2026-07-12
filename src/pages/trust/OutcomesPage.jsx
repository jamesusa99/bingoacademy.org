import { Link } from 'react-router-dom'
import PageMeta from '../../components/PageMeta'
import PageContent from '../../components/PageContent'
import {
  OUTCOMES_HUB,
  OUTCOME_METRICS,
  OUTCOME_RUBRIC,
  CASE_STUDIES,
  OUTCOME_METHODS,
} from '../../config/trust/outcomes'
import { TrustDisclaimer, TrustMetaFooter, TrustPageHero } from '../../components/trust/TrustPageSections'
import { SITE_URL } from '../../config/siteSeo'

function MetricCard({ metric }) {
  return (
    <div className="card p-5">
      <p className="text-2xl font-black text-primary">{metric.value}</p>
      <p className="font-semibold text-bingo-dark text-sm mt-1">{metric.label}</p>
      <dl className="mt-3 space-y-1 text-xs text-slate-500">
        <div>
          <dt className="font-semibold text-slate-600 inline">Sample: </dt>
          <dd className="inline">{metric.sampleSize}</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-600 inline">Period: </dt>
          <dd className="inline">{metric.period}</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-600 inline">Method: </dt>
          <dd className="inline">{metric.method}</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-600 inline">Definition: </dt>
          <dd className="inline">{metric.metricDefinition}</dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-600 inline">Data type: </dt>
          <dd className="inline">{metric.dataType}</dd>
        </div>
      </dl>
      {metric.evidenceHref ? (
        <Link to={metric.evidenceHref} className="text-xs text-primary font-semibold mt-3 inline-block hover:underline">
          View evidence →
        </Link>
      ) : null}
    </div>
  )
}

export default function OutcomesPage() {
  const hub = OUTCOMES_HUB

  return (
    <div className="w-full">
      <PageMeta
        title={`${hub.title} | Bingo Academy`}
        description={hub.excerpt}
        canonical={`${SITE_URL}/outcomes`}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Dataset',
          name: hub.title,
          description: hub.excerpt,
          dateModified: hub.updatedAt,
          url: `${SITE_URL}/outcomes`,
        }}
      />

      <TrustPageHero eyebrow="Evidence" title={hub.title} excerpt={hub.excerpt} />

      <PageContent className="py-10 sm:py-12 max-w-3xl">
        <TrustDisclaimer>{hub.disclaimer}</TrustDisclaimer>

        <p className="text-sm mt-6">
          Also see{' '}
          <Link to="/guides/evidence" className="text-primary hover:underline">
            GEO evidence hub
          </Link>{' '}
          and{' '}
          <Link to="/showcase" className="text-primary hover:underline">
            student showcase
          </Link>
          .
        </p>

        <section className="mt-10">
          <h2 className="text-lg font-bold text-bingo-dark mb-4">Published metrics</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {OUTCOME_METRICS.map((m) => (
              <MetricCard key={m.id} metric={m} />
            ))}
          </div>
        </section>

        <section id="rubric" className="mt-10 scroll-mt-24">
          <h2 className="text-lg font-bold text-bingo-dark mb-3">{OUTCOME_RUBRIC.title}</h2>
          <p className="text-xs text-slate-500 mb-3">Dimensions: {OUTCOME_RUBRIC.dimensions.join(', ')}</p>
          <ul className="space-y-3">
            {OUTCOME_RUBRIC.bands.map((b) => (
              <li key={b.score} className="card p-4 text-sm">
                <p className="font-semibold text-bingo-dark">{b.score}</p>
                <p className="text-slate-600 mt-1">{b.criteria}</p>
              </li>
            ))}
          </ul>
          <Link to={OUTCOME_RUBRIC.fullHref} className="text-sm text-primary font-semibold hover:underline mt-3 inline-block">
            Full rubric guide →
          </Link>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-bold text-bingo-dark mb-4">Case studies</h2>
          <div className="space-y-4">
            {CASE_STUDIES.map((c) => (
              <Link key={c.id} to={c.evidenceHref} className="card p-5 block hover:border-primary/40 transition">
                <p className="font-semibold text-bingo-dark">{c.title}</p>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">{c.summary}</p>
                <dl className="mt-3 grid sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-500">
                  <div>
                    <dt className="font-semibold text-slate-600 inline">n: </dt>
                    <dd className="inline">{c.sampleSize}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-600 inline">Period: </dt>
                    <dd className="inline">{c.period}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="font-semibold text-slate-600 inline">Method: </dt>
                    <dd className="inline">{c.method}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="font-semibold text-slate-600 inline">Data type: </dt>
                    <dd className="inline">{c.dataType}</dd>
                  </div>
                </dl>
                <p className="text-xs text-primary font-semibold mt-3">{c.metric}</p>
                <p className="text-[10px] text-slate-400 mt-1">Work: {c.workType}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-bold text-bingo-dark mb-4">Reporting methods</h2>
          <div className="space-y-4">
            {OUTCOME_METHODS.map((m) => (
              <div key={m.title} className="card p-5">
                <h3 className="font-semibold text-bingo-dark text-sm">{m.title}</h3>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">{m.body}</p>
              </div>
            ))}
          </div>
        </section>

        <TrustMetaFooter version={hub.version} updatedAt={hub.updatedAt} />
      </PageContent>
    </div>
  )
}

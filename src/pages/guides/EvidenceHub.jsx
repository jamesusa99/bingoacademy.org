import { Link } from 'react-router-dom'
import PageMeta from '../../components/PageMeta'
import PageContent from '../../components/PageContent'
import {
  EVIDENCE_HUB,
  EVIDENCE_METRICS,
  EVIDENCE_RUBRIC,
  EVIDENCE_CASE_SNAPSHOTS,
  EVIDENCE_METHODS,
} from '../../config/geoKnowledge/evidence'
import { GeoDisclaimer } from '../../components/knowledge/KnowledgeArticleLayout'
import { SITE_URL } from '../../config/siteSeo'

export default function EvidenceHub() {
  return (
    <div className="w-full">
      <PageMeta
        title={`${EVIDENCE_HUB.title} | Bingo Academy`}
        description={EVIDENCE_HUB.excerpt}
        canonical={`${SITE_URL}/guides/evidence`}
        ogType="article"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Dataset',
          name: EVIDENCE_HUB.title,
          description: EVIDENCE_HUB.excerpt,
          dateModified: EVIDENCE_HUB.updatedAt,
          url: `${SITE_URL}/guides/evidence`,
          provider: { '@type': 'Organization', name: 'Bingo Academy', url: SITE_URL },
        }}
      />

      <PageContent className="py-10 sm:py-12 max-w-3xl">
        <Link to="/guides" className="text-sm text-primary hover:underline">
          ← Knowledge guides
        </Link>
        <p className="text-xs font-semibold text-primary uppercase mt-4">
          v{EVIDENCE_HUB.version} · {EVIDENCE_HUB.updatedAt}
        </p>
        <h1 className="text-2xl sm:text-3xl font-black text-bingo-dark mt-2">{EVIDENCE_HUB.title}</h1>
        <p className="text-sm text-slate-600 mt-3 leading-relaxed">{EVIDENCE_HUB.excerpt}</p>
        <p className="text-sm mt-4">
          <Link to="/outcomes" className="text-primary font-semibold hover:underline">
            Full outcomes & case studies (sample sizes, methods) →
          </Link>
        </p>

        <section className="mt-10">
          <h2 className="text-lg font-bold text-bingo-dark mb-4">Published metrics</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {EVIDENCE_METRICS.map((m) => (
              <div key={m.id} className="card p-5">
                <p className="text-2xl font-black text-primary">{m.value}</p>
                <p className="font-semibold text-bingo-dark text-sm mt-1">{m.label}</p>
                <p className="text-xs text-slate-500 mt-2">{m.cohort}</p>
                <p className="text-xs text-slate-400 mt-1">Method: {m.method}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-bold text-bingo-dark mb-3">{EVIDENCE_RUBRIC.title}</h2>
          <p className="text-xs text-slate-500 mb-3">
            Dimensions: {EVIDENCE_RUBRIC.dimensions.join(', ')}
          </p>
          <ul className="space-y-3">
            {EVIDENCE_RUBRIC.bands.map((b) => (
              <li key={b.score} className="card p-4 text-sm">
                <p className="font-semibold text-bingo-dark">{b.score}</p>
                <p className="text-slate-600 mt-1">{b.criteria}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-bold text-bingo-dark mb-4">Case snapshots</h2>
          <div className="space-y-3">
            {EVIDENCE_CASE_SNAPSHOTS.map((c) => (
              <Link key={c.title} to={c.href} className="card p-5 block hover:border-primary/40 transition">
                <p className="text-[10px] font-bold text-primary uppercase">{c.type}</p>
                <p className="font-semibold text-bingo-dark mt-1">{c.title}</p>
                <p className="text-sm text-slate-600 mt-1">{c.summary}</p>
                <p className="text-xs text-primary mt-2">{c.metric}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-bold text-bingo-dark mb-4">Methods</h2>
          {EVIDENCE_METHODS.map((m) => (
            <div key={m.title} className="mb-4">
              <h3 className="font-semibold text-sm text-bingo-dark">{m.title}</h3>
              <p className="text-sm text-slate-600 mt-1">{m.body}</p>
            </div>
          ))}
        </section>

        <GeoDisclaimer text={EVIDENCE_HUB.disclaimer} />

        <footer className="text-xs text-slate-500 mt-6 space-y-1">
          <p>Author: {EVIDENCE_HUB.author}</p>
          <p>Reviewed by: {EVIDENCE_HUB.reviewer}</p>
        </footer>
      </PageContent>
    </div>
  )
}

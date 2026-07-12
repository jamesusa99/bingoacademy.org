import { Link } from 'react-router-dom'
import PageMeta from '../../components/PageMeta'
import PageContent from '../../components/PageContent'
import { METHODOLOGY } from '../../config/trust/methodology'
import { TrustDisclaimer, TrustMetaFooter, TrustPageHero } from '../../components/trust/TrustPageSections'
import { SITE_URL } from '../../config/siteSeo'

export default function MethodologyPage() {
  const m = METHODOLOGY

  return (
    <div className="w-full">
      <PageMeta
        title={`${m.title} | Bingo Academy`}
        description={m.excerpt}
        canonical={`${SITE_URL}/methodology`}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: m.title,
          description: m.excerpt,
          dateModified: m.updatedAt,
          url: `${SITE_URL}/methodology`,
        }}
      />

      <TrustPageHero eyebrow="Methodology" title={m.title} excerpt={m.excerpt} />

      <PageContent className="py-10 sm:py-12 max-w-3xl">
        <TrustDisclaimer>{m.disclaimer}</TrustDisclaimer>

        <section className="mt-10">
          <h2 className="text-lg font-bold text-bingo-dark mb-2">{m.framework.title}</h2>
          <p className="text-sm text-slate-700 leading-relaxed">{m.framework.body}</p>
          <div className="grid sm:grid-cols-3 gap-3 mt-4">
            {m.framework.steps.map((step) => (
              <div key={step.label} className="card p-4">
                <p className="text-xs font-black text-primary">{step.label}</p>
                <p className="text-xs text-slate-600 mt-1">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-bold text-bingo-dark mb-3">{m.projectDesign.title}</h2>
          <ul className="space-y-2 text-sm text-slate-700">
            {m.projectDesign.items.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-primary">·</span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-bold text-bingo-dark mb-3">{m.assessment.title}</h2>
          <ul className="space-y-2 text-sm text-slate-700 mb-3">
            {m.assessment.items.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-primary">·</span>
                {item}
              </li>
            ))}
          </ul>
          <Link to={m.assessment.rubricHref} className="text-sm text-primary font-semibold hover:underline">
            View published rubric →
          </Link>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-bold text-bingo-dark mb-3">{m.alignment.title}</h2>
          <ul className="space-y-2 text-sm">
            {m.alignment.items.map((item) => (
              <li key={item.href}>
                {item.external ? (
                  <a href={item.href} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    {item.label} ↗
                  </a>
                ) : (
                  <Link to={item.href} className="text-primary hover:underline">
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10 card p-6 border-amber-200/60 bg-amber-50/30">
          <h2 className="text-lg font-bold text-bingo-dark mb-2">{m.researchInspiration.title}</h2>
          <p className="text-sm text-slate-600 mb-6">{m.researchInspiration.intro}</p>
          <div className="space-y-6">
            {m.researchInspiration.items.map((item) => (
              <div key={item.tradition}>
                <h3 className="font-semibold text-bingo-dark text-sm">{item.tradition}</h3>
                <p className="text-sm text-slate-600 mt-1 leading-relaxed">{item.inspiredBy}</p>
                {item.papers?.length ? (
                  <ul className="mt-2 text-sm space-y-1">
                    {item.papers.map((paper) => (
                      <li key={paper.href}>
                        <a href={paper.href} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          {paper.label} ↗
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-bold text-bingo-dark mb-3">{m.proprietary.title}</h2>
          <ul className="space-y-2 text-sm text-slate-700">
            {m.proprietary.items.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-primary">·</span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-bold text-bingo-dark mb-2">{m.peerReview.title}</h2>
          <p className="text-sm text-slate-700 leading-relaxed">{m.peerReview.body}</p>
          <Link to={m.peerReview.reviewersHref} className="text-sm text-primary font-semibold hover:underline mt-3 inline-block">
            See named reviewers →
          </Link>
        </section>

        <TrustMetaFooter version={m.version} updatedAt={m.updatedAt} />
      </PageContent>
    </div>
  )
}

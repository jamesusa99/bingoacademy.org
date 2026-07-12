import { Link } from 'react-router-dom'
import PageMeta from '../../components/PageMeta'
import PageContent from '../../components/PageContent'
import { SAFETY_PRIVACY } from '../../config/trust/safetyPrivacy'
import { TrustMetaFooter, TrustPageHero } from '../../components/trust/TrustPageSections'
import { SITE_URL } from '../../config/siteSeo'

export default function SafetyPrivacyPage() {
  const sp = SAFETY_PRIVACY

  return (
    <div className="w-full">
      <PageMeta
        title={`${sp.title} | Bingo Academy`}
        description={sp.excerpt}
        canonical={`${SITE_URL}/safety-and-privacy`}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: sp.title,
          description: sp.excerpt,
          dateModified: sp.updatedAt,
          url: `${SITE_URL}/safety-and-privacy`,
        }}
      />

      <TrustPageHero eyebrow="Safety" title={sp.title} excerpt={sp.excerpt} />

      <PageContent className="py-10 sm:py-12 max-w-3xl">
        <p className="text-sm text-slate-600">
          Legal rights and jurisdictions:{' '}
          <Link to={sp.legalHref} className="text-primary hover:underline">
            Privacy Policy
          </Link>
          . Questions:{' '}
          <a href={`mailto:${sp.contact}`} className="text-primary hover:underline">
            {sp.contact}
          </a>
        </p>

        <div className="mt-10 space-y-10">
          {sp.sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-24">
              <h2 className="text-lg font-bold text-bingo-dark mb-3">{section.title}</h2>
              {section.body ? (
                <p className="text-sm text-slate-700 leading-relaxed mb-3">{section.body}</p>
              ) : null}
              {section.items?.length ? (
                <ul className="space-y-3">
                  {section.items.map((item) => (
                    <li key={item.label || item.detail} className="card p-4 text-sm">
                      {item.label ? <p className="font-semibold text-bingo-dark">{item.label}</p> : null}
                      <p className="text-slate-600 mt-1 leading-relaxed">{item.detail}</p>
                      {item.href ? (
                        item.external ? (
                          <a
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary font-semibold mt-2 inline-block hover:underline"
                          >
                            Learn more ↗
                          </a>
                        ) : (
                          <Link to={item.href} className="text-xs text-primary font-semibold mt-2 inline-block hover:underline">
                            Related guide →
                          </Link>
                        )
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>

        <TrustMetaFooter version={sp.version} updatedAt={sp.updatedAt} />
      </PageContent>
    </div>
  )
}

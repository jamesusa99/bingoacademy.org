import { Link } from 'react-router-dom'
import PageMeta from '../../components/PageMeta'
import PageContent from '../../components/PageContent'
import { ABOUT_ORG } from '../../config/trust/about'
import { TrustMetaFooter, TrustPageHero, TrustVerifyNav } from '../../components/trust/TrustPageSections'
import { SITE_URL } from '../../config/siteSeo'

export default function AboutPage() {
  const org = ABOUT_ORG

  return (
    <div className="w-full">
      <PageMeta
        title={`About ${org.displayName} — Mission, Team & Contact`}
        description={`${org.legalName}. ${org.mission}`}
        canonical={`${SITE_URL}/about`}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'EducationalOrganization',
          name: org.displayName,
          legalName: org.legalName,
          url: SITE_URL,
          description: org.mission,
          email: org.contact.general,
          areaServed: org.region.operations,
        }}
      />

      <TrustPageHero
        eyebrow="About"
        title={org.displayName}
        excerpt={org.mission}
      />

      <PageContent className="py-10 sm:py-12 max-w-3xl">
        <section className="space-y-6 text-sm text-slate-700 leading-relaxed">
          <div>
            <h2 className="text-lg font-bold text-bingo-dark mb-2">Legal & operating identity</h2>
            <ul className="space-y-2">
              <li>
                <span className="font-semibold text-bingo-dark">Display name:</span> {org.displayName} ({org.alsoKnownAs})
              </li>
              <li>
                <span className="font-semibold text-bingo-dark">Legal entity:</span> {org.legalName}
              </li>
              <li>
                <span className="font-semibold text-bingo-dark">Headquarters:</span> {org.region.headquarters}
              </li>
              <li>
                <span className="font-semibold text-bingo-dark">Operations:</span> {org.region.operations}
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-bold text-bingo-dark mb-2">Founded</h2>
            <p>
              {org.founded.year} — {org.founded.background}
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-bingo-dark mb-2">Who we serve</h2>
            <div className="grid sm:grid-cols-3 gap-3 mt-3">
              {org.audiences.map((a) => (
                <div key={a.label} className="card p-4">
                  <p className="font-semibold text-bingo-dark">{a.label}</p>
                  <p className="text-xs text-slate-600 mt-1">{a.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold text-bingo-dark mb-2">Contact</h2>
            <ul className="space-y-1">
              <li>
                General:{' '}
                <a href={`mailto:${org.contact.general}`} className="text-primary hover:underline">
                  {org.contact.general}
                </a>
              </li>
              <li>
                Privacy:{' '}
                <a href={`mailto:${org.contact.privacy}`} className="text-primary hover:underline">
                  {org.contact.privacy}
                </a>
              </li>
              <li>
                Schools & DPA:{' '}
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

          {org.social.length > 0 ? (
            <div>
              <h2 className="text-lg font-bold text-bingo-dark mb-2">Official channels</h2>
              <ul className="space-y-1">
                {org.social.map((s) => (
                  <li key={s.href}>
                    <a href={s.href} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {s.label} ↗
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>

        <TrustVerifyNav links={org.verifyLinks} title="Verify credibility claims" />

        <p className="mt-8 text-sm">
          <Link to="/instructors" className="text-primary font-semibold hover:underline">
            Meet core instructors →
          </Link>
        </p>

        <TrustMetaFooter version={org.version} updatedAt={org.updatedAt} />
      </PageContent>
    </div>
  )
}

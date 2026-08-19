import { Link } from 'react-router-dom'
import PageMeta from '../../components/PageMeta'
import PageContent from '../../components/PageContent'
import AboutPageContent from '../../components/about/AboutPageContent'
import { ABOUT_ORG } from '../../config/trust/about'
import { TrustMetaFooter, TrustVerifyNav } from '../../components/trust/TrustPageSections'
import { SITE_URL } from '../../config/siteSeo'

export default function AboutPage() {
  const org = ABOUT_ORG

  return (
    <div className="w-full">
      <PageMeta
        title="About Us | BingoAcademy.org — AI Education for K-12"
        description="BingoAcademy.org helps K-12 students learn AI through real projects, global competitions, and hands-on experiments. 20,000+ students across 1,000+ schools and 4 countries."
        canonical={`${SITE_URL}/about`}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'EducationalOrganization',
          name: org.displayName,
          legalName: org.legalName,
          url: SITE_URL,
          description: ABOUT_ORG.mission,
          founder: { '@type': 'Person', name: 'Dr. James Chen' },
          email: org.contact.general,
          areaServed: org.region.operations,
          sameAs: ['https://ioai-official.org/'],
        }}
      />

      <AboutPageContent />

      <PageContent className="max-w-6xl mx-auto py-8 sm:py-10 border-t border-slate-200">
        <details className="group card overflow-hidden">
          <summary className="cursor-pointer list-none flex items-center justify-between gap-3 p-4 sm:p-5 text-sm font-semibold text-bingo-dark select-none [&::-webkit-details-marker]:hidden">
            Legal, contact & verification
            <span className="text-slate-400 transition group-open:rotate-180" aria-hidden>
              ▾
            </span>
          </summary>
          <div className="px-4 sm:px-5 pb-5 pt-0 border-t border-slate-100 space-y-6 text-sm text-slate-700 leading-relaxed">
            <div className="grid sm:grid-cols-2 gap-6 pt-4">
              <div>
                <h2 className="text-sm font-bold text-bingo-dark mb-2">Legal & operating identity</h2>
                <ul className="space-y-1.5 text-xs sm:text-sm">
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
                <h2 className="text-sm font-bold text-bingo-dark mb-2">Contact</h2>
                <ul className="space-y-1 text-xs sm:text-sm">
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
            </div>

            <TrustVerifyNav links={org.verifyLinks} title="Verify credibility claims" />

            <p>
              <Link to="/instructors" className="text-primary font-semibold hover:underline text-sm">
                Meet core instructors →
              </Link>
            </p>

            <TrustMetaFooter version={org.version} updatedAt={org.updatedAt} />
          </div>
        </details>
      </PageContent>
    </div>
  )
}

import { Link, useParams } from 'react-router-dom'
import PageMeta from '../../components/PageMeta'
import PageContent from '../../components/PageContent'
import NotFound from '../NotFound'
import { getInstructor, INSTRUCTORS_HUB } from '../../config/trust/instructors'
import { TrustDisclaimer, TrustMetaFooter } from '../../components/trust/TrustPageSections'
import { SITE_URL } from '../../config/siteSeo'
import { buildPageGraph, personEntity } from '../../config/structuredData'

function ProfileList({ title, items }) {
  if (!items?.length) return null
  return (
    <section className="mt-8">
      <h2 className="text-lg font-bold text-bingo-dark mb-3">{title}</h2>
      <ul className="space-y-2 text-sm text-slate-700">
        {items.map((item) => (
          <li key={typeof item === 'string' ? item : item.label} className="flex gap-2">
            <span className="text-primary shrink-0">·</span>
            <span>{typeof item === 'string' ? item : item.label}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

function ProfileLinks({ title, items }) {
  if (!items?.length) return null
  return (
    <section className="mt-8">
      <h2 className="text-lg font-bold text-bingo-dark mb-3">{title}</h2>
      <ul className="space-y-2 text-sm">
        {items.map((item) => (
          <li key={item.href}>
            <Link to={item.href} className="text-primary hover:underline">
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

function ScholarlyProfiles({ profiles }) {
  if (!profiles?.length) return null
  return (
    <section className="mt-8">
      <h2 className="text-lg font-bold text-bingo-dark mb-3">Google Scholar / ORCID / LinkedIn</h2>
      <ul className="space-y-2 text-sm">
        {profiles.map((p) => (
          <li key={`${p.type}-${p.href}`}>
            <span className="text-slate-500">{p.type}: </span>
            {p.external ? (
              <a href={p.href} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                {p.label} ↗
              </a>
            ) : (
              <Link to={p.href} className="text-primary hover:underline">
                {p.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

export default function InstructorDetailPage() {
  const { slug } = useParams()
  const instructor = getInstructor(slug)

  if (!instructor) return <NotFound />

  const canonical = `${SITE_URL}/instructors/${instructor.slug}`
  const path = `/instructors/${instructor.slug}`
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Instructors', href: '/instructors' },
    { label: instructor.name },
  ]

  const researchItems = instructor.researchBackground ?? instructor.researchAreas

  return (
    <div className="w-full">
      <PageMeta
        title={`${instructor.name} — ${instructor.currentRole ?? instructor.title} | Bingo Academy`}
        description={instructor.bio}
        canonical={canonical}
        jsonLd={buildPageGraph({
          pageUrl: path,
          breadcrumbs,
          entities: [
            personEntity({
              slug: instructor.slug,
              name: instructor.name,
              title: instructor.currentRole ?? instructor.title,
              image: instructor.photo,
              description: instructor.bio,
            }),
          ],
        })}
      />

      <PageContent className="py-10 sm:py-12 max-w-3xl">
        <Link to="/instructors" className="text-sm text-primary hover:underline">
          ← All instructors
        </Link>

        <header className="mt-6 flex flex-col sm:flex-row gap-6">
          <img
            src={instructor.photo}
            alt={instructor.name}
            className="w-24 h-24 rounded-2xl object-cover bg-slate-100 shrink-0"
            width={96}
            height={96}
          />
          <div>
            <p className="text-[10px] font-bold text-primary uppercase">{instructor.tag}</p>
            <h1 className="text-2xl sm:text-3xl font-black text-bingo-dark mt-1">{instructor.name}</h1>
            <p className="text-sm text-slate-600 mt-2">{instructor.bio}</p>
          </div>
        </header>

        <section className="mt-8 card p-5 bg-slate-50/80 space-y-4 text-sm">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">Full legal or professional name</h2>
            <p className="text-bingo-dark font-semibold">{instructor.legalName ?? instructor.name}</p>
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">Current role</h2>
            <p className="text-slate-700">{instructor.currentRole ?? instructor.title}</p>
            {instructor.title && instructor.currentRole ? (
              <p className="text-slate-500 mt-1">{instructor.title}</p>
            ) : null}
          </div>
        </section>

        <ProfileList title="Education" items={instructor.education} />
        <ProfileList title="Research or industry background" items={researchItems} />
        <ProfileList title="AI topics taught" items={instructor.topicsTaught} />
        <ProfileLinks title="Courses authored" items={instructor.coursesAuthored} />
        <ProfileLinks title="Articles reviewed" items={instructor.reviewedGuides} />

        {instructor.selectedPublications?.length ? (
          <ProfileList title="Selected publications" items={instructor.selectedPublications} />
        ) : instructor.publications ? (
          <section className="mt-8">
            <h2 className="text-lg font-bold text-bingo-dark mb-2">Selected publications</h2>
            <p className="text-sm text-slate-700">{instructor.publications}</p>
          </section>
        ) : null}

        <ScholarlyProfiles profiles={instructor.scholarlyProfiles ?? instructor.profiles} />

        {instructor.disclosure ? (
          <TrustDisclaimer>{instructor.disclosure}</TrustDisclaimer>
        ) : null}

        <TrustMetaFooter version={INSTRUCTORS_HUB.version} updatedAt={INSTRUCTORS_HUB.updatedAt} />
      </PageContent>
    </div>
  )
}

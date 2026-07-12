import { Link } from 'react-router-dom'
import PageMeta from '../../components/PageMeta'
import PageContent from '../../components/PageContent'
import { CORE_INSTRUCTORS, INSTRUCTORS_HUB } from '../../config/trust/instructors'
import { TrustMetaFooter, TrustPageHero } from '../../components/trust/TrustPageSections'
import { SITE_URL } from '../../config/siteSeo'

export default function InstructorsHub() {
  return (
    <div className="w-full">
      <PageMeta
        title={`${INSTRUCTORS_HUB.title} | Bingo Academy`}
        description={INSTRUCTORS_HUB.excerpt}
        canonical={`${SITE_URL}/instructors`}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: INSTRUCTORS_HUB.title,
          description: INSTRUCTORS_HUB.excerpt,
          url: `${SITE_URL}/instructors`,
        }}
      />

      <TrustPageHero
        eyebrow="Faculty"
        title={INSTRUCTORS_HUB.title}
        excerpt={INSTRUCTORS_HUB.excerpt}
      />

      <PageContent className="py-10 sm:py-12">
        <p className="text-sm text-slate-600 mb-8 max-w-2xl">
          Each profile lists education, research areas, course responsibilities, and guides they authored or reviewed.{' '}
          <Link to="/methodology" className="text-primary hover:underline">
            See how we cite research →
          </Link>
        </p>

        <div className="grid md:grid-cols-2 gap-5">
          {CORE_INSTRUCTORS.map((instructor) => (
            <Link
              key={instructor.slug}
              to={`/instructors/${instructor.slug}`}
              className="card p-6 flex gap-4 hover:border-primary/40 hover:shadow-md transition group"
            >
              <img
                src={instructor.photo}
                alt={instructor.name}
                className="w-16 h-16 rounded-full object-cover bg-slate-100 shrink-0"
                width={64}
                height={64}
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-primary uppercase">{instructor.tag}</p>
                <h2 className="font-bold text-bingo-dark group-hover:text-primary transition">{instructor.name}</h2>
                <p className="text-xs text-slate-500 mt-0.5">{instructor.title}</p>
                <p className="text-sm text-slate-600 mt-2 line-clamp-2">{instructor.bio}</p>
                <span className="text-xs font-semibold text-primary mt-3 inline-block">Full profile →</span>
              </div>
            </Link>
          ))}
        </div>

        <TrustMetaFooter version={INSTRUCTORS_HUB.version} updatedAt={INSTRUCTORS_HUB.updatedAt} />
      </PageContent>
    </div>
  )
}

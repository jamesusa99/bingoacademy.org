import { Link } from 'react-router-dom'
import PageMeta from '../components/PageMeta'
import PageContent from '../components/PageContent'
import { PAGE_SEO, PROGRAM_PATH_CARDS } from '../config/programs'

const TIERS = [
  { name: 'Free', price: '$0', desc: 'Exploration lab, community, profile', cta: 'Get started', href: '/register' },
  { name: 'Learner', price: 'Per course', desc: 'Video courses, online labs, basic cert', cta: 'Browse courses', href: '/courses' },
  { name: 'School', price: 'Custom', desc: 'K12 bundles, offline kits, campus rollout', cta: 'Request demo', href: '/programs/k12' },
]

export default function Pricing() {
  return (
    <div className="w-full">
      <PageMeta title={PAGE_SEO.pricing.title} description={PAGE_SEO.pricing.description} />

      <PageContent className="py-10 sm:py-14">
        <h1 className="text-3xl font-black text-bingo-dark mb-2">Pricing</h1>
        <p className="text-slate-600 mb-10 max-w-2xl">
          Start free in the Exploration Lab. Pay per course or contact us for school and competition packages.
        </p>

        <div className="grid md:grid-cols-3 gap-5 mb-14">
          {TIERS.map((tier) => (
            <div key={tier.name} className="card p-6 flex flex-col">
              <h2 className="font-bold text-bingo-dark text-lg">{tier.name}</h2>
              <p className="text-2xl font-black text-primary mt-2">{tier.price}</p>
              <p className="text-sm text-slate-600 mt-2 flex-1">{tier.desc}</p>
              <Link to={tier.href} className="btn-primary mt-6 text-center text-sm py-2.5 min-h-[44px] inline-flex items-center justify-center">
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>

        <section className="mb-10">
          <h2 className="section-title mb-4">Programs</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {PROGRAM_PATH_CARDS.map((p) => (
              <Link key={p.slug} to={p.href} className="card p-4 hover:border-primary/30 transition">
                <span className="text-xl">{p.icon}</span>
                <p className="font-semibold text-sm mt-2">{p.title}</p>
              </Link>
            ))}
          </div>
        </section>

        <p className="text-sm text-slate-500 text-center">
          <Link to="/cert" className="text-primary hover:underline">
            View certification tiers →
          </Link>
        </p>
      </PageContent>
    </div>
  )
}

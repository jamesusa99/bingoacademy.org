import { Link } from 'react-router-dom'
import PageMeta from '../../components/PageMeta'
import PageContent from '../../components/PageContent'
import { GEO_CLUSTERS } from '../../config/geoKnowledge/clusters'
import { getClusterArticles } from '../../config/geoKnowledge/articles'
import { SITE_URL } from '../../config/siteSeo'

export default function GuidesHub() {
  return (
    <div className="w-full">
      <PageMeta
        title="AI Education Knowledge Guides | Bingo Academy"
        description="Expert guides for parents, IOAI competitors, and K–12 schools — versioned, citable knowledge assets with official references."
        canonical={`${SITE_URL}/guides`}
      />

      <section className="border-b border-slate-200 bg-gradient-to-br from-slate-50 to-cyan-50/40 py-10 sm:py-14">
        <PageContent>
          <p className="text-xs font-bold tracking-widest text-slate-500 uppercase">Knowledge base</p>
          <h1 className="text-2xl sm:text-3xl font-black text-bingo-dark mt-2 max-w-2xl">
            Citable guides — not keyword spam
          </h1>
          <p className="text-sm text-slate-600 mt-3 max-w-2xl leading-relaxed">
            Each page answers one real decision with version dates, reviewers, and official citations. We do not batch-generate near-duplicate articles for every keyword variant.
          </p>
        </PageContent>
      </section>

      <PageContent className="py-10 sm:py-12">
        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          {GEO_CLUSTERS.map((cluster) => {
            const count =
              cluster.id === 'evidence' ? 1 : getClusterArticles(cluster.id).length
            return (
              <Link
                key={cluster.id}
                to={cluster.path}
                className="card p-6 hover:border-primary/40 hover:shadow-md transition group"
              >
                <span className="text-3xl">{cluster.icon}</span>
                <h2 className="font-bold text-bingo-dark mt-3 group-hover:text-primary transition">
                  {cluster.title}
                </h2>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">{cluster.description}</p>
                <p className="text-xs text-primary font-semibold mt-4">
                  {count} resource{count !== 1 ? 's' : ''} →
                </p>
              </Link>
            )
          })}
        </div>

        <section className="card p-6 bg-slate-50 text-sm text-slate-600 leading-relaxed">
          <h2 className="font-bold text-bingo-dark mb-2">For generative search (GEO)</h2>
          <p>
            Research suggests generative engines favour unique, expert, well-sourced content. These guides pair with{' '}
            <Link to="/exploration" className="text-primary hover:underline">
              lab knowledge bases
            </Link>
            ,{' '}
            <Link to="/programs/ioai" className="text-primary hover:underline">
              program decision pages
            </Link>
            , and{' '}
            <Link to="/news" className="text-primary hover:underline">
              dated news guides
            </Link>
            . Visibility outcomes are not guaranteed on any platform.
          </p>
        </section>
      </PageContent>
    </div>
  )
}

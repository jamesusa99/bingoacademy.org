import { Link, useParams } from 'react-router-dom'
import PageMeta from '../../components/PageMeta'
import PageContent from '../../components/PageContent'
import NotFound from '../NotFound'
import { getCluster } from '../../config/geoKnowledge/clusters'
import { getClusterArticles } from '../../config/geoKnowledge/articles'
import { SITE_URL } from '../../config/siteSeo'

export default function GuideClusterPage() {
  const { cluster: clusterId } = useParams()
  const cluster = getCluster(clusterId)
  const articles = getClusterArticles(clusterId)

  if (!cluster || !articles.length) {
    return <NotFound status={404} />
  }

  return (
    <div className="w-full">
      <PageMeta
        title={`${cluster.title} | Bingo Academy Guides`}
        description={cluster.description}
        canonical={`${SITE_URL}/guides/${clusterId}`}
      />

      <PageContent className="py-10 sm:py-12 max-w-3xl">
        <Link to="/guides" className="text-sm text-primary hover:underline">
          ← All guides
        </Link>
        <p className="text-3xl mt-4" aria-hidden>
          {cluster.icon}
        </p>
        <h1 className="text-2xl sm:text-3xl font-black text-bingo-dark mt-2">{cluster.title}</h1>
        <p className="text-sm text-slate-600 mt-3 leading-relaxed">{cluster.description}</p>

        <ul className="mt-8 space-y-3">
          {articles.map((article) => (
            <li key={article.slug}>
              <Link
                to={`/guides/${clusterId}/${article.slug}`}
                className="card p-5 block hover:border-primary/40 transition"
              >
                <p className="text-[10px] font-bold text-primary uppercase">
                  v{article.version} · {article.updatedAt}
                </p>
                <h2 className="font-semibold text-bingo-dark mt-1">{article.title}</h2>
                <p className="text-sm text-slate-600 mt-1">{article.excerpt}</p>
              </Link>
            </li>
          ))}
        </ul>
      </PageContent>
    </div>
  )
}

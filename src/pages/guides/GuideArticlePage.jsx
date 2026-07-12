import { Link, useParams } from 'react-router-dom'
import { useEffect } from 'react'
import PageMeta from '../../components/PageMeta'
import PageContent from '../../components/PageContent'
import NotFound from '../NotFound'
import { getCluster } from '../../config/geoKnowledge/clusters'
import { getGuideArticle } from '../../config/geoKnowledge/articles'
import KnowledgeArticleLayout from '../../components/knowledge/KnowledgeArticleLayout'
import { SITE_URL } from '../../config/siteSeo'
import { buildPageGraph, guideArticleEntity, personEntity } from '../../config/structuredData'
import { getInstructor } from '../../config/trust/instructors'
import { trackEvent } from '../../lib/analytics'

export default function GuideArticlePage() {
  const { cluster: clusterId, slug } = useParams()
  const cluster = getCluster(clusterId)
  const article = getGuideArticle(clusterId, slug)
  const path = `/guides/${clusterId}/${slug}`

  useEffect(() => {
    if (!cluster || !article) return
    trackEvent('guide_view', {
      cluster: clusterId,
      slug,
      version: article.version,
      page: path,
    })
  }, [cluster, article, clusterId, slug, path])

  if (!cluster || !article) {
    return <NotFound status={404} />
  }

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Guides', href: '/guides' },
    { label: cluster.title, href: `/guides/${clusterId}` },
    { label: article.title },
  ]
  const authorInstructor = article.authorSlug ? getInstructor(article.authorSlug) : null

  return (
    <div className="w-full">
      <PageMeta
        title={`${article.title} | Bingo Academy`}
        description={article.excerpt}
        canonical={`${SITE_URL}${path}`}
        ogType="article"
        jsonLd={buildPageGraph({
          pageUrl: path,
          breadcrumbs,
          entities: [guideArticleEntity(article, path)],
          authorPerson: authorInstructor
            ? personEntity({
                slug: authorInstructor.slug,
                name: authorInstructor.name,
                title: authorInstructor.title,
                image: authorInstructor.photo,
                description: authorInstructor.bio,
              })
            : null,
        })}
      />

      <PageContent className="py-10 sm:py-12">
        <Link to={`/guides/${clusterId}`} className="text-sm text-primary hover:underline">
          ← {cluster.title}
        </Link>
        <div className="mt-6">
          <KnowledgeArticleLayout article={article} cluster={cluster} />
        </div>
      </PageContent>
    </div>
  )
}

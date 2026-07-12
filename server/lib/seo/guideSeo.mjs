/** Server SEO for /guides knowledge hub */

import { getGuideArticle, getClusterArticles, getAllGuidePaths } from '../../../src/config/geoKnowledge/articles.js'
import { GEO_CLUSTERS, getCluster } from '../../../src/config/geoKnowledge/clusters.js'
import { EVIDENCE_HUB } from '../../../src/config/geoKnowledge/evidence.js'
import { SITE_BRAND } from './constants.mjs'

export function parseGuidePath(pathname) {
  if (pathname === '/guides') return { hub: true }
  if (pathname === '/guides/evidence') return { evidence: true }

  const clusterMatch = pathname.match(/^\/guides\/(parents|ioai|k12)$/)
  if (clusterMatch) return { cluster: clusterMatch[1] }

  const articleMatch = pathname.match(/^\/guides\/(parents|ioai|k12)\/([^/]+)$/)
  if (articleMatch) {
    return { cluster: articleMatch[1], slug: articleMatch[2] }
  }

  return null
}

export function guidesSeoForPath(pathname) {
  const parsed = parseGuidePath(pathname)
  if (!parsed) return null

  if (parsed.hub) {
    return {
      title: `AI Education Knowledge Guides | ${SITE_BRAND}`,
      description:
        'Expert guides for parents, IOAI competitors, and K–12 schools — versioned, citable knowledge with official references.',
      h1: 'Knowledge guides',
      body: 'Citable guides for parents, IOAI/USAAIO preparation, K–12 schools, and first-party evidence.',
      canonical: '/guides',
    }
  }

  if (parsed.evidence) {
    return {
      title: `${EVIDENCE_HUB.title} | ${SITE_BRAND}`,
      description: EVIDENCE_HUB.excerpt,
      h1: EVIDENCE_HUB.title,
      body: EVIDENCE_HUB.excerpt,
      canonical: '/guides/evidence',
    }
  }

  if (parsed.slug) {
    const article = getGuideArticle(parsed.cluster, parsed.slug)
    if (!article) return null
    return {
      title: `${article.title} | ${SITE_BRAND}`,
      description: article.excerpt,
      h1: article.title,
      body: article.body,
      canonical: `/guides/${parsed.cluster}/${parsed.slug}`,
      version: article.version,
      updatedAt: article.updatedAt,
    }
  }

  if (parsed.cluster) {
    const cluster = getCluster(parsed.cluster)
    const count = getClusterArticles(parsed.cluster).length
    if (!cluster) return null
    return {
      title: `${cluster.title} | ${SITE_BRAND} Guides`,
      description: cluster.description,
      h1: cluster.title,
      body: `${cluster.description} (${count} guides)`,
      canonical: `/guides/${parsed.cluster}`,
    }
  }

  return null
}

export function guideSitemapPaths() {
  return getAllGuidePaths()
}

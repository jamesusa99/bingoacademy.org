/**
 * JSON-LD builders — stable @id graph linking for SEO rich results.
 * Not GEO-specific; helps crawlers understand entities and relationships.
 */

import { SITE_BRAND, SITE_DEFAULT_SEO, SITE_OG, SITE_URL } from './siteConstants.js'

/** Stable entity identifiers */
export const STRUCTURED_IDS = {
  organization: `${SITE_URL}/#organization`,
  website: `${SITE_URL}/#website`,
}

export function orgReference() {
  return { '@id': STRUCTURED_IDS.organization }
}

export function normalizeImageUrl(image) {
  if (!image) return SITE_OG.image
  if (image.startsWith('http')) return image
  return `${SITE_URL}${image.startsWith('/') ? image : `/${image}`}`
}

export function personId(slug) {
  return `${SITE_URL}/instructors/${slug}/#person`
}

export function personReference(slug) {
  return { '@id': personId(slug) }
}

export function courseId(url) {
  return `${url}#course`
}

export function productId(url) {
  return `${url}#product`
}

export function offerId(url) {
  return `${url}#offer`
}

/** Full organization — include on homepage graph */
export function organizationEntity() {
  return {
    '@type': 'EducationalOrganization',
    '@id': STRUCTURED_IDS.organization,
    name: SITE_BRAND,
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/logo.png`,
    },
    image: SITE_OG.image,
    description: SITE_DEFAULT_SEO.description,
    email: 'hello@bingoacademy.org',
    sameAs: [SITE_URL],
  }
}

export function websiteEntity() {
  return {
    '@type': 'WebSite',
    '@id': STRUCTURED_IDS.website,
    name: SITE_BRAND,
    url: SITE_URL,
    publisher: orgReference(),
  }
}

export function homePageGraph() {
  return buildGraph(organizationEntity(), websiteEntity())
}

export function personEntity({ slug, name, title, image, url, description }) {
  const pageUrl = url || `${SITE_URL}/instructors/${slug}`
  return {
    '@type': 'Person',
    '@id': personId(slug),
    name,
    jobTitle: title,
    description,
    url: pageUrl,
    image: image ? normalizeImageUrl(image) : undefined,
    worksFor: orgReference(),
  }
}

export function offerEntity({ url, priceCents, price, currency = 'USD', availability = 'InStock' }) {
  if (priceCents == null && !price) return null
  const amount =
    priceCents != null ? (priceCents / 100).toFixed(priceCents % 100 === 0 ? 0 : 2) : String(price).replace(/[^0-9.]/g, '')
  if (!amount || Number(amount) <= 0) return null
  return {
    '@type': 'Offer',
    '@id': offerId(url),
    url,
    price: amount,
    priceCurrency: currency.toUpperCase(),
    availability: `https://schema.org/${availability}`,
    seller: orgReference(),
    itemOffered: { '@id': courseId(url) },
  }
}

export function productOfferEntity({ url, priceCents, price, currency = 'USD' }) {
  if (priceCents == null && !price) return null
  const amount =
    priceCents != null ? (priceCents / 100).toFixed(priceCents % 100 === 0 ? 0 : 2) : String(price).replace(/[^0-9.]/g, '')
  if (!amount || Number(amount) <= 0) return null
  return {
    '@type': 'Offer',
    '@id': offerId(url),
    url,
    price: amount,
    priceCurrency: currency.toUpperCase(),
    availability: 'https://schema.org/InStock',
    seller: orgReference(),
    itemOffered: { '@id': productId(url) },
  }
}

export function courseEntity({ name, description, url, image, priceCents, price, currency }) {
  const pageUrl = url.startsWith('http') ? url : `${SITE_URL}${url}`
  const entity = {
    '@type': 'Course',
    '@id': courseId(pageUrl),
    name,
    description,
    url: pageUrl,
    provider: orgReference(),
    image: normalizeImageUrl(image),
  }
  const offer = offerEntity({ url: pageUrl, priceCents, price, currency })
  if (offer) {
    entity.offers = offer
    offer.itemOffered = { '@id': courseId(pageUrl) }
  }
  return entity
}

export function productEntity({ name, description, url, image, priceCents, price, currency }) {
  const pageUrl = url.startsWith('http') ? url : `${SITE_URL}${url}`
  const entity = {
    '@type': 'Product',
    '@id': productId(pageUrl),
    name,
    description,
    url: pageUrl,
    brand: orgReference(),
    image: normalizeImageUrl(image),
  }
  const offer = productOfferEntity({ url: pageUrl, priceCents, price, currency })
  if (offer) {
    entity.offers = offer
    offer.itemOffered = { '@id': productId(pageUrl) }
  }
  return entity
}

export function articleEntity({
  headline,
  description,
  url,
  datePublished,
  dateModified,
  authorSlug,
  authorName,
  image,
  type = 'Article',
}) {
  const pageUrl = url.startsWith('http') ? url : `${SITE_URL}${url}`
  const modified = dateModified || datePublished
  const entity = {
    '@type': type,
    '@id': `${pageUrl}#article`,
    headline,
    description,
    url: pageUrl,
    datePublished,
    dateModified: modified,
    image: [normalizeImageUrl(image)],
    publisher: {
      '@type': 'Organization',
      '@id': STRUCTURED_IDS.organization,
      name: SITE_BRAND,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
    mainEntityOfPage: pageUrl,
  }
  if (authorSlug) {
    entity.author = personReference(authorSlug)
  } else {
    entity.author = {
      '@type': 'Organization',
      '@id': STRUCTURED_IDS.organization,
      name: authorName || SITE_BRAND,
    }
  }
  return entity
}

export function newsArticleEntity(article, path) {
  const pageUrl = `${SITE_URL}${path}`
  return articleEntity({
    headline: article.title,
    description: article.excerpt,
    url: pageUrl,
    datePublished: article.date,
    dateModified: article.updatedAt || article.date,
    authorSlug: article.authorSlug,
    authorName: article.authorName || `${SITE_BRAND} Editorial`,
    image: article.ogImage,
    type: 'NewsArticle',
  })
}

export function guideArticleEntity(article, path) {
  const pageUrl = `${SITE_URL}${path}`
  return articleEntity({
    headline: article.title,
    description: article.excerpt,
    url: pageUrl,
    datePublished: article.updatedAt,
    dateModified: article.updatedAt,
    authorSlug: article.authorSlug,
    authorName: article.author,
    image: SITE_OG.image,
    type: 'Article',
  })
}

export function breadcrumbEntity(breadcrumbs, pageUrl) {
  if (!breadcrumbs?.length) return null
  const baseUrl = pageUrl.startsWith('http') ? pageUrl : `${SITE_URL}${pageUrl}`
  return {
    '@type': 'BreadcrumbList',
    '@id': `${baseUrl}#breadcrumb`,
    itemListElement: breadcrumbs.map((crumb, index) => {
      const item = crumb.href ? `${SITE_URL}${crumb.href}` : undefined
      return {
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.label,
        ...(item ? { item } : {}),
      }
    }),
  }
}

export function faqPageEntity(faq, pageUrl) {
  if (!faq?.length) return null
  const url = pageUrl.startsWith('http') ? pageUrl : `${SITE_URL}${pageUrl}`
  return {
    '@type': 'FAQPage',
    '@id': `${url}#faq`,
    url,
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  }
}

export function videoObjectEntity({ name, description, thumbnailUrl, contentUrl, embedUrl, pageUrl }) {
  if (!contentUrl && !embedUrl) return null
  const url = pageUrl.startsWith('http') ? pageUrl : `${SITE_URL}${pageUrl}`
  return {
    '@type': 'VideoObject',
    '@id': `${url}#video`,
    name,
    description,
    thumbnailUrl: normalizeImageUrl(thumbnailUrl),
    contentUrl,
    embedUrl,
    uploadDate: undefined,
    publisher: orgReference(),
  }
}

export function learningResourceEntity({ name, description, url }) {
  const pageUrl = url.startsWith('http') ? url : `${SITE_URL}${url}`
  return {
    '@type': 'LearningResource',
    '@id': `${pageUrl}#resource`,
    name,
    description,
    url: pageUrl,
    provider: orgReference(),
  }
}

/** Merge entities into a single linked @graph document */
export function buildGraph(...entities) {
  const flat = entities.flat().filter(Boolean)
  const unique = []
  const seen = new Set()
  for (const entity of flat) {
    const key = entity['@id'] || JSON.stringify(entity)
    if (seen.has(key)) continue
    seen.add(key)
    unique.push(entity)
  }
  return {
    '@context': 'https://schema.org',
    '@graph': unique,
  }
}

/**
 * Standard page graph: primary entity + breadcrumbs + optional FAQ + person author.
 */
export function buildPageGraph({ pageUrl, breadcrumbs, entities = [], faq, authorPerson }) {
  const items = [...entities]
  const crumb = breadcrumbEntity(breadcrumbs, pageUrl)
  if (crumb) items.push(crumb)
  const faqEntity = faqPageEntity(faq, pageUrl)
  if (faqEntity) items.push(faqEntity)
  if (authorPerson) items.push(authorPerson)
  return buildGraph(...items)
}

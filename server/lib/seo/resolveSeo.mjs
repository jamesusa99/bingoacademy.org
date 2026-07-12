import {
  SITE_URL,
  SITE_DEFAULT_SEO,
  SITE_OG,
  SITE_TWITTER,
  SITE_BRAND,
  ORG_JSON_LD,
  isNoindexPath,
  isNoindexQuery,
  robotsMetaContent,
} from './constants.mjs'
import { getStaticSeoForPath } from './staticSeo.mjs'
import {
  fetchNewsArticle,
  fetchCourseBySlug,
  fetchLabPackBySlug,
  fetchLabExperiment,
} from './fetchDynamic.mjs'
import { buildBodyHtml } from './bodyContent.mjs'
import { coursesSeoForPathname, parseCoursePathname } from './courseSeo.mjs'
import { getProgramDecisionPage, decisionPagePlainText } from '../../../src/config/courseDecisionPages.js'
import { guidesSeoForPath } from './guideSeo.mjs'
import { trustSeoForPath } from './trustSeo.mjs'
import { getExperimentById } from '../../../src/config/explorationLab.js'
import { getExplorationKnowledge } from '../../../src/config/explorationKnowledge.js'
import { getInstructor } from '../../../src/config/trust/instructors.js'
import { getGuideArticle } from '../../../src/config/geoKnowledge/articles.js'
import {
  buildGraph,
  homePageGraph,
  courseEntity,
  productEntity,
  newsArticleEntity,
  guideArticleEntity,
  personEntity,
  breadcrumbEntity,
  faqPageEntity,
  learningResourceEntity,
} from '../../../src/config/structuredData.js'

function buildSeoPayload({
  path,
  title,
  description,
  keywords,
  ogTitle,
  ogDescription,
  ogImage,
  ogType = 'website',
  jsonLd,
  noindex = false,
  robotsContent,
  h1,
  body,
  breadcrumbs,
  links,
  mainHtml,
}) {
  const canonical = `${SITE_URL}${path === '/' ? '' : path}`
  return {
    path,
    title: title || SITE_DEFAULT_SEO.title,
    description: description || SITE_DEFAULT_SEO.description,
    keywords: keywords || SITE_DEFAULT_SEO.keywords,
    ogTitle: ogTitle || title || SITE_OG.title,
    ogDescription: ogDescription || description || SITE_DEFAULT_SEO.description,
    ogImage: ogImage || SITE_OG.image,
    ogUrl: canonical,
    ogType,
    canonical,
    jsonLd,
    noindex,
    robotsContent,
    h1,
    body,
    breadcrumbs,
    links,
    mainHtml,
  }
}

function authorPersonForSlug(slug) {
  const instructor = getInstructor(slug)
  if (!instructor) return null
  return personEntity({
    slug: instructor.slug,
    name: instructor.name,
    title: instructor.title,
    image: instructor.photo,
    description: instructor.bio,
  })
}

function resolvePageJsonLd({ pageUrl, breadcrumbs, entities = [], faq, authorSlug }) {
  const graphEntities = [...entities]
  const author = authorSlug ? authorPersonForSlug(authorSlug) : null
  if (author) graphEntities.push(author)
  const crumb = breadcrumbEntity(breadcrumbs, pageUrl)
  if (crumb) graphEntities.push(crumb)
  const faqNode = faqPageEntity(faq, pageUrl)
  if (faqNode) graphEntities.push(faqNode)
  return buildGraph(...graphEntities)
}

/**
 * Resolve full SEO payload for a pathname.
 * @param {string} pathname — URL path without query/hash
 * @param {string} [search] — query string (with or without leading ?)
 */
export async function resolveSeo(pathname, search = '') {
  const path = pathname.replace(/\/+$/, '') || '/'
  const queryNoindex = isNoindexQuery(search, path)
  const pathNoindex = isNoindexPath(path)
  const metaRobots = robotsMetaContent(path, search)

  if (pathNoindex) {
    return buildSeoPayload({
      path,
      title: SITE_BRAND,
      description: SITE_DEFAULT_SEO.description,
      noindex: true,
      robotsContent: metaRobots || 'noindex, nofollow',
      h1: SITE_BRAND,
      body: '',
    })
  }

  if (queryNoindex) {
    const baseSeo = await resolveSeoForPathOnly(path)
    return buildSeoPayload({
      ...baseSeo,
      path,
      noindex: true,
      robotsContent: metaRobots || 'noindex, follow',
    })
  }

  return resolveSeoForPathOnly(path)
}

async function resolveSeoForPathOnly(path) {
  // News article
  const newsMatch = path.match(/^\/news\/([^/]+)$/)
  if (newsMatch) {
    const article = await fetchNewsArticle(newsMatch[1])
    if (article) {
      const articlePath = `/news/${article.slug}`
      const breadcrumbs = [
        { label: 'Home', href: '/' },
        { label: 'News', href: '/news' },
        { label: article.title },
      ]
      return buildSeoPayload({
        path: articlePath,
        title: `${article.title} | ${SITE_BRAND} News`,
        description: article.excerpt,
        keywords: article.keywords?.join(', '),
        ogTitle: article.title,
        ogDescription: article.excerpt,
        ogImage: article.ogImage || undefined,
        ogType: 'article',
        jsonLd: resolvePageJsonLd({
          pageUrl: articlePath,
          breadcrumbs,
          entities: [newsArticleEntity(article, articlePath)],
          authorSlug: article.authorSlug,
        }),
        h1: article.title,
        body: article.excerpt,
        breadcrumbs,
        mainHtml: article.body,
      })
    }
  }

  // Course detail
  const courseMatch = path.match(/^\/courses\/detail\/([^/]+)$/)
  if (courseMatch) {
    const course = await fetchCourseBySlug(decodeURIComponent(courseMatch[1]))
    if (course) {
      const coursePath = `/courses/detail/${course.slug}`
      const desc = course.description || `${course.name} — AI course at ${SITE_BRAND}`
      const breadcrumbs = [
        { label: 'Home', href: '/' },
        { label: 'Courses', href: '/courses' },
        { label: course.name },
      ]
      return buildSeoPayload({
        path: coursePath,
        title: `${course.name} | AI Course | ${SITE_BRAND}`,
        description: desc,
        ogTitle: course.name,
        ogDescription: desc,
        ogImage: course.thumbnail || undefined,
        jsonLd: resolvePageJsonLd({
          pageUrl: coursePath,
          breadcrumbs,
          entities: [
            courseEntity({
              name: course.name,
              description: desc,
              url: coursePath,
              image: course.thumbnail,
              priceCents: course.priceCents,
              price: course.price,
              currency: course.currency,
            }),
          ],
        }),
        h1: course.nameEn || course.name,
        body: desc,
        breadcrumbs,
        links: course.outcomes?.length
          ? course.outcomes.map((o) => ({ label: o, href: coursePath }))
          : [],
      })
    }
  }

  // Lab pack
  const labPackMatch = path.match(/^\/labs\/pack\/([^/]+)$/)
  if (labPackMatch) {
    const pack = await fetchLabPackBySlug(decodeURIComponent(labPackMatch[1]))
    if (pack) {
      const packPath = `/labs/pack/${pack.slug}`
      const desc = pack.description || `${pack.name} — hands-on AI lab pack at ${SITE_BRAND}`
      const breadcrumbs = [
        { label: 'Home', href: '/' },
        { label: 'Labs', href: '/labs' },
        { label: pack.name },
      ]
      return buildSeoPayload({
        path: packPath,
        title: `${pack.name} · AI Lab Pack | ${SITE_BRAND}`,
        description: desc,
        ogTitle: pack.name,
        ogDescription: desc,
        jsonLd: resolvePageJsonLd({
          pageUrl: packPath,
          breadcrumbs,
          entities: [
            productEntity({
              name: pack.name,
              description: desc,
              url: packPath,
              image: pack.thumbnail,
              priceCents: pack.priceCents,
              price: pack.price,
              currency: pack.currency,
            }),
          ],
        }),
        h1: pack.name,
        body: desc,
        breadcrumbs,
        links: (pack.experiments || []).map((e) => ({
          label: e.title,
          href: `/labs/pack/${pack.slug}/experiments/${e.slug}`,
        })),
      })
    }
  }

  // Lab experiment
  const labExpMatch = path.match(/^\/labs\/pack\/([^/]+)\/experiments\/([^/]+)$/)
  if (labExpMatch) {
    const packSlug = decodeURIComponent(labExpMatch[1])
    const experimentSlug = decodeURIComponent(labExpMatch[2])
    const experiment = await fetchLabExperiment(packSlug, experimentSlug)
    if (experiment) {
      const expPath = `/labs/pack/${packSlug}/experiments/${experimentSlug}`
      const desc = experiment.summary || `${experiment.title} — AI lab experiment`
      const stepBodies = (experiment.steps || [])
        .filter((s) => s.body)
        .map((s) => s.body)
        .join('\n\n')
      return buildSeoPayload({
        path: expPath,
        title: `${experiment.title} · Lab Experiment | ${SITE_BRAND}`,
        description: desc,
        ogTitle: experiment.title,
        ogDescription: desc,
        h1: experiment.title,
        body: desc,
        breadcrumbs: [
          { label: 'Home', href: '/' },
          { label: 'Labs', href: '/labs' },
          { label: packSlug, href: `/labs/pack/${packSlug}` },
          { label: experiment.title },
        ],
        mainHtml: stepBodies,
        links: (experiment.steps || []).map((s) => ({
          label: s.title,
          href: expPath,
        })),
      })
    }
  }

  // Trust & credibility — /about, /instructors, /methodology, /outcomes, /safety-and-privacy
  const trustSeo = trustSeoForPath(path)
  if (trustSeo) {
    const breadcrumbs = [{ label: 'Home', href: '/' }]
    if (path.startsWith('/instructors')) {
      breadcrumbs.push({ label: 'Instructors', href: '/instructors' })
      if (path !== '/instructors') breadcrumbs.push({ label: trustSeo.h1 || trustSeo.title })
    } else {
      breadcrumbs.push({ label: trustSeo.h1 || trustSeo.title })
    }
    const instructorMatch = path.match(/^\/instructors\/([^/]+)$/)
    const instructor = instructorMatch ? getInstructor(instructorMatch[1]) : null
    const entities = []
    if (instructor) {
      entities.push(
        personEntity({
          slug: instructor.slug,
          name: instructor.name,
          title: instructor.title,
          image: instructor.photo,
          description: instructor.bio,
        })
      )
    }
    return buildSeoPayload({
      path: trustSeo.canonical || path,
      title: trustSeo.title,
      description: trustSeo.description,
      h1: trustSeo.h1 || trustSeo.title,
      body: trustSeo.body,
      breadcrumbs,
      mainHtml: trustSeo.body ? `<p>${trustSeo.body.slice(0, 500)}</p>` : undefined,
      jsonLd: resolvePageJsonLd({
        pageUrl: trustSeo.canonical || path,
        breadcrumbs,
        entities,
      }),
    })
  }

  // Knowledge guides — /guides/*
  const guideSeo = guidesSeoForPath(path)
  if (guideSeo) {
    const breadcrumbs = [{ label: 'Home', href: '/' }, { label: 'Guides', href: '/guides' }]
    if (path !== '/guides') {
      breadcrumbs.push({ label: guideSeo.h1 || guideSeo.title })
    }
    const parsed = path.match(/^\/guides\/(parents|ioai|k12)\/([^/]+)$/)
    const guideArticle = parsed ? getGuideArticle(parsed[1], parsed[2]) : null
    const entities = guideArticle ? [guideArticleEntity(guideArticle, guideSeo.canonical || path)] : []
    return buildSeoPayload({
      path: guideSeo.canonical || path,
      title: guideSeo.title,
      description: guideSeo.description,
      h1: guideSeo.h1 || guideSeo.title,
      body: guideSeo.body,
      breadcrumbs,
      mainHtml: guideSeo.body ? `<p>${guideSeo.body.slice(0, 500)}</p>` : undefined,
      jsonLd: resolvePageJsonLd({
        pageUrl: guideSeo.canonical || path,
        breadcrumbs,
        entities,
        authorSlug: guideArticle?.authorSlug,
      }),
    })
  }

  // Exploration lab pages — knowledge-rich learning resources
  const explorationMatch = path.match(/^\/exploration\/([^/]+)$/)
  if (explorationMatch) {
    const slugToId = {
      'hide-and-seek': 'hide-and-seek',
      'virtual-conductor': 'statue-conductor',
      'word-gravity': 'word-gravity',
      'jailbreak-adventure': 'jailbreak-adventure',
      'evolve-car': 'evolve-car',
      'doodle-monsters': 'doodle-monsters',
      'cyber-tennis': 'cyber-tennis',
    }
    const expId = slugToId[explorationMatch[1]]
    const experiment = expId ? getExperimentById(expId) : null
    const knowledge = expId ? getExplorationKnowledge(expId) : null
    if (experiment && knowledge) {
      const bodyParts = [
        knowledge.learningGoals.join('. '),
        knowledge.whyItWorks,
        knowledge.safetyPrivacy,
      ].filter(Boolean)
      return buildSeoPayload({
        path,
        title: `${experiment.title} — AI Lab & Learning Guide | ${SITE_BRAND}`,
        description: `${experiment.subtitle}. ${knowledge.learningGoals[0]}`,
        h1: experiment.title,
        body: bodyParts.join('\n\n'),
        breadcrumbs: [
          { label: 'Home', href: '/' },
          { label: 'Exploration', href: '/exploration' },
          { label: experiment.title },
        ],
        jsonLd: resolvePageJsonLd({
          pageUrl: path,
          breadcrumbs: [
            { label: 'Home', href: '/' },
            { label: 'Exploration', href: '/exploration' },
            { label: experiment.title },
          ],
          entities: [
            learningResourceEntity({
              name: experiment.title,
              description: knowledge.learningGoals.join(' '),
              url: path,
            }),
          ],
        }),
      })
    }
  }

  // Program pages — decision-page body for crawlers
  const programMatch = path.match(/^\/programs\/([^/]+)$/)
  if (programMatch) {
    const slug = programMatch[1]
    const staticSeo = getStaticSeoForPath(path)
    const decision = getProgramDecisionPage(slug)
    if (staticSeo) {
      const breadcrumbs = [
        { label: 'Home', href: '/' },
        { label: 'Programs', href: '/courses' },
        { label: staticSeo.h1 || staticSeo.title },
      ]
      const bodyText = decision ? decisionPagePlainText(decision) : staticSeo.body || staticSeo.description
      return buildSeoPayload({
        path,
        title: staticSeo.title,
        description: decision?.directAnswer?.slice(0, 160) || staticSeo.description,
        h1: staticSeo.h1 || staticSeo.title,
        body: bodyText,
        breadcrumbs,
        mainHtml: decision?.directAnswer
          ? `<p>${decision.directAnswer}</p>`
          : undefined,
        jsonLd: resolvePageJsonLd({
          pageUrl: path,
          breadcrumbs,
          entities: [
            courseEntity({
              name: staticSeo.h1 || staticSeo.title,
              description: decision?.directAnswer || staticSeo.description,
              url: path,
            }),
          ],
          faq: decision?.faq,
        }),
      })
    }
  }

  // Course hub + product line paths
  const courseSeo = coursesSeoForPathname(path)
  if (courseSeo) {
    const parsed = parseCoursePathname(path)
    const seoPath = courseSeo.canonical || path
    const lineSlug = parsed?.lineSlug
    const decision = lineSlug ? getProgramDecisionPage(lineSlug) : null
    const breadcrumbs = [{ label: 'Home', href: '/' }, { label: 'Courses', href: '/courses' }]
    if (parsed && !parsed.hub) {
      breadcrumbs.push({ label: courseSeo.h1 || courseSeo.title })
    } else {
      breadcrumbs.push({ label: courseSeo.h1 || courseSeo.title })
    }
    return buildSeoPayload({
      path: seoPath,
      title: courseSeo.title,
      description: decision?.directAnswer?.slice(0, 160) || courseSeo.description,
      h1: courseSeo.h1 || courseSeo.title,
      body: decision ? decisionPagePlainText(decision) : courseSeo.body || courseSeo.description,
      breadcrumbs,
      mainHtml: decision?.directAnswer ? `<p>${decision.directAnswer}</p>` : undefined,
      jsonLd: decision
        ? resolvePageJsonLd({
            pageUrl: seoPath,
            breadcrumbs,
            entities: [
              courseEntity({
                name: courseSeo.h1 || courseSeo.title,
                description: decision.directAnswer,
                url: seoPath,
              }),
            ],
            faq: decision.faq,
          })
        : resolvePageJsonLd({
            pageUrl: seoPath,
            breadcrumbs,
            entities: [
              courseEntity({
                name: courseSeo.h1 || courseSeo.title,
                description: courseSeo.description,
                url: seoPath,
              }),
            ],
          }),
    })
  }

  // Static pages
  const staticSeo = getStaticSeoForPath(path)
  if (staticSeo) {
    const breadcrumbs = [{ label: 'Home', href: '/' }]
    if (path.startsWith('/programs/')) {
      breadcrumbs.push({ label: 'Programs', href: '/courses' })
      breadcrumbs.push({ label: staticSeo.h1 || staticSeo.title })
    } else if (path !== '/') {
      breadcrumbs.push({ label: staticSeo.h1 || staticSeo.title })
    }

    let jsonLd
    if (path === '/') {
      jsonLd = homePageGraph()
    } else if (path.startsWith('/programs/')) {
      jsonLd = resolvePageJsonLd({
        pageUrl: path,
        breadcrumbs,
        entities: [
          courseEntity({
            name: staticSeo.h1 || staticSeo.title,
            description: staticSeo.description,
            url: path,
          }),
        ],
      })
    } else if (breadcrumbs.length > 1) {
      jsonLd = resolvePageJsonLd({ pageUrl: path, breadcrumbs, entities: [] })
    }

    return buildSeoPayload({
      path,
      title: staticSeo.title,
      description: staticSeo.description,
      keywords: staticSeo.keywords,
      ogTitle: staticSeo.ogTitle,
      ogDescription: staticSeo.ogDescription,
      jsonLd,
      h1: staticSeo.h1 || staticSeo.title,
      body: staticSeo.body || staticSeo.description,
      breadcrumbs,
    })
  }

  // Unknown path — caller should return 404; minimal noindex payload as fallback
  return buildSeoPayload({
    path,
    title: `Page Not Found | ${SITE_BRAND}`,
    description: 'The requested page could not be found.',
    noindex: true,
    h1: 'Page not found',
    body: 'The requested page could not be found.',
  })
}

export async function resolveSeoWithBody(pathname, search = '') {
  const seo = await resolveSeo(pathname, search)
  seo.bodyHtml = buildBodyHtml(seo)
  return seo
}

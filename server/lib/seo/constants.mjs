/** Site-wide SEO defaults — mirrors src/config/siteSeo.js for server-side rendering */

import { SITE_BRAND } from '../../config/urlMigrations.mjs'
import { homePageGraph } from '../../../src/config/structuredData.js'

export {
  NOINDEX_PATH_PATTERNS,
  isNoindexPath,
  isNoindexQuery,
  shouldNoindex,
  robotsMetaContent,
} from '../../config/crawlers.mjs'

export const SITE_URL = 'https://www.bingoacademy.org'

export const SITE_DEFAULT_SEO = {
  title: `AI Courses for Kids & Teens | K-12 AI Education Platform | ${SITE_BRAND}`,
  description: `Discover AI courses, competitions and hands-on learning programs for K-12 students. ${SITE_BRAND} helps children and teens learn artificial intelligence through projects, creativity and innovation.`,
  keywords:
    'AI Education, AI Courses, AI for Kids, K12 AI Education, AI Curriculum, Artificial Intelligence for Students, AI Competitions, AI Literacy, STEM Education, AI Learning, IOAI, AI classes for kids, AI course for teens, AI summer camp, AI coding classes',
}

export const SITE_OG = {
  title: `${SITE_BRAND} — AI Education for the Next Generation`,
  description:
    'AI courses, competitions and K-12 artificial intelligence programs for students and schools.',
  image: `${SITE_URL}/images/og-cover.jpg`,
  type: 'website',
}

export const SITE_TWITTER = {
  card: 'summary_large_image',
}

export { SITE_BRAND }

export const ORG_JSON_LD = homePageGraph()

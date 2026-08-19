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
  title: `IOAI Competition Training for Students | ${SITE_BRAND}`,
  description:
    'Structured AI Olympiad training for students ages 12–18, covering Python, machine learning, neural networks, Jupyter labs, projects, and mock assessments.',
  keywords:
    'IOAI, AI Olympiad training, IOAI competition prep, AI for teens, Python machine learning, neural networks, Jupyter labs, mock assessments, Bingo Academy',
}

export const SITE_OG = {
  title: `IOAI Competition Training for Students | ${SITE_BRAND}`,
  siteName: SITE_BRAND,
  description:
    'Structured AI Olympiad training for students ages 12–18 — Python, machine learning, neural networks, Jupyter labs, projects, and mock assessments.',
  image: `${SITE_URL}/images/og-cover.jpg`,
  type: 'website',
}

export const SITE_TWITTER = {
  card: 'summary_large_image',
}

export { SITE_BRAND }

export const ORG_JSON_LD = homePageGraph()

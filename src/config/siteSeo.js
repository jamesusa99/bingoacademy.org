/** Site-wide SEO defaults — TKD, Open Graph, canonical base */

import { SITE_URL, SITE_BRAND, SITE_DEFAULT_SEO, SITE_OG, SITE_TWITTER } from './siteConstants.js'
import { homePageGraph } from './structuredData.js'

export { SITE_URL, SITE_BRAND, SITE_DEFAULT_SEO, SITE_OG, SITE_TWITTER }

export const ORG_JSON_LD = homePageGraph()

export { homePageGraph } from './structuredData.js'

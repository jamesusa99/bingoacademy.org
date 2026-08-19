/** Site-wide SEO defaults — TKD, Open Graph, canonical base */

import {
  SITE_URL,
  SITE_BRAND,
  SITE_DOMAIN,
  SITE_LEGACY_NAME,
  SITE_LEGAL_ENTITY,
  SITE_DEFAULT_SEO,
  SITE_OG,
  SITE_TWITTER,
  pageTitle,
} from './siteConstants.js'
import { homePageGraph } from './structuredData.js'

export {
  SITE_URL,
  SITE_BRAND,
  SITE_DOMAIN,
  SITE_LEGACY_NAME,
  SITE_LEGAL_ENTITY,
  SITE_DEFAULT_SEO,
  SITE_OG,
  SITE_TWITTER,
  pageTitle,
}

export const ORG_JSON_LD = homePageGraph()

export { homePageGraph } from './structuredData.js'

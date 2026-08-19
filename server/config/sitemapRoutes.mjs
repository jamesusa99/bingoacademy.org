/** Static public routes for sitemap generation */

import { SITE_URL } from './sitemapStatic.mjs'

export { SITE_URL }

/** Core marketing pages — no query params, no lastmod unless content file changes */
export const SITEMAP_PAGE_ROUTES = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/news', changefreq: 'daily', priority: '0.9' },
  { path: '/courses/ioai', changefreq: 'weekly', priority: '0.9' },
  { path: '/ioai/curriculum', changefreq: 'weekly', priority: '0.9' },
  { path: '/ioai/sample-lab', changefreq: 'monthly', priority: '0.8' },
  { path: '/assessment/ioai', changefreq: 'monthly', priority: '0.8' },
  { path: '/exploration', changefreq: 'weekly', priority: '0.8' },
  { path: '/showcase', changefreq: 'weekly', priority: '0.7' },
  { path: '/showcase/works', changefreq: 'weekly', priority: '0.7' },
  { path: '/about', changefreq: 'monthly', priority: '0.7' },
  { path: '/instructors', changefreq: 'monthly', priority: '0.7' },
  { path: '/privacy', changefreq: 'yearly', priority: '0.3' },
  { path: '/safety-and-privacy', changefreq: 'yearly', priority: '0.3' },
]

export const SITEMAP_PROGRAM_ROUTES = []

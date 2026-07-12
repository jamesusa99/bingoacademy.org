/** Static public routes for sitemap generation */

import { SITE_URL } from './sitemapStatic.mjs'

export { SITE_URL }

/** Core marketing pages — no query params, no lastmod unless content file changes */
export const SITEMAP_PAGE_ROUTES = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/news', changefreq: 'daily', priority: '0.9' },
  { path: '/courses/ioai', changefreq: 'weekly', priority: '0.9' },
  { path: '/exploration', changefreq: 'weekly', priority: '0.8' },
  { path: '/labs', changefreq: 'weekly', priority: '0.8' },
  { path: '/curriculum', changefreq: 'weekly', priority: '0.8' },
  { path: '/showcase', changefreq: 'weekly', priority: '0.7' },
  { path: '/cert', changefreq: 'monthly', priority: '0.7' },
  { path: '/mall', changefreq: 'weekly', priority: '0.7' },
  { path: '/community', changefreq: 'weekly', priority: '0.6' },
  { path: '/assessment', changefreq: 'monthly', priority: '0.7' },
  { path: '/privacy', changefreq: 'yearly', priority: '0.3' },
  { path: '/ai-classes-for-kids', changefreq: 'weekly', priority: '0.9' },
  { path: '/usaaio-prep', changefreq: 'weekly', priority: '0.9' },
  { path: '/try-ai', changefreq: 'weekly', priority: '0.8' },
  { path: '/ioai-masterclass', changefreq: 'weekly', priority: '0.8' },
]

export const SITEMAP_PROGRAM_ROUTES = [
  { path: '/programs/ioai', changefreq: 'weekly', priority: '0.9' },
  { path: '/programs/foundations', changefreq: 'weekly', priority: '0.9' },
  { path: '/programs/k12', changefreq: 'weekly', priority: '0.8' },
]

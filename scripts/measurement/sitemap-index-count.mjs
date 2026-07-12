/**
 * Count canonical URLs in sitemap vs noindex paths — SEO index health baseline.
 * Run: node scripts/measurement/sitemap-index-count.mjs
 */
import { collectPrerenderPaths } from '../../server/lib/seo/spaHandler.mjs'
import { guideSitemapPaths } from '../../server/lib/seo/guideSeo.mjs'
import { trustSitemapPaths } from '../../server/lib/seo/trustSeo.mjs'
import { courseSitemapPaths } from '../../server/lib/seo/courseSeo.mjs'
import { SITEMAP_PAGE_ROUTES, SITEMAP_PROGRAM_ROUTES } from '../../server/config/sitemapRoutes.mjs'

async function main() {
  const prerender = await collectPrerenderPaths()
  const staticRoutes = [...SITEMAP_PAGE_ROUTES, ...SITEMAP_PROGRAM_ROUTES]
  const guides = guideSitemapPaths()
  const trust = trustSitemapPaths()
  const courses = courseSitemapPaths()

  const canonical = new Set([
    ...staticRoutes,
    ...guides,
    ...trust,
    ...courses,
    ...prerender,
  ])

  console.log('[sitemap-index-count] Canonical URL estimate')
  console.log(`  Static + program routes: ${staticRoutes.length}`)
  console.log(`  Guides: ${guides.length}`)
  console.log(`  Trust: ${trust.length}`)
  console.log(`  Course hubs: ${courses.length}`)
  console.log(`  Prerender (dynamic): ${prerender.length}`)
  console.log(`  Total unique canonical paths: ${canonical.size}`)
  console.log('')
  console.log('Compare monthly with GSC → Pages → Indexed count.')
  console.log('Investigate gaps: duplicate, crawled-not-indexed, soft 404.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

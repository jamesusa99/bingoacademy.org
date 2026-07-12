import { SITE_URL } from '../config/sitemapStatic.mjs'
import { SITEMAP_PAGE_ROUTES, SITEMAP_PROGRAM_ROUTES } from '../config/sitemapRoutes.mjs'
import { buildRobotsTxt } from '../config/crawlers.mjs'
import {
  fetchAllLiveNewsSlugs,
  fetchCourseSitemapEntries,
  fetchLabPackSitemapEntries,
} from './seo/fetchDynamic.mjs'
import { guideSitemapPaths } from './seo/guideSeo.mjs'
import { trustSitemapPaths } from './seo/trustSeo.mjs'
import { courseSitemapPaths } from './seo/courseSeo.mjs'

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function urlEntry(loc, { lastmod, changefreq, priority } = {}) {
  let xml = '  <url>\n'
  xml += `    <loc>${escapeXml(loc)}</loc>\n`
  if (lastmod) xml += `    <lastmod>${escapeXml(lastmod)}</lastmod>\n`
  if (changefreq) xml += `    <changefreq>${escapeXml(changefreq)}</changefreq>\n`
  if (priority) xml += `    <priority>${escapeXml(priority)}</priority>\n`
  xml += '  </url>\n'
  return xml
}

function buildUrlset(entries) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
  for (const entry of entries) {
    xml += urlEntry(`${SITE_URL}${entry.path}`, entry)
  }
  xml += '</urlset>\n'
  return xml
}

function buildSitemapIndex(sitemaps) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
  xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
  for (const name of sitemaps) {
    xml += '  <sitemap>\n'
    xml += `    <loc>${escapeXml(`${SITE_URL}/${name}`)}</loc>\n`
    xml += '  </sitemap>\n'
  }
  xml += '</sitemapindex>\n'
  return xml
}

async function fetchNewsSitemapEntries() {
  const admin = getSupabaseAdmin()
  if (!admin) {
    const slugs = await fetchAllLiveNewsSlugs()
    return slugs.map((slug) => ({
      path: `/news/${slug}`,
      changefreq: 'monthly',
      priority: '0.7',
    }))
  }

  const { data, error } = await admin
    .from('news_articles')
    .select('slug, published_at, updated_at')
    .eq('status', 'live')
    .order('published_at', { ascending: false })

  if (error || !data?.length) {
    const slugs = await fetchAllLiveNewsSlugs()
    return slugs.map((slug) => ({
      path: `/news/${slug}`,
      changefreq: 'monthly',
      priority: '0.7',
    }))
  }

  return data.map((row) => ({
    path: `/news/${row.slug}`,
    changefreq: 'monthly',
    priority: '0.7',
    lastmod: (row.updated_at || row.published_at || '').slice(0, 10) || undefined,
  }))
}

export function buildSitemapPagesXml() {
  const guidePaths = guideSitemapPaths()
  const explorationPaths = [
    'hide-and-seek',
    'virtual-conductor',
    'word-gravity',
    'jailbreak-adventure',
    'evolve-car',
    'doodle-monsters',
    'cyber-tennis',
  ].map((slug) => ({
    path: `/exploration/${slug}`,
    changefreq: 'monthly',
    priority: '0.7',
    lastmod: '2026-03-01',
  }))
  return buildUrlset([...SITEMAP_PAGE_ROUTES, ...guidePaths, ...trustSitemapPaths(), ...explorationPaths])
}

export function buildSitemapProgramsXml() {
  return buildUrlset(SITEMAP_PROGRAM_ROUTES)
}

export async function buildSitemapCoursesXml() {
  const linePaths = courseSitemapPaths()
  const detailEntries = await fetchCourseSitemapEntries()
  return buildUrlset([...linePaths, ...detailEntries])
}

export async function buildSitemapLabsXml() {
  const entries = await fetchLabPackSitemapEntries()
  return buildUrlset(entries)
}

export async function buildSitemapNewsXml() {
  const entries = await fetchNewsSitemapEntries()
  return buildUrlset(entries)
}

export function buildSitemapIndexXml() {
  return buildSitemapIndex([
    'sitemap-pages.xml',
    'sitemap-programs.xml',
    'sitemap-courses.xml',
    'sitemap-labs.xml',
    'sitemap-news.xml',
  ])
}

/** @deprecated Use buildSitemapIndexXml + sub-sitemaps */
export async function buildSitemapXml() {
  const [courses, labs, news] = await Promise.all([
    fetchCourseSitemapEntries(),
    fetchLabPackSitemapEntries(),
    fetchNewsSitemapEntries(),
  ])
  return buildUrlset([...SITEMAP_PAGE_ROUTES, ...SITEMAP_PROGRAM_ROUTES, ...news, ...courses, ...labs])
}

export function buildRobotsTxtFile() {
  return buildRobotsTxt(SITE_URL)
}

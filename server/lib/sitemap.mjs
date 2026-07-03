import { getSupabaseAdmin } from './supabaseAdmin.mjs'
import { SITE_URL, SITEMAP_STATIC_ROUTES } from '../config/sitemapStatic.mjs'

/** Fallback news slugs when DB is unavailable (matches migration seed) */
const FALLBACK_NEWS_SLUGS = [
  'ai-classes-for-kids-guide-2026',
  'usaaio-prep-course-overview',
  'machine-learning-high-school-syllabus',
  'ai-classroom-activities-k12',
  'ai-summer-camp-online-2026',
  'how-to-prepare-usaaio',
  'best-ai-coding-classes-7-12',
  'ioai-competition-training-update',
]

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

async function fetchLiveNewsEntries() {
  const admin = getSupabaseAdmin()
  if (!admin) {
    return FALLBACK_NEWS_SLUGS.map((slug) => ({
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
    return FALLBACK_NEWS_SLUGS.map((slug) => ({
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

export async function buildSitemapXml() {
  const newsEntries = await fetchLiveNewsEntries()
  const today = new Date().toISOString().slice(0, 10)

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'

  for (const route of SITEMAP_STATIC_ROUTES) {
    xml += urlEntry(`${SITE_URL}${route.path}`, {
      lastmod: today,
      changefreq: route.changefreq,
      priority: route.priority,
    })
  }

  for (const entry of newsEntries) {
    xml += urlEntry(`${SITE_URL}${entry.path}`, {
      lastmod: entry.lastmod || today,
      changefreq: entry.changefreq,
      priority: entry.priority,
    })
  }

  xml += '</urlset>\n'
  return xml
}

export function buildRobotsTxt() {
  return `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`
}

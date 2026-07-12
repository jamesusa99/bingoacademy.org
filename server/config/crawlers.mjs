/**
 * Crawler & AI search policy — robots.txt, noindex paths, and query rules.
 *
 * - Public indexable content: courses, labs, guides, news, programs (in sitemap)
 * - App/auth/checkout flows: noindex + Disallow
 * - /api/*: Disallow all bots
 * - OAI-SearchBot: allowed on public pages (ChatGPT search citations)
 * - GPTBot: disallowed by default (model training ≠ search; change only with explicit policy)
 * - llms.txt: intentionally not shipped (low priority; Google ignores it)
 */

/** Paths bots must not crawl — mirrors NOINDEX_PATH_PATTERNS + legacy junk */
export const ROBOTS_DISALLOW_PATHS = [
  '/api/',
  '/admin',
  '/profile',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/auth/',
  '/study',
  '/charity',
  '/pricing',
  '/events',
  '/research',
  '/career',
  '/tools',
  '/ai-test',
]

/** Query keys that produce non-canonical views — noindex, not in sitemap */
const NOINDEX_QUERY_KEYS = new Set([
  'checkout',
  'session_id',
  'q',
  'search',
  'query',
  'filter',
  'stage',
  'buy',
  'page',
  'sort',
  'category',
  'level',
  'price',
  'line',
  'sub',
  'type',
])

export const NOINDEX_PATH_PATTERNS = [
  /^\/login(?:\/|$)/,
  /^\/register(?:\/|$)/,
  /^\/profile(?:\/|$)/,
  /^\/admin(?:\/|$)/,
  /^\/auth(?:\/|$)/,
  /^\/study(?:\/|$)/,
  /^\/reset-password(?:\/|$)/,
  /^\/forgot-password(?:\/|$)/,
]

export function isNoindexPath(pathname) {
  return NOINDEX_PATH_PATTERNS.some((re) => re.test(pathname))
}

/**
 * Filter/sort/checkout query views — noindex + follow (canonical parent remains indexable).
 */
export function isNoindexQuery(search, pathname = '') {
  if (!search) return false
  const raw = search.startsWith('?') ? search.slice(1) : search
  if (!raw) return false
  const params = new URLSearchParams(raw)

  for (const key of NOINDEX_QUERY_KEYS) {
    if (params.has(key)) return true
  }

  return false
}

export function shouldNoindex(pathname, search = '') {
  return isNoindexPath(pathname) || isNoindexQuery(search, pathname)
}

/** Private app pages: noindex + nofollow. Filter views: noindex + follow. */
export function robotsMetaContent(pathname, search = '') {
  if (isNoindexPath(pathname)) return 'noindex, nofollow'
  if (isNoindexQuery(search, pathname)) return 'noindex, follow'
  return null
}

function disallowBlock() {
  return ROBOTS_DISALLOW_PATHS.map((p) => `Disallow: ${p}`).join('\n')
}

/**
 * Build robots.txt with explicit bot policies.
 * @param {string} siteUrl
 */
export function buildRobotsTxt(siteUrl) {
  const disallow = disallowBlock()
  return `# Bingo Academy — crawler policy
# Public courses, labs, guides, and articles are in sitemap.xml
# Search indexing (OAI-SearchBot) is allowed; model training (GPTBot) is not.

User-agent: *
${disallow}

User-agent: Googlebot
Allow: /
${disallow}

User-agent: Bingbot
Allow: /
${disallow}

# OpenAI search citations (ChatGPT) — allow public HTML; block app + API layers
User-agent: OAI-SearchBot
Allow: /
${disallow}

# OpenAI model training crawler — not authorized without a separate written policy
User-agent: GPTBot
Disallow: /

Sitemap: ${siteUrl}/sitemap.xml
`
}

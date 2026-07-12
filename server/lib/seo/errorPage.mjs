import { SITE_URL, SITE_BRAND } from './constants.mjs'
import { escapeHtml } from './bodyContent.mjs'

const ERROR_COPY = {
  404: {
    title: `Page Not Found | ${SITE_BRAND}`,
    h1: 'Page not found',
    body: 'The page you are looking for does not exist or may have been moved. Browse our AI courses, labs, and programs below.',
  },
  410: {
    title: `Page Removed | ${SITE_BRAND}`,
    h1: 'This page has been removed',
    body: `This content is no longer available on ${SITE_BRAND}. Explore our current AI education programs instead.`,
  },
}

const HELPFUL_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/courses/ioai', label: 'AI Courses' },
  { href: '/labs', label: 'AI Labs' },
  { href: '/programs/ioai', label: 'IOAI Training' },
  { href: '/news', label: 'News & Insights' },
]

function buildErrorBody(seo) {
  const links = HELPFUL_LINKS.map(
    (l) => `<li><a href="${escapeHtml(l.href)}">${escapeHtml(l.label)}</a></li>`
  ).join('')

  return `<main id="ssr-prerender" data-ssr="true" lang="en">
  <header>
    <h1>${escapeHtml(seo.h1)}</h1>
  </header>
  <article>
    <p>${escapeHtml(seo.body)}</p>
    <nav aria-label="Helpful links"><ul>${links}</ul></nav>
  </article>
  <footer>
    <p><a href="${SITE_URL}">${escapeHtml(SITE_BRAND)}</a> — AI Education for K-12 Students</p>
  </footer>
</main>`
}

export function buildErrorSeo(status, path) {
  const copy = ERROR_COPY[status] || ERROR_COPY[404]
  return {
    path,
    status,
    title: copy.title,
    description: copy.body,
    ogTitle: copy.title,
    ogDescription: copy.body,
    ogUrl: `${SITE_URL}${path === '/' ? '' : path}`,
    ogType: 'website',
    canonical: `${SITE_URL}${path === '/' ? '' : path}`,
    noindex: true,
    h1: copy.h1,
    body: copy.body,
    bodyHtml: buildErrorBody(copy),
  }
}

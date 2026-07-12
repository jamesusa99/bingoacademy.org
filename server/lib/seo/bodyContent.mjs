import { SITE_URL, SITE_BRAND } from './constants.mjs'

export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** Strip markdown to plain text for crawlable SSR body */
export function markdownToPlain(text) {
  if (!text) return ''
  return String(text)
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^#+\s+/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function breadcrumbHtml(breadcrumbs) {
  if (!breadcrumbs?.length) return ''
  const items = breadcrumbs
    .map((crumb, i) => {
      const isLast = i === breadcrumbs.length - 1
      if (crumb.href && !isLast) {
        return `<a href="${escapeHtml(crumb.href)}">${escapeHtml(crumb.label)}</a>`
      }
      return `<span>${escapeHtml(crumb.label)}</span>`
    })
    .join(' <span aria-hidden="true">›</span> ')
  return `<nav aria-label="Breadcrumb" class="ssr-breadcrumb">${items}</nav>`
}

function linksHtml(links) {
  if (!links?.length) return ''
  const items = links
    .map(
      (link) =>
        `<li><a href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a></li>`
    )
    .join('')
  return `<nav aria-label="Related links"><ul>${items}</ul></nav>`
}

function paragraphsFromText(text) {
  const plain = markdownToPlain(text)
  if (!plain) return ''
  return plain
    .split(/\n{2,}/)
    .map((p) => `<p>${escapeHtml(p.trim())}</p>`)
    .join('')
}

/**
 * Build crawlable HTML body for injection into #root before React hydrates.
 */
export function buildBodyHtml(seo) {
  const breadcrumb = breadcrumbHtml(seo.breadcrumbs)
  const mainContent = seo.mainHtml
    ? paragraphsFromText(seo.mainHtml)
    : paragraphsFromText(seo.body)
  const related = linksHtml(seo.links)

  return `<main id="ssr-prerender" data-ssr="true" lang="en">
  <header>
    ${breadcrumb}
    <h1>${escapeHtml(seo.h1 || seo.title)}</h1>
  </header>
  <article>
    ${mainContent}
  </article>
  ${related}
  <footer>
    <p><a href="${SITE_URL}">${escapeHtml(SITE_BRAND)}</a> — AI Education for K-12 Students</p>
  </footer>
</main>`
}

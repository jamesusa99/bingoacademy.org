import { SITE_TWITTER, SITE_BRAND } from './constants.mjs'
import { escapeHtml } from './bodyContent.mjs'

const SEO_META_PATTERN =
  /<title>[\s\S]*?<\/title>\s*(?:<meta name="keywords"[\s\S]*?<meta name="twitter:card"[^>]*>\s*)?/

function buildHeadBlock(seo) {
  const lines = []
  lines.push(`<title>${escapeHtml(seo.title)}</title>`)

  if (seo.keywords) {
    lines.push(`<meta name="keywords" content="${escapeHtml(seo.keywords)}" />`)
  }
  lines.push(`<meta name="description" content="${escapeHtml(seo.description)}" />`)

  if (seo.robotsContent) {
    lines.push(`<meta name="robots" content="${escapeHtml(seo.robotsContent)}" />`)
  } else if (seo.noindex) {
    lines.push('<meta name="robots" content="noindex, nofollow" />')
  }

  lines.push(`<meta property="og:title" content="${escapeHtml(seo.ogTitle)}" />`)
  lines.push(`<meta property="og:description" content="${escapeHtml(seo.ogDescription)}" />`)
  lines.push(`<meta property="og:image" content="${escapeHtml(seo.ogImage)}" />`)
  lines.push(`<meta property="og:url" content="${escapeHtml(seo.ogUrl)}" />`)
  lines.push(`<meta property="og:type" content="${escapeHtml(seo.ogType || 'website')}" />`)
  lines.push(`<meta property="og:site_name" content="${escapeHtml(SITE_BRAND)}" />`)

  lines.push(`<meta name="twitter:card" content="${SITE_TWITTER.card}" />`)
  lines.push(`<meta name="twitter:title" content="${escapeHtml(seo.ogTitle)}" />`)
  lines.push(`<meta name="twitter:description" content="${escapeHtml(seo.ogDescription)}" />`)
  lines.push(`<meta name="twitter:image" content="${escapeHtml(seo.ogImage)}" />`)

  lines.push(`<link rel="canonical" href="${escapeHtml(seo.canonical)}" />`)

  if (seo.jsonLd) {
    lines.push(
      `<script type="application/ld+json" id="page-json-ld">${JSON.stringify(seo.jsonLd)}</script>`
    )
  }

  return lines.join('\n    ')
}

const SSR_STYLE = `<style id="ssr-prerender-style">
  #ssr-prerender { font-family: Inter, system-ui, sans-serif; max-width: 48rem; margin: 0 auto; padding: 2rem 1.25rem; color: #1e293b; line-height: 1.6; }
  #ssr-prerender h1 { font-size: 1.75rem; font-weight: 800; margin: 0.75rem 0; color: #0f172a; }
  #ssr-prerender p { margin: 0.75rem 0; }
  #ssr-prerender a { color: #0891b2; }
  #ssr-prerender .ssr-breadcrumb { font-size: 0.875rem; color: #64748b; margin-bottom: 0.5rem; }
  #ssr-prerender ul { padding-left: 1.25rem; }
  #ssr-prerender footer { margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #e2e8f0; font-size: 0.875rem; color: #64748b; }
</style>`

/**
 * Inject SEO meta tags and crawlable body into an HTML template.
 * @param {string} html — index.html template (dev or built)
 * @param {object} seo — resolved SEO payload with bodyHtml
 */
export function injectSeoIntoHtml(html, seo) {
  let result = html

  const headBlock = buildHeadBlock(seo)
  if (SEO_META_PATTERN.test(result)) {
    result = result.replace(SEO_META_PATTERN, `${headBlock}\n    `)
  } else {
    result = result.replace('</head>', `    ${headBlock}\n  </head>`)
  }

  if (!result.includes('id="ssr-prerender-style"')) {
    result = result.replace('</head>', `    ${SSR_STYLE}\n  </head>`)
  }

  const bodyHtml = seo.bodyHtml || ''
  result = result.replace(
    /<div id="root"><\/div>/,
    `<div id="root">${bodyHtml}</div>`
  )
  result = result.replace(
    /<div id="root">\s*<\/div>/,
    `<div id="root">${bodyHtml}</div>`
  )

  // Replace existing root content if prerendering over prior output
  result = result.replace(
    /<div id="root">[\s\S]*?<\/div>\s*(?=<script)/,
    `<div id="root">${bodyHtml}</div>\n    `
  )

  return result
}

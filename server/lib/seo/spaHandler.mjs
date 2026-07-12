import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { resolveSeoWithBody } from './resolveSeo.mjs'
import { injectSeoIntoHtml } from './renderHtml.mjs'
import { isNoindexPath } from './constants.mjs'
import { getStaticSeoForPath } from './staticSeo.mjs'
import { resolveRoute } from './resolveRoute.mjs'
import { buildErrorSeo } from './errorPage.mjs'
import {
  fetchAllLiveNewsSlugs,
  fetchAllLiveCourseSlugs,
  fetchAllLiveLabPackSlugs,
} from './fetchDynamic.mjs'
import { courseSitemapPaths } from './courseSeo.mjs'
import { guideSitemapPaths } from './guideSeo.mjs'
import { trustSitemapPaths } from './trustSeo.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

let htmlTemplateCache = null

export function loadHtmlTemplate(distPath) {
  const indexPath = path.join(distPath, 'index.html')
  if (!fs.existsSync(indexPath)) {
    throw new Error(`index.html not found at ${indexPath}`)
  }
  return fs.readFileSync(indexPath, 'utf8')
}

export function getHtmlTemplate(distPath) {
  if (!htmlTemplateCache) {
    htmlTemplateCache = loadHtmlTemplate(distPath)
  }
  return htmlTemplateCache
}

export function clearHtmlTemplateCache() {
  htmlTemplateCache = null
}

/**
 * Resolve route, build SEO-enriched HTML, and return status + body.
 */
export async function renderHtmlForRequest(pathname, search = '', distPath) {
  const route = await resolveRoute(pathname, search)

  if (route.status === 301 || route.status === 308) {
    return { status: route.status, location: route.location, html: null }
  }

  const template = getHtmlTemplate(distPath)
  let seo

  if (route.status === 404 || route.status === 410) {
    seo = buildErrorSeo(route.status, route.path)
  } else {
    seo = await resolveSeoWithBody(route.path, search)
    seo.status = 200
  }

  const html = injectSeoIntoHtml(template, seo)
  return { status: route.status, html, seo }
}

/**
 * Express middleware: serve HTML with correct HTTP status codes.
 */
export function createSpaHandler(distPath) {
  return async (req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next()
    if (req.path.startsWith('/api/')) return next()

    const ext = path.extname(req.path)
    if (ext && ext !== '.html') return next()

    try {
      const pathname = req.path.replace(/\/index\.html$/, '') || '/'
      const search = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : ''
      const result = await renderHtmlForRequest(pathname, search, distPath)

      if (result.location) {
        return res.redirect(result.status, result.location)
      }

      res.status(result.status)
      res.setHeader('Content-Type', 'text/html; charset=utf-8')
      const noindex = result.seo?.noindex || result.status === 404 || result.status === 410
      res.setHeader(
        'Cache-Control',
        noindex ? 'no-store' : 'public, max-age=0, must-revalidate'
      )
      if (req.method === 'HEAD') return res.end()
      return res.send(result.html)
    } catch (err) {
      console.error('[seo/spa]', err)
      return next(err)
    }
  }
}

/** Collect all public paths to prerender at build time */
export async function collectPrerenderPaths() {
  const paths = new Set(['/'])

  const staticPaths = [
    '/compare',
    '/exploration',
    '/labs',
    '/news',
    '/curriculum',
    '/privacy',
    '/showcase',
    '/cert',
    '/mall',
    '/community',
    '/assessment',
    '/ai-classes-for-kids',
    '/usaaio-prep',
    '/try-ai',
    '/ioai-masterclass',
    '/programs/ioai',
    '/programs/foundations',
    '/programs/k12',
    '/guides',
    '/guides/evidence',
  ]

  for (const p of staticPaths) {
    if (getStaticSeoForPath(p)) paths.add(p)
  }

  for (const { path: coursePath } of courseSitemapPaths()) {
    paths.add(coursePath)
  }

  for (const { path: guidePath } of guideSitemapPaths()) {
    paths.add(guidePath)
  }

  for (const { path: trustPath } of trustSitemapPaths()) {
    paths.add(trustPath)
  }

  const explorationSlugs = [
    'hide-and-seek',
    'virtual-conductor',
    'word-gravity',
    'jailbreak-adventure',
    'evolve-car',
    'doodle-monsters',
    'cyber-tennis',
  ]
  for (const slug of explorationSlugs) {
    paths.add(`/exploration/${slug}`)
  }

  const [newsSlugs, courseSlugs, labSlugs] = await Promise.all([
    fetchAllLiveNewsSlugs(),
    fetchAllLiveCourseSlugs(),
    fetchAllLiveLabPackSlugs(),
  ])

  for (const slug of newsSlugs) paths.add(`/news/${slug}`)
  for (const slug of courseSlugs) paths.add(`/courses/detail/${slug}`)
  for (const slug of labSlugs) paths.add(`/labs/pack/${slug}`)

  return [...paths].filter((p) => !isNoindexPath(p))
}

/** Write prerendered HTML files to dist/ for static hosting (Vercel + Railway) */
export async function prerenderToDist(distPath) {
  const template = loadHtmlTemplate(distPath)
  const paths = await collectPrerenderPaths()
  let written = 0

  for (const routePath of paths) {
    const seo = await resolveSeoWithBody(routePath)
    const html = injectSeoIntoHtml(template, seo)

    const outPath =
      routePath === '/'
        ? path.join(distPath, 'index.html')
        : path.join(distPath, routePath.slice(1), 'index.html')

    fs.mkdirSync(path.dirname(outPath), { recursive: true })
    fs.writeFileSync(outPath, html, 'utf8')
    written++
  }

  // Standalone error pages for static hosts
  for (const status of [404, 410]) {
    const seo = buildErrorSeo(status, status === 404 ? '/not-found' : '/gone')
    const html = injectSeoIntoHtml(template, seo)
    fs.writeFileSync(path.join(distPath, `${status}.html`), html, 'utf8')
  }

  return { written, paths }
}

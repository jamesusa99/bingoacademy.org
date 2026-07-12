import {
  buildRobotsTxtFile,
  buildSitemapIndexXml,
  buildSitemapPagesXml,
  buildSitemapProgramsXml,
  buildSitemapCoursesXml,
  buildSitemapLabsXml,
  buildSitemapNewsXml,
} from '../lib/sitemap.mjs'

const SITEMAP_HANDLERS = {
  'sitemap.xml': async () => buildSitemapIndexXml(),
  'sitemap-pages.xml': async () => buildSitemapPagesXml(),
  'sitemap-programs.xml': async () => buildSitemapProgramsXml(),
  'sitemap-courses.xml': async () => buildSitemapCoursesXml(),
  'sitemap-labs.xml': async () => buildSitemapLabsXml(),
  'sitemap-news.xml': async () => buildSitemapNewsXml(),
}

export function registerSitemapRoutes(app) {
  for (const [name, build] of Object.entries(SITEMAP_HANDLERS)) {
    app.get(`/${name}`, async (_req, res) => {
      try {
        const xml = await build()
        res.setHeader('Content-Type', 'application/xml; charset=utf-8')
        res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600')
        res.send(xml)
      } catch (err) {
        console.error(`[sitemap/${name}]`, err)
        res.status(500).type('text/plain').send('Sitemap generation failed')
      }
    })
  }

  app.get('/robots.txt', (_req, res) => {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.setHeader('Cache-Control', 'public, max-age=86400')
    res.send(buildRobotsTxtFile())
  })
}

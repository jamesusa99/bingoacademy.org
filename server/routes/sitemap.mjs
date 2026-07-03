import { buildRobotsTxt, buildSitemapXml } from '../lib/sitemap.mjs'

export function registerSitemapRoutes(app) {
  app.get('/sitemap.xml', async (_req, res) => {
    try {
      const xml = await buildSitemapXml()
      res.setHeader('Content-Type', 'application/xml; charset=utf-8')
      res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600')
      res.send(xml)
    } catch (err) {
      console.error('[sitemap]', err)
      res.status(500).type('text/plain').send('Sitemap generation failed')
    }
  })

  app.get('/robots.txt', (_req, res) => {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.setHeader('Cache-Control', 'public, max-age=86400')
    res.send(buildRobotsTxt())
  })
}

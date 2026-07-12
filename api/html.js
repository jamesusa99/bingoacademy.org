/**
 * Vercel serverless — HTML responses with correct HTTP status codes.
 * Replaces the catch-all /index.html rewrite for dynamic 404/301 handling.
 */
import '../server/lib/loadEnv.mjs'
import path from 'path'
import { fileURLToPath } from 'url'
import { renderHtmlForRequest } from '../server/lib/seo/spaHandler.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distPath = path.join(__dirname, '../dist')

export default async function handler(req, res) {
  try {
    const url = new URL(req.url || '/', `https://${req.headers.host || 'localhost'}`)
    const pathname = url.pathname.replace(/\/index\.html$/, '') || '/'
    const search = url.search || ''

    const result = await renderHtmlForRequest(pathname, search, distPath)

    if (result.location) {
      res.writeHead(result.status, { Location: result.location })
      return res.end()
    }

    res.status(result.status).setHeader('Content-Type', 'text/html; charset=utf-8')
    const noindex = result.seo?.noindex || result.status === 404 || result.status === 410
    res.setHeader('Cache-Control', noindex ? 'no-store' : 'public, max-age=0, must-revalidate')
    return res.send(result.html)
  } catch (err) {
    console.error('[api/html]', err)
    res.status(500).setHeader('Content-Type', 'text/plain')
    return res.send('Internal Server Error')
  }
}

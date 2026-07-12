import './lib/loadEnv.mjs'
import express from 'express'
import fs from 'fs'
import { getSupabaseConfig } from './lib/supabaseAdmin.mjs'
import path from 'path'
import { fileURLToPath } from 'url'
import { handleChatRequest } from '../lib/guardChat.js'
import { createApiApp } from './createApiApp.mjs'
import { createSpaHandler } from './lib/seo/spaHandler.mjs'
import { createEarlyRouteMiddleware } from './lib/seo/earlyRoute.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = Number(process.env.PORT) || 8787
const distPath = path.join(__dirname, '../dist')
// In dev, Vite serves the UI; API only listens for /api/* (set API_SERVE_STATIC=0 in dev:api)
const hasDist =
  process.env.API_SERVE_STATIC !== '0' && fs.existsSync(path.join(distPath, 'index.html'))

const app = createApiApp()

app.post('/api/chat', async (req, res) => {
  try {
    const webResponse = await handleChatRequest(req.body)

    res.status(webResponse.status)
    webResponse.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'content-length') return
      res.setHeader(key, value)
    })

    if (!webResponse.body) {
      res.end()
      return
    }

    const reader = webResponse.body.getReader()
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      res.write(Buffer.from(value))
    }
    res.end()
  } catch (err) {
    console.error('[api/chat]', err)
    res.status(500).json({ error: err.message || 'Chat request failed' })
  }
})

if (hasDist) {
  app.use(createEarlyRouteMiddleware())
  app.use(express.static(distPath, { index: false, redirect: false }))
  app.get(/^(?!\/api\/).*/, createSpaHandler(distPath))
}

const server = app.listen(PORT, () => {
  const cfg = getSupabaseConfig()
  console.log(`[server] listening on http://localhost:${PORT}`)
  console.log(
    cfg.ready
      ? '[server] Supabase admin API ready (service role)'
      : `[server] Supabase admin API OFF — set ${!cfg.url ? 'SUPABASE_URL ' : ''}${!cfg.hasServiceRole ? 'SUPABASE_SERVICE_ROLE_KEY ' : ''}in .env.local, then restart`
  )
  if (hasDist) console.log('[server] serving dist/ + API')
  else console.log('[server] API only — Vite proxies /api → this server')
})

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(
      `[server] Port ${PORT} is already in use. Stop the other process:\n` +
        `  lsof -ti:${PORT} | xargs kill -9\n` +
        `Then run npm run dev again.`
    )
    process.exit(1)
  }
  console.error('[server] failed to start:', err)
  process.exit(1)
})

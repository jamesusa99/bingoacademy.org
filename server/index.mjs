import { config as loadEnv } from 'dotenv'
import express from 'express'

loadEnv({ path: '.env.local' })
loadEnv({ path: '.env' })
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { handleChatRequest } from '../lib/guardChat.js'
import { verifyAdminUser } from './lib/supabaseAdmin.mjs'
import { registerAdminRoutes } from './routes/admin.mjs'
import { registerStripeWebhook } from './routes/stripe.mjs'
import { registerUserAdminRoutes } from './routes/users.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = Number(process.env.PORT) || 8787
const distPath = path.join(__dirname, '../dist')
const hasDist = fs.existsSync(path.join(distPath, 'index.html'))

const app = express()

registerStripeWebhook(app)

app.use(express.json({ limit: '1mb' }))

registerAdminRoutes(app, { verifyAdminUser })
registerUserAdminRoutes(app, { verifyAdminUser })

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
  app.use(express.static(distPath, { index: false }))
  app.get(/^(?!\/api\/).*/, (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`)
  if (hasDist) console.log('[server] serving dist/ + API')
  else console.log('[server] API only — run Vite separately for the UI')
})

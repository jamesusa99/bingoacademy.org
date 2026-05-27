import express from 'express'
import { verifyAdminUser } from './lib/supabaseAdmin.mjs'
import { registerAdminRoutes } from './routes/admin.mjs'
import { registerStripeWebhook } from './routes/stripe.mjs'
import { registerUserAdminRoutes } from './routes/users.mjs'
import { registerSeedRoutes } from './routes/seed.mjs'
import { registerCmsRoutes } from './routes/cms.mjs'
import { registerCatalogRoutes } from './routes/catalog.mjs'

/** Express app for /api/* (admin, webhooks). Used by local server and Vercel serverless. */
export function createApiApp() {
  const app = express()

  registerStripeWebhook(app)

  app.use(express.json({ limit: '1mb' }))

  registerAdminRoutes(app, { verifyAdminUser })
  registerUserAdminRoutes(app, { verifyAdminUser })
  registerSeedRoutes(app, { verifyAdminUser })
  registerCmsRoutes(app, { verifyAdminUser })
  registerCatalogRoutes(app, { verifyAdminUser })

  return app
}

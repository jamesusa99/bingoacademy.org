import express from 'express'
import { verifyAdminUser } from './lib/supabaseAdmin.mjs'
import { registerStreamTusCreateRoutes } from './lib/handleStreamTusCreate.mjs'
import { registerAdminRoutes } from './routes/admin.mjs'
import { registerStripeWebhook } from './routes/stripe.mjs'
import { registerUserAdminRoutes } from './routes/users.mjs'
import { registerSeedRoutes } from './routes/seed.mjs'
import { registerCmsRoutes } from './routes/cms.mjs'
import { registerCatalogRoutes } from './routes/catalog.mjs'
import { registerStreamRoutes } from './routes/stream.mjs'
import { registerPaymentRoutes } from './routes/payments.mjs'
import { registerIoaiRoutes } from './routes/ioai.mjs'
import { registerMediaRoutes } from './routes/media.mjs'
import { registerLabRoutes } from './routes/labs.mjs'
import { registerIoaiExperimentRoutes } from './routes/ioaiExperiments.mjs'
import { registerLeadRoutes } from './routes/leads.mjs'
import { registerSitemapRoutes } from './routes/sitemap.mjs'

/** Express app for /api/* (admin, webhooks). Used by local server and Vercel serverless. */
export function createApiApp() {
  const app = express()

  registerSitemapRoutes(app)

  registerStripeWebhook(app)

  registerStreamTusCreateRoutes(app, { verifyAdminUser })

  registerMediaRoutes(app, { verifyAdminUser })

  app.use(express.json({ limit: '1mb' }))

  registerAdminRoutes(app, { verifyAdminUser })
  registerUserAdminRoutes(app, { verifyAdminUser })
  registerSeedRoutes(app, { verifyAdminUser })
  registerCmsRoutes(app, { verifyAdminUser })
  registerCatalogRoutes(app, { verifyAdminUser })
  registerStreamRoutes(app, { verifyAdminUser })
  registerPaymentRoutes(app)
  registerIoaiRoutes(app, { verifyAdminUser })
  registerLabRoutes(app, { verifyAdminUser })
  registerIoaiExperimentRoutes(app, { verifyAdminUser })
  registerLeadRoutes(app)

  return app
}

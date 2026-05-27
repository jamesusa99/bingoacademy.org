/**
 * Vercel serverless — admin API, CMS, catalog, webhooks (not /api/chat).
 * Requires SUPABASE_SERVICE_ROLE_KEY and related env vars on Vercel.
 */
import '../server/lib/loadEnv.mjs'
import { createApiApp } from '../server/createApiApp.mjs'

const app = createApiApp()

export default app

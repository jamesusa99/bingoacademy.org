import { getSupabaseAdmin } from '../lib/supabaseAdmin.mjs'
import { runSiteSeed } from '../../scripts/lib/seedSupabase.mjs'

export function registerSeedRoutes(app, { verifyAdminUser }) {
  app.post('/api/admin/seed', async (req, res) => {
    const auth = await verifyAdminUser(req)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

    const admin = getSupabaseAdmin()
    if (!admin) {
      return res.status(503).json({
        error: 'Supabase service role not configured on server',
      })
    }

    const force = req.body?.force === true || req.query?.force === 'true'

    try {
      const summary = await runSiteSeed(admin, { force })
      res.json({ ok: true, force, summary })
    } catch (err) {
      console.error('[seed]', err)
      res.status(500).json({ error: err.message })
    }
  })
}

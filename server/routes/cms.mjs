import { getSupabaseAdmin } from '../lib/supabaseAdmin.mjs'

/** Tables the admin console may mutate via service role */
export const CMS_TABLES = new Set([
  'home_stats',
  'home_testimonials',
  'showcase_cases',
  'courses',
  'events',
  'forum_threads',
  'community_mentors',
  'research_camps',
  'research_faculty',
  'charity_reports',
  'charity_projects',
  'mall_products',
  'cert_tiers',
  'career_jobs',
  'video_assets',
])

export function registerCmsRoutes(app, { verifyAdminUser }) {
  app.post('/api/admin/cms/:table', async (req, res) => {
    const auth = await verifyAdminUser(req)
    if (!auth.ok) {
      return res.status(auth.status).json({ error: auth.error })
    }

    const admin = getSupabaseAdmin()
    if (!admin) {
      return res.status(503).json({
        error:
          'Supabase service role not configured. Add SUPABASE_SERVICE_ROLE_KEY to .env.local and restart npm run dev.',
      })
    }

    const table = req.params.table
    if (!CMS_TABLES.has(table)) {
      return res.status(400).json({ error: `Table not allowed: ${table}` })
    }

    const { action, id, payload } = req.body || {}
    if (!action || !['insert', 'update', 'delete'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action (use insert, update, or delete)' })
    }

    try {
      if (action === 'insert') {
        if (!payload || typeof payload !== 'object') {
          return res.status(400).json({ error: 'Missing payload' })
        }
        const { data, error } = await admin.from(table).insert(payload).select()
        if (error) return res.status(400).json({ error: error.message })
        if (!data?.length) {
          return res.status(400).json({ error: `Insert into ${table} returned no rows` })
        }
        return res.json({ row: data[0], rows: data })
      }

      if (!id) {
        return res.status(400).json({ error: 'Missing id' })
      }

      if (action === 'update') {
        if (!payload || typeof payload !== 'object') {
          return res.status(400).json({ error: 'Missing payload' })
        }
        const { data, error } = await admin.from(table).update(payload).eq('id', id).select()
        if (error) return res.status(400).json({ error: error.message })
        if (!data?.length) {
          return res.status(404).json({
            error: `No row updated in ${table}. The record may have been deleted — refresh and try again.`,
          })
        }
        return res.json({ row: data[0], rows: data })
      }

      const { data, error } = await admin.from(table).delete().eq('id', id).select()
      if (error) return res.status(400).json({ error: error.message })
      if (!data?.length) {
        return res.status(404).json({ error: `No row deleted in ${table}` })
      }
      return res.json({ row: data[0], rows: data })
    } catch (err) {
      console.error('[cms]', table, action, err)
      return res.status(500).json({ error: err.message || 'CMS operation failed' })
    }
  })
}

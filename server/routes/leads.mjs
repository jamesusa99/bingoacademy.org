import { getSupabaseAdmin } from '../lib/supabaseAdmin.mjs'

export function registerLeadRoutes(app) {
  app.post('/api/leads', async (req, res) => {
    const { email, name, source, campaign, page, utm } = req.body || {}
    const trimmed = typeof email === 'string' ? email.trim().toLowerCase() : ''

    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      return res.status(400).json({ error: 'Valid email is required' })
    }

    const admin = getSupabaseAdmin()
    if (!admin) {
      console.warn('[leads] Supabase not configured — lead logged only:', trimmed, source)
      return res.json({ ok: true, stored: false })
    }

    const row = {
      email: trimmed,
      name: typeof name === 'string' && name.trim() ? name.trim() : null,
      source: typeof source === 'string' && source.trim() ? source.trim() : 'unknown',
      campaign: typeof campaign === 'string' && campaign.trim() ? campaign.trim() : null,
      page: typeof page === 'string' && page.trim() ? page.trim() : null,
      utm: utm && typeof utm === 'object' && !Array.isArray(utm) ? utm : {},
    }

    const { error } = await admin.from('marketing_leads').insert(row)

    if (error) {
      console.error('[leads]', error)
      return res.status(502).json({ error: 'Failed to save lead' })
    }

    return res.json({ ok: true, stored: true })
  })
}

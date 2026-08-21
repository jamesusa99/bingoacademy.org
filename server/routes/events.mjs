import { getSupabaseAdmin } from '../lib/supabaseAdmin.mjs'

const ALLOWED_EVENTS = new Set([
  'page_view',
  'conversion',
  'web_vital',
  'guide_view',
  'lead_submitted',
  'ioai_assessment_view',
  'ioai_assessment_start',
  'ioai_question_answered',
  'ioai_assessment_complete',
  'ioai_result_stage',
  'ioai_result_weak_tags',
  'ioai_course_recommendation_click',
  'ioai_full_track_click',
  'ioai_report_email_submit',
])

export function registerEventRoutes(app) {
  app.post('/api/events', async (req, res) => {
    const { event_name, page, page_type, properties, attribution, session_id } = req.body || {}
    const name = typeof event_name === 'string' ? event_name.trim() : ''

    if (!name || !ALLOWED_EVENTS.has(name)) {
      return res.status(400).json({ error: 'Invalid event_name' })
    }

    const admin = getSupabaseAdmin()
    if (!admin) {
      return res.json({ ok: true, stored: false })
    }

    const row = {
      event_name: name,
      page: typeof page === 'string' ? page.slice(0, 500) : null,
      page_type: typeof page_type === 'string' ? page_type.slice(0, 64) : null,
      properties:
        properties && typeof properties === 'object' && !Array.isArray(properties) ? properties : {},
      attribution:
        attribution && typeof attribution === 'object' && !Array.isArray(attribution) ? attribution : {},
      session_id: typeof session_id === 'string' ? session_id.slice(0, 128) : null,
    }

    const { error } = await admin.from('analytics_events').insert(row)
    if (error) {
      console.error('[events]', error)
      return res.status(502).json({ error: 'Failed to store event' })
    }

    return res.json({ ok: true, stored: true })
  })
}

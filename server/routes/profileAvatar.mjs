import express from 'express'
import { getSupabaseAdmin } from '../lib/supabaseAdmin.mjs'
import { verifyAuthUser } from '../lib/supabaseAuth.mjs'
import { parseDataUrlImage, uploadUserAvatar } from '../lib/mediaUpload.mjs'

const PROFILE_FIELDS =
  'id, email, full_name, phone, avatar_url, locale, country, school, grade, parent_email, member_tier, created_at, updated_at'

export function registerProfileAvatarRoutes(app) {
  app.post(
    '/api/me/avatar',
    express.json({ limit: '5mb' }),
    async (req, res) => {
      const auth = await verifyAuthUser(req)
      if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

      const parsed = parseDataUrlImage(req.body?.dataUrl)
      if (parsed.error) return res.status(400).json({ error: parsed.error })

      const admin = getSupabaseAdmin()
      const result = await uploadUserAvatar(admin, {
        buffer: parsed.buffer,
        contentType: parsed.contentType,
        userId: auth.user.id,
      })
      if (result.error) return res.status(400).json({ error: result.error })

      if (!admin) {
        return res.json({ url: result.url, profile: null })
      }

      const { data, error } = await admin
        .from('profiles')
        .update({ avatar_url: result.url, updated_at: new Date().toISOString() })
        .eq('id', auth.user.id)
        .select(PROFILE_FIELDS)
        .maybeSingle()
      if (error) return res.status(400).json({ error: error.message })

      return res.json({ url: result.url, profile: data })
    }
  )

  app.delete('/api/me/avatar', async (req, res) => {
    const auth = await verifyAuthUser(req)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })
    const admin = getSupabaseAdmin()
    if (!admin) return res.status(503).json({ error: 'Database not configured' })

    const { data, error } = await admin
      .from('profiles')
      .update({ avatar_url: null, updated_at: new Date().toISOString() })
      .eq('id', auth.user.id)
      .select(PROFILE_FIELDS)
      .maybeSingle()
    if (error) return res.status(400).json({ error: error.message })

    return res.json({ url: null, profile: data })
  })
}

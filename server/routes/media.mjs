import express from 'express'
import { getSupabaseAdmin } from '../lib/supabaseAdmin.mjs'
import { parseDataUrlImage, uploadAdminImage } from '../lib/mediaUpload.mjs'

export function registerMediaRoutes(app, { verifyAdminUser }) {
  app.post(
    '/api/admin/media/upload-image',
    express.json({ limit: '5mb' }),
    async (req, res) => {
      const auth = await verifyAdminUser(req)
      if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

      const { dataUrl, folder = 'modules' } = req.body || {}
      const parsed = parseDataUrlImage(dataUrl)
      if (parsed.error) return res.status(400).json({ error: parsed.error })

      const admin = getSupabaseAdmin()
      const result = await uploadAdminImage(admin, {
        buffer: parsed.buffer,
        contentType: parsed.contentType,
        folder: String(folder).replace(/[^a-z0-9-_]/gi, '') || 'modules',
      })

      if (result.error) return res.status(400).json({ error: result.error })
      return res.json({ url: result.url })
    }
  )
}

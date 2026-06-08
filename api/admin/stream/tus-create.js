/**
 * Vercel serverless entry for tus upload creation (files ≥50 MB).
 * File-system route takes precedence over vercel.json rewrites to api/server.
 */
import '../../server/lib/loadEnv.mjs'
import { verifyAdminUser } from '../../server/lib/supabaseAdmin.mjs'
import {
  handleStreamTusCreate,
  setStreamTusCreateCors,
} from '../../server/lib/handleStreamTusCreate.mjs'

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    setStreamTusCreateCors(res)
    return res.status(204).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  return handleStreamTusCreate(req, res, { verifyAdminUser })
}

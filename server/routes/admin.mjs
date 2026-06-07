import { getSupabaseAdmin, getSupabaseConfig } from '../lib/supabaseAdmin.mjs'
import { grantCourseEntitlements } from '../lib/courseEntitlements.mjs'
import { parseAddonSlugs } from '../lib/ioaiCommerce.mjs'
import {
  STREAM_DEFAULT_MAX_DURATION_SECONDS,
  STREAM_MAX_FILE_BYTES,
  STREAM_RECOMMENDED_MAX_FILE_BYTES,
  fetchStreamVideo,
  isStreamConfigured,
  streamVideoToPlayback,
} from '../lib/cloudflareStream.mjs'

function envFlag(name) {
  const v = process.env[name]
  return Boolean(typeof v === 'string' ? v.trim() : v)
}

function detectDeployPlatform() {
  if (process.env.VERCEL) return 'vercel'
  if (process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID) return 'railway'
  return 'local'
}

export function getAdminHealth() {
  const cfg = getSupabaseConfig()
  return {
    apiReachable: true,
    platform: detectDeployPlatform(),
    supabase: Boolean(cfg.url),
    adminEmails: envFlag('VITE_ADMIN_EMAILS') || envFlag('ADMIN_EMAILS'),
    serviceRole: cfg.ready,
    stripe: envFlag('STRIPE_SECRET_KEY'),
    stripeWebhook: envFlag('STRIPE_WEBHOOK_SECRET'),
    cloudflare: envFlag('CLOUDFLARE_ACCOUNT_ID') && envFlag('CLOUDFLARE_API_TOKEN'),
    openai: envFlag('OPENAI_API_KEY'),
  }
}

export function registerAdminRoutes(app, { verifyAdminUser }) {
  app.get('/api/admin/health', (_req, res) => {
    res.json(getAdminHealth())
  })

  app.get('/api/admin/stream/limits', (_req, res) => {
    const maxDurationSeconds = STREAM_DEFAULT_MAX_DURATION_SECONDS
    res.json({
      maxFileBytes: STREAM_MAX_FILE_BYTES,
      recommendedMaxFileBytes: STREAM_RECOMMENDED_MAX_FILE_BYTES,
      maxDurationSeconds,
      maxDurationHours: Math.round(maxDurationSeconds / 3600),
      maxFileGb: 30,
      recommendedMaxFileGb: 4,
    })
  })

  app.get('/api/admin/stream/playback', async (req, res) => {
    const auth = await verifyAdminUser(req)
    if (!auth.ok) {
      return res.status(auth.status).json({ error: auth.error })
    }

    const uid = String(req.query.uid || '').trim()
    if (!uid) {
      return res.status(400).json({ error: 'uid is required' })
    }

    if (!isStreamConfigured()) {
      return res.status(503).json({ error: 'Cloudflare Stream not configured' })
    }

    const { ok, error, video } = await fetchStreamVideo(uid)
    if (!ok) {
      return res.status(502).json({ error: error || 'Failed to fetch video' })
    }

    return res.json({ playback: streamVideoToPlayback(video) })
  })

  app.post('/api/admin/stream/upload-url', async (req, res) => {
    const auth = await verifyAdminUser(req)
    if (!auth.ok) {
      return res.status(auth.status).json({ error: auth.error })
    }

    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
    const apiToken = process.env.CLOUDFLARE_API_TOKEN
    if (!accountId || !apiToken) {
      return res.status(503).json({ error: 'Cloudflare Stream not configured' })
    }

    const { title, maxDurationSeconds = STREAM_DEFAULT_MAX_DURATION_SECONDS } = req.body || {}
    const cfRes = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/direct_upload`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          maxDurationSeconds,
          requireSignedURLs: false,
          meta: { title: title || 'Bingo Academy upload' },
        }),
      }
    )

    const cfJson = await cfRes.json()
    if (!cfRes.ok || !cfJson.success) {
      console.error('[stream]', cfJson)
      return res.status(502).json({ error: cfJson.errors?.[0]?.message || 'Cloudflare API error' })
    }

    const result = cfJson.result
    res.json({
      uploadURL: result.uploadURL,
      uid: result.uid,
      limits: {
        maxFileBytes: STREAM_MAX_FILE_BYTES,
        recommendedMaxFileBytes: STREAM_RECOMMENDED_MAX_FILE_BYTES,
        maxDurationSeconds: maxDurationSeconds,
      },
    })
  })
}

export async function upsertOrderFromStripe(session) {
  const admin = getSupabaseAdmin()
  if (!admin) return

  const amount = session.amount_total
  const currency = session.currency || 'usd'
  const email = session.customer_details?.email || session.customer_email
  const userId = session.metadata?.user_id || null
  const metadata = session.metadata || {}

  const { data: orderRow } = await admin
    .from('orders')
    .upsert(
      {
        user_id: userId,
        stripe_checkout_session_id: session.id,
        stripe_payment_intent_id: session.payment_intent || null,
        status: session.payment_status === 'paid' ? 'paid' : 'pending',
        amount_cents: amount,
        currency,
        customer_email: email,
        product_name: metadata.product_name || session.line_items?.data?.[0]?.description,
        metadata,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'stripe_checkout_session_id' }
    )
    .select('id')
    .maybeSingle()

  if (session.payment_status === 'paid' && userId) {
    const purchaseType = metadata.purchase_type || 'course'
    const addonSlugs = parseAddonSlugs(metadata.addon_slugs)
    await grantCourseEntitlements(admin, {
      userId,
      purchaseType,
      courseSlug: metadata.course_slug,
      addonSlugs,
      orderId: orderRow?.id ?? null,
    })
  }
}

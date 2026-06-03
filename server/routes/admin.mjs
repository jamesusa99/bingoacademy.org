import { getSupabaseAdmin, getSupabaseConfig } from '../lib/supabaseAdmin.mjs'
import { grantCourseEntitlements } from '../lib/courseEntitlements.mjs'
import {
  STREAM_DEFAULT_MAX_DURATION_SECONDS,
  STREAM_MAX_FILE_BYTES,
  STREAM_RECOMMENDED_MAX_FILE_BYTES,
} from '../lib/cloudflareStream.mjs'

export function getAdminHealth() {
  const cfg = getSupabaseConfig()
  return {
    apiReachable: true,
    supabase: Boolean(cfg.url),
    adminEmails: Boolean(process.env.VITE_ADMIN_EMAILS || process.env.ADMIN_EMAILS),
    serviceRole: cfg.ready,
    stripe: Boolean(process.env.STRIPE_SECRET_KEY),
    stripeWebhook: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
    cloudflare: Boolean(process.env.CLOUDFLARE_ACCOUNT_ID && process.env.CLOUDFLARE_API_TOKEN),
    openai: Boolean(process.env.OPENAI_API_KEY),
  }
}

export function registerAdminRoutes(app, { verifyAdminUser }) {
  app.get('/api/admin/health', (_req, res) => {
    res.json(getAdminHealth())
  })

  app.get('/api/admin/stream/limits', (_req, res) => {
    res.json({
      maxFileBytes: STREAM_MAX_FILE_BYTES,
      recommendedMaxFileBytes: STREAM_RECOMMENDED_MAX_FILE_BYTES,
      maxDurationSeconds: STREAM_DEFAULT_MAX_DURATION_SECONDS,
      maxFileGb: 30,
      recommendedMaxFileGb: 4,
    })
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
    await grantCourseEntitlements(admin, {
      userId,
      purchaseType: metadata.purchase_type || 'lesson',
      courseSlug: metadata.course_slug,
      orderId: orderRow?.id ?? null,
    })
  }
}

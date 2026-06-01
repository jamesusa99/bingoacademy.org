import { getSupabaseAdmin, getSupabaseConfig } from '../lib/supabaseAdmin.mjs'

export function getAdminHealth() {
  const cfg = getSupabaseConfig()
  return {
    apiReachable: true,
    supabase: Boolean(cfg.url),
    adminEmails: Boolean(process.env.VITE_ADMIN_EMAILS || process.env.ADMIN_EMAILS),
    serviceRole: cfg.ready,
    stripe: Boolean(process.env.STRIPE_SECRET_KEY),
    cloudflare: Boolean(process.env.CLOUDFLARE_ACCOUNT_ID && process.env.CLOUDFLARE_API_TOKEN),
    openai: Boolean(process.env.OPENAI_API_KEY),
  }
}

export function registerAdminRoutes(app, { verifyAdminUser }) {
  app.get('/api/admin/health', (_req, res) => {
    res.json(getAdminHealth())
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

    const { title, maxDurationSeconds = 3600 } = req.body || {}
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
    })
  })
}

export async function upsertOrderFromStripe(session) {
  const admin = getSupabaseAdmin()
  if (!admin) return

  const amount = session.amount_total
  const currency = session.currency || 'usd'
  const email = session.customer_details?.email || session.customer_email

  await admin.from('orders').upsert(
    {
      stripe_checkout_session_id: session.id,
      status: session.payment_status === 'paid' ? 'paid' : 'pending',
      amount_cents: amount,
      currency,
      customer_email: email,
      product_name: session.metadata?.product_name || session.line_items?.data?.[0]?.description,
      metadata: session.metadata || {},
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'stripe_checkout_session_id' }
  )
}

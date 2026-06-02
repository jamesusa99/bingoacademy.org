import { getSupabaseAdmin } from '../lib/supabaseAdmin.mjs'
import { verifyAuthUser } from '../lib/supabaseAuth.mjs'
import { getStripeClient, isStripeConfigured } from '../lib/stripeClient.mjs'
import {
  CHECKOUT_PRICING,
  IOAI_FULL_TRACK_SLUG,
  grantCourseEntitlements,
  listEnrollmentSlugs,
} from '../lib/courseEntitlements.mjs'

function siteOrigin(req) {
  return (
    process.env.SITE_URL ||
    process.env.VITE_SITE_URL ||
    req.headers.origin ||
    'http://localhost:5173'
  ).replace(/\/$/, '')
}

export function registerPaymentRoutes(app) {
  app.get('/api/payments/config', (_req, res) => {
    res.json({
      stripeCheckout: isStripeConfigured(),
      pricing: {
        lesson: CHECKOUT_PRICING.lesson.amountCents / 100,
        ioaiTrack: CHECKOUT_PRICING.ioai_track.amountCents / 100,
      },
    })
  })

  app.get('/api/me/enrollments', async (req, res) => {
    const auth = await verifyAuthUser(req)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

    const slugs = await listEnrollmentSlugs(auth.admin, auth.user.id)
    return res.json({ slugs })
  })

  app.post('/api/checkout/course', async (req, res) => {
    const auth = await verifyAuthUser(req)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

    const stripe = await getStripeClient()
    if (!stripe) {
      return res.status(503).json({ error: 'Stripe not configured (STRIPE_SECRET_KEY)' })
    }

    const { courseSlug, purchaseType = 'lesson' } = req.body || {}
    if (!courseSlug?.trim()) {
      return res.status(400).json({ error: 'courseSlug is required' })
    }

    const isTrack = purchaseType === 'ioai_track'
    const pricing = isTrack ? CHECKOUT_PRICING.ioai_track : CHECKOUT_PRICING.lesson
    const productName = isTrack
      ? pricing.label
      : `IOAI Lesson — ${courseSlug.trim()}`

    const origin = siteOrigin(req)
    const returnSlug = isTrack ? IOAI_FULL_TRACK_SLUG : courseSlug.trim()
    const successUrl = `${origin}/courses/detail/${returnSlug}?checkout=success&session_id={CHECKOUT_SESSION_ID}`
    const cancelUrl = `${origin}/courses/detail/${returnSlug}?checkout=canceled`

    try {
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        customer_email: auth.user.email || undefined,
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: pricing.currency,
              unit_amount: pricing.amountCents,
              product_data: {
                name: productName,
                metadata: {
                  course_slug: courseSlug.trim(),
                  purchase_type: purchaseType,
                },
              },
            },
          },
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          product_name: productName,
          course_slug: courseSlug.trim(),
          purchase_type: purchaseType,
          user_id: auth.user.id,
        },
      })

      return res.json({ url: session.url, sessionId: session.id })
    } catch (err) {
      console.error('[checkout]', err)
      return res.status(502).json({ error: err.message || 'Stripe checkout failed' })
    }
  })

  /** Verify checkout session after redirect (fallback if webhook delayed) */
  app.post('/api/checkout/confirm', async (req, res) => {
    const auth = await verifyAuthUser(req)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

    const stripe = await getStripeClient()
    if (!stripe) return res.status(503).json({ error: 'Stripe not configured' })

    const { sessionId } = req.body || {}
    if (!sessionId) return res.status(400).json({ error: 'sessionId is required' })

    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId)
      if (session.payment_status !== 'paid') {
        return res.json({ ok: false, status: session.payment_status })
      }
      if (session.metadata?.user_id && session.metadata.user_id !== auth.user.id) {
        return res.status(403).json({ error: 'Session does not belong to this user' })
      }

      const admin = getSupabaseAdmin()
      const { granted } = await grantCourseEntitlements(admin, {
        userId: auth.user.id,
        purchaseType: session.metadata?.purchase_type || 'lesson',
        courseSlug: session.metadata?.course_slug,
      })

      const slugs = await listEnrollmentSlugs(admin, auth.user.id)
      return res.json({ ok: true, granted, slugs })
    } catch (err) {
      console.error('[checkout/confirm]', err)
      return res.status(502).json({ error: err.message })
    }
  })
}

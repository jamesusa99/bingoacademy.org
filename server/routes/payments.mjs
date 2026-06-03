import { getSupabaseAdmin } from '../lib/supabaseAdmin.mjs'
import { verifyAuthUser } from '../lib/supabaseAuth.mjs'
import { getStripeClient, isStripeConfigured } from '../lib/stripeClient.mjs'
import {
  CHECKOUT_PRICING,
  grantCourseEntitlements,
  IOAI_FULL_TRACK_SLUG,
  listEnrollmentSlugs,
  userHasIOAIAccess,
} from '../lib/courseEntitlements.mjs'
import {
  getCatalogCourseBySlug,
  isCatalogCoursePurchasable,
  resolveCheckoutQuote,
  resolveCoursePriceCents,
} from '../lib/coursePricing.mjs'
import { resolveMallCartLineItems } from '../lib/mallCheckout.mjs'
import { upsertOrderFromStripe } from './admin.mjs'

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

  app.get('/api/payments/course/:slug', async (req, res) => {
    const slug = req.params.slug?.trim()
    if (!slug) return res.status(400).json({ error: 'slug is required' })

    const admin = getSupabaseAdmin()
    const course = admin ? await getCatalogCourseBySlug(admin, slug) : null
    const priceCents = resolveCoursePriceCents(course)
    const purchasable = isCatalogCoursePurchasable(course, priceCents)

    return res.json({
      slug,
      stripeCheckout: isStripeConfigured(),
      purchasable,
      priceCents,
      currency: course?.currency || 'usd',
      displayPrice: course?.price || null,
      status: course?.status || null,
    })
  })

  app.get('/api/me/enrollments', async (req, res) => {
    const auth = await verifyAuthUser(req)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

    const slugs = await listEnrollmentSlugs(auth.admin, auth.user.id)
    return res.json({ slugs })
  })

  app.get('/api/me/ioai-access', async (req, res) => {
    const auth = await verifyAuthUser(req)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

    const hasAccess = await userHasIOAIAccess(auth.admin, auth.user.id)
    const slugs = await listEnrollmentSlugs(auth.admin, auth.user.id)
    return res.json({ hasAccess, slugs })
  })

  app.post('/api/checkout/course', async (req, res) => {
    const auth = await verifyAuthUser(req)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

    const stripe = await getStripeClient()
    if (!stripe) {
      return res.status(503).json({ error: 'Stripe not configured (STRIPE_SECRET_KEY)' })
    }

    const { courseSlug, purchaseType = 'course' } = req.body || {}
    if (!courseSlug?.trim()) {
      return res.status(400).json({ error: 'courseSlug is required' })
    }

    const admin = getSupabaseAdmin()
    const course = admin ? await getCatalogCourseBySlug(admin, courseSlug.trim()) : null
    const quote = resolveCheckoutQuote({ courseSlug, purchaseType, course })
    if (quote.error) {
      return res.status(quote.error === 'Course not found in catalog' ? 404 : 400).json({
        error: quote.error,
      })
    }

    const origin = siteOrigin(req)
    const returnPath = req.body?.returnPath?.trim() || `/courses/detail/${quote.returnSlug}`
    const successUrl = `${origin}${returnPath}?checkout=success&session_id={CHECKOUT_SESSION_ID}`
    const cancelUrl = `${origin}${returnPath}?checkout=canceled`

    try {
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        customer_email: auth.user.email || undefined,
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: quote.currency,
              unit_amount: quote.amountCents,
              product_data: {
                name: quote.productName,
                metadata: {
                  course_slug: courseSlug.trim(),
                  purchase_type: quote.purchaseType,
                },
              },
            },
          },
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          product_name: quote.productName,
          course_slug: courseSlug.trim(),
          purchase_type: quote.purchaseType,
          user_id: auth.user.id,
        },
      })

      return res.json({ url: session.url, sessionId: session.id })
    } catch (err) {
      console.error('[checkout]', err)
      return res.status(502).json({ error: err.message || 'Stripe checkout failed' })
    }
  })

  /** IOAI Masterclass checkout — alias for Stripe from curriculum paywall */
  app.post('/api/checkout', async (req, res) => {
    req.body = {
      courseSlug: IOAI_FULL_TRACK_SLUG,
      purchaseType: 'ioai_track',
      returnPath: '/curriculum',
      ...(req.body || {}),
    }
    const auth = await verifyAuthUser(req)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

    const stripe = await getStripeClient()
    if (!stripe) {
      return res.status(503).json({ error: 'Stripe not configured (STRIPE_SECRET_KEY)' })
    }

    const courseSlug = IOAI_FULL_TRACK_SLUG
    const purchaseType = 'ioai_track'
    const admin = getSupabaseAdmin()
    const course = admin ? await getCatalogCourseBySlug(admin, courseSlug) : null
    const quote = resolveCheckoutQuote({ courseSlug, purchaseType, course })
    if (quote.error) {
      return res.status(400).json({ error: quote.error })
    }

    const origin = siteOrigin(req)
    const returnPath = req.body?.returnPath || '/curriculum'
    const successUrl = `${origin}${returnPath}?checkout=success&session_id={CHECKOUT_SESSION_ID}`
    const cancelUrl = `${origin}${returnPath}?checkout=canceled`

    try {
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        customer_email: auth.user.email || undefined,
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: quote.currency,
              unit_amount: quote.amountCents,
              product_data: {
                name: quote.productName || 'IOAI Masterclass',
                metadata: { course_slug: courseSlug, purchase_type: purchaseType },
              },
            },
          },
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          product_name: quote.productName,
          course_slug: courseSlug,
          purchase_type: purchaseType,
          user_id: auth.user.id,
        },
      })
      return res.json({ url: session.url, sessionId: session.id })
    } catch (err) {
      console.error('[checkout/ioai]', err)
      return res.status(502).json({ error: err.message || 'Stripe checkout failed' })
    }
  })

  app.post('/api/checkout/mall', async (req, res) => {
    const auth = await verifyAuthUser(req)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

    const stripe = await getStripeClient()
    if (!stripe) {
      return res.status(503).json({ error: 'Stripe not configured (STRIPE_SECRET_KEY)' })
    }

    const { items } = req.body || {}
    const admin = getSupabaseAdmin()
    const quote = await resolveMallCartLineItems(admin, items)
    if (quote.error) {
      return res.status(400).json({ error: quote.error })
    }

    const origin = siteOrigin(req)
    const successUrl = `${origin}/mall?checkout=success&session_id={CHECKOUT_SESSION_ID}`
    const cancelUrl = `${origin}/mall?checkout=canceled`

    try {
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        customer_email: auth.user.email || undefined,
        line_items: quote.lineItems,
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          product_name: quote.productName,
          purchase_type: 'mall',
          user_id: auth.user.id,
          mall_items: JSON.stringify(quote.metaItems),
        },
      })

      return res.json({ url: session.url, sessionId: session.id })
    } catch (err) {
      console.error('[checkout/mall]', err)
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
      const purchaseType = session.metadata?.purchase_type || 'course'

      await upsertOrderFromStripe(session)

      if (purchaseType === 'mall') {
        return res.json({ ok: true, type: 'mall' })
      }

      const { granted } = await grantCourseEntitlements(admin, {
        userId: auth.user.id,
        purchaseType,
        courseSlug: session.metadata?.course_slug,
      })

      const slugs = await listEnrollmentSlugs(admin, auth.user.id)
      return res.json({ ok: true, granted, slugs, type: 'course' })
    } catch (err) {
      console.error('[checkout/confirm]', err)
      return res.status(502).json({ error: err.message })
    }
  })
}

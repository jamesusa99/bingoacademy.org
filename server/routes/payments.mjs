import { getSupabaseAdmin } from '../lib/supabaseAdmin.mjs'
import { verifyAuthUser } from '../lib/supabaseAuth.mjs'
import { getStripeClient, isStripeConfigured } from '../lib/stripeClient.mjs'
import {
  CHECKOUT_PRICING,
  grantCourseEntitlements,
  IOAI_FULL_BUNDLE_SLUG,
  listEnrollmentSlugs,
  revokeUserEnrollments,
} from '../lib/courseEntitlements.mjs'
import {
  getCatalogCourseBySlug,
  isCatalogCoursePurchasable,
  resolveCheckoutQuote,
  resolveCoursePriceCents,
} from '../lib/coursePricing.mjs'
import { parseAddonSlugs } from '../lib/ioaiCommerce.mjs'
import { resolveMallCartLineItems } from '../lib/mallCheckout.mjs'
import { upsertOrderFromStripe } from './admin.mjs'
import { buildProfileOverview } from '../lib/profileOverview.mjs'
import {
  listUserNotifications,
  syncUserNotificationsFromActivity,
} from '../lib/userNotifications.mjs'
import { buildStripeCheckoutSession } from '../lib/stripeCheckout.mjs'

function siteOrigin(req) {
  return (
    process.env.SITE_URL ||
    process.env.VITE_SITE_URL ||
    req.headers.origin ||
    'http://localhost:5173'
  ).replace(/\/$/, '')
}

function enrollmentResetAllowed() {
  return process.env.ALLOW_ENROLLMENT_RESET === 'true' || process.env.NODE_ENV !== 'production'
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

  app.get('/api/me/orders', async (req, res) => {
    const auth = await verifyAuthUser(req)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

    const { data, error } = await auth.admin
      .from('orders')
      .select(
        'id, status, amount_cents, currency, product_name, customer_email, metadata, created_at, updated_at'
      )
      .eq('user_id', auth.user.id)
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) return res.status(502).json({ error: error.message })
    return res.json({ orders: data || [] })
  })

  app.get('/api/me/overview', async (req, res) => {
    const auth = await verifyAuthUser(req)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

    try {
      const overview = await buildProfileOverview(auth.admin, auth.user.id)
      return res.json({ overview })
    } catch (err) {
      console.error('[me/overview]', err)
      return res.status(502).json({ error: err.message || 'Failed to load profile overview' })
    }
  })

  app.get('/api/me/notifications', async (req, res) => {
    const auth = await verifyAuthUser(req)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 100)

    try {
      await syncUserNotificationsFromActivity(auth.admin, auth.user.id)
      const notifications = await listUserNotifications(auth.admin, auth.user.id, { limit })
      return res.json({ notifications })
    } catch (err) {
      console.error('[me/notifications]', err)
      return res.status(502).json({ error: err.message || 'Failed to load notifications' })
    }
  })

  app.patch('/api/me/notifications/:id/read', async (req, res) => {
    const auth = await verifyAuthUser(req)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

    const notificationId = req.params.id?.trim()
    if (!notificationId) return res.status(400).json({ error: 'Notification id required' })

    const { error } = await auth.admin
      .from('user_notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', notificationId)
      .eq('user_id', auth.user.id)
      .is('read_at', null)

    if (error) return res.status(502).json({ error: error.message })
    return res.json({ ok: true })
  })

  app.post('/api/me/notifications/mark-all-read', async (req, res) => {
    const auth = await verifyAuthUser(req)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

    const { error } = await auth.admin
      .from('user_notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('user_id', auth.user.id)
      .is('read_at', null)

    if (error) return res.status(502).json({ error: error.message })
    return res.json({ ok: true })
  })

  app.delete('/api/me/enrollments', async (req, res) => {
    if (!enrollmentResetAllowed()) {
      return res.status(403).json({ error: 'Enrollment reset is disabled on this environment' })
    }

    const auth = await verifyAuthUser(req)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

    try {
      const removed = await revokeUserEnrollments(auth.admin, auth.user.id)
      return res.json({ ok: true, removed, slugs: [] })
    } catch (err) {
      console.error('[enrollments/reset]', err)
      return res.status(502).json({ error: err.message || 'Failed to reset enrollments' })
    }
  })

  app.post('/api/checkout/course', async (req, res) => {
    const auth = await verifyAuthUser(req)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

    const stripe = await getStripeClient()
    if (!stripe) {
      return res.status(503).json({ error: 'Stripe not configured (STRIPE_SECRET_KEY)' })
    }

    const { courseSlug, purchaseType = 'course', addonSlugs = [] } = req.body || {}
    if (!courseSlug?.trim()) {
      return res.status(400).json({ error: 'courseSlug is required' })
    }

    const admin = getSupabaseAdmin()
    const course = admin ? await getCatalogCourseBySlug(admin, courseSlug.trim()) : null
    const quote = await resolveCheckoutQuote(admin, {
      courseSlug,
      purchaseType,
      course,
      addonSlugs,
    })
    if (quote.error) {
      const status = quote.error.includes('Stripe') || quote.error.includes('minimum') ? 400 : quote.error === 'Course not found in catalog' || quote.error === 'Module not found' ? 404 : 400
      return res.status(status).json({
        error: quote.error,
      })
    }

    const origin = siteOrigin(req)
    const returnPath = req.body?.returnPath?.trim() || `/courses/detail/${quote.returnSlug}`
    const successUrl = `${origin}${returnPath}?checkout=success&session_id={CHECKOUT_SESSION_ID}`
    const cancelUrl = `${origin}${returnPath}?checkout=canceled`

    try {
      const session = await stripe.checkout.sessions.create(
        buildStripeCheckoutSession({
          customerEmail: auth.user.email,
          lineItems: [
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
          successUrl,
          cancelUrl,
          metadata: {
            product_name: quote.productName,
            course_slug: courseSlug.trim(),
            purchase_type: quote.purchaseType,
            addon_slugs: JSON.stringify(quote.addonSlugs || []),
            user_id: auth.user.id,
          },
        })
      )

      return res.json({ url: session.url, sessionId: session.id })
    } catch (err) {
      console.error('[checkout]', err)
      return res.status(502).json({ error: err.message || 'Stripe checkout failed' })
    }
  })

  /** IOAI Masterclass checkout — alias for Stripe from curriculum paywall */
  app.post('/api/checkout', async (req, res) => {
    req.body = {
      courseSlug: IOAI_FULL_BUNDLE_SLUG,
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

    const courseSlug = IOAI_FULL_BUNDLE_SLUG
    const purchaseType = 'ioai_track'
    const admin = getSupabaseAdmin()
    const course = admin ? await getCatalogCourseBySlug(admin, courseSlug) : null
    const quote = await resolveCheckoutQuote(admin, {
      courseSlug,
      purchaseType,
      course,
    })
    if (quote.error) {
      return res.status(400).json({ error: quote.error })
    }

    const origin = siteOrigin(req)
    const returnPath = req.body?.returnPath || '/curriculum'
    const successUrl = `${origin}${returnPath}?checkout=success&session_id={CHECKOUT_SESSION_ID}`
    const cancelUrl = `${origin}${returnPath}?checkout=canceled`

    try {
      const session = await stripe.checkout.sessions.create(
        buildStripeCheckoutSession({
          customerEmail: auth.user.email,
          lineItems: [
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
          successUrl,
          cancelUrl,
          metadata: {
            product_name: quote.productName,
            course_slug: courseSlug,
            purchase_type: purchaseType,
            user_id: auth.user.id,
          },
        })
      )
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
      const session = await stripe.checkout.sessions.create(
        buildStripeCheckoutSession({
          customerEmail: auth.user.email,
          lineItems: quote.lineItems,
          successUrl,
          cancelUrl,
          metadata: {
            product_name: quote.productName,
            purchase_type: 'mall',
            user_id: auth.user.id,
            mall_items: JSON.stringify(quote.metaItems),
          },
        })
      )

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
        addonSlugs: parseAddonSlugs(session.metadata?.addon_slugs),
      })

      const slugs = await listEnrollmentSlugs(admin, auth.user.id)
      return res.json({ ok: true, granted, slugs, type: 'course' })
    } catch (err) {
      console.error('[checkout/confirm]', err)
      return res.status(502).json({ error: err.message })
    }
  })
}

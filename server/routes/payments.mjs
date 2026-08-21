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
import { applyBundleUpgradeCredit, optionalAuthUser } from '../lib/bundleUpgradeCredit.mjs'
import { createPaidCheckoutSession, isZeroDueCheckoutSessionId } from '../lib/createCheckoutSession.mjs'
import {
  findPromoCodeByCode,
  PROMO_MIN_CHECKOUT_CENTS,
  recordPromoRedemption,
  resolvePromoForCheckout,
  validatePromoForQuote,
} from '../lib/promoCodes.mjs'

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

function publicCheckoutQuote(quote) {
  return {
    productName: quote.productName,
    purchaseType: quote.purchaseType,
    returnSlug: quote.returnSlug,
    amountCents: quote.amountCents,
    listAmountCents: quote.listAmountCents ?? quote.amountCents,
    creditCents: quote.creditCents || 0,
    credits: quote.credits || [],
    currency: quote.currency,
    lineItems: quote.lineItems || [],
    addonSlugs: quote.addonSlugs || [],
    itemLabel: quote.itemLabel || null,
    coverUrl: quote.coverUrl || null,
    upgrade: Boolean(quote.upgrade),
  }
}

async function quoteWithUpgradeCredit(admin, req, { courseSlug, purchaseType, course, addonSlugs }) {
  const quote = await resolveCheckoutQuote(admin, {
    courseSlug,
    purchaseType,
    course,
    addonSlugs,
  })
  if (quote.error) return quote
  const auth = await optionalAuthUser(verifyAuthUser, req)
  if (!auth.ok) return quote
  return applyBundleUpgradeCredit(admin, {
    userId: auth.user.id,
    quote,
    courseSlug,
    purchaseType,
  })
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

  async function handlePromoValidate(req, res) {
    const { code, courseSlug, purchaseType = 'course', amountCents, addonSlugs = [] } = req.body || {}
    if (!code?.trim()) {
      return res.status(400).json({ valid: false, error: 'Promo code is required' })
    }

    const admin = getSupabaseAdmin()
    if (!admin) {
      return res.status(503).json({ valid: false, error: 'Database not configured' })
    }

    try {
      let quote
      const currency = (req.body?.currency || 'usd').toLowerCase()
      if (amountCents != null && Number.isFinite(Number(amountCents))) {
        quote = {
          amountCents: Number(amountCents),
          currency,
          purchaseType,
          returnSlug: courseSlug?.trim() || '',
          productName: 'Preview',
        }
      } else if (courseSlug?.trim()) {
        const course = await getCatalogCourseBySlug(admin, courseSlug.trim())
        quote = await resolveCheckoutQuote(admin, {
          courseSlug: courseSlug.trim(),
          purchaseType,
          course,
          addonSlugs,
        })
        if (quote.error) {
          return res.status(200).json({ valid: false, error: quote.error })
        }
      } else {
        return res.status(400).json({ valid: false, error: 'courseSlug or amountCents is required' })
      }

      const promo = await findPromoCodeByCode(admin, code)
      const result = validatePromoForQuote(promo, quote, {
        purchaseType,
        courseSlug: courseSlug?.trim(),
      })
      if (!result.ok) {
        return res.json({ valid: false, error: result.error })
      }

      return res.json({
        valid: true,
        code: result.promo.code,
        discountLabel: result.discountLabel,
        originalAmountCents: quote.amountCents,
        discountCents: result.discountCents,
        finalAmountCents: result.finalAmountCents,
        currency: quote.currency,
        minimumCheckoutApplied: result.minimumCheckoutApplied,
        minimumCheckoutCents: result.minimumCheckoutCents,
        minimumCheckoutNotice: result.minimumCheckoutNotice,
      })
    } catch (err) {
      console.error('[promo/validate]', err)
      return res.status(502).json({ valid: false, error: err.message || 'Validation failed' })
    }
  }

  app.post('/api/promo/validate', handlePromoValidate)
  app.post('/api/checkout/promo/validate', handlePromoValidate)
  app.post('/api/payments/promo/validate', handlePromoValidate)

  app.post('/api/checkout/quote', async (req, res) => {
    const { courseSlug, purchaseType = 'course', addonSlugs = [] } = req.body || {}
    if (!courseSlug?.trim()) {
      return res.status(400).json({ error: 'courseSlug is required' })
    }

    const admin = getSupabaseAdmin()
    const course = admin ? await getCatalogCourseBySlug(admin, courseSlug.trim()) : null
    const quote = await quoteWithUpgradeCredit(admin, req, {
      courseSlug: courseSlug.trim(),
      purchaseType,
      course,
      addonSlugs,
    })
    if (quote.error) {
      const status = quote.error === 'Course not found in catalog' || quote.error === 'Module not found' || quote.error === 'Bundle not found' ? 404 : 400
      return res.status(status).json({ error: quote.error })
    }

    return res.json(publicCheckoutQuote(quote))
  })

  app.post('/api/checkout/quotes', async (req, res) => {
    const items = Array.isArray(req.body?.items) ? req.body.items.slice(0, 16) : []
    if (!items.length) return res.json({ quotes: [] })

    const admin = getSupabaseAdmin()
    const quotes = []
    for (const item of items) {
      const courseSlug = item?.courseSlug?.trim()
      if (!courseSlug) continue
      const purchaseType = item.purchaseType || 'bundle'
      const course = admin ? await getCatalogCourseBySlug(admin, courseSlug) : null
      const quote = await quoteWithUpgradeCredit(admin, req, {
        courseSlug,
        purchaseType,
        course,
        addonSlugs: item.addonSlugs || [],
      })
      if (quote.error) {
        quotes.push({ courseSlug, purchaseType, error: quote.error })
        continue
      }
      quotes.push({ courseSlug, purchaseType, ...publicCheckoutQuote(quote) })
    }
    return res.json({ quotes })
  })

  app.post('/api/checkout/course', async (req, res) => {
    const auth = await verifyAuthUser(req)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

    const { courseSlug, purchaseType = 'course', addonSlugs = [], promoCode } = req.body || {}
    if (!courseSlug?.trim()) {
      return res.status(400).json({ error: 'courseSlug is required' })
    }

    const admin = getSupabaseAdmin()
    const course = admin ? await getCatalogCourseBySlug(admin, courseSlug.trim()) : null
    const quote = await applyBundleUpgradeCredit(admin, {
      userId: auth.user.id,
      quote: await resolveCheckoutQuote(admin, {
        courseSlug,
        purchaseType,
        course,
        addonSlugs,
      }),
      courseSlug,
      purchaseType,
    })
    if (quote.error) {
      const status = quote.error.includes('Stripe') || quote.error.includes('minimum') ? 400 : quote.error === 'Course not found in catalog' || quote.error === 'Module not found' ? 404 : 400
      return res.status(status).json({
        error: quote.error,
      })
    }

    const origin = siteOrigin(req)
    const returnPath = req.body?.returnPath?.trim() || `/courses/detail/${quote.returnSlug}`

    if ((quote.amountCents || 0) <= 0) {
      try {
        const result = await createPaidCheckoutSession({
          stripe: null,
          admin,
          auth,
          quote,
          returnPath,
          origin,
          purchaseContext: { courseSlug: courseSlug.trim(), purchaseType: quote.purchaseType },
        })
        if (result.error) {
          return res.status(400).json({ error: result.error })
        }
        return res.json({ url: result.url, sessionId: result.sessionId, complimentary: true })
      } catch (err) {
        console.error('[checkout]', err)
        return res.status(502).json({ error: err.message || 'Checkout failed' })
      }
    }

    const stripe = await getStripeClient()
    if (!stripe) {
      return res.status(503).json({ error: 'Stripe not configured (STRIPE_SECRET_KEY)' })
    }

    try {
      const result = await createPaidCheckoutSession({
        stripe,
        admin,
        auth,
        quote,
        returnPath,
        origin,
        promoCode,
        purchaseContext: { courseSlug: courseSlug.trim(), purchaseType: quote.purchaseType },
      })
      if (result.error) {
        return res.status(400).json({ error: result.error })
      }
      return res.json({ url: result.url, sessionId: result.sessionId })
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

    const courseSlug = IOAI_FULL_BUNDLE_SLUG
    const purchaseType = 'ioai_track'
    const admin = getSupabaseAdmin()
    const course = admin ? await getCatalogCourseBySlug(admin, courseSlug) : null
    const quote = await applyBundleUpgradeCredit(admin, {
      userId: auth.user.id,
      quote: await resolveCheckoutQuote(admin, {
        courseSlug,
        purchaseType,
        course,
      }),
      courseSlug,
      purchaseType,
    })
    if (quote.error) {
      return res.status(400).json({ error: quote.error })
    }

    const origin = siteOrigin(req)
    const returnPath = req.body?.returnPath || '/curriculum'
    const promoCode = req.body?.promoCode

    if ((quote.amountCents || 0) <= 0) {
      try {
        const result = await createPaidCheckoutSession({
          stripe: null,
          admin,
          auth,
          quote,
          returnPath,
          origin,
          purchaseContext: { courseSlug, purchaseType: quote.purchaseType },
        })
        if (result.error) {
          return res.status(400).json({ error: result.error })
        }
        return res.json({ url: result.url, sessionId: result.sessionId, complimentary: true })
      } catch (err) {
        console.error('[checkout/ioai]', err)
        return res.status(502).json({ error: err.message || 'Checkout failed' })
      }
    }

    const stripe = await getStripeClient()
    if (!stripe) {
      return res.status(503).json({ error: 'Stripe not configured (STRIPE_SECRET_KEY)' })
    }

    try {
      const result = await createPaidCheckoutSession({
        stripe,
        admin,
        auth,
        quote,
        returnPath,
        origin,
        promoCode,
        purchaseContext: { courseSlug, purchaseType: quote.purchaseType },
      })
      if (result.error) {
        return res.status(400).json({ error: result.error })
      }
      return res.json({ url: result.url, sessionId: result.sessionId })
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

    const { items, promoCode } = req.body || {}
    const admin = getSupabaseAdmin()
    const quote = await resolveMallCartLineItems(admin, items)
    if (quote.error) {
      return res.status(400).json({ error: quote.error })
    }

    const mallQuote = {
      amountCents: quote.totalCents,
      currency: quote.currency,
      productName: quote.productName,
      purchaseType: 'mall',
      returnSlug: 'mall',
    }

    const promoResult = await resolvePromoForCheckout(admin, promoCode, mallQuote, {
      purchaseType: 'mall',
      courseSlug: 'mall',
    })
    if (promoResult.error) {
      return res.status(400).json({ error: promoResult.error })
    }

    const hasPromo = Boolean(promoResult.promoMeta?.promo_code_id)
    const promoMinCents = hasPromo
      ? parseInt(promoResult.promoMeta?.promo_minimum_checkout_cents, 10) || PROMO_MIN_CHECKOUT_CENTS
      : null
    const chargedCents = hasPromo
      ? Math.max(promoMinCents, promoResult.amountCents)
      : promoResult.amountCents

    const origin = siteOrigin(req)
    const successUrl = `${origin}/mall?checkout=success&session_id={CHECKOUT_SESSION_ID}`
    const cancelUrl = `${origin}/mall?checkout=canceled`

    const productName = promoResult.productNameSuffix
      ? `${quote.productName} (${promoResult.productNameSuffix})`
      : quote.productName

    const lineItems =
      promoResult.promoMeta?.promo_code_id != null
        ? [
            {
              quantity: 1,
              price_data: {
                currency: quote.currency,
                unit_amount: chargedCents,
                product_data: {
                  name: productName,
                  metadata: { purchase_type: 'mall' },
                },
              },
            },
          ]
        : quote.lineItems

    try {
      const session = await stripe.checkout.sessions.create(
        buildStripeCheckoutSession({
          customerEmail: auth.user.email,
          lineItems,
          successUrl,
          cancelUrl,
          metadata: {
            product_name: quote.productName,
            purchase_type: 'mall',
            user_id: auth.user.id,
            mall_items: JSON.stringify(quote.metaItems),
            ...promoResult.promoMeta,
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

    const { sessionId } = req.body || {}
    if (!sessionId) return res.status(400).json({ error: 'sessionId is required' })

    try {
      if (isZeroDueCheckoutSessionId(sessionId)) {
        const admin = getSupabaseAdmin()
        const { data: order } = await admin
          .from('orders')
          .select('id, user_id, status, metadata')
          .eq('stripe_checkout_session_id', sessionId)
          .maybeSingle()
        if (!order) return res.status(404).json({ error: 'Order not found' })
        if (order.user_id !== auth.user.id) {
          return res.status(403).json({ error: 'Session does not belong to this user' })
        }
        if (order.status !== 'paid') {
          return res.json({ ok: false, status: order.status })
        }
        const slugs = await listEnrollmentSlugs(admin, auth.user.id)
        return res.json({ ok: true, granted: true, slugs, type: 'course', complimentary: true })
      }

      const stripe = await getStripeClient()
      if (!stripe) return res.status(503).json({ error: 'Stripe not configured' })
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

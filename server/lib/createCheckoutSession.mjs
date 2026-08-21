import { randomUUID } from 'node:crypto'
import { grantCourseEntitlements } from './courseEntitlements.mjs'
import { notifyCheckoutEntitlements, notifyOrderPaid } from './userNotifications.mjs'
import { buildStripeCheckoutSession } from './stripeCheckout.mjs'
import { PROMO_MIN_CHECKOUT_CENTS, resolvePromoForCheckout } from './promoCodes.mjs'

export function isZeroDueCheckoutSessionId(sessionId) {
  return String(sessionId || '').startsWith('zero_')
}

export async function completeZeroDueCheckout({
  admin,
  auth,
  quote,
  returnPath,
  origin,
  purchaseContext = {},
}) {
  const sessionId = `zero_${randomUUID()}`
  const courseSlug = purchaseContext.courseSlug?.trim() || quote.returnSlug
  const metadata = {
    product_name: quote.productName,
    course_slug: courseSlug,
    purchase_type: quote.purchaseType,
    addon_slugs: JSON.stringify(quote.addonSlugs || []),
    user_id: auth.user.id,
    upgrade_credit_cents: String(quote.creditCents || 0),
    source: 'bundle_upgrade_credit',
  }

  const { data: orderRow, error } = await admin
    .from('orders')
    .insert({
      user_id: auth.user.id,
      stripe_checkout_session_id: sessionId,
      status: 'paid',
      amount_cents: 0,
      currency: quote.currency || 'usd',
      product_name: quote.productName,
      customer_email: auth.user.email || null,
      metadata,
    })
    .select('id')
    .maybeSingle()

  if (error) return { error: error.message || 'Could not record complimentary order' }

  const { granted, error: grantError } = await grantCourseEntitlements(admin, {
    userId: auth.user.id,
    purchaseType: quote.purchaseType,
    courseSlug,
    addonSlugs: quote.addonSlugs || [],
    orderId: orderRow?.id ?? null,
  })
  if (grantError) return { error: grantError }

  try {
    await notifyOrderPaid(admin, {
      userId: auth.user.id,
      orderId: orderRow?.id,
      productName: quote.productName,
      amountCents: 0,
      currency: quote.currency || 'usd',
    })
    if (granted?.length) {
      await notifyCheckoutEntitlements(admin, {
        userId: auth.user.id,
        orderId: orderRow?.id,
        productName: quote.productName,
        grantedSlugs: granted,
      })
    }
  } catch (err) {
    console.error('[checkout/zero-due] notifications', err)
  }

  const successUrl = `${origin}/checkout?paid=1&session_id=${encodeURIComponent(sessionId)}&return=${encodeURIComponent(returnPath || '/courses')}`
  return { url: successUrl, sessionId, complimentary: true, granted }
}

export async function createPaidCheckoutSession({
  stripe,
  admin,
  auth,
  quote,
  returnPath,
  origin,
  promoCode,
  purchaseContext = {},
  extraMetadata = {},
}) {
  if ((quote.amountCents || 0) <= 0) {
    return completeZeroDueCheckout({ admin, auth, quote, returnPath, origin, purchaseContext })
  }

  const promoResult = await resolvePromoForCheckout(admin, promoCode, quote, purchaseContext)
  if (promoResult.error) {
    return { error: promoResult.error }
  }

  const hasPromo = Boolean(promoResult.promoMeta?.promo_code_id)
  const promoMinCents = hasPromo
    ? parseInt(promoResult.promoMeta?.promo_minimum_checkout_cents, 10) || PROMO_MIN_CHECKOUT_CENTS
    : null
  const amountCents = hasPromo
    ? Math.max(promoMinCents, promoResult.amountCents)
    : promoResult.amountCents
  const productName = promoResult.productNameSuffix
    ? `${quote.productName} (${promoResult.productNameSuffix})`
    : quote.productName

  const successUrl = `${origin}/checkout?paid=1&session_id={CHECKOUT_SESSION_ID}&return=${encodeURIComponent(returnPath || '/courses')}`
  const cancelUrl = `${origin}${returnPath || '/courses'}`

  const session = await stripe.checkout.sessions.create(
    buildStripeCheckoutSession({
      customerEmail: auth.user.email,
      lineItems: [
        {
          quantity: 1,
          price_data: {
            currency: quote.currency,
            unit_amount: amountCents,
            product_data: {
              name: productName,
              metadata: {
                course_slug: purchaseContext.courseSlug?.trim() || quote.returnSlug,
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
        course_slug: purchaseContext.courseSlug?.trim() || quote.returnSlug,
        purchase_type: quote.purchaseType,
        addon_slugs: JSON.stringify(quote.addonSlugs || []),
        user_id: auth.user.id,
        ...promoResult.promoMeta,
        ...(quote.creditCents ? { upgrade_credit_cents: String(quote.creditCents) } : {}),
        ...extraMetadata,
      },
    })
  )

  return { url: session.url, sessionId: session.id }
}

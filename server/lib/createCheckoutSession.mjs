import { buildStripeCheckoutSession } from './stripeCheckout.mjs'
import { PROMO_MIN_CHECKOUT_CENTS, resolvePromoForCheckout } from './promoCodes.mjs'

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
        ...extraMetadata,
      },
    })
  )

  return { url: session.url, sessionId: session.id }
}

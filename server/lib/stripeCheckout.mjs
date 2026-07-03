/** Shared Stripe Checkout Session options — minimal friction for K-12 parents. */

export function buildStripeCheckoutSession({
  customerEmail,
  lineItems,
  successUrl,
  cancelUrl,
  metadata,
}) {
  return {
    mode: 'payment',
    customer_email: customerEmail || undefined,
    line_items: lineItems,
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
    phone_number_collection: { enabled: false },
    allow_promotion_codes: true,
  }
}

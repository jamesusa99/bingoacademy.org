/** Stripe SDK singleton (server-only) */

let stripeClient = null

export function isStripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY)
}

export async function getStripeClient() {
  if (!isStripeConfigured()) return null
  if (!stripeClient) {
    const Stripe = (await import('stripe')).default
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY)
  }
  return stripeClient
}

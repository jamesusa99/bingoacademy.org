const NON_PURCHASABLE_PATTERN =
  /coming\s*soon|quote|contact|included|free|school\s*quote|\/yr|\/\s*session|tbd|upon\s*request|custom/i

/** Stripe Checkout minimum charge amounts (in smallest currency unit). */
const STRIPE_MINIMUM_CENTS = {
  usd: 50,
  eur: 50,
  gbp: 30,
  cad: 50,
  aud: 50,
  cny: 400,
}

export function stripeMinimumCents(currency = 'usd') {
  const key = String(currency || 'usd').toLowerCase()
  return STRIPE_MINIMUM_CENTS[key] ?? 50
}

export function isStripeCheckoutAmountValid(amountCents, currency = 'usd') {
  if (amountCents == null || amountCents <= 0) return false
  return amountCents >= stripeMinimumCents(currency)
}

export function stripeMinimumAmountError(amountCents, currency = 'usd') {
  const min = stripeMinimumCents(currency)
  const cur = String(currency || 'usd').toUpperCase()
  const actual = (amountCents / 100).toFixed(2)
  const minimum = (min / 100).toFixed(2)
  return `Checkout amount (${cur} ${actual}) is below Stripe's minimum (${cur} ${minimum}). Update the product price in admin.`
}

/** Parse display price text → cents (USD assumed unless currency column set) */
export function parsePriceStringToCents(text) {
  if (!text || typeof text !== 'string') return null
  const trimmed = text.trim()
  if (!trimmed || NON_PURCHASABLE_PATTERN.test(trimmed)) return null
  const normalized = trimmed.replace(/,/g, '')
  const match = normalized.match(/(\d+(?:\.\d{1,2})?)/)
  if (!match) return null
  const dollars = parseFloat(match[1])
  if (!Number.isFinite(dollars) || dollars <= 0) return null
  return Math.round(dollars * 100)
}

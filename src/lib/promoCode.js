import { getStoredPromoCode } from './lazyRegistration'

export async function validatePromoCode({ code, courseSlug, purchaseType, amountCents, currency, addonSlugs }) {
  const res = await fetch('/api/promo/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code: code?.trim(),
      courseSlug,
      purchaseType,
      amountCents,
      currency,
      addonSlugs,
    }),
  })
  const body = await res.json().catch(() => ({}))
  if (body.valid === false || body.error) {
    return { valid: false, error: body.error || 'Invalid promo code', ...body }
  }
  if (!res.ok) {
    throw new Error(body.error || `Validation failed (${res.status})`)
  }
  return body
}

/** Promo code applied on site — passed to checkout APIs. */
export function getCheckoutPromoCode() {
  return getStoredPromoCode()?.trim().toUpperCase() || ''
}

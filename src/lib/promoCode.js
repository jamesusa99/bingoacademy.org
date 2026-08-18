import { getStoredPromoCode } from './lazyRegistration'

export async function validatePromoCode({ code, courseSlug, purchaseType, amountCents, addonSlugs }) {
  const res = await fetch('/api/promo/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code: code?.trim(),
      courseSlug,
      purchaseType,
      amountCents,
      addonSlugs,
    }),
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok && !body.error) {
    throw new Error(`Validation failed (${res.status})`)
  }
  return body
}

/** Promo code applied on site — passed to checkout APIs. */
export function getCheckoutPromoCode() {
  return getStoredPromoCode()?.trim().toUpperCase() || ''
}

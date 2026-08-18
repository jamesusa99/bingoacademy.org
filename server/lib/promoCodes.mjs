import { IOAI_FULL_BUNDLE_SLUG } from './courseEntitlements.mjs'
import { stripeMinimumCents } from './priceUtils.mjs'

export const DEFAULT_MIN_PURCHASE_CENTS = 100
/** After a promo is applied, checkout total is never below this amount ($1.00). */
export const PROMO_MIN_CHECKOUT_CENTS = DEFAULT_MIN_PURCHASE_CENTS

/** @typedef {'all'|'ioai'|'courses'|'mall'} PromoScope */

export function effectivePromoStatus(row, now = Date.now()) {
  if (!row) return 'invalid'
  if (row.status === 'paused' || row.status === 'draft') return row.status
  if (row.status === 'expired') return 'expired'
  if (row.ends_at && new Date(row.ends_at).getTime() < now) return 'expired'
  if (row.starts_at && new Date(row.starts_at).getTime() > now) return 'scheduled'
  if (row.max_redemptions != null && row.redemption_count >= row.max_redemptions) return 'exhausted'
  if (row.status === 'active') return 'active'
  return row.status
}

export function purchaseScopeForCheckout({ purchaseType, courseSlug }) {
  if (purchaseType === 'mall') return 'mall'
  if (purchaseType === 'ioai_track' || purchaseType === 'bundle' || purchaseType === 'module') {
    return 'ioai'
  }
  const slug = courseSlug?.trim() || ''
  if (slug === IOAI_FULL_BUNDLE_SLUG || slug.startsWith('ioai-')) return 'ioai'
  return 'courses'
}

function scopeMatches(promoScope, purchaseScope) {
  if (promoScope === 'all') return true
  return promoScope === purchaseScope
}

function slugMatches(applicableSlugs, courseSlug) {
  if (!Array.isArray(applicableSlugs) || applicableSlugs.length === 0) return true
  const slug = courseSlug?.trim()?.toLowerCase()
  if (!slug) return false
  return applicableSlugs.some((entry) => String(entry).trim().toLowerCase() === slug)
}

export function computeDiscountCents(row, amountCents) {
  if (row.discount_type === 'fixed_amount') {
    return Math.min(row.discount_amount_cents ?? 0, amountCents)
  }
  const percent = row.discount_percent ?? 0
  return Math.min(Math.round((amountCents * percent) / 100), amountCents)
}

export function formatPromoDiscountLabel(row) {
  if (row.discount_type === 'fixed_amount') {
    const dollars = ((row.discount_amount_cents ?? 0) / 100).toFixed(2)
    return `$${dollars} off`
  }
  return `${row.discount_percent ?? 0}% off`
}

export function formatMinimumCheckoutNotice(cents, currency = 'usd') {
  const amount = (cents / 100).toFixed(2)
  const cur = String(currency || 'usd').toLowerCase()
  if (cur === 'usd') return `Minimum charge for this promo code: $${amount}`
  return `Minimum charge for this promo code: ${cur.toUpperCase()} ${amount}`
}

function applyPromoMinimumCheckout(amountCents, discountCents, minCheckoutCents = PROMO_MIN_CHECKOUT_CENTS) {
  const rawFinal = amountCents - discountCents
  if (rawFinal >= minCheckoutCents) {
    return {
      finalAmountCents: rawFinal,
      discountCents,
      minimumCheckoutApplied: false,
    }
  }
  return {
    finalAmountCents: minCheckoutCents,
    discountCents: Math.max(0, amountCents - minCheckoutCents),
    minimumCheckoutApplied: true,
  }
}

export { applyPromoMinimumCheckout }

const STATUS_ERRORS = {
  draft: 'This promo code is not active yet',
  paused: 'This promo code is paused',
  expired: 'This promo code has expired',
  scheduled: 'This promo code is not valid yet',
  exhausted: 'This promo code has reached its usage limit',
  invalid: 'Invalid promo code',
}

export async function findPromoCodeByCode(admin, code) {
  if (!admin || !code?.trim()) return null
  const normalized = code.trim().toUpperCase()
  const { data, error } = await admin
    .from('promo_codes')
    .select('*')
    .eq('code', normalized)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return data
}

/**
 * Validate promo against a checkout quote.
 * @returns {{ ok: true, promo: object, discountCents: number, finalAmountCents: number, discountLabel: string } | { ok: false, error: string }}
 */
export function validatePromoForQuote(promo, quote, { purchaseType, courseSlug } = {}) {
  if (!promo) return { ok: false, error: 'Invalid promo code' }

  const live = effectivePromoStatus(promo)
  if (live !== 'active') {
    return { ok: false, error: STATUS_ERRORS[live] || STATUS_ERRORS.invalid }
  }

  const purchaseScope = purchaseScopeForCheckout({ purchaseType: purchaseType || quote.purchaseType, courseSlug })
  if (!scopeMatches(promo.applies_to, purchaseScope)) {
    return { ok: false, error: 'This promo code does not apply to this product' }
  }

  const slug = courseSlug?.trim() || quote.returnSlug
  if (!slugMatches(promo.applicable_slugs, slug)) {
    return { ok: false, error: 'This promo code does not apply to this product' }
  }

  const currency = (quote.currency || 'usd').toLowerCase()
  const promoCurrency = (promo.currency || 'usd').toLowerCase()
  if (promoCurrency !== currency) {
    return { ok: false, error: 'This promo code is not valid for this currency' }
  }

  const amountCents = quote.amountCents
  const minCheckoutCents = promo.min_purchase_cents ?? DEFAULT_MIN_PURCHASE_CENTS
  if (amountCents < minCheckoutCents) {
    const min = (minCheckoutCents / 100).toFixed(2)
    return { ok: false, error: `Minimum purchase of ${currency.toUpperCase()} ${min} required for this code` }
  }

  const discountCents = computeDiscountCents(promo, amountCents)
  if (discountCents <= 0) {
    return { ok: false, error: 'This promo code does not apply a discount to this order' }
  }

  const checkout = applyPromoMinimumCheckout(amountCents, discountCents, minCheckoutCents)

  return {
    ok: true,
    promo,
    discountCents: checkout.discountCents,
    finalAmountCents: checkout.finalAmountCents,
    discountLabel: formatPromoDiscountLabel(promo),
    minimumCheckoutApplied: checkout.minimumCheckoutApplied,
    minimumCheckoutCents: minCheckoutCents,
    minimumCheckoutNotice: checkout.minimumCheckoutApplied
      ? formatMinimumCheckoutNotice(minCheckoutCents, currency)
      : null,
  }
}

export async function resolvePromoForCheckout(admin, promoCode, quote, context = {}) {
  if (!promoCode?.trim()) {
    return {
      amountCents: quote.amountCents,
      promoMeta: {},
    }
  }

  const promo = await findPromoCodeByCode(admin, promoCode)
  const result = validatePromoForQuote(promo, quote, context)
  if (!result.ok) {
    return { error: result.error }
  }

  const {
    promo: row,
    discountCents,
    finalAmountCents,
    discountLabel,
    minimumCheckoutApplied,
    minimumCheckoutCents,
  } = result
  const suffix = `${row.code} · ${discountLabel}`

  return {
    amountCents: finalAmountCents,
    productNameSuffix: suffix,
    promoMeta: {
      promo_code_id: row.id,
      promo_code: row.code,
      promo_discount_cents: String(discountCents),
      promo_original_amount_cents: String(quote.amountCents),
      promo_discount_label: discountLabel,
      promo_minimum_checkout_cents: String(minimumCheckoutCents ?? PROMO_MIN_CHECKOUT_CENTS),
      ...(minimumCheckoutApplied ? { promo_minimum_checkout_applied: 'true' } : {}),
    },
  }
}

export async function recordPromoRedemption(admin, session) {
  if (!admin || !session?.id) return

  try {
    const paid =
      session.payment_status === 'paid' ||
      session.payment_status === 'no_payment_required' ||
      session.status === 'complete'
    if (!paid) return

    const { data: order } = await admin
      .from('orders')
      .select('id, metadata')
      .eq('stripe_checkout_session_id', session.id)
      .maybeSingle()

    const meta = {
      ...(order?.metadata && typeof order.metadata === 'object' ? order.metadata : {}),
      ...(session.metadata || {}),
    }
    const promoId = meta.promo_code_id
    if (!promoId) return
    if (meta.promo_redemption_recorded === 'true' || meta.promo_redemption_recorded === true) return

    const userId = meta.user_id || null
    const { data: rpcRedeemed, error: rpcErr } = await admin.rpc('redeem_promo_for_session', {
      p_promo_id: promoId,
      p_session_id: session.id,
      p_user_id: userId,
    })

    if (rpcErr) {
      console.warn('[promo] redeem_promo_for_session failed, using fallback', rpcErr.message)
      const { data: promo, error: fetchErr } = await admin
        .from('promo_codes')
        .select('id, redemption_count')
        .eq('id', promoId)
        .maybeSingle()

      if (fetchErr || !promo) {
        console.error('[promo] lookup failed', fetchErr?.message || 'not found', promoId)
        return
      }

      const { data: updated, error: updateErr } = await admin
        .from('promo_codes')
        .update({
          redemption_count: (promo.redemption_count ?? 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', promoId)
        .select('id')

      if (updateErr || !updated?.length) {
        console.error('[promo] increment failed', updateErr?.message || '0 rows updated', promoId)
        return
      }
    } else if (rpcRedeemed === false) {
      // Duplicate session — already counted
    }

    if (order?.id) {
      await admin
        .from('orders')
        .update({
          metadata: { ...meta, promo_redemption_recorded: 'true' },
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id)
    }
  } catch (err) {
    console.error('[promo] redemption failed', err)
  }
}

export { stripeMinimumCents }

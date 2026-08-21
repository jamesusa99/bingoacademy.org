import { stripeMinimumCents } from './priceUtils.mjs'
import {
  IOAI_FULL_BUNDLE_SLUG,
  listBundleModuleCatalogSlugs,
  parseAddonSlugs,
  sumCatalogRowsPriceCents,
} from './ioaiCommerce.mjs'

export function computeUpgradeDueCents(listAmountCents, creditCents, currency = 'usd') {
  const list = Math.max(0, Number(listAmountCents) || 0)
  const cappedCredit = Math.min(Math.max(0, Number(creditCents) || 0), list)
  let amountCents = Math.max(0, list - cappedCredit)
  const min = stripeMinimumCents(currency)
  if (amountCents > 0 && amountCents < min) amountCents = 0
  return { creditCents: cappedCredit, amountCents }
}

function orderMeta(order) {
  const meta = order?.metadata && typeof order.metadata === 'object' ? order.metadata : {}
  return meta
}

async function orderGrantedModuleSlugs(admin, order) {
  const meta = orderMeta(order)
  const slug = String(meta.course_slug || '').trim()
  const purchaseType = String(meta.purchase_type || '').trim()
  if (!slug || purchaseType === 'mall') return []

  if (
    purchaseType === 'bundle' ||
    purchaseType === 'ioai_track' ||
    slug.startsWith('ioai-stage-') ||
    slug === IOAI_FULL_BUNDLE_SLUG
  ) {
    return listBundleModuleCatalogSlugs(admin, slug)
  }

  return [slug]
}

async function moduleCreditAmountCents(admin, order) {
  const paid = Math.max(0, parseInt(order.amount_cents, 10) || 0)
  if (paid <= 0) return 0
  const addonSlugs = parseAddonSlugs(orderMeta(order).addon_slugs)
  if (!addonSlugs.length) return paid

  const { data } = await admin
    .from('courses_catalog')
    .select('slug, price, price_cents')
    .in('slug', addonSlugs)
  const addonCents = sumCatalogRowsPriceCents(data || [])
  return Math.max(0, paid - addonCents)
}

/**
 * Subtract what the user already paid for modules included in this bundle.
 * Guest quotes are unchanged. Credits never exceed the bundle list price.
 */
export async function applyBundleUpgradeCredit(admin, { userId, quote, courseSlug, purchaseType }) {
  if (!quote || quote.error || !admin || !userId) return quote

  const type = purchaseType === 'ioai_track' ? 'bundle' : quote.purchaseType || purchaseType
  if (type !== 'bundle') return quote

  const targetSlug = String(courseSlug || quote.returnSlug || '').trim()
  if (!targetSlug) return quote

  const included = new Set(await listBundleModuleCatalogSlugs(admin, targetSlug))
  if (!included.size) return quote

  const { data: orders, error } = await admin
    .from('orders')
    .select('id, status, amount_cents, product_name, metadata')
    .eq('user_id', userId)
    .eq('status', 'paid')

  if (error) {
    console.error('[upgrade-credit]', error)
    return quote
  }

  const credits = []
  let rawCredit = 0

  for (const order of orders || []) {
    const meta = orderMeta(order)
    const slug = String(meta.course_slug || '').trim()
    if (!slug || slug === targetSlug) continue
    if (String(meta.purchase_type || '') === 'mall') continue
    if (String(meta.source || '') === 'bundle_upgrade_credit' && slug === targetSlug) continue

    const granted = await orderGrantedModuleSlugs(admin, order)
    if (!granted.length || !granted.every((moduleSlug) => included.has(moduleSlug))) continue

    const amountCents = await moduleCreditAmountCents(admin, order)
    if (amountCents <= 0) continue

    credits.push({
      orderId: order.id,
      slug,
      name: order.product_name || slug,
      amountCents,
    })
    rawCredit += amountCents
  }

  const due = computeUpgradeDueCents(quote.amountCents, rawCredit, quote.currency)
  if (due.creditCents <= 0) {
    return {
      ...quote,
      listAmountCents: quote.amountCents,
      creditCents: 0,
      credits: [],
    }
  }

  return {
    ...quote,
    listAmountCents: quote.amountCents,
    creditCents: due.creditCents,
    credits,
    amountCents: due.amountCents,
    upgrade: true,
  }
}

export async function optionalAuthUser(verifyAuthUser, req) {
  const header = req.headers.authorization || ''
  if (!header.startsWith('Bearer ')) return { ok: false }
  return verifyAuthUser(req)
}

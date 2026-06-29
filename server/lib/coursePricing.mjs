import { IOAI_FULL_BUNDLE_SLUG } from './courseEntitlements.mjs'
import {
  getBundleBySlug,
  getModuleByCatalogSlug,
  isBundlePurchasable,
  isModulePurchasable,
  isStageComboBundleSlug,
  resolveModuleCheckoutPriceCents,
  resolveStageComboBundle,
  validateModuleAddonSlugs,
} from './ioaiCommerce.mjs'
import { parsePriceStringToCents, isStripeCheckoutAmountValid, stripeMinimumAmountError } from './priceUtils.mjs'

export { parsePriceStringToCents } from './priceUtils.mjs'

export function resolveCoursePriceCents(course) {
  if (!course) return null
  if (course.price_cents != null && course.price_cents > 0) return course.price_cents
  return parsePriceStringToCents(course.price)
}

export function isCatalogCoursePurchasable(course, priceCents = resolveCoursePriceCents(course)) {
  if (!course) return false
  if (course.purchasable === false) return false
  if (course.status === 'coming-soon' || course.status === 'offline') return false
  if (course.purchasable === true) return priceCents != null && priceCents > 0
  return priceCents != null && priceCents > 0
}

export async function getCatalogCourseBySlug(admin, slug) {
  if (!admin || !slug?.trim()) return null
  const { data, error } = await admin
    .from('courses_catalog')
    .select('slug, name, status, price, price_cents, currency, purchasable')
    .eq('slug', slug.trim())
    .maybeSingle()
  if (error || !data) return null
  return data
}

function isIoaiLessonSlug(slug) {
  return slug?.startsWith('ioai-') && slug !== IOAI_FULL_BUNDLE_SLUG
}

/** Resolve Stripe line item for checkout */
export async function resolveCheckoutQuote(admin, { courseSlug, purchaseType, course, addonSlugs = [] }) {
  const slug = courseSlug?.trim()
  if (!slug) return { error: 'courseSlug is required' }

  if (purchaseType === 'ioai_track') {
    const bundle = admin ? await getBundleBySlug(admin, IOAI_FULL_BUNDLE_SLUG) : null
    const amountCents = bundle?.price_cents || 299000
    return {
      purchaseType: 'bundle',
      returnSlug: IOAI_FULL_BUNDLE_SLUG,
      amountCents,
      currency: (bundle?.currency || 'usd').toLowerCase(),
      productName: bundle?.title || 'IOAI Full Track',
    }
  }

  if (purchaseType === 'bundle') {
    if (isStageComboBundleSlug(slug)) {
      const combo = admin ? await resolveStageComboBundle(admin, slug) : null
      if (!combo) return { error: 'Bundle not found' }
      if (!isStripeCheckoutAmountValid(combo.priceCents, combo.currency)) {
        return { error: stripeMinimumAmountError(combo.priceCents, combo.currency) }
      }
      return {
        purchaseType: 'bundle',
        returnSlug: combo.slug,
        amountCents: combo.priceCents,
        currency: (combo.currency || 'usd').toLowerCase(),
        productName: combo.title || combo.slug,
      }
    }

    const bundle = admin ? await getBundleBySlug(admin, slug) : null
    if (!bundle) return { error: 'Bundle not found' }
    if (!isBundlePurchasable(bundle)) return { error: 'This bundle is not available for purchase' }
    return {
      purchaseType: 'bundle',
      returnSlug: bundle.slug,
      amountCents: bundle.price_cents,
      currency: (bundle.currency || 'usd').toLowerCase(),
      productName: bundle.title || bundle.slug,
    }
  }

  if (purchaseType === 'module') {
    const mod = admin ? await getModuleByCatalogSlug(admin, slug) : null
    if (!mod) return { error: 'Module not found' }
    const validation = admin ? await validateModuleAddonSlugs(admin, mod.id, addonSlugs) : { ok: true, slugs: [] }
    if (!validation.ok) return { error: validation.error }
    const totalCents = admin
      ? await resolveModuleCheckoutPriceCents(admin, mod, validation.slugs)
      : mod.price_cents
    if (!isModulePurchasable(mod, mod.price_cents ?? 0)) {
      return { error: 'This module is not available for purchase' }
    }
    if (!isStripeCheckoutAmountValid(totalCents, mod.currency)) {
      return { error: stripeMinimumAmountError(totalCents, mod.currency) }
    }
    const addonLabel =
      validation.slugs.length > 0 ? ` (+ ${validation.slugs.length} add-on${validation.slugs.length === 1 ? '' : 's'})` : ''
    return {
      purchaseType: 'module',
      returnSlug: mod.catalog_slug,
      amountCents: totalCents,
      currency: (mod.currency || 'usd').toLowerCase(),
      productName: `${mod.title || mod.catalog_slug}${addonLabel}`,
      addonSlugs: validation.slugs,
    }
  }

  // IOAI lesson checkout disabled — L3 modules only
  if (purchaseType === 'lesson' && isIoaiLessonSlug(slug)) {
    return { error: 'IOAI lessons are sold as modules. Purchase the course unit (L3) instead.' }
  }

  if (!course) {
    return { error: 'Course not found in catalog' }
  }

  const amountCents = resolveCoursePriceCents(course)
  if (!isCatalogCoursePurchasable(course, amountCents)) {
    return { error: 'This course is not available for online purchase' }
  }
  if (!isStripeCheckoutAmountValid(amountCents, course.currency)) {
    return { error: stripeMinimumAmountError(amountCents, course.currency) }
  }

  return {
    purchaseType: 'course',
    returnSlug: slug,
    amountCents,
    currency: (course.currency || 'usd').toLowerCase(),
    productName: course.name || slug,
  }
}

import { IOAI_FULL_BUNDLE_SLUG } from './courseEntitlements.mjs'
import {
  getBundleBySlug,
  getModuleByCatalogSlug,
  isBundlePurchasable,
  isModulePurchasable,
} from './ioaiCommerce.mjs'

const NON_PURCHASABLE_PATTERN =
  /coming\s*soon|quote|contact|included|free|school\s*quote|\/yr|\/\s*session|tbd|upon\s*request|custom/i

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

export function resolveCoursePriceCents(course) {
  if (!course) return null
  if (course.price_cents != null && course.price_cents > 0) return course.price_cents
  return parsePriceStringToCents(course.price)
}

export function isCatalogCoursePurchasable(course, priceCents = resolveCoursePriceCents(course)) {
  if (!course) return false
  if (course.purchasable === false) return false
  if (course.status === 'coming-soon') return false
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
export async function resolveCheckoutQuote(admin, { courseSlug, purchaseType, course }) {
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
    if (!isModulePurchasable(mod)) return { error: 'This module is not available for purchase' }
    return {
      purchaseType: 'module',
      returnSlug: mod.catalog_slug,
      amountCents: mod.price_cents,
      currency: (mod.currency || 'usd').toLowerCase(),
      productName: mod.title || mod.catalog_slug,
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

  return {
    purchaseType: 'course',
    returnSlug: slug,
    amountCents,
    currency: (course.currency || 'usd').toLowerCase(),
    productName: course.name || slug,
  }
}

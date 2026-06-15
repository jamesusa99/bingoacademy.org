/** Client-side course pricing helpers (mirrors server/lib/coursePricing.mjs) */

import { PRICING } from './courseAccess'
import { isIOAILessonId, isIOAITrackId, IOAI_TRACK_ID } from './ioaiCourseStructure'

const NON_PURCHASABLE_PATTERN =
  /coming\s*soon|quote|contact|included|free|school\s*quote|\/yr|\/\s*session|tbd|upon\s*request|custom/i

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

/** Resolve Stripe cents from admin price text and/or cents field (price text wins when parseable). */
export function resolveCatalogPriceCents(price, priceCents) {
  const fromPrice = parsePriceStringToCents(typeof price === 'string' ? price : '')
  if (fromPrice != null) return fromPrice
  if (priceCents === '' || priceCents == null || priceCents === undefined) return null
  const parsed = parseInt(priceCents, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

/** Normalize admin catalog price fields so display price and cents stay aligned. */
export function initialCatalogPriceFields({ price = '', priceCents = null, currency = 'usd' } = {}) {
  const currencyCode = currency || 'usd'
  const fromPrice = parsePriceStringToCents(price)
  const centsNum =
    priceCents !== '' && priceCents != null && priceCents !== undefined ? Number(priceCents) : null
  const hasCents = Number.isFinite(centsNum) && centsNum > 0

  if (fromPrice != null && hasCents && fromPrice !== centsNum) {
    return {
      price: formatPriceFromCents(fromPrice, currencyCode),
      price_cents: fromPrice,
    }
  }
  if (hasCents) {
    return {
      price: formatPriceFromCents(centsNum, currencyCode),
      price_cents: centsNum,
    }
  }
  if (fromPrice != null) {
    return {
      price: formatPriceFromCents(fromPrice, currencyCode),
      price_cents: fromPrice,
    }
  }
  return { price: price || '', price_cents: '' }
}

export function resolveCoursePriceCents(course) {
  if (!course) return null
  if (course.priceCents != null && course.priceCents > 0) return course.priceCents
  return parsePriceStringToCents(course.price)
}

export function formatPriceFromCents(cents, currency = 'USD') {
  if (cents == null) return null
  const dollars = cents / 100
  const formatted =
    dollars >= 1000
      ? dollars.toLocaleString('en-US', { maximumFractionDigits: 0 })
      : dollars % 1 === 0
        ? String(dollars)
        : dollars.toFixed(2)
  return currency.toUpperCase() === 'USD' ? `$${formatted}` : `${formatted} ${currency.toUpperCase()}`
}

export function getCourseDisplayPrice(course) {
  if (!course) return null
  if (course.price && !NON_PURCHASABLE_PATTERN.test(course.price)) return course.price
  const cents = resolveCoursePriceCents(course)
  return cents != null ? formatPriceFromCents(cents, course.currency || 'USD') : course.price || null
}

export function isIoaiCheckoutCourse(courseId) {
  if (!courseId) return false
  return courseId.startsWith('ioai-')
}

/** IOAI L4 lesson pages — Phase 1 sells L3 modules only */
export function isIoaiLessonOnlyCatalog(course) {
  if (!course?.id) return false
  return isIOAILessonId(course.id, null, null)
}

/** Whether Stripe / demo checkout should be offered for this course */
export function isPurchasableCourse(course) {
  if (!course || course.status === 'coming-soon' || course.status === 'offline') return false
  if (isIoaiLessonOnlyCatalog(course)) return false
  if (course.sub === 'module') return true
  if (course.sub === 'bundle') return true
  if (isIoaiCheckoutCourse(course.id) && course.id === IOAI_TRACK_ID) return false
  if (course.purchasable === false) return false
  const cents = resolveCoursePriceCents(course)
  if (course.purchasable === true) return cents != null && cents > 0
  return cents != null && cents > 0
}

export function resolvePurchaseType(course) {
  if (!course?.id) return 'course'
  if (course.purchaseType === 'module' || course.sub === 'module') return 'module'
  if (course.purchaseType === 'bundle' || course.sub === 'bundle') return 'bundle'
  if (isIOAITrackId(course.id)) return 'ioai_track'
  if (isIOAILessonId(course.id)) return 'course'
  return 'course'
}

export function getCheckoutPriceLabel(course, purchaseType) {
  if (purchaseType === 'ioai_track') {
    return `$${PRICING.ioaiTrack.price.toLocaleString()}`
  }
  if (purchaseType === 'lesson') {
    return `$${PRICING.lesson.price}`
  }
  const cents = resolveCoursePriceCents(course)
  return formatPriceFromCents(cents, course?.currency || 'USD') || course?.price || ''
}

import { IOAI_FULL_BUNDLE_SLUG } from './courseEntitlements.mjs'
import {
  getBundleBySlug,
  getModuleByCatalogSlug,
  isBundlePurchasable,
  isModulePurchasable,
  isStageComboBundleSlug,
  listLabMaterialsForModule,
  parseStageComboLevelSlug,
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

const IOAI_STAGE_PACKAGES_ANCHOR = 'stage-packages'

function bundleProductHref(slug) {
  if (!slug) return '/courses/ioai'
  if (slug === IOAI_FULL_BUNDLE_SLUG) {
    return `/courses/ioai?stage=all#${IOAI_STAGE_PACKAGES_ANCHOR}`
  }
  const levelSlug = parseStageComboLevelSlug(slug)
  if (levelSlug) {
    return `/courses/ioai?stage=${encodeURIComponent(levelSlug)}#${IOAI_STAGE_PACKAGES_ANCHOR}`
  }
  return `/courses/ioai#${IOAI_STAGE_PACKAGES_ANCHOR}`
}

function checkoutLineItemHref(kind, slug) {
  if (!slug) return null
  if (kind === 'unit') return `/courses/module/${encodeURIComponent(slug)}`
  if (kind === 'addon') return `/labs/pack/${encodeURIComponent(slug)}`
  if (kind === 'course') return `/courses/detail/${encodeURIComponent(slug)}`
  if (kind === 'bundle') return bundleProductHref(slug)
  return null
}

function checkoutLineItem({ name, amountCents, kind, slug }) {
  return {
    name,
    amountCents,
    kind,
    slug: slug || null,
    href: checkoutLineItemHref(kind, slug),
  }
}

function withDisplayLines(quote, lineItems, extra = {}) {
  if (quote?.error) return quote
  const lines =
    Array.isArray(lineItems) && lineItems.length
      ? lineItems
      : [{ name: quote.productName, amountCents: quote.amountCents, kind: 'item' }]
  return { ...quote, lineItems: lines, ...extra }
}

function catalogRowAmountCents(row) {
  if (row?.price_cents != null && row.price_cents > 0) return row.price_cents
  return parsePriceStringToCents(row?.price) || 0
}

/** Resolve Stripe line item for checkout */
export async function resolveCheckoutQuote(admin, { courseSlug, purchaseType, course, addonSlugs = [] }) {
  const slug = courseSlug?.trim()
  if (!slug) return { error: 'courseSlug is required' }

  if (purchaseType === 'ioai_track') {
    const bundle = admin ? await getBundleBySlug(admin, IOAI_FULL_BUNDLE_SLUG) : null
    const amountCents = bundle?.price_cents || 299000
    const productName = bundle?.title || 'IOAI Full Track'
    return withDisplayLines(
      {
        purchaseType: 'bundle',
        returnSlug: IOAI_FULL_BUNDLE_SLUG,
        amountCents,
        currency: (bundle?.currency || 'usd').toLowerCase(),
        productName,
      },
      [checkoutLineItem({ name: productName, amountCents, kind: 'bundle', slug: IOAI_FULL_BUNDLE_SLUG })],
      { itemLabel: 'Full track', coverUrl: bundle?.cover_url || null }
    )
  }

  if (purchaseType === 'bundle') {
    if (isStageComboBundleSlug(slug)) {
      const combo = admin ? await resolveStageComboBundle(admin, slug) : null
      if (!combo) return { error: 'Bundle not found' }
      if (!isStripeCheckoutAmountValid(combo.priceCents, combo.currency)) {
        return { error: stripeMinimumAmountError(combo.priceCents, combo.currency) }
      }
      const productName = combo.title || combo.slug
      return withDisplayLines(
        {
          purchaseType: 'bundle',
          returnSlug: combo.slug,
          amountCents: combo.priceCents,
          currency: (combo.currency || 'usd').toLowerCase(),
          productName,
        },
        [checkoutLineItem({ name: productName, amountCents: combo.priceCents, kind: 'bundle', slug: combo.slug })],
        { itemLabel: 'Stage bundle', coverUrl: combo.coverUrl || combo.cover_url || null }
      )
    }

    const bundle = admin ? await getBundleBySlug(admin, slug) : null
    if (!bundle) return { error: 'Bundle not found' }
    if (!isBundlePurchasable(bundle)) return { error: 'This bundle is not available for purchase' }
    const productName = bundle.title || bundle.slug
    return withDisplayLines(
      {
        purchaseType: 'bundle',
        returnSlug: bundle.slug,
        amountCents: bundle.price_cents,
        currency: (bundle.currency || 'usd').toLowerCase(),
        productName,
      },
      [checkoutLineItem({ name: productName, amountCents: bundle.price_cents, kind: 'bundle', slug: bundle.slug })],
      { itemLabel: 'Course bundle', coverUrl: bundle.cover_url || null }
    )
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
    const lineItems = [
      checkoutLineItem({
        name: mod.title || mod.catalog_slug,
        amountCents: mod.price_cents ?? 0,
        kind: 'unit',
        slug: mod.catalog_slug,
      }),
    ]
    if (validation.slugs.length && admin) {
      const available = await listLabMaterialsForModule(admin, mod.id)
      const bySlug = new Map(available.map((row) => [row.slug, row]))
      for (const addonSlug of validation.slugs) {
        const row = bySlug.get(addonSlug)
        lineItems.push(
          checkoutLineItem({
            name: row?.name || addonSlug,
            amountCents: catalogRowAmountCents(row),
            kind: 'addon',
            slug: addonSlug,
          })
        )
      }
    }
    return withDisplayLines(
      {
        purchaseType: 'module',
        returnSlug: mod.catalog_slug,
        amountCents: totalCents,
        currency: (mod.currency || 'usd').toLowerCase(),
        productName: `${mod.title || mod.catalog_slug}${addonLabel}`,
        addonSlugs: validation.slugs,
      },
      lineItems,
      { itemLabel: 'Course unit', coverUrl: mod.cover_url || null }
    )
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

  const productName = course.name || slug
  return withDisplayLines(
    {
      purchaseType: 'course',
      returnSlug: slug,
      amountCents,
      currency: (course.currency || 'usd').toLowerCase(),
      productName,
    },
    [checkoutLineItem({ name: productName, amountCents, kind: 'course', slug })],
    { itemLabel: 'Course', coverUrl: course.thumbnail_url || course.cover_url || null }
  )
}

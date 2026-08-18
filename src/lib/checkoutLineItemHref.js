import { IOAI_FULL_BUNDLE_SLUG } from './ioaiAccess'

const IOAI_STAGE_PACKAGES_ANCHOR = 'stage-packages'
const IOAI_STAGE_BUNDLE_PREFIX = 'ioai-stage-'

function bundleProductHref(slug) {
  if (!slug) return '/courses/ioai'
  if (slug === IOAI_FULL_BUNDLE_SLUG) {
    return `/courses/ioai?stage=all#${IOAI_STAGE_PACKAGES_ANCHOR}`
  }
  if (slug.startsWith(IOAI_STAGE_BUNDLE_PREFIX)) {
    const levelSlug = slug.slice(IOAI_STAGE_BUNDLE_PREFIX.length)
    return `/courses/ioai?stage=${encodeURIComponent(levelSlug)}#${IOAI_STAGE_PACKAGES_ANCHOR}`
  }
  return `/courses/ioai#${IOAI_STAGE_PACKAGES_ANCHOR}`
}

/** Resolve product page URL for a checkout line item (client fallback when API omits href). */
export function checkoutLineItemHref(item, { returnSlug, purchaseType, addonSlugs = [], index = 0 } = {}) {
  if (item?.href) return item.href
  const slug = item?.slug || null
  const kind = item?.kind

  if (slug) {
    if (kind === 'unit') return `/courses/module/${encodeURIComponent(slug)}`
    if (kind === 'addon') return `/labs/pack/${encodeURIComponent(slug)}`
    if (kind === 'course') return `/courses/detail/${encodeURIComponent(slug)}`
    if (kind === 'bundle') return bundleProductHref(slug)
  }

  if (kind === 'unit' && returnSlug) return `/courses/module/${encodeURIComponent(returnSlug)}`
  if (kind === 'course' && returnSlug) return `/courses/detail/${encodeURIComponent(returnSlug)}`
  if (kind === 'bundle') return bundleProductHref(returnSlug || IOAI_FULL_BUNDLE_SLUG)
  if (purchaseType === 'module' && returnSlug) return `/courses/module/${encodeURIComponent(returnSlug)}`
  if (purchaseType === 'course' && returnSlug) return `/courses/detail/${encodeURIComponent(returnSlug)}`
  if (purchaseType === 'bundle' || purchaseType === 'ioai_track') {
    return bundleProductHref(returnSlug || IOAI_FULL_BUNDLE_SLUG)
  }
  if (kind === 'addon' && addonSlugs.length) {
    const addonSlug = addonSlugs[index > 0 ? index - 1 : 0]
    if (addonSlug) return `/labs/pack/${encodeURIComponent(addonSlug)}`
  }
  return null
}

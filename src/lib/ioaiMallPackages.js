/** Map storefront course bundle API rows to UI / mall item shape. */
export function mapCourseBundleToDisplayItem(bundle) {
  if (!bundle) return null

  const discountTag =
    bundle.discountPercent != null && bundle.discountPercent > 0
      ? `Save ${bundle.discountPercent}%`
      : null
  const primaryTag = bundle.marketingTags?.[0] || discountTag

  return {
    id: bundle.slug,
    name: bundle.title,
    type: 'ioai_bundle',
    tag: primaryTag || (bundle.isFullTrack ? '🏆 Full track' : '📦 Stage bundle'),
    price: bundle.priceCents / 100,
    priceCents: bundle.priceCents,
    compareAtCents: bundle.compareAtCents,
    listPriceCents: bundle.listPriceCents,
    currency: bundle.currency || 'usd',
    desc:
      bundle.shortDesc ||
      `One purchase unlocks all ${bundle.moduleCount} course unit${bundle.moduleCount === 1 ? '' : 's'} (${bundle.lessonCount} lesson${bundle.lessonCount === 1 ? '' : 's'}).`,
    introHtml: bundle.introHtml || '',
    marketingTags: bundle.marketingTags || [],
    discountPercent: bundle.discountPercent,
    emoji: bundle.emoji,
    ioaiBundleSlug: bundle.slug,
    purchaseType: bundle.purchaseType,
    moduleCount: bundle.moduleCount,
    lessonCount: bundle.lessonCount,
    moduleSlugs: bundle.moduleSlugs || [],
    source: 'ioai_bundle',
    packageId: bundle.packageId,
    isFullTrack: bundle.isFullTrack,
  }
}

export function mapCourseBundlesToDisplayItems(bundles) {
  return (bundles || []).map(mapCourseBundleToDisplayItem).filter(Boolean)
}

export function isIoaiMallBundleItem(item) {
  return item?.source === 'ioai_bundle' || item?.type === 'ioai_bundle'
}

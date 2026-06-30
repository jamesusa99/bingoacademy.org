import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { IOAI_STAGE_PACKAGES, ioaiStagePackageHref } from '../../config/ioaiStagePackages'
import { useProductLineVisibility } from '../../contexts/ProductLineVisibilityContext'
import { findCourseBundleForStage, useIoaiCourseBundles } from '../../hooks/useIoaiCourseBundles'
import { formatIoaiPrice } from '../../lib/ioaiStore'

function buildHomePackageItems(bundles) {
  return IOAI_STAGE_PACKAGES.map((pkg) => {
    const bundle = findCourseBundleForStage(bundles, pkg.id)
    return {
      id: pkg.id,
      href: ioaiStagePackageHref(pkg.id, { autoBuy: false }),
      title: bundle?.title || pkg.title,
      emoji: bundle?.emoji || pkg.emoji,
      coverUrl: bundle?.coverUrl || '',
      moduleCount: bundle?.moduleCount ?? 0,
      lessonCount: bundle?.lessonCount ?? 0,
      priceCents: bundle?.priceCents ?? 0,
      compareAtCents: bundle?.compareAtCents ?? null,
      currency: bundle?.currency || 'usd',
      discountPercent: bundle?.discountPercent ?? 0,
      marketingTags: bundle?.marketingTags || [],
    }
  })
}

function HomeIoaiPackageCard({ pkg }) {
  const hasCover = Boolean(pkg.coverUrl?.trim())
  const price = pkg.priceCents > 0 ? formatIoaiPrice(pkg.priceCents, pkg.currency) : null
  const compare =
    pkg.compareAtCents != null && pkg.compareAtCents > pkg.priceCents
      ? formatIoaiPrice(pkg.compareAtCents, pkg.currency)
      : null
  const promoTag = pkg.marketingTags[0] || (pkg.discountPercent > 0 ? `Save ${pkg.discountPercent}%` : null)

  return (
    <Link
      to={pkg.href}
      className="group flex flex-col w-[168px] sm:w-[200px] shrink-0 rounded-xl overflow-hidden border border-amber-400/35 bg-amber-500/10 hover:bg-amber-500/20 hover:border-amber-300/50 transition shadow-sm hover:shadow-md"
    >
      <div className="relative aspect-[4/3] bg-gradient-to-br from-amber-500/30 to-orange-950/50 flex items-center justify-center overflow-hidden">
        {hasCover ? (
          <img
            src={pkg.coverUrl.trim()}
            alt=""
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <span className="text-4xl" aria-hidden>
            {pkg.emoji}
          </span>
        )}
        {promoTag ? (
          <span className="absolute top-2 left-2 max-w-[calc(100%-1rem)] truncate text-[10px] font-bold bg-rose-500/95 text-white px-2 py-0.5 rounded-full">
            {promoTag}
          </span>
        ) : null}
      </div>
      <div className="p-3 flex flex-col flex-1 gap-1 min-h-[88px]">
        <h3 className="font-semibold text-sm text-amber-50 leading-snug line-clamp-2">{pkg.title}</h3>
        {pkg.moduleCount > 0 ? (
          <p className="text-[10px] text-amber-200/70">
            {pkg.moduleCount} unit{pkg.moduleCount === 1 ? '' : 's'} · {pkg.lessonCount} lesson
            {pkg.lessonCount === 1 ? '' : 's'}
          </p>
        ) : null}
        {price ? (
          <div className="mt-auto pt-1 flex flex-wrap items-baseline gap-x-2 gap-y-0">
            {compare ? <span className="text-[10px] text-amber-200/50 line-through">{compare}</span> : null}
            <span className="text-sm font-bold text-amber-300">{price}</span>
          </div>
        ) : (
          <p className="mt-auto pt-1 text-[10px] text-amber-200/60">View courses →</p>
        )}
      </div>
    </Link>
  )
}

function HomeIoaiPackageCardSkeleton() {
  return (
    <div className="w-[168px] sm:w-[200px] shrink-0 rounded-xl overflow-hidden border border-amber-400/20 bg-amber-500/5 animate-pulse">
      <div className="aspect-[4/3] bg-amber-500/10" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-amber-500/15 rounded w-3/4" />
        <div className="h-3 bg-amber-500/10 rounded w-1/2" />
        <div className="h-4 bg-amber-500/15 rounded w-1/3 mt-2" />
      </div>
    </div>
  )
}

export default function HomeIoaiStagePackages() {
  const { isLineVisible } = useProductLineVisibility()
  const { bundles, loading } = useIoaiCourseBundles()
  const items = useMemo(() => buildHomePackageItems(bundles), [bundles])

  if (!isLineVisible('ioai')) return null

  return (
    <div className="mt-8 sm:mt-10">
      <p className="text-xs font-bold tracking-[0.18em] text-amber-300 uppercase text-center mb-4">
        IOAI Course Packages
      </p>
      <div
        className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none justify-start sm:justify-center"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {loading && !bundles.length
          ? IOAI_STAGE_PACKAGES.map((pkg) => <HomeIoaiPackageCardSkeleton key={pkg.id} />)
          : items.map((pkg) => <HomeIoaiPackageCard key={pkg.id} pkg={pkg} />)}
      </div>
    </div>
  )
}

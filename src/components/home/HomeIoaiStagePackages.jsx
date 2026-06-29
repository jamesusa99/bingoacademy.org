import { Link } from 'react-router-dom'
import { IOAI_STAGE_PACKAGES, ioaiStagePackageHref } from '../../config/ioaiStagePackages'
import { useProductLineVisibility } from '../../contexts/ProductLineVisibilityContext'

export default function HomeIoaiStagePackages() {
  const { isLineVisible } = useProductLineVisibility()
  if (!isLineVisible('ioai')) return null

  return (
    <div className="mt-8 sm:mt-10">
      <p className="text-xs font-bold tracking-[0.18em] text-amber-300 uppercase text-center mb-3">
        IOAI Course Packages
      </p>
      <p className="text-sm text-slate-400 text-center mb-4 max-w-xl mx-auto">
        Buy a full stage bundle — one checkout unlocks every course unit in that track.
      </p>
      <div
        className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none justify-start sm:justify-center"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {IOAI_STAGE_PACKAGES.map((pkg) => (
          <Link
            key={pkg.id}
            to={ioaiStagePackageHref(pkg.id)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shrink-0 min-h-[44px] bg-amber-500/15 border border-amber-400/35 text-amber-100 hover:bg-amber-500/25 hover:border-amber-300/50 transition"
          >
            <span aria-hidden>{pkg.emoji}</span>
            {pkg.title}
          </Link>
        ))}
      </div>
    </div>
  )
}

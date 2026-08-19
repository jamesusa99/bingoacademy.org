/** Tuition pathway & package selection — mounted via HomeTuitionSection (not Hero). */
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { HOME_CURRICULUM_ROADMAP, HOME_TUITION } from '../../config/homePage'
import { IOAI_STAGE_PACKAGES, ioaiStagePackageHref } from '../../config/ioaiStagePackages'
import { useProductLineVisibility } from '../../contexts/ProductLineVisibilityContext'
import { findCourseBundleForStage, useIoaiCourseBundles } from '../../hooks/useIoaiCourseBundles'
import { formatIoaiPrice } from '../../lib/ioaiStore'

const FULL_TRACK_ID = 'all'

const STAGE_PACKAGE_IDS = IOAI_STAGE_PACKAGES.filter((p) => p.id !== FULL_TRACK_ID).map((p) => p.id)

const STAGE_ID_TO_ROADMAP = {
  'ai-explorer': 0,
  'ai-builder': 1,
  'ai-engineer': 2,
  'ai-olympian': 3,
}

function buildTuitionItems(bundles) {
  return IOAI_STAGE_PACKAGES.map((pkg) => {
    const bundle = findCourseBundleForStage(bundles, pkg.id)
    return {
      id: pkg.id,
      href: ioaiStagePackageHref(pkg.id, { autoBuy: false }),
      title: pkg.id === FULL_TRACK_ID ? HOME_TUITION.completeTrack.title : bundle?.title || pkg.title,
      moduleCount: bundle?.moduleCount ?? 0,
      lessonCount: bundle?.lessonCount ?? 0,
      priceCents: bundle?.priceCents ?? 0,
      currency: bundle?.currency || 'usd',
      isFullTrack: pkg.id === FULL_TRACK_ID,
    }
  })
}

function DetailRow({ label, value, highlight = false }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-0.5 sm:gap-4 py-2.5 border-b border-white/10 last:border-0">
      <dt className="text-xs text-slate-400 shrink-0">{label}</dt>
      <dd className={`text-sm text-right sm:text-right ${highlight ? 'font-bold text-cyan-300 text-base' : 'text-slate-200'}`}>
        {value}
      </dd>
    </div>
  )
}

function CompleteTrackCard({ track, loading }) {
  const { completeTrack } = HOME_TUITION
  const { detailLabels } = completeTrack
  const price =
    track?.priceCents > 0 ? formatIoaiPrice(track.priceCents, track.currency) : loading ? '…' : 'View pricing'
  const moduleLabel =
    track?.moduleCount > 0
      ? `${track.moduleCount} module${track.moduleCount === 1 ? '' : 's'} · ${track.lessonCount} lesson${track.lessonCount === 1 ? '' : 's'}`
      : loading
        ? '…'
        : 'See course catalog'

  return (
    <div className="rounded-2xl border-2 border-cyan-400/40 bg-gradient-to-br from-cyan-500/10 to-slate-900/50 p-6 sm:p-8 mb-10">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-cyan-500 text-slate-900">
          {completeTrack.badge}
        </span>
      </div>
      <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">{completeTrack.title}</h3>
      <p className="text-sm text-slate-300 leading-relaxed max-w-2xl mb-6">{completeTrack.description}</p>

      <dl className="rounded-xl border border-white/10 bg-slate-900/40 px-4 sm:px-5 py-1 mb-6 max-w-xl">
        <DetailRow label={detailLabels.stages} value={completeTrack.includedStages} />
        <DetailRow label={detailLabels.modules} value={moduleLabel} />
        <DetailRow label={detailLabels.access} value={completeTrack.accessPeriod} />
        <DetailRow label={detailLabels.feedback} value={completeTrack.feedbackIncluded} />
        <DetailRow label={detailLabels.price} value={price} highlight />
        <DetailRow label={detailLabels.payment} value={completeTrack.paymentOptions} />
      </dl>

      {track?.href ? (
        <Link
          to={track.href}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-900 text-sm font-bold transition min-h-[44px]"
        >
          {completeTrack.cta.label}
          <ArrowRight className="w-4 h-4 shrink-0" aria-hidden />
        </Link>
      ) : null}
    </div>
  )
}

function StageEnrollmentCard({ roadmap, bundle, loading }) {
  const price =
    bundle?.priceCents > 0 ? formatIoaiPrice(bundle.priceCents, bundle.currency) : loading ? '…' : null
  const moduleLabel =
    bundle?.moduleCount > 0
      ? `${bundle.moduleCount} module${bundle.moduleCount === 1 ? '' : 's'}`
      : null

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4 sm:p-5 flex flex-col h-full">
      <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-400/90 mb-1">
        Stage {roadmap.stage}
      </p>
      <h4 className="font-bold text-white text-sm sm:text-base">{roadmap.title}</h4>
      <p className="text-xs text-slate-400 mt-1.5 leading-relaxed flex-1">{roadmap.subtitle}</p>
      {roadmap.topics?.length ? (
        <ul className="mt-3 space-y-1">
          {roadmap.topics.slice(0, 3).map((topic) => (
            <li key={topic} className="flex items-start gap-1.5 text-[11px] text-slate-500">
              <span className="text-slate-600 shrink-0" aria-hidden>
                ·
              </span>
              <span>{topic}</span>
            </li>
          ))}
        </ul>
      ) : null}
      <div className="mt-4 pt-3 border-t border-slate-700/80 flex flex-wrap items-baseline justify-between gap-2">
        {moduleLabel ? <span className="text-[11px] text-slate-500">{moduleLabel}</span> : <span />}
        {price ? <span className="text-sm font-semibold text-amber-300">{price}</span> : null}
      </div>
    </div>
  )
}

function PricingPolicyPanel() {
  const { pricingPolicy } = HOME_TUITION
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-800/30 p-6 sm:p-8">
      <h3 className="text-sm font-bold text-white mb-4">{pricingPolicy.heading}</h3>
      <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
        {pricingPolicy.items.map((item) => (
          <div key={item.q}>
            <dt className="text-xs font-semibold text-cyan-400/90 mb-1">{item.q}</dt>
            <dd className="text-xs text-slate-400 leading-relaxed">
              {item.a}
              {item.href ? (
                <>
                  {' '}
                  <Link to={item.href} className="text-primary hover:underline">
                    View sample rubric →
                  </Link>
                </>
              ) : null}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

function TuitionSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/5 h-64" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-slate-700 bg-slate-800/30 h-48" />
        ))}
      </div>
    </div>
  )
}

export default function HomeIoaiStagePackages() {
  const { isLineVisible } = useProductLineVisibility()
  const { bundles, loading } = useIoaiCourseBundles()
  const items = useMemo(() => buildTuitionItems(bundles), [bundles])
  const fullTrack = items.find((item) => item.isFullTrack)
  const { stageBased } = HOME_TUITION
  const roadmapStages = HOME_CURRICULUM_ROADMAP.stages

  if (!isLineVisible('ioai')) return null

  if (loading && !bundles.length) {
    return <TuitionSkeleton />
  }

  return (
    <div className="max-w-5xl mx-auto">
      <CompleteTrackCard track={fullTrack} loading={loading} />

      <div className="mb-10">
        <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{stageBased.title}</h3>
        <p className="text-sm text-slate-400 leading-relaxed max-w-2xl mb-2">{stageBased.description}</p>
        <p className="text-xs text-amber-300/90 mb-5 flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" aria-hidden />
          <span>{stageBased.placementNote}</span>
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {STAGE_PACKAGE_IDS.map((stageId) => {
            const roadmap = roadmapStages[STAGE_ID_TO_ROADMAP[stageId]]
            const bundle = findCourseBundleForStage(bundles, stageId)
            if (!roadmap) return null
            return (
              <StageEnrollmentCard
                key={stageId}
                roadmap={roadmap}
                bundle={bundle}
                loading={loading}
              />
            )
          })}
        </div>
        <div className="text-center sm:text-left">
          <Link
            to={stageBased.cta.href}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-white/30 hover:border-cyan-400/60 hover:bg-white/5 text-white text-sm font-bold transition min-h-[44px]"
          >
            {stageBased.cta.label}
            <ArrowRight className="w-4 h-4 shrink-0" aria-hidden />
          </Link>
        </div>
      </div>

      <PricingPolicyPanel />
    </div>
  )
}

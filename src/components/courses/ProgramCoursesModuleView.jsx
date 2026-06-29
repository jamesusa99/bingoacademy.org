import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { PRODUCT_LINES } from '../../config/products'
import { VIDEO_COURSE_SUB_BY_LINE } from '../../config/courseListFilters'
import { COURSES_PORTAL } from '../../config/coursesPortal'
import { useIOAIAccess } from '../../hooks/useIOAIStore'
import { useProgramStore } from '../../hooks/useProgramStore'
import { usePurchasedCourses } from '../../hooks/usePurchasedCourses'
import { flattenIoaiModules, formatIoaiPrice, isIoaiModuleComingSoon, isIoaiModulePurchasable, buildStageCombo, isStageComboOwned } from '../../lib/ioaiStore'
import { purchaseIoaiModule, purchaseIoaiBundle } from '../../lib/ioaiPurchase'
import { fetchPaymentsConfig } from '../../lib/checkout'
import { purchaseCourseSlug } from '../../lib/courseAccess'
import { useAuth } from '../../contexts/AuthContext'
import { useProductLineVisibility } from '../../contexts/ProductLineVisibilityContext'
import CoursesHero from './CoursesHero'
import { useCoursesLineHero, buildLineHeroStats } from '../../hooks/useCoursesLineHero'
import PageMeta from '../PageMeta'
import { PAGE_SEO } from '../../config/programs'
import ModuleCoverImage from './ModuleCoverImage'

function buyStageCombo({
  combo,
  stageId,
  stripeCheckout,
  isAuthenticated,
  navigate,
  setCheckoutLoading,
}) {
  if (!combo) return
  const returnPath = `/courses?line=ioai&stage=${encodeURIComponent(stageId)}&buy=1`

  purchaseIoaiBundle({
    bundleSlug: combo.slug,
    stripeCheckout,
    isAuthenticated,
    navigate,
    setCheckoutLoading,
    returnPath,
    onDemoUnlock: {
      bundle: (slug) => {
        purchaseCourseSlug(slug)
        for (const moduleSlug of combo.moduleSlugs) {
          purchaseCourseSlug(moduleSlug)
        }
        window.location.reload()
      },
    },
  })
}

function lineBadgeLabel(lineId) {
  const pl = PRODUCT_LINES.find((p) => p.id === lineId)
  if (!pl) return lineId
  if (lineId === 'ioai') return 'IOAI'
  if (lineId === 'general') return 'Foundations'
  if (lineId === 'k12') return 'K12'
  return pl.name
}

function ModuleCard({ mod, lineId, hasModule, stripeCheckout, isAuthenticated, navigate }) {
  const [loading, setLoading] = useState(false)
  const owned = hasModule(mod.catalogSlug)
  const comingSoon = isIoaiModuleComingSoon(mod)
  const canPurchase = isIoaiModulePurchasable(mod)
  const price = formatIoaiPrice(mod.priceCents ?? mod.totalPriceCents, mod.currency)
  const hasOptionalAddons = !comingSoon && (mod.extrasPriceCents ?? 0) > 0
  const detailPath = `/courses/module/${encodeURIComponent(mod.catalogSlug)}`

  const buy = (e) => {
    e.preventDefault()
    e.stopPropagation()
    purchaseIoaiModule({
      catalogSlug: mod.catalogSlug,
      stripeCheckout,
      isAuthenticated,
      navigate,
      setCheckoutLoading: setLoading,
      onDemoUnlock: {
        module: (slug) => {
          purchaseCourseSlug(slug)
          window.location.reload()
        },
      },
    })
  }

  return (
    <article className="course-card-dark group flex flex-col h-full">
      <Link to={detailPath} className="block relative">
        <div
          className="course-card-dark__thumb bg-gradient-to-br from-amber-500/80 via-orange-600/70 to-amber-950 flex items-center justify-center overflow-hidden"
          aria-hidden
        >
          <ModuleCoverImage
            coverUrl={mod.coverUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      </Link>

      <div className="flex flex-col flex-1 p-4">
        <div className="flex flex-wrap gap-1.5 mb-2">
          <span className="text-[10px] font-semibold text-cyan-400/90 bg-cyan-500/10 px-2 py-0.5 rounded">
            {lineBadgeLabel(lineId)}
          </span>
          <span className="text-[10px] font-semibold text-slate-400 bg-slate-700/50 px-2 py-0.5 rounded">
            {mod.themeTitle}
          </span>
        </div>
        <Link to={detailPath}>
          <h3 className="font-semibold text-white text-sm leading-snug mb-1 group-hover:text-cyan-300 transition">
            {mod.title}
          </h3>
        </Link>
        <p className="text-[10px] text-slate-500 mb-2">
          {mod.levelTitle} · {COURSES_PORTAL.moduleLessonCount(mod.lessonCount)}
        </p>
        <p className="text-xs text-slate-400 leading-relaxed flex-1 mb-4 line-clamp-3">
          {mod.introHtml || COURSES_PORTAL.ioaiModuleCardDesc}
        </p>
        <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-700/80 mt-auto">
          <div>
            <span className="text-lg font-bold text-cyan-400">{price}</span>
            {hasOptionalAddons ? (
              <p className="text-[10px] text-slate-500 mt-0.5">{COURSES_PORTAL.moduleOptionalAddons}</p>
            ) : null}
          </div>
          {owned ? (
            <Link
              to={detailPath}
              className="text-xs font-semibold text-emerald-400 px-3 py-1.5 rounded-lg border border-emerald-500/40"
            >
              {COURSES_PORTAL.moduleUnlocked}
            </Link>
          ) : comingSoon || !canPurchase ? (
            <span className="text-xs font-semibold text-amber-300/90 px-3 py-1.5 rounded-lg border border-amber-500/30">
              {COURSES_PORTAL.comingSoonBadge}
            </span>
          ) : (
            <button
              type="button"
              onClick={buy}
              disabled={loading}
              className="text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-900 px-3 py-1.5 rounded-lg disabled:opacity-60"
            >
              {loading ? '…' : COURSES_PORTAL.buyModuleShort}
            </button>
          )}
        </div>
      </div>
    </article>
  )
}

function StageComboCard({ combo, lineId, hasModule, stripeCheckout, isAuthenticated, navigate }) {
  const [loading, setLoading] = useState(false)
  if (!combo) return null

  const owned = isStageComboOwned(combo, hasModule)
  const price = formatIoaiPrice(combo.priceCents, combo.currency)
  const compare = combo.compareAtCents ? formatIoaiPrice(combo.compareAtCents, combo.currency) : null

  const buy = (e) => {
    e.preventDefault()
    e.stopPropagation()
    buyStageCombo({
      combo,
      stageId: combo.stageId,
      stripeCheckout,
      isAuthenticated,
      navigate,
      setCheckoutLoading: setLoading,
    })
  }

  return (
    <article className="course-card-dark group flex flex-col h-full ring-2 ring-amber-500/40 bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-900">
      <div className="relative p-4 pb-0">
        <div
          className="course-card-dark__thumb bg-gradient-to-br from-amber-500/90 via-orange-600/80 to-amber-950 flex items-center justify-center overflow-hidden min-h-[120px] rounded-lg"
          aria-hidden
        >
          <span className="text-4xl">{combo.isFullTrack ? '🏆' : '📦'}</span>
        </div>
      </div>

      <div className="flex flex-col flex-1 p-4">
        <div className="flex flex-wrap gap-1.5 mb-2">
          <span className="text-[10px] font-semibold text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded">
            {COURSES_PORTAL.stageComboBadge}
          </span>
          <span className="text-[10px] font-semibold text-cyan-400/90 bg-cyan-500/10 px-2 py-0.5 rounded">
            {lineBadgeLabel(lineId)}
          </span>
        </div>
        <h3 className="font-semibold text-white text-sm leading-snug mb-1">{combo.title}</h3>
        <p className="text-[10px] text-slate-500 mb-2">
          {COURSES_PORTAL.stageComboDesc(combo.moduleCount, combo.lessonCount)}
        </p>
        {combo.introHtml ? (
          <p className="text-xs text-slate-400 leading-relaxed flex-1 mb-4 line-clamp-2">{combo.introHtml}</p>
        ) : (
          <div className="flex-1 mb-4" />
        )}
        <div className="flex items-center justify-between gap-2 pt-3 border-t border-amber-500/20 mt-auto">
          <div>
            {compare ? <p className="text-[10px] text-slate-500 line-through">{compare}</p> : null}
            <span className="text-lg font-bold text-amber-300">{price}</span>
          </div>
          {owned ? (
            <span className="text-xs font-semibold text-emerald-400 px-3 py-1.5 rounded-lg border border-emerald-500/40">
              {COURSES_PORTAL.stageComboOwned}
            </span>
          ) : (
            <button
              type="button"
              onClick={buy}
              disabled={loading}
              className="text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-900 px-3 py-1.5 rounded-lg disabled:opacity-60"
            >
              {loading ? '…' : combo.isFullTrack ? COURSES_PORTAL.buyFullTrack : COURSES_PORTAL.buyStageCombo}
            </button>
          )}
        </div>
      </div>
    </article>
  )
}

export default function ProgramCoursesModuleView({ line }) {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { isAuthenticated } = useAuth()
  const { visibleProductLines } = useProductLineVisibility()
  const lineId = line.id
  const { hero } = useCoursesLineHero(lineId)
  const { levels, fullBundle, loading, error } = useProgramStore(lineId)
  const ioaiAccess = useIOAIAccess()
  const purchase = usePurchasedCourses()
  const [stripeCheckout, setStripeCheckout] = useState(false)
  const stageParam = searchParams.get('stage')
  const shouldAutoBuy = searchParams.get('buy') === '1'
  const [stageFilter, setStageFilter] = useState(stageParam || 'all')
  const autoBuyStarted = useRef(false)

  useEffect(() => {
    fetchPaymentsConfig()
      .then((c) => setStripeCheckout(Boolean(c.stripeCheckout)))
      .catch(() => setStripeCheckout(false))
  }, [])

  const hasModule = useMemo(() => {
    if (lineId === 'ioai') return ioaiAccess.hasModule
    return (catalogSlug) => purchase.hasAccess?.(catalogSlug)
  }, [lineId, ioaiAccess.hasModule, purchase.hasAccess])

  const modules = useMemo(() => flattenIoaiModules(levels), [levels])

  const stages = useMemo(() => {
    const seen = new Map()
    for (const m of modules) {
      if (!seen.has(m.levelId)) seen.set(m.levelId, m.levelTitle)
    }
    return [...seen.entries()].map(([id, title]) => ({ id, title }))
  }, [modules])

  const visible = useMemo(() => {
    if (stageFilter === 'all') return modules
    return modules.filter((m) => m.levelId === stageFilter)
  }, [modules, stageFilter])

  const stageCombo = useMemo(() => {
    const combo = buildStageCombo({ stageFilter, modules, stages, fullBundle })
    return combo ? { ...combo, stageId: stageFilter } : null
  }, [stageFilter, modules, stages, fullBundle])

  useEffect(() => {
    if (!stageParam) return
    if (stageParam === 'all' || stages.some((stage) => stage.id === stageParam)) {
      setStageFilter(stageParam)
    }
  }, [stageParam, stages])

  const selectStage = (stageId) => {
    setStageFilter(stageId)
    const next = new URLSearchParams(searchParams)
    next.set('line', lineId)
    next.set('stage', stageId)
    next.delete('buy')
    setSearchParams(next, { replace: true })
  }

  useEffect(() => {
    if (!shouldAutoBuy || autoBuyStarted.current || loading || lineId !== 'ioai') return

    if (!stageCombo || isStageComboOwned(stageCombo, hasModule)) {
      const next = new URLSearchParams(searchParams)
      next.delete('buy')
      setSearchParams(next, { replace: true })
      return
    }

    autoBuyStarted.current = true
    buyStageCombo({
      combo: stageCombo,
      stageId: stageFilter,
      stripeCheckout,
      isAuthenticated,
      navigate,
    })

    if (isAuthenticated) {
      const next = new URLSearchParams(searchParams)
      next.delete('buy')
      setSearchParams(next, { replace: true })
    }
  }, [
    shouldAutoBuy,
    loading,
    lineId,
    stageCombo,
    hasModule,
    stageFilter,
    stripeCheckout,
    isAuthenticated,
    navigate,
    searchParams,
    setSearchParams,
  ])

  const heroStats = useMemo(
    () => buildLineHeroStats(modules.length, hero),
    [modules.length, hero]
  )

  const videoSubId = VIDEO_COURSE_SUB_BY_LINE[lineId]

  return (
    <div className="w-full">
      <PageMeta title={PAGE_SEO.courses.title} description={PAGE_SEO.courses.description} />
      <div className="courses-page-dark min-h-[60vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <nav className="flex flex-wrap gap-2 mb-4 text-xs" aria-label="Breadcrumb">
            <Link to="/courses" className="text-slate-400 hover:text-white transition">
              {COURSES_PORTAL.backToCourses}
            </Link>
            <span className="text-slate-600">/</span>
            <span className="text-cyan-400 font-medium">{line.name}</span>
          </nav>

          <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-none">
            {visibleProductLines.map((pl) => (
              <Link
                key={pl.id}
                to={`/courses?line=${pl.id}`}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition shrink-0 min-h-[44px] inline-flex items-center ${
                  lineId === pl.id
                    ? 'bg-cyan-500 text-white shadow'
                    : 'bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-500'
                }`}
              >
                {pl.icon} {pl.name}
              </Link>
            ))}
          </div>

          <CoursesHero
            title={`${line.icon} ${line.name} · ${hero.modulesTitle}`}
            subtitle={hero.modulesSubtitle}
            stats={heroStats}
          />

          <div className="flex flex-wrap gap-2 mb-6">
            <button
              type="button"
              onClick={() => selectStage('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                stageFilter === 'all' ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-300 border border-slate-700'
              }`}
            >
              {COURSES_PORTAL.allStages}
            </button>
            {stages.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => selectStage(s.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  stageFilter === s.id ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-300 border border-slate-700'
                }`}
              >
                {s.title}
              </button>
            ))}
          </div>

          {loading ? (
            <p className="text-sm text-slate-400 py-12 text-center">{COURSES_PORTAL.loadingModules}</p>
          ) : error ? (
            <p className="text-sm text-red-400 py-8">{error}</p>
          ) : visible.length === 0 ? (
            <p className="text-sm text-slate-400 py-12 text-center">{COURSES_PORTAL.emptyIoaiModules}</p>
          ) : (
            <>
              <p className="text-sm text-slate-400 mb-4">
                {COURSES_PORTAL.ioaiModuleCount(visible.length)}
              </p>
              <div className="course-grid-dark">
                {lineId === 'ioai' && stageCombo ? (
                  <StageComboCard
                    combo={stageCombo}
                    lineId={lineId}
                    hasModule={hasModule}
                    stripeCheckout={stripeCheckout}
                    isAuthenticated={isAuthenticated}
                    navigate={navigate}
                  />
                ) : null}
                {visible.map((mod) => (
                  <ModuleCard
                    key={mod.catalogSlug}
                    mod={mod}
                    lineId={lineId}
                    hasModule={hasModule}
                    stripeCheckout={stripeCheckout}
                    isAuthenticated={isAuthenticated}
                    navigate={navigate}
                  />
                ))}
              </div>
            </>
          )}

          {videoSubId ? (
            <p className="text-xs text-slate-500 mt-8">
              {lineId === 'ioai' ? COURSES_PORTAL.ioaiLegacyNote : COURSES_PORTAL.legacyCatalogNote}{' '}
              <Link to={`/courses?line=${lineId}&sub=${videoSubId}`} className="text-cyan-400 hover:underline">
                {COURSES_PORTAL.videoCoursesChip}
              </Link>
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}

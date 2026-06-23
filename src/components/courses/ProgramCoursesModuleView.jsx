import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PRODUCT_LINES } from '../../config/products'
import { VIDEO_COURSE_SUB_BY_LINE } from '../../config/courseListFilters'
import { COURSES_PORTAL } from '../../config/coursesPortal'
import { useIOAIAccess } from '../../hooks/useIOAIStore'
import { useProgramStore } from '../../hooks/useProgramStore'
import { usePurchasedCourses } from '../../hooks/usePurchasedCourses'
import { flattenIoaiModules, formatIoaiPrice, isIoaiModuleComingSoon, isIoaiModulePurchasable } from '../../lib/ioaiStore'
import { purchaseIoaiModule } from '../../lib/ioaiPurchase'
import { fetchPaymentsConfig } from '../../lib/checkout'
import { purchaseCourseSlug } from '../../lib/courseAccess'
import { useAuth } from '../../contexts/AuthContext'
import { useProductLineVisibility } from '../../contexts/ProductLineVisibilityContext'
import CoursesHero from './CoursesHero'
import { useCoursesLineHero, buildLineHeroStats } from '../../hooks/useCoursesLineHero'
import PageMeta from '../PageMeta'
import { PAGE_SEO } from '../../config/programs'
import ModuleCoverImage from './ModuleCoverImage'

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

export default function ProgramCoursesModuleView({ line }) {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { visibleProductLines } = useProductLineVisibility()
  const lineId = line.id
  const { hero } = useCoursesLineHero(lineId)
  const { levels, fullBundle, loading, error } = useProgramStore(lineId)
  const ioaiAccess = useIOAIAccess()
  const purchase = usePurchasedCourses()
  const [stripeCheckout, setStripeCheckout] = useState(false)
  const [stageFilter, setStageFilter] = useState('all')

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

          {lineId === 'ioai' && fullBundle?.price_cents ? (
            <section className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-amber-300 uppercase tracking-wide">{COURSES_PORTAL.fullTrack}</p>
                <p className="text-sm text-slate-300">{fullBundle.title || 'IOAI Full Track'}</p>
              </div>
              <Link to="/ioai" className="text-xs font-semibold text-amber-200 hover:underline">
                {COURSES_PORTAL.viewFullTrack} →
              </Link>
            </section>
          ) : null}

          <div className="flex flex-wrap gap-2 mb-6">
            <button
              type="button"
              onClick={() => setStageFilter('all')}
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
                onClick={() => setStageFilter(s.id)}
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

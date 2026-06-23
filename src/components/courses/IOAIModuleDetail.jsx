import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Award, Clock, Headphones, ShieldCheck, Video } from 'lucide-react'
import PageContent from '../PageContent'
import PageMeta from '../PageMeta'
import { useAuth } from '../../contexts/AuthContext'
import { useIOAIAccess } from '../../hooks/useIOAIStore'
import { useProgramStore } from '../../hooks/useProgramStore'
import { usePurchasedCourses } from '../../hooks/usePurchasedCourses'
import { buildLessonModuleMap, findModule, fetchIoaiModule, formatIoaiPrice, isIoaiModuleComingSoon, isIoaiModulePurchasable, mapDetailToFoundContext, mapDetailToStoreModule, resolveLessonCatalogSlug } from '../../lib/ioaiStore'
import { isPurchasableCourse } from '../../lib/coursePricing'
import { purchaseIoaiModule } from '../../lib/ioaiPurchase'
import { fetchPaymentsConfig, confirmCheckoutSession } from '../../lib/checkout'
import { purchaseCourseSlug } from '../../lib/courseAccess'
import { COURSES_PORTAL } from '../../config/coursesPortal'
import { IOAI_MODULE_PREVIEW_SECONDS } from '../../config/ioaiPreview'
import { labMaterialTypeLabel } from '../../config/labMaterials'
import IOAIModuleHeroVideo from './IOAIModuleHeroVideo'
import IOAIModuleInfoCards, { buildModuleInfoContent } from './IOAIModuleInfoCards'
import IOAIModuleLessonList from './IOAIModuleLessonList'
import ModuleTestSection from './ModuleTestSection'
import { studyLessonPath } from '../../lib/studyPaths'

const LESSON_DURATION_MINUTES = 14

/**
 * L3 module detail: purchase unit + optional lab add-ons + L4 lessons.
 * @param {{ catalogSlug: string, backHref?: string, backLabel?: string, studyMode?: boolean }} props
 */
export default function IOAIModuleDetail({
  catalogSlug,
  backHref = '/courses?line=ioai',
  backLabel = COURSES_PORTAL.backToCourses,
  studyMode = false,
}) {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [productLine, setProductLine] = useState('ioai')
  const { levels, loading: storeLoading } = useProgramStore(productLine)
  const { hasModule: hasIoaiModule, moduleSlugs, enrolledSlugs, loading: accessLoading, reload: reloadAccess } =
    useIOAIAccess()
  const purchase = usePurchasedCourses()
  const { isAuthenticated } = useAuth()
  const [stripeCheckout, setStripeCheckout] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(true)
  const [selectedAddons, setSelectedAddons] = useState(() => new Set())

  useEffect(() => {
    fetchPaymentsConfig()
      .then((c) => setStripeCheckout(Boolean(c.stripeCheckout)))
      .catch(() => setStripeCheckout(false))
  }, [])

  useEffect(() => {
    const checkout = searchParams.get('checkout')
    const sessionId = searchParams.get('session_id')
    if (checkout !== 'success' || !sessionId) return

    confirmCheckoutSession(sessionId)
      .then(() => reloadAccess())
      .catch(() => {})
      .finally(() => {
        setSearchParams(
          (prev) => {
            const next = new URLSearchParams(prev)
            next.delete('checkout')
            next.delete('session_id')
            return next
          },
          { replace: true }
        )
      })
  }, [searchParams, setSearchParams, reloadAccess])

  useEffect(() => {
    let cancelled = false
    setDetailLoading(true)
    setSelectedAddons(new Set())
    fetchIoaiModule(catalogSlug)
      .then((mod) => {
        if (!cancelled) {
          setDetail(mod)
          const line = mod?.theme?.level?.product_line
          if (line) setProductLine(line)
        }
      })
      .catch(() => {
        if (!cancelled) setDetail(null)
      })
      .finally(() => {
        if (!cancelled) setDetailLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [catalogSlug])

  const storeMatch = useMemo(() => findModule(levels, catalogSlug), [levels, catalogSlug])
  const mod = useMemo(
    () => storeMatch?.module ?? mapDetailToStoreModule(detail),
    [storeMatch, detail]
  )
  const found = useMemo(
    () => storeMatch ?? mapDetailToFoundContext(detail),
    [storeMatch, detail]
  )
  const lessonModuleMap = useMemo(() => buildLessonModuleMap(levels), [levels])
  const accessSlugs = useMemo(() => {
    if (productLine === 'ioai') return enrolledSlugs
    return purchase.enrollmentSlugs || []
  }, [productLine, enrolledSlugs, purchase.enrollmentSlugs])
  const owned =
    productLine === 'ioai'
      ? hasIoaiModule(catalogSlug)
      : Boolean(purchase.hasAccess?.(catalogSlug))
  const comingSoon = isIoaiModuleComingSoon(mod ?? detail)
  const canPurchase = isIoaiModulePurchasable(mod ?? detail) && !owned

  const lessons = useMemo(() => {
    const mapLesson = (lesson, fromApi = false) => {
      const catalogSlug = resolveLessonCatalogSlug(lesson)
      return {
        id: catalogSlug,
        catalogSlug,
        title: lesson.title,
        intro: lesson.intro || '',
        trialEnabled: Boolean(fromApi ? lesson.trial_enabled : lesson.trialEnabled),
        sortOrder: lesson.sort_order ?? lesson.sortOrder ?? 0,
        cloudflareVideoId:
          lesson.cloudflare_video_id || lesson.cloudflareVideoId || null,
        contentGoals: lesson.content_goals || lesson.contentGoals || '',
        knowledgePoints: lesson.knowledge_points || lesson.knowledgePoints || '',
        previewSeconds: IOAI_MODULE_PREVIEW_SECONDS,
      }
    }

    const apiLessons = (detail?.lessons || [])
      .filter((l) => l.status !== 'hidden' && l.status !== 'draft')
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .map((l) => mapLesson(l, true))

    if (apiLessons.length) return apiLessons

    return (mod?.lessons || []).map((l) => mapLesson(l, false))
  }, [mod?.lessons, detail?.lessons])

  const heroLesson = useMemo(() => {
    return lessons.find((l) => l.cloudflareVideoId) || null
  }, [lessons])

  const baseCents = comingSoon
    ? null
    : mod?.priceCents ?? detail?.price_cents ?? null
  const labMaterials = detail?.labMaterials || []
  const currency = mod?.currency || detail?.currency || 'usd'

  const selectedAddonSlugs = useMemo(() => [...selectedAddons], [selectedAddons])

  const selectedExtrasCents = useMemo(
    () =>
      comingSoon
        ? 0
        : labMaterials.reduce((sum, item) => {
            if (!selectedAddons.has(item.slug)) return sum
            return sum + (item.priceCents || 0)
          }, 0),
    [comingSoon, labMaterials, selectedAddons]
  )

  const totalCents = !comingSoon && baseCents != null ? baseCents + selectedExtrasCents : null
  const price = formatIoaiPrice(totalCents, currency)
  const compare =
    !comingSoon && mod?.compareAtCents
      ? formatIoaiPrice(mod.compareAtCents, mod.currency)
      : !comingSoon && detail?.compare_at_cents
        ? formatIoaiPrice(detail.compare_at_cents, detail?.currency)
        : null
  const availableExtrasCents = comingSoon
    ? 0
    : labMaterials.reduce((sum, item) => sum + (item.priceCents || 0), 0)

  const moduleInfo = useMemo(
    () => buildModuleInfoContent({ mod, detail }),
    [mod, detail]
  )

  const totalMinutes = lessons.length * LESSON_DURATION_MINUTES
  const categoryLabel = found?.theme?.categoryLabel || found?.theme?.title || ''
  const levelLabel = found?.level?.title || COURSES_PORTAL.moduleLevelBeginner
  const subtitle =
    mod?.summary ||
    detail?.summary ||
    moduleInfo.intro ||
    COURSES_PORTAL.ioaiModuleCardDesc

  const toggleAddon = (slug) => {
    setSelectedAddons((prev) => {
      const next = new Set(prev)
      if (next.has(slug)) next.delete(slug)
      else next.add(slug)
      return next
    })
  }

  const buy = () => {
    purchaseIoaiModule({
      catalogSlug,
      addonSlugs: selectedAddonSlugs,
      stripeCheckout,
      isAuthenticated,
      navigate,
      setCheckoutLoading,
      onDemoUnlock: {
        module: (slug, addons = []) => {
          purchaseCourseSlug(slug)
          for (const addon of addons) purchaseCourseSlug(addon)
          window.location.reload()
        },
      },
    })
  }

  const firstWatchableLesson = lessons.find((l) => l.cloudflareVideoId)

  if (storeLoading || detailLoading) {
    return (
      <PageContent className="py-12">
        <p className="text-sm text-slate-500">{COURSES_PORTAL.loadingModules}</p>
      </PageContent>
    )
  }

  if (!mod) {
    return (
      <PageContent className="py-12">
        <p className="text-sm text-slate-600">{COURSES_PORTAL.moduleNotFound}</p>
        <Link to={backHref} className="text-primary text-sm mt-2 inline-block">
          ← {backLabel}
        </Link>
      </PageContent>
    )
  }

  return (
    <div className="w-full">
      <PageMeta title={`${mod.title} · ${productLine === 'ioai' ? 'IOAI' : productLine === 'k12' ? 'K12' : 'Foundations'}`} />
      <PageContent className="py-8 max-w-6xl mx-auto">
        <Link to={backHref} className="text-sm text-primary hover:underline inline-flex items-center gap-1">
          ← {backLabel}
        </Link>

        {/* Hero */}
        <header className="mt-6 mb-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-10 items-start">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                {found?.level?.emoji ? `${found.level.emoji} ` : ''}{categoryLabel}
              </span>

              <h1 className="text-3xl sm:text-4xl font-bold text-bingo-dark mt-4 tracking-tight">
                {mod.title}
              </h1>

              <p className="text-base text-slate-600 mt-3 leading-relaxed max-w-xl">{subtitle}</p>

              <div className="flex flex-wrap items-center gap-4 mt-5 text-sm text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <Video className="w-4 h-4 text-primary" aria-hidden />
                  {COURSES_PORTAL.moduleLessonCount(lessons.length || 0)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden />
                  {levelLabel}
                </span>
                {lessons.length > 0 ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-primary" aria-hidden />
                    {COURSES_PORTAL.moduleTotalDuration(totalMinutes)}
                  </span>
                ) : null}
              </div>

              <div className="mt-6 pt-6 border-t border-slate-200">
                <div className="flex flex-wrap items-end gap-3">
                  {compare ? (
                    <span className="text-base text-slate-400 line-through pb-1">{compare}</span>
                  ) : null}
                  <span className="text-3xl font-bold text-primary">{price}</span>
                  {!comingSoon && availableExtrasCents > 0 && selectedExtrasCents === 0 ? (
                    <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-1 rounded-full mb-1">
                      {COURSES_PORTAL.moduleOptionalAddons}
                    </span>
                  ) : null}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  {owned ? (
                    <>
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full">
                        {COURSES_PORTAL.moduleUnlocked}
                      </span>
                      {firstWatchableLesson ? (
                        <Link
                          to={
                            studyMode
                              ? studyLessonPath(firstWatchableLesson.id, { play: true })
                              : `/courses/detail/${encodeURIComponent(firstWatchableLesson.id)}?from=ioai&play=1`
                          }
                          className="text-sm font-semibold text-primary hover:underline"
                        >
                          {COURSES_PORTAL.moduleContinueLesson} →
                        </Link>
                      ) : null}
                    </>
                  ) : comingSoon ? (
                    <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full">
                      {COURSES_PORTAL.comingSoonBadge}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={buy}
                      disabled={checkoutLoading || accessLoading || !canPurchase}
                      className="btn-primary text-sm px-6 py-2.5 disabled:opacity-60"
                    >
                      {checkoutLoading ? COURSES_PORTAL.redirecting : COURSES_PORTAL.buyModule(price)}
                    </button>
                  )}
                </div>

                {comingSoon ? (
                  <p className="text-xs text-amber-700 mt-3">{COURSES_PORTAL.moduleComingSoonHint}</p>
                ) : null}

                {!comingSoon && baseCents != null ? (
                  <p className="text-xs text-slate-500 mt-3">
                    {COURSES_PORTAL.moduleBasePrice}: {formatIoaiPrice(baseCents, currency)}
                    {availableExtrasCents > 0
                      ? ` · ${COURSES_PORTAL.moduleSelectAddonsFootnote}`
                      : null}
                  </p>
                ) : null}
              </div>
            </div>

            <IOAIModuleHeroVideo
              lesson={heroLesson}
              owned={owned}
              coverUrl={mod?.coverUrl || detail?.cover_url}
              moduleTitle={mod.title}
              onBuy={buy}
              checkoutLoading={checkoutLoading}
              canPurchase={canPurchase}
            />
          </div>
        </header>

        <IOAIModuleInfoCards
          intro={moduleInfo.intro}
          objectives={moduleInfo.objectives}
          outcomes={moduleInfo.outcomes}
        />

        <IOAIModuleLessonList
          lessons={lessons}
          owned={owned}
          moduleSlugs={productLine === 'ioai' ? moduleSlugs : []}
          enrolledSlugs={accessSlugs}
          lessonModuleMap={lessonModuleMap}
          price={price}
          onBuy={buy}
          checkoutLoading={checkoutLoading}
          accessLoading={accessLoading}
          canPurchase={canPurchase}
          comingSoon={comingSoon}
          studyMode={studyMode}
        />

        <ModuleTestSection
          moduleRef={catalogSlug}
          owned={owned}
          lessonIds={lessons.map((l) => l.catalogSlug)}
        />

        {labMaterials.length > 0 ? (
          <section className="mb-8">
            <h2 className="text-lg font-bold text-bingo-dark mb-1">{COURSES_PORTAL.moduleLabsHeading}</h2>
            <p className="text-sm text-slate-500 mb-4">{COURSES_PORTAL.moduleLabsDesc}</p>
            <ul className="space-y-3">
              {labMaterials.map((item) => {
                const addonOwned = accessSlugs.includes(item.slug)
                const selected = selectedAddons.has(item.slug)
                const itemPrice =
                  item.priceCents != null
                    ? formatIoaiPrice(item.priceCents, item.currency || currency)
                    : item.price || null
                const standalonePurchasable = isPurchasableCourse({
                  id: item.slug,
                  status: 'live',
                  price: item.price,
                  price_cents: item.priceCents,
                  purchasable: item.purchasable,
                })
                const labPackHref = `/labs/pack/${encodeURIComponent(item.slug)}`
                return (
                  <li key={item.slug} className="card p-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex gap-3 min-w-0 flex-1 items-start">
                      {!owned && !comingSoon && item.priceCents ? (
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleAddon(item.slug)}
                          aria-label={`Add ${item.name} to purchase`}
                          className="mt-1 rounded border-slate-300 text-primary focus:ring-primary/30 shrink-0"
                        />
                      ) : null}
                      <Link to={labPackHref} className="shrink-0 rounded-lg hover:opacity-90 transition">
                        {item.thumbnailUrl ? (
                          <img
                            src={item.thumbnailUrl}
                            alt=""
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <span className="w-12 h-12 rounded-lg bg-primary/10 text-primary text-lg flex items-center justify-center">
                            📦
                          </span>
                        )}
                      </Link>
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                          {labMaterialTypeLabel(item.sub, 'ioai')}
                        </p>
                        <Link
                          to={labPackHref}
                          className="font-medium text-sm text-bingo-dark hover:text-primary hover:underline"
                        >
                          {item.name}
                        </Link>
                        {item.description ? (
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{item.description}</p>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      {itemPrice && !comingSoon ? (
                        <span className="text-sm font-semibold text-primary">{itemPrice}</span>
                      ) : comingSoon ? (
                        <span className="text-sm font-semibold text-slate-400">—</span>
                      ) : null}
                      {addonOwned ? (
                        <Link
                          to={labPackHref}
                          className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full hover:bg-emerald-100 transition"
                        >
                          Purchased
                        </Link>
                      ) : comingSoon ? (
                        <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                          {COURSES_PORTAL.comingSoonBadge}
                        </span>
                      ) : standalonePurchasable ? (
                        <Link
                          to={labPackHref}
                          className="text-[10px] font-semibold text-primary hover:underline"
                        >
                          {COURSES_PORTAL.moduleLabBuySeparately}
                        </Link>
                      ) : (
                        <Link
                          to={labPackHref}
                          className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full hover:bg-primary/20 transition"
                        >
                          {COURSES_PORTAL.moduleLabIncluded}
                        </Link>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          </section>
        ) : null}

        {/* Trust signals */}
        <footer className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-200">
          {[
            { icon: ShieldCheck, label: COURSES_PORTAL.moduleTrustGuarantee },
            { icon: Clock, label: COURSES_PORTAL.moduleTrustLifetime },
            { icon: Award, label: COURSES_PORTAL.moduleTrustCertificate },
            { icon: Headphones, label: COURSES_PORTAL.moduleTrustSupport },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center text-center gap-2 py-3">
              <Icon className="w-5 h-5 text-primary" aria-hidden />
              <span className="text-xs text-slate-600 leading-snug">{label}</span>
            </div>
          ))}
        </footer>
      </PageContent>
    </div>
  )
}

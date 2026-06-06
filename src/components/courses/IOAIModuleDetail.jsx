import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PageContent from '../PageContent'
import PageMeta from '../PageMeta'
import { useAuth } from '../../contexts/AuthContext'
import { useIOAIAccess, useIOAIStore } from '../../hooks/useIOAIStore'
import { buildLessonModuleMap, findModule, formatIoaiPrice } from '../../lib/ioaiStore'
import { hasIoaiLessonAccess } from '../../lib/ioaiAccess'
import { purchaseIoaiModule } from '../../lib/ioaiPurchase'
import { fetchPaymentsConfig } from '../../lib/checkout'
import { purchaseCourseSlug } from '../../lib/courseAccess'
import { COURSES_PORTAL } from '../../config/coursesPortal'

/**
 * L3 module detail: purchase unit + list of L4 lessons.
 * @param {{ catalogSlug: string, backHref?: string, backLabel?: string }} props
 */
export default function IOAIModuleDetail({
  catalogSlug,
  backHref = '/courses?line=ioai',
  backLabel = COURSES_PORTAL.backToCourses,
}) {
  const navigate = useNavigate()
  const { levels, loading: storeLoading } = useIOAIStore()
  const { moduleSlugs, enrolledSlugs, hasModule, loading: accessLoading } = useIOAIAccess()
  const { isAuthenticated } = useAuth()
  const [stripeCheckout, setStripeCheckout] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)

  useEffect(() => {
    fetchPaymentsConfig()
      .then((c) => setStripeCheckout(Boolean(c.stripeCheckout)))
      .catch(() => setStripeCheckout(false))
  }, [])

  const found = useMemo(() => findModule(levels, catalogSlug), [levels, catalogSlug])
  const lessonModuleMap = useMemo(() => buildLessonModuleMap(levels), [levels])
  const owned = hasModule(catalogSlug)

  const mod = found?.module
  const price = mod ? formatIoaiPrice(mod.priceCents, mod.currency) : null
  const compare = mod?.compareAtCents ? formatIoaiPrice(mod.compareAtCents, mod.currency) : null

  const buy = () => {
    purchaseIoaiModule({
      catalogSlug,
      stripeCheckout,
      isAuthenticated,
      navigate,
      setCheckoutLoading,
      onDemoUnlock: {
        module: (slug) => {
          purchaseCourseSlug(slug)
          window.location.reload()
        },
      },
    })
  }

  if (storeLoading) {
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
      <PageMeta title={`${mod.title} · IOAI`} />
      <PageContent className="py-8">
        <Link to={backHref} className="text-xs text-primary hover:underline">
          ← {backLabel}
        </Link>

        <header className="mt-4 mb-6 card p-6">
          <p className="text-[10px] uppercase tracking-wide text-slate-500">
            {found.level.emoji} {found.level.title} · {found.theme.categoryLabel || found.theme.title}
          </p>
          <h1 className="text-2xl font-bold text-bingo-dark mt-1">{mod.title}</h1>
          {mod.introHtml ? <p className="text-sm text-slate-600 mt-3 max-w-2xl">{mod.introHtml}</p> : null}
          <p className="text-xs text-slate-500 mt-2">
            {COURSES_PORTAL.moduleLessonCount(mod.lessons?.length || 0)}
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-4">
            {compare ? <span className="text-sm text-slate-400 line-through">{compare}</span> : null}
            <span className="text-xl font-bold text-primary">{price}</span>
            {owned ? (
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                {COURSES_PORTAL.moduleUnlocked}
              </span>
            ) : (
              <button
                type="button"
                onClick={buy}
                disabled={checkoutLoading || accessLoading}
                className="btn-primary text-sm px-4 py-2 disabled:opacity-60"
              >
                {checkoutLoading ? COURSES_PORTAL.redirecting : COURSES_PORTAL.buyModule(price)}
              </button>
            )}
          </div>
        </header>

        <h2 className="text-sm font-semibold text-bingo-dark mb-3">{COURSES_PORTAL.moduleLessonsHeading}</h2>
        <ul className="space-y-2">
          {(mod.lessons || []).map((lesson, index) => {
            const canWatch =
              owned ||
              hasIoaiLessonAccess(lesson.id, {
                moduleSlugs,
                enrolledSlugs,
                lessonModuleMap,
                trialEnabled: lesson.trialEnabled,
              })
            return (
              <li
                key={lesson.id}
                className={`card p-4 flex flex-wrap items-center justify-between gap-3 ${
                  canWatch ? '' : 'opacity-75'
                }`}
              >
                <div className="flex gap-3 min-w-0">
                  <span className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-bingo-dark">{lesson.title}</p>
                    {lesson.intro ? <p className="text-xs text-slate-500 mt-0.5">{lesson.intro}</p> : null}
                    {lesson.trialEnabled ? (
                      <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded mt-1 inline-block">
                        {COURSES_PORTAL.freeTrialLesson}
                      </span>
                    ) : null}
                  </div>
                </div>
                {canWatch ? (
                  <Link
                    to={`/courses/detail/${encodeURIComponent(lesson.id)}?from=ioai`}
                    className="text-xs font-semibold text-primary px-3 py-1.5 rounded-lg border border-primary/30"
                  >
                    {COURSES_PORTAL.watchLesson}
                  </Link>
                ) : (
                  <span className="text-xs text-slate-400">{COURSES_PORTAL.purchaseModuleToUnlock}</span>
                )}
              </li>
            )
          })}
        </ul>
      </PageContent>
    </div>
  )
}

import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import PageContent from '../../components/PageContent'
import PageMeta from '../../components/PageMeta'
import { useAuth } from '../../contexts/AuthContext'
import { useIOAIAccess, useIOAIStore } from '../../hooks/useIOAIStore'
import { buildLessonModuleMap, findModule, formatIoaiPrice } from '../../lib/ioaiStore'
import { hasIoaiLessonAccess } from '../../lib/ioaiAccess'
import { purchaseIoaiModule } from '../../lib/ioaiPurchase'
import { fetchPaymentsConfig } from '../../lib/checkout'
import { purchaseCourseSlug } from '../../lib/courseAccess'

export default function IOAIModulePage() {
  const { moduleSlug } = useParams()
  const navigate = useNavigate()
  const catalogSlug = decodeURIComponent(moduleSlug || '')
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
        <p className="text-sm text-slate-500">Loading…</p>
      </PageContent>
    )
  }

  if (!mod) {
    return (
      <PageContent className="py-12">
        <p className="text-sm text-slate-600">Course unit not found.</p>
        <Link to="/ioai" className="text-primary text-sm mt-2 inline-block">
          ← Back to IOAI
        </Link>
      </PageContent>
    )
  }

  return (
    <div className="w-full">
      <PageMeta title={`${mod.title} · IOAI`} />
      <PageContent className="py-8">
        <Link
          to={`/ioai/l1/${encodeURIComponent(found.level.id)}`}
          className="text-xs text-primary hover:underline"
        >
          ← {found.level.title}
        </Link>

        <header className="mt-4 mb-6 card p-6">
          <p className="text-[10px] uppercase tracking-wide text-slate-500">
            {found.theme.categoryLabel || found.theme.title}
          </p>
          <h1 className="text-2xl font-bold text-bingo-dark mt-1">{mod.title}</h1>
          {mod.introHtml ? <p className="text-sm text-slate-600 mt-3 max-w-2xl">{mod.introHtml}</p> : null}
          <div className="flex flex-wrap items-center gap-3 mt-4">
            {compare ? <span className="text-sm text-slate-400 line-through">{compare}</span> : null}
            <span className="text-xl font-bold text-primary">{price}</span>
            {owned ? (
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                Unlocked
              </span>
            ) : (
              <button
                type="button"
                onClick={buy}
                disabled={checkoutLoading || accessLoading}
                className="btn-primary text-sm px-4 py-2 disabled:opacity-60"
              >
                {checkoutLoading ? 'Redirecting…' : 'Buy unit'}
              </button>
            )}
          </div>
        </header>

        <h2 className="text-sm font-semibold text-bingo-dark mb-3">Lessons</h2>
        <ul className="space-y-2">
          {(mod.lessons || []).map((lesson) => {
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
                <div>
                  <p className="font-medium text-sm text-bingo-dark">{lesson.title}</p>
                  {lesson.intro ? <p className="text-xs text-slate-500 mt-0.5">{lesson.intro}</p> : null}
                  {lesson.trialEnabled ? (
                    <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded mt-1 inline-block">
                      Free trial
                    </span>
                  ) : null}
                </div>
                {canWatch ? (
                  <Link
                    to={`/courses/detail/${encodeURIComponent(lesson.id)}?from=ioai`}
                    className="text-xs font-semibold text-primary px-3 py-1.5 rounded-lg border border-primary/30"
                  >
                    Watch
                  </Link>
                ) : (
                  <span className="text-xs text-slate-400">Purchase unit to unlock</span>
                )}
              </li>
            )
          })}
        </ul>
      </PageContent>
    </div>
  )
}

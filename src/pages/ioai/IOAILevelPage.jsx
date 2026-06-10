import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import PageContent from '../../components/PageContent'
import PageMeta from '../../components/PageMeta'
import { useAuth } from '../../contexts/AuthContext'
import { useIOAIAccess, useIOAIStore } from '../../hooks/useIOAIStore'
import { findLevel, formatIoaiPrice, isIoaiModuleComingSoon, isIoaiModulePurchasable } from '../../lib/ioaiStore'
import { purchaseIoaiModule } from '../../lib/ioaiPurchase'
import { fetchPaymentsConfig } from '../../lib/checkout'
import { purchaseCourseSlug } from '../../lib/courseAccess'
import { COURSES_PORTAL } from '../../config/coursesPortal'

function ModuleCard({ mod, hasModule, stripeCheckout, isAuthenticated, navigate }) {
  const [loading, setLoading] = useState(false)
  const owned = hasModule(mod.catalogSlug)
  const comingSoon = isIoaiModuleComingSoon(mod)
  const canPurchase = isIoaiModulePurchasable(mod)
  const price = formatIoaiPrice(mod.priceCents, mod.currency)
  const compare = !comingSoon && mod.compareAtCents ? formatIoaiPrice(mod.compareAtCents, mod.currency) : null

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
    <div className="card p-4 flex flex-col h-full hover:shadow-md transition">
      <Link to={`/courses/module/${encodeURIComponent(mod.catalogSlug)}`} className="flex-1 flex flex-col">
        <h3 className="font-semibold text-bingo-dark text-sm">
          {mod.title}
          {comingSoon ? (
            <span className="ml-1.5 inline-flex align-middle text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
              {COURSES_PORTAL.comingSoonBadge}
            </span>
          ) : null}
        </h3>
        <p className="text-xs text-slate-600 mt-1 flex-1 line-clamp-2">{mod.introHtml || `${mod.lessonCount} lessons`}</p>
        {(mod.marketingTags || []).length ? (
          <div className="flex flex-wrap gap-1 mt-2">
            {mod.marketingTags.map((tag) => (
              <span key={tag} className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </Link>
      <div className="mt-3 flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
        <div>
          {compare ? <span className="text-[10px] text-slate-400 line-through mr-1">{compare}</span> : null}
          <span className="text-sm font-bold text-primary">{price}</span>
        </div>
        {owned ? (
          <Link
            to={`/courses/module/${encodeURIComponent(mod.catalogSlug)}`}
            className="text-xs font-semibold text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-200"
          >
            Owned
          </Link>
        ) : comingSoon || !canPurchase ? (
          <span className="text-xs font-semibold text-amber-700 px-3 py-1.5 rounded-lg border border-amber-200">
            {COURSES_PORTAL.comingSoonBadge}
          </span>
        ) : (
          <button
            type="button"
            onClick={buy}
            disabled={loading || !mod.catalogSlug}
            className="text-xs font-semibold btn-primary px-3 py-1.5 disabled:opacity-60"
          >
            {loading ? '…' : 'Buy'}
          </button>
        )}
      </div>
    </div>
  )
}

export default function IOAILevelPage() {
  const { levelSlug } = useParams()
  const navigate = useNavigate()
  const { levels, loading, error } = useIOAIStore()
  const { hasModule } = useIOAIAccess()
  const { isAuthenticated } = useAuth()
  const [stripeCheckout, setStripeCheckout] = useState(false)

  useEffect(() => {
    fetchPaymentsConfig()
      .then((c) => setStripeCheckout(Boolean(c.stripeCheckout)))
      .catch(() => setStripeCheckout(false))
  }, [])

  const level = findLevel(levels, levelSlug)

  if (loading) {
    return (
      <PageContent className="py-12">
        <p className="text-sm text-slate-500">Loading…</p>
      </PageContent>
    )
  }

  if (!level) {
    return (
      <PageContent className="py-12">
        <p className="text-sm text-slate-600">Track not found.</p>
        <Link to="/courses?line=ioai" className="text-primary text-sm mt-2 inline-block">
          ← Back to IOAI
        </Link>
      </PageContent>
    )
  }

  return (
    <div className="w-full">
      <PageMeta title={`${level.title} · IOAI`} />
      <PageContent className="py-8">
        <Link to="/courses?line=ioai" className="text-xs text-primary hover:underline">
          ← All IOAI tracks
        </Link>
        <header className="mt-4 mb-8">
          <span className="text-3xl">{level.emoji}</span>
          <h1 className="text-2xl font-bold text-bingo-dark mt-2">{level.title}</h1>
          {level.summaryShort ? <p className="text-sm text-slate-600 mt-2 max-w-2xl">{level.summaryShort}</p> : null}
        </header>

        {error ? <p className="text-sm text-red-600 mb-4">{error}</p> : null}

        <div className="space-y-10">
          {(level.themes || []).map((theme) => (
            <section key={theme.id}>
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-bingo-dark">{theme.categoryLabel || theme.title}</h2>
                {theme.introHtml ? (
                  <p className="text-sm text-slate-600 mt-1 max-w-3xl">{theme.introHtml}</p>
                ) : null}
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(theme.modules || []).map((mod) => (
                  <ModuleCard
                    key={mod.catalogSlug || mod.id}
                    mod={mod}
                    hasModule={hasModule}
                    stripeCheckout={stripeCheckout}
                    isAuthenticated={isAuthenticated}
                    navigate={navigate}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </PageContent>
    </div>
  )
}

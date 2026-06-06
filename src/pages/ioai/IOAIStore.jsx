import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PageContent from '../../components/PageContent'
import PageMeta from '../../components/PageMeta'
import { useAuth } from '../../contexts/AuthContext'
import { useIOAIAccess, useIOAIStore } from '../../hooks/useIOAIStore'
import { formatIoaiPrice } from '../../lib/ioaiStore'
import { purchaseIoaiBundle } from '../../lib/ioaiPurchase'
import { fetchPaymentsConfig } from '../../lib/checkout'
import { purchaseCourseSlug } from '../../lib/courseAccess'
import { IOAI_FULL_BUNDLE_SLUG } from '../../lib/ioaiAccess'

function FullTrackCard({ bundle, hasFullTrack, stripeCheckout, isAuthenticated, navigate }) {
  const [loading, setLoading] = useState(false)
  if (!bundle) return null

  const price = formatIoaiPrice(bundle.price_cents, bundle.currency)
  const compare = bundle.compare_at_cents
    ? formatIoaiPrice(bundle.compare_at_cents, bundle.currency)
    : null

  const buy = () => {
    purchaseIoaiBundle({
      bundleSlug: bundle.slug || IOAI_FULL_BUNDLE_SLUG,
      stripeCheckout,
      isAuthenticated,
      navigate,
      setCheckoutLoading: setLoading,
      onDemoUnlock: {
        bundle: () => {
          purchaseCourseSlug(IOAI_FULL_BUNDLE_SLUG)
          window.location.reload()
        },
      },
    })
  }

  return (
    <section className="card p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200/80 mb-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-amber-800 mb-1">Full track</p>
          <h2 className="text-xl font-bold text-bingo-dark">{bundle.title || 'IOAI Full Track'}</h2>
          {bundle.intro_html ? (
            <p className="text-sm text-slate-600 mt-2 max-w-xl">{bundle.intro_html}</p>
          ) : null}
        </div>
        <div className="text-right">
          {compare ? <p className="text-sm text-slate-400 line-through">{compare}</p> : null}
          <p className="text-2xl font-bold text-amber-900">{price}</p>
          {hasFullTrack ? (
            <Link to="/profile/study" className="btn-primary inline-flex mt-2 text-sm px-4 py-2">
              Continue learning
            </Link>
          ) : (
            <button
              type="button"
              onClick={buy}
              disabled={loading}
              className="btn-primary mt-2 text-sm px-5 py-2.5 disabled:opacity-60"
            >
              {loading ? 'Redirecting…' : 'Buy full track'}
            </button>
          )}
        </div>
      </div>
    </section>
  )
}

export default function IOAIStore() {
  const { levels, fullBundle, loading, error } = useIOAIStore()
  const { hasFullTrack } = useIOAIAccess()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [stripeCheckout, setStripeCheckout] = useState(false)

  useEffect(() => {
    fetchPaymentsConfig()
      .then((c) => setStripeCheckout(Boolean(c.stripeCheckout)))
      .catch(() => setStripeCheckout(false))
  }, [])

  return (
    <div className="w-full">
      <PageMeta title="IOAI Competition Courses" description="IOAI training — structured modules and lessons" />
      <PageContent className="py-8">
        <header className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-bingo-dark">IOAI Competition Courses</h1>
          <p className="text-slate-600 mt-2 text-sm max-w-2xl">
            Choose a training track, then purchase course units to unlock all lessons inside.
          </p>
        </header>

        <FullTrackCard
          bundle={fullBundle}
          hasFullTrack={hasFullTrack}
          stripeCheckout={stripeCheckout}
          isAuthenticated={isAuthenticated}
          navigate={navigate}
        />

        {loading ? <p className="text-sm text-slate-500">Loading…</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {levels.map((level) => (
            <Link
              key={level.id}
              to={`/ioai/l1/${encodeURIComponent(level.id)}`}
              className="card p-5 hover:shadow-md hover:border-primary/30 transition flex flex-col"
            >
              <span className="text-2xl mb-2">{level.emoji || '📘'}</span>
              <h2 className="font-semibold text-bingo-dark">{level.title}</h2>
              <p className="text-xs text-slate-600 mt-2 flex-1 line-clamp-3">
                {level.summaryShort || 'View categories and course units'}
              </p>
              {(level.highlightTags || []).length ? (
                <div className="flex flex-wrap gap-1 mt-3">
                  {level.highlightTags.slice(0, 3).map((tag) => (
                    <span key={tag} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
              <span className="text-xs text-primary font-semibold mt-4">View track →</span>
            </Link>
          ))}
        </div>
      </PageContent>
    </div>
  )
}

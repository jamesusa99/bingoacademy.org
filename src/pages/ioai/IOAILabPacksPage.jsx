import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FlaskConical } from 'lucide-react'
import PageContent from '../components/PageContent'
import PageMeta from '../components/PageMeta'
import { useAuth } from '../contexts/AuthContext'
import { fetchIoaiLabPacks } from '../lib/ioaiExperimentsClient'
import { formatIoaiPrice } from '../lib/ioaiStore'
import { purchaseIoaiBundle } from '../lib/ioaiPurchase'
import { fetchPaymentsConfig } from '../lib/checkout'
import { authLink } from '../lib/authRedirect'
import { purchaseCourseSlug } from '../lib/courseAccess'
import { useIOAIAccess } from '../hooks/useIOAIStore'

export default function IOAILabPacksPage() {
  const { isAuthenticated } = useAuth()
  const { enrolledSlugs } = useIOAIAccess()
  const navigate = useNavigate()
  const [packs, setPacks] = useState([])
  const [loading, setLoading] = useState(true)
  const [stripeCheckout, setStripeCheckout] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(null)

  useEffect(() => {
    fetchIoaiLabPacks()
      .then(setPacks)
      .catch(() => setPacks([]))
      .finally(() => setLoading(false))
    fetchPaymentsConfig()
      .then((c) => setStripeCheckout(Boolean(c.stripeCheckout)))
      .catch(() => setStripeCheckout(false))
  }, [])

  const buy = (slug) => {
    purchaseIoaiBundle({
      bundleSlug: slug,
      stripeCheckout,
      isAuthenticated,
      navigate,
      setCheckoutLoading: (v) => setCheckoutLoading(v ? slug : null),
      onDemoUnlock: {
        bundle: (s) => {
          purchaseCourseSlug(s)
          window.location.reload()
        },
      },
      returnPath: '/ioai/lab-packs',
    })
  }

  return (
    <div className="w-full">
      <PageMeta title="IOAI Lab Packs" />
      <PageContent className="py-8">
        <Link to="/courses?line=ioai" className="text-xs text-primary hover:underline">
          ← Back to IOAI courses
        </Link>
        <header className="mt-4 mb-6">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-6 h-6 text-violet-600" />
            <h1 className="text-2xl font-bold text-bingo-dark">Experiment Lab Packs</h1>
          </div>
          <p className="text-sm text-slate-600 mt-2 max-w-2xl">
            Standalone experiment bundles — unlock interactive labs and materials without buying full course units.
          </p>
        </header>

        {loading ? (
          <p className="text-sm text-slate-500">Loading lab packs…</p>
        ) : packs.length === 0 ? (
          <p className="text-sm text-slate-500">No lab packs available yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {packs.map((pack) => {
              const owned = enrolledSlugs.includes(pack.slug)
              const price = formatIoaiPrice(pack.priceCents, pack.currency)
              return (
                <article key={pack.slug} className="card overflow-hidden flex flex-col">
                  {pack.coverUrl ? (
                    <img src={pack.coverUrl} alt="" className="w-full h-36 object-cover" />
                  ) : (
                    <div className="w-full h-36 bg-violet-100 flex items-center justify-center text-4xl">🧪</div>
                  )}
                  <div className="p-5 flex flex-col flex-1">
                    <h2 className="font-bold text-bingo-dark">{pack.title}</h2>
                    {pack.introHtml ? <p className="text-xs text-slate-600 mt-2 line-clamp-3">{pack.introHtml}</p> : null}
                    <div className="mt-auto pt-4 flex items-center justify-between gap-2">
                      <span className="text-lg font-bold text-primary">{price}</span>
                      {owned ? (
                        <Link
                          to={`/ioai/lab-packs/${encodeURIComponent(pack.slug)}`}
                          className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg"
                        >
                          Open pack →
                        </Link>
                      ) : (
                        <button
                          type="button"
                          disabled={checkoutLoading === pack.slug}
                          onClick={() => buy(pack.slug)}
                          className="btn-primary text-xs px-3 py-1.5 disabled:opacity-60"
                        >
                          {checkoutLoading === pack.slug ? 'Redirecting…' : `Buy ${price}`}
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}

        {!isAuthenticated ? (
          <p className="text-xs text-slate-500 mt-6">
            <Link to={authLink('/login', '/ioai/lab-packs')} className="text-primary hover:underline">
              Sign in
            </Link>{' '}
            to purchase and access lab packs.
          </p>
        ) : null}
      </PageContent>
    </div>
  )
}

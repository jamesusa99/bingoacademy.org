import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Download, ExternalLink } from 'lucide-react'
import PageContent from '../../components/PageContent'
import PageMeta from '../../components/PageMeta'
import { useAuth } from '../../contexts/AuthContext'
import { useIOAIAccess } from '../../hooks/useIOAIStore'
import { fetchIoaiLabPack } from '../../lib/ioaiExperimentsClient'
import { formatIoaiPrice } from '../../lib/ioaiStore'
import { purchaseIoaiBundle } from '../../lib/ioaiPurchase'
import { fetchPaymentsConfig } from '../../lib/checkout'
import { purchaseCourseSlug } from '../../lib/courseAccess'

export default function IOAILabPackDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { enrolledSlugs } = useIOAIAccess()
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [stripeCheckout, setStripeCheckout] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)

  useEffect(() => {
    fetchPaymentsConfig()
      .then((c) => setStripeCheckout(Boolean(c.stripeCheckout)))
      .catch(() => setStripeCheckout(false))
  }, [])

  useEffect(() => {
    if (!slug) return
    let cancelled = false
    fetchIoaiLabPack(slug)
      .then((data) => {
        if (!cancelled) setDetail(data)
      })
      .catch(() => {
        if (!cancelled) setDetail(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [slug])

  if (loading) {
    return (
      <PageContent className="py-12">
        <p className="text-sm text-slate-500">Loading lab pack…</p>
      </PageContent>
    )
  }

  if (!detail?.pack) {
    return (
      <PageContent className="py-12">
        <p className="text-sm text-slate-600">Lab pack not found.</p>
        <Link to="/ioai/lab-packs" className="text-primary text-sm mt-2 inline-block">
          ← Back to lab packs
        </Link>
      </PageContent>
    )
  }

  const { pack, experiments, recommendedModules } = detail
  const owned = enrolledSlugs.includes(pack.slug)
  const price = formatIoaiPrice(pack.priceCents, pack.currency)

  const buy = () => {
    purchaseIoaiBundle({
      bundleSlug: pack.slug,
      stripeCheckout,
      isAuthenticated,
      navigate,
      setCheckoutLoading,
      onDemoUnlock: {
        bundle: (s) => {
          purchaseCourseSlug(s)
          window.location.reload()
        },
      },
      returnPath: `/ioai/lab-packs/${encodeURIComponent(pack.slug)}`,
    })
  }

  return (
    <div className="w-full">
      <PageMeta title={`${pack.title} · Lab Pack`} />
      <PageContent className="py-8 max-w-3xl">
        <Link to="/ioai/lab-packs" className="text-xs text-primary hover:underline">
          ← All lab packs
        </Link>
        <header className="card p-6 mt-4 mb-6">
          {pack.coverUrl ? (
            <img src={pack.coverUrl} alt="" className="w-full h-44 object-cover rounded-xl mb-4" />
          ) : null}
          <h1 className="text-2xl font-bold text-bingo-dark">{pack.title}</h1>
          {pack.introHtml ? <p className="text-sm text-slate-600 mt-2">{pack.introHtml}</p> : null}
          <div className="flex items-center gap-3 mt-4">
            <span className="text-xl font-bold text-primary">{price}</span>
            {owned ? (
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">Unlocked</span>
            ) : (
              <button type="button" onClick={buy} disabled={checkoutLoading} className="btn-primary text-sm px-4 py-2 disabled:opacity-60">
                {checkoutLoading ? 'Redirecting…' : `Buy ${price}`}
              </button>
            )}
          </div>
        </header>

        {owned && experiments?.length > 0 ? (
          <section className="mb-6">
            <h2 className="text-sm font-semibold text-bingo-dark mb-3">Experiments in this pack</h2>
            <ul className="space-y-2">
              {experiments.map((exp) => (
                <li key={exp.slug} className="card p-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-sm">{exp.title}</p>
                    {exp.subtitle ? <p className="text-xs text-slate-500">{exp.subtitle}</p> : null}
                    {exp.materials?.map((m) => (
                      <a
                        key={m.id}
                        href={m.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-primary hover:underline flex items-center gap-1 mt-1"
                      >
                        <Download className="w-3 h-3" />
                        {m.fileName}
                      </a>
                    ))}
                  </div>
                  {exp.playHref ? (
                    <Link to={exp.playHref} className="text-xs font-semibold text-violet-700 inline-flex items-center gap-1">
                      <ExternalLink className="w-3.5 h-3.5" />
                      Open
                    </Link>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {recommendedModules?.length > 0 ? (
          <section>
            <h2 className="text-sm font-semibold text-bingo-dark mb-3">Recommended course units</h2>
            <ul className="space-y-2">
              {recommendedModules.map((mod) => (
                <li key={mod.catalogSlug || mod.id}>
                  <Link
                    to={`/courses/module/${encodeURIComponent(mod.catalogSlug || mod.id)}`}
                    className="card p-4 block hover:border-primary/30 transition text-sm font-medium text-bingo-dark"
                  >
                    {mod.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </PageContent>
    </div>
  )
}

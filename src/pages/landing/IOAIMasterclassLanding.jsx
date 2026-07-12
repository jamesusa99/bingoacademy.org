import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import PageMeta from '../../components/PageMeta'
import LandingShell from '../../components/landing/LandingShell'
import LabEnvironmentPreview from '../../components/landing/LabEnvironmentPreview'
import LeadEmailCapture from '../../components/landing/LeadEmailCapture'
import CheckoutTrustMicrocopy from '../../components/checkout/CheckoutTrustMicrocopy'
import { IOAI_MASTERCLASS_LANDING, IOAI_LANDING_STARTER_MODULE } from '../../config/landingPages'
import { HOME_TRUST_AUTHORITY } from '../../config/homeTrust'
import { useAuth } from '../../contexts/AuthContext'
import { authLink } from '../../lib/authRedirect'
import { fetchPaymentsConfig } from '../../lib/checkout'
import { purchaseIoaiBundle, purchaseIoaiModule } from '../../lib/ioaiPurchase'
import { IOAI_FULL_BUNDLE_SLUG } from '../../lib/ioaiStore'
import { PRICING } from '../../lib/courseAccess'

export default function IOAIMasterclassLanding() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [stripeCheckout, setStripeCheckout] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const copy = IOAI_MASTERCLASS_LANDING
  const trackPrice = (PRICING?.ioaiTrack?.price ?? 2990).toLocaleString()

  useEffect(() => {
    fetchPaymentsConfig()
      .then((c) => setStripeCheckout(Boolean(c.stripeCheckout)))
      .catch(() => setStripeCheckout(false))
  }, [])

  const handleModulePurchase = () => {
    purchaseIoaiModule({
      catalogSlug: IOAI_LANDING_STARTER_MODULE,
      stripeCheckout,
      isAuthenticated,
      navigate,
      setCheckoutLoading,
    })
  }

  const handleFullTrackPurchase = () => {
    purchaseIoaiBundle({
      bundleSlug: IOAI_FULL_BUNDLE_SLUG,
      stripeCheckout,
      isAuthenticated,
      navigate,
      setCheckoutLoading,
      returnPath: '/ioai-masterclass',
    })
  }

  return (
    <LandingShell variant="light">
      <PageMeta title={copy.seo.title} description={copy.seo.description} />

      <section className="bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950 text-white px-4 sm:px-6 py-12 sm:py-16">
        <div className="max-w-5xl mx-auto">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400 mb-3">{copy.eyebrow}</p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight mb-4 max-w-3xl">{copy.headline}</h1>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mb-8">{copy.subhead}</p>

          <div className="grid sm:grid-cols-3 gap-4 mb-10">
            {copy.outcomes.map((item) => (
              <div key={item.label} className="rounded-xl border border-white/10 bg-white/5 p-4">
                <span className="text-2xl mb-2 block" aria-hidden>
                  {item.icon}
                </span>
                <p className="font-bold text-sm text-white mb-1">{item.label}</p>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <LabEnvironmentPreview />
        </div>
      </section>

      <section className="px-4 sm:px-6 py-12 sm:py-16 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-bingo-dark mb-2">Your IOAI progression path</h2>
          <p className="text-sm text-slate-600 mb-8 max-w-2xl">
            Python → Machine Learning → Neural Networks — each stage with video lessons, GoLab notebooks, and
            autograded labs.
          </p>

          <div className="grid md:grid-cols-3 gap-5 mb-12">
            {copy.curriculumPath.map((step, index) => (
              <article key={step.stage} className="card p-5">
                <span className="inline-block text-[10px] font-bold uppercase tracking-wide bg-primary text-white px-2.5 py-1 rounded-full mb-3">
                  Stage {index + 1}
                </span>
                <span className="text-3xl mb-3 block" aria-hidden>
                  {step.icon}
                </span>
                <h3 className="font-bold text-bingo-dark mb-3">{step.stage}</h3>
                <ul className="space-y-2">
                  {step.topics.map((topic) => (
                    <li key={topic} className="flex gap-2 text-xs text-slate-600 leading-snug">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" aria-hidden />
                      {topic}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 mb-10">
            <p className="text-xs font-bold uppercase tracking-wider text-primary mb-2">{HOME_TRUST_AUTHORITY.eyebrow}</p>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">{HOME_TRUST_AUTHORITY.body}</p>
            <Link to="/showcase/works" className="text-sm font-semibold text-primary inline-flex items-center gap-1 hover:underline">
              View student outcomes <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 items-start">
            <LeadEmailCapture
              source="ioai-masterclass"
              campaign="ioai-prep-whitepaper"
              title={copy.whitepaper.title}
              subtitle={copy.whitepaper.subtitle}
              cta={copy.whitepaper.cta}
              successMessage={copy.whitepaper.success}
            />

            <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-6 sm:p-8">
              <h3 className="text-lg font-bold text-bingo-dark mb-1">{copy.purchase.title}</h3>
              <p className="text-sm text-slate-600 mb-4 leading-relaxed">{copy.purchase.desc}</p>
              <p className="text-3xl font-black text-bingo-dark mb-1">
                ${trackPrice}
                <span className="text-sm font-normal text-slate-500 ml-1">USD · full track</span>
              </p>
              <p className="text-xs text-slate-500 mb-5">One-time · lifetime access · all IOAI modules</p>

              <button
                type="button"
                onClick={handleFullTrackPurchase}
                disabled={checkoutLoading}
                className="w-full btn-primary py-3.5 text-sm font-bold rounded-xl disabled:opacity-60 mb-2"
              >
                {checkoutLoading ? 'Redirecting to Stripe…' : `Unlock IOAI Masterclass — $${trackPrice}`}
              </button>
              <CheckoutTrustMicrocopy variant="light" className="mb-4" />

              <button
                type="button"
                onClick={handleModulePurchase}
                disabled={checkoutLoading}
                className="w-full text-sm font-semibold py-2.5 rounded-xl border border-amber-300 text-amber-900 hover:bg-amber-100/80 disabled:opacity-60"
              >
                {copy.purchase.cta}
              </button>

              {!isAuthenticated ? (
                <p className="text-xs text-slate-500 mt-4 text-center">
                  <Link to={authLink('/login', '/ioai-masterclass')} className="text-primary hover:underline">
                    Sign in
                  </Link>{' '}
                  to complete checkout
                </p>
              ) : null}

              <Link
                to="/courses/ioai"
                className="block text-center text-xs text-primary hover:underline mt-4"
              >
                {copy.purchase.fullTrackCta}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </LandingShell>
  )
}

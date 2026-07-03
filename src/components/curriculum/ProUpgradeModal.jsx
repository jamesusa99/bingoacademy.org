import { useState } from 'react'
import { X, Sparkles, Shield, PlayCircle, Loader2 } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { startIOAIMasterclassCheckout } from '../../lib/checkout'
import { PRICING } from '../../lib/courseAccess'
import CheckoutTrustMicrocopy from '../checkout/CheckoutTrustMicrocopy'
import { useLazyAuth } from '../../contexts/LazyAuthContext'
import { getStoredPromoCode } from '../../lib/lazyRegistration'
import { EARLY_BIRD_PROMO } from '../../config/funnel'

export default function ProUpgradeModal({ open, onClose }) {
  const { isAuthenticated } = useAuth()
  const { gateAction } = useLazyAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  if (!open) return null

  const price = (PRICING?.ioaiTrack?.price ?? 2990).toLocaleString()
  const promo = getStoredPromoCode()

  const runCheckout = async () => {
    setLoading(true)
    setError(null)
    try {
      const { url } = await startIOAIMasterclassCheckout()
      if (url) window.location.href = url
      else throw new Error('No checkout URL returned')
    } catch (err) {
      setError(err.message || 'Checkout failed')
      setLoading(false)
    }
  }

  const handleUnlock = () => {
    gateAction({
      title: 'Sign in to unlock IOAI Masterclass',
      subtitle:
        'Google one-tap sign-in — then secure Stripe checkout. Enter promo codes like BINGO2026 on the payment page.',
      googleLabel: 'Continue with Google to checkout',
      onAuthed: runCheckout,
    })
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pro-upgrade-title"
    >
      <div className="relative w-full max-w-md rounded-2xl border border-cyan-500/30 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 shadow-[0_0_60px_rgba(34,211,238,0.15)] overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-400 via-violet-400 to-cyan-400" />

        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 pt-10 text-center">
          <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-cyan-400" />
          </div>

          <h2 id="pro-upgrade-title" className="text-2xl font-black text-white mb-2">
            Unlock IOAI Masterclass
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed mb-6">
            Get full access to every lesson, Cloudflare Stream video playback, labs, and progress tracking
            across the complete IOAI curriculum.
          </p>

          <ul className="text-left text-sm text-slate-300 space-y-2 mb-8">
            <li className="flex gap-2">
              <PlayCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              All video lessons & hands-on labs
            </li>
            <li className="flex gap-2">
              <Shield className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              Secure signed streaming via Cloudflare
            </li>
          </ul>

          <p className="text-3xl font-black text-white mb-1">
            ${price}
            <span className="text-sm font-normal text-slate-500 ml-1">USD</span>
          </p>
          <p className="text-xs text-slate-500 mb-6">One-time · lifetime access</p>

          {promo ? (
            <p className="text-xs text-amber-400/90 mb-4">
              Promo <span className="font-mono font-bold">{promo || EARLY_BIRD_PROMO.code}</span> — enter at Stripe
              checkout
            </p>
          ) : null}

          {error ? (
            <p className="text-sm text-red-400 mb-4">{error}</p>
          ) : null}

          <button
            type="button"
            onClick={handleUnlock}
            disabled={loading}
            className="w-full btn-primary py-3.5 text-sm font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Redirecting to Stripe…
              </>
            ) : (
              'Unlock IOAI Masterclass'
            )}
          </button>

          <CheckoutTrustMicrocopy variant="dark" className="mt-3" />

          {!isAuthenticated ? (
            <p className="text-xs text-slate-500 mt-4">
              One-tap Google sign-in — no lengthy registration form
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}

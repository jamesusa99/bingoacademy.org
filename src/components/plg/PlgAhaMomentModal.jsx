import { useState } from 'react'
import { X, Sparkles, PlayCircle, Shield, Loader2, Trophy } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { startIOAIMasterclassCheckout } from '../../lib/checkout'
import { PRICING } from '../../lib/courseAccess'
import { PLG_AHA_COPY } from '../../config/plgAhaMoments'
import CheckoutTrustMicrocopy from '../checkout/CheckoutTrustMicrocopy'
import { useLazyAuth } from '../../contexts/LazyAuthContext'

export default function PlgAhaMomentModal({ open, onClose }) {
  const { isAuthenticated } = useAuth()
  const { gateAction } = useLazyAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  if (!open) return null

  const price = (PRICING?.ioaiTrack?.price ?? 2990).toLocaleString()

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
      title: PLG_AHA_COPY.title,
      subtitle: PLG_AHA_COPY.subtitle,
      googleLabel: 'Continue with Google to unlock',
      onAuthed: runCheckout,
    })
  }

  return (
    <div
      className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="plg-aha-title"
    >
      <div className="relative w-full max-w-lg rounded-3xl border border-amber-400/25 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 shadow-[0_0_80px_rgba(251,191,36,0.2),0_0_120px_rgba(34,211,238,0.12)] overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-amber-400 via-fuchsia-400 to-cyan-400" />
        <div
          className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-amber-400/10 blur-3xl"
          aria-hidden
        />

        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative p-8 sm:p-10 pt-12 text-center">
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-amber-400/20 to-cyan-400/20 border border-amber-400/30 flex items-center justify-center shadow-lg shadow-amber-500/10">
            <Trophy className="w-8 h-8 text-amber-300" />
          </div>

          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400/90 mb-3 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" aria-hidden />
            Aha moment
          </p>

          <h2 id="plg-aha-title" className="text-2xl sm:text-3xl font-black text-white mb-3 leading-tight">
            {PLG_AHA_COPY.title}
          </h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-2 max-w-md mx-auto">
            {PLG_AHA_COPY.subtitle}
          </p>
          <p className="text-xs text-slate-500 mb-7 max-w-md mx-auto">{PLG_AHA_COPY.subtitleZh}</p>

          <ul className="text-left text-sm text-slate-300 space-y-2.5 mb-8 max-w-sm mx-auto">
            <li className="flex gap-2.5">
              <PlayCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              Full IOAI video lessons, labs & GoLab Python workspace
            </li>
            <li className="flex gap-2.5">
              <Shield className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              Build real models — from lists to competition-ready AI
            </li>
          </ul>

          <p className="text-3xl font-black text-white mb-1">
            ${price}
            <span className="text-sm font-normal text-slate-500 ml-1">USD</span>
          </p>
          <p className="text-xs text-slate-500 mb-6">One-time · lifetime access</p>

          {error ? <p className="text-sm text-red-400 mb-4">{error}</p> : null}

          <button
            type="button"
            onClick={handleUnlock}
            disabled={loading}
            className="w-full btn-primary py-4 text-sm font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg shadow-cyan-500/20"
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

          <button
            type="button"
            onClick={onClose}
            className="mt-4 text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            Keep playing for now
          </button>

          {!isAuthenticated ? (
            <p className="text-xs text-slate-500 mt-4">Google one-tap sign-in at checkout — no signup form first</p>
          ) : null}
        </div>
      </div>
    </div>
  )
}

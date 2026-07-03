import { useState } from 'react'
import { X, CloudUpload, Sparkles } from 'lucide-react'
import { LAZY_AUTH_COPY } from '../../config/funnel'
import GoogleSignInButton from '../auth/GoogleSignInButton'
import { CHECKOUT_TRUST } from '../../config/checkoutTrust'

export default function LazyAuthModal({
  open,
  copyKey = 'saveProgress',
  title,
  subtitle,
  googleLabel,
  onClose,
  onGoogleSignIn,
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  if (!open) return null

  const copy = LAZY_AUTH_COPY[copyKey] || LAZY_AUTH_COPY.saveProgress
  const heading = title || copy.title
  const body = subtitle || copy.subtitle
  const googleText = googleLabel || copy.googleLabel

  const handleGoogle = async () => {
    setLoading(true)
    setError(null)
    try {
      await onGoogleSignIn()
    } catch (err) {
      setError(err.message || 'Sign-in failed')
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[240] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lazy-auth-title"
    >
      <div className="relative w-full max-w-md rounded-2xl border border-cyan-500/25 bg-gradient-to-b from-slate-900 to-slate-950 shadow-2xl overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-400 to-violet-400" />

        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 pt-10 text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center">
            <CloudUpload className="w-7 h-7 text-cyan-400" />
          </div>

          <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-400/80 mb-2 flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3" aria-hidden />
            One tap · No lengthy form
          </p>

          <h2 id="lazy-auth-title" className="text-xl font-black text-white mb-2">
            {heading}
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed mb-6">{body}</p>

          {error ? <p className="text-sm text-red-400 mb-4">{error}</p> : null}

          <GoogleSignInButton onClick={handleGoogle} disabled={loading} label={googleText} />

          <p className="text-[11px] text-slate-500 mt-4 leading-snug">{CHECKOUT_TRUST.microcopy}</p>

          <button type="button" onClick={onClose} className="mt-4 text-xs text-slate-500 hover:text-slate-300">
            Continue without saving
          </button>
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { X, Copy, Check, Tag } from 'lucide-react'
import { Link } from 'react-router-dom'
import { EARLY_BIRD_PROMO, EXIT_INTENT_COPY } from '../../config/funnel'
import { storePromoCode } from '../../lib/lazyRegistration'

export default function ExitIntentModal({ open, onClose }) {
  const [copied, setCopied] = useState(false)

  if (!open) return null

  const handleCopy = async () => {
    storePromoCode(EARLY_BIRD_PROMO.code)
    try {
      await navigator.clipboard.writeText(EARLY_BIRD_PROMO.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      setCopied(true)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[235] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-intent-title"
    >
      <div className="relative w-full max-w-md rounded-2xl border border-amber-400/30 bg-gradient-to-b from-slate-900 via-amber-950/20 to-slate-950 shadow-[0_0_60px_rgba(251,191,36,0.15)] overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400" />

        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 pt-10 text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center">
            <Tag className="w-7 h-7 text-amber-300" />
          </div>

          <h2 id="exit-intent-title" className="text-2xl font-black text-white mb-2">
            {EXIT_INTENT_COPY.title}
          </h2>
          <p className="text-sm text-slate-400 mb-5">{EXIT_INTENT_COPY.subtitle}</p>

          <div className="rounded-xl border-2 border-dashed border-amber-400/50 bg-amber-500/10 px-6 py-4 mb-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400/90 mb-1">
              {EARLY_BIRD_PROMO.label}
            </p>
            <p className="text-3xl font-black font-mono text-amber-300 tracking-wider">{EARLY_BIRD_PROMO.code}</p>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="w-full btn-primary py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 border-0 shadow-lg"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                {EXIT_INTENT_COPY.cta}
              </>
            )}
          </button>

          <Link
            to="/try-ai"
            onClick={onClose}
            className="block mt-3 text-sm font-semibold text-cyan-400 hover:text-cyan-300"
          >
            Play AI Cyber Tennis free →
          </Link>

          <button type="button" onClick={onClose} className="mt-4 text-xs text-slate-500 hover:text-slate-300">
            {EXIT_INTENT_COPY.dismiss}
          </button>
        </div>
      </div>
    </div>
  )
}

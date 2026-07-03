import { X, Sparkles, Gift } from 'lucide-react'
import { TRY_AI_LANDING } from '../../config/landingPages'

export default function TryAiCuriosityModal({ open, onClose, onClaimTrial, claiming = false }) {
  if (!open) return null

  const copy = TRY_AI_LANDING.curiosityModal

  return (
    <div
      className="fixed inset-0 z-[260] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="try-ai-curiosity-title"
    >
      <div className="relative w-full max-w-md rounded-3xl border border-violet-400/30 bg-gradient-to-b from-slate-900 via-violet-950/40 to-slate-950 shadow-[0_0_80px_rgba(139,92,246,0.25)] overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400" />

        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 pt-10 text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-violet-500/20 border border-violet-400/30 flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-violet-300" />
          </div>

          <h2 id="try-ai-curiosity-title" className="text-2xl font-black text-white mb-2 leading-tight">
            {copy.title}
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed mb-6">{copy.subtitle}</p>

          <button
            type="button"
            onClick={onClaimTrial}
            disabled={claiming}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-400 hover:to-fuchsia-400 text-white font-bold text-sm disabled:opacity-60 shadow-lg"
          >
            <Gift className="w-4 h-4" aria-hidden />
            {claiming ? 'Opening lesson…' : copy.cta}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="mt-4 text-xs text-slate-500 hover:text-slate-300"
          >
            {copy.dismiss}
          </button>
        </div>
      </div>
    </div>
  )
}

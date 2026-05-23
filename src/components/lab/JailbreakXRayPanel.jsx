import { BookOpen, Lightbulb, ScanEye, X } from 'lucide-react'
import {
  GUARD_SYSTEM_PROMPT,
  HACKER_TIPS,
  JAILBREAK_CONCEPT,
  XRAY_INTRO,
} from '../../config/guardPrompt'

/**
 * Educational overlay — reveals system prompt + prompt-engineering tips.
 */
export default function JailbreakXRayPanel({ open, onClose }) {
  if (!open) return null

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] lg:hidden"
        aria-label="Close X-Ray panel"
        onClick={onClose}
      />

      <aside
        className="fixed z-50 inset-x-0 bottom-0 max-h-[min(85vh,640px)] lg:inset-x-auto lg:bottom-auto lg:top-[72px] lg:right-4 lg:w-[min(100%,380px)] lg:max-h-[calc(100vh-88px)] flex flex-col rounded-t-2xl lg:rounded-2xl border border-fuchsia-500/35 bg-[#060a12]/98 shadow-[0_0_40px_rgba(192,132,252,0.15)] backdrop-blur-md overflow-hidden font-mono"
        aria-label="X-Ray Vision — hidden rules and hacker tips"
      >
        <div className="shrink-0 flex items-center justify-between gap-2 px-4 py-3 border-b border-fuchsia-500/25 bg-gradient-to-r from-fuchsia-950/60 to-cyan-950/40">
          <div className="flex items-center gap-2">
            <ScanEye className="w-5 h-5 text-fuchsia-400 animate-pulse" aria-hidden />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-fuchsia-300">
                X-Ray Vision
              </p>
              <p className="text-[9px] text-fuchsia-600/90">PROMPT LAYER EXPOSED</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[40px] min-w-[40px] rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:border-fuchsia-500/50 flex items-center justify-center"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-4">
          <section className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400/90 mb-2 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" aria-hidden />
              Hidden Rules (System Prompt)
            </p>
            <p className="text-[11px] text-slate-400 leading-relaxed mb-3 font-sans">
              {XRAY_INTRO}
            </p>
            <pre className="text-[11px] sm:text-xs text-amber-100/95 leading-relaxed whitespace-pre-wrap break-words rounded-lg bg-black/50 border border-amber-800/40 p-3">
              {GUARD_SYSTEM_PROMPT}
            </pre>
          </section>

          <section className="rounded-xl border border-cyan-500/25 bg-cyan-950/15 p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-400/90 mb-3 flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5" aria-hidden />
              Hacker Tips
            </p>
            <ul className="space-y-3">
              {HACKER_TIPS.map((item) => (
                <li
                  key={item.id}
                  className="rounded-lg border border-slate-800/80 bg-slate-950/60 px-3 py-2.5"
                >
                  <p className="text-xs font-bold text-cyan-300 mb-0.5">{item.title}</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                    {item.tip}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border border-emerald-500/25 bg-emerald-950/15 p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400/90 mb-2">
              Why can the AI be tricked?
            </p>
            <p className="text-[11px] text-slate-300 leading-relaxed font-sans">{JAILBREAK_CONCEPT}</p>
          </section>
        </div>

        <div
          className="shrink-0 h-1 bg-gradient-to-r from-fuchsia-500 via-cyan-500 to-emerald-500 opacity-60"
          aria-hidden
        />
      </aside>
    </>
  )
}

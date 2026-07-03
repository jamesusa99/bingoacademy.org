import { Link } from 'react-router-dom'
import { PLG_LEAD_MAGNET } from '../../config/plgAhaMoments'

export default function ExplorationLeadMagnet() {
  const { emoji, title, tagline, href } = PLG_LEAD_MAGNET

  return (
    <section className="mb-10 scroll-mt-24" aria-labelledby="lead-magnet-title">
      <Link
        to={href}
        className="group block relative overflow-hidden rounded-2xl border-2 border-emerald-400/40 bg-gradient-to-br from-slate-900 via-emerald-950/80 to-slate-900 p-6 sm:p-8 shadow-[0_0_40px_rgba(52,211,153,0.12)] transition-all hover:border-emerald-400/60 hover:shadow-[0_0_60px_rgba(52,211,153,0.18)]"
      >
        <div
          className="pointer-events-none absolute -right-8 -top-8 w-48 h-48 rounded-full bg-emerald-400/10 blur-3xl group-hover:bg-emerald-400/15 transition-colors"
          aria-hidden
        />
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
          <span className="text-5xl sm:text-6xl shrink-0" aria-hidden>
            {emoji}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-400/90 mb-1.5">
              Start here · Lead magnet
            </p>
            <h2 id="lead-magnet-title" className="text-xl sm:text-2xl font-black text-white mb-2">
              {title}
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed max-w-xl">{tagline}</p>
          </div>
          <span className="shrink-0 inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-emerald-400 text-slate-900 font-bold text-sm min-h-[44px] group-hover:bg-emerald-300 transition-colors">
            Play now →
          </span>
        </div>
      </Link>
    </section>
  )
}

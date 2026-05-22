import { DETECTION_THRESHOLD } from '../../config/hideAndSeek'

/**
 * Kid-friendly real-time confidence gauge for the active target.
 */
export default function ConfidenceGauge({ confidence, targetLabel, targetEmoji, celebrating }) {
  const pct = Math.round(confidence * 100)
  const winLine = Math.round(DETECTION_THRESHOLD * 100)
  const ready = pct >= winLine

  const barColor = ready
    ? 'bg-gradient-to-r from-[#39ff14] to-[#5dffa8]'
    : pct >= 35
      ? 'bg-gradient-to-r from-amber-400 to-yellow-300'
      : 'bg-gradient-to-r from-slate-500 to-slate-400'

  return (
    <div
      className={`rounded-2xl border p-4 transition-all duration-500 ease-out ${
        celebrating
          ? 'border-[#39ff14] bg-[#39ff14]/10 scale-[1.02]'
          : ready
            ? 'border-[#39ff14]/50 bg-[#39ff14]/5'
            : 'border-slate-700/80 bg-slate-800/50'
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <p className="text-xs font-semibold text-slate-300">How sure is the AI?</p>
        <span className="text-lg" aria-hidden>
          {targetEmoji}
        </span>
      </div>
      <p className="text-[10px] text-slate-500 mb-3 truncate">
        Looking for: <span className="text-amber-200/90">{targetLabel}</span>
      </p>

      <div className="flex items-end justify-between gap-3 mb-2">
        <span
          className={`text-4xl font-black tabular-nums transition-all duration-500 ease-out ${
            celebrating ? 'text-[#39ff14] scale-110' : ready ? 'text-[#39ff14]' : 'text-slate-200'
          }`}
        >
          {pct}%
        </span>
        <span className="text-[10px] text-slate-500 pb-1">
          Need {winLine}% to win ⭐
        </span>
      </div>

      <div className="relative h-4 rounded-full bg-slate-900/80 overflow-hidden border border-slate-700/60">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${barColor} ${
            ready && !celebrating ? 'animate-pulse' : ''
          }`}
          style={{ width: `${Math.min(100, pct)}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`AI confidence for ${targetLabel}`}
        />
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white/70"
          style={{ left: `${winLine}%` }}
          title={`Win threshold ${winLine}%`}
        />
      </div>

      <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
        {pct === 0
          ? 'Target not in frame yet — try moving your object into view!'
          : ready
            ? '🎉 Almost there — hold steady!'
            : 'Keep hunting — the bar fills as the AI gets more confident.'}
      </p>
    </div>
  )
}

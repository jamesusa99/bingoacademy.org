/**
 * Futuristic dial / progress meter for the conductor dashboard.
 */
export default function ConductorDial({
  label,
  value,
  displayValue,
  min = 0,
  max = 100,
  unit = '%',
  accent = 'violet',
  hint,
}) {
  const pct = max === min ? 0 : Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100))

  const accentBar =
    accent === 'amber'
      ? 'from-amber-400 to-orange-500'
      : accent === 'cyan'
        ? 'from-cyan-400 to-blue-500'
        : 'from-violet-400 to-fuchsia-500'

  return (
    <div className="rounded-2xl border border-violet-500/20 bg-slate-900/80 p-4 backdrop-blur-sm transition-all duration-500">
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-violet-300/90">{label}</span>
        <span className="text-lg font-black tabular-nums text-white transition-all duration-300">
          {displayValue ?? `${Math.round(value)}${unit}`}
        </span>
      </div>
      <div className="relative h-3 rounded-full bg-slate-950/80 overflow-hidden border border-slate-700/60">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${accentBar} transition-all duration-500 ease-out`}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={min}
          aria-valuemax={max}
        />
        {/* Dial tick marks */}
        <div className="absolute inset-0 flex justify-between px-0.5 pointer-events-none opacity-30">
          {[0, 1, 2, 3, 4].map((i) => (
            <span key={i} className="w-px h-full bg-white/40" />
          ))}
        </div>
      </div>
      {hint && <p className="text-[10px] text-slate-500 mt-2 leading-snug">{hint}</p>}
    </div>
  )
}

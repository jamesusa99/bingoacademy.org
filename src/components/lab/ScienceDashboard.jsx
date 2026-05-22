/** Decorative “science dashboard” — animates when experiment is active */
export default function ScienceDashboard({ metrics = [], active = false, accent = 'cyan' }) {
  const accentClass =
    accent === 'violet' ? 'bg-violet-500' : accent === 'amber' ? 'bg-amber-500' : 'bg-cyan-500'

  const bars = metrics.length ? metrics : ['signal', 'weights', 'loss']

  return (
    <div
      className={`rounded-xl border border-slate-200/80 bg-slate-900 p-3 font-mono text-[10px] text-slate-300 transition-opacity ${
        active ? 'opacity-100' : 'opacity-70'
      }`}
      aria-hidden
    >
      <div className="flex items-center justify-between mb-2 text-slate-500 uppercase tracking-wider">
        <span>Science dashboard</span>
        <span className={`h-1.5 w-1.5 rounded-full ${active ? `${accentClass} animate-pulse` : 'bg-slate-600'}`} />
      </div>
      <div className="grid grid-cols-3 gap-2 mb-2">
        {bars.map((m) => (
          <div key={m} className="text-center">
            <div className="h-8 flex items-end justify-center gap-0.5">
              {[40, 65, 55, 80, 50].map((h, i) => (
                <div
                  key={i}
                  className={`w-1 rounded-t ${accentClass} ${active ? 'animate-pulse' : ''}`}
                  style={{
                    height: active ? `${h + (i % 2) * 12}%` : `${h * 0.5}%`,
                    opacity: 0.4 + i * 0.12,
                    animationDelay: `${i * 120}ms`,
                  }}
                />
              ))}
            </div>
            <span className="text-[8px] text-slate-500 truncate block mt-0.5">{m}</span>
          </div>
        ))}
      </div>
      <svg viewBox="0 0 120 24" className="w-full h-6 text-cyan-400/80">
        <path
          d="M0 20 Q20 4 40 14 T80 8 T120 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className={active ? 'opacity-100' : 'opacity-40'}
        />
      </svg>
      <p className="text-[8px] text-slate-500 mt-1">Your action → game result → math underneath</p>
    </div>
  )
}

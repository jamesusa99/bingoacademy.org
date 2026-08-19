import { HOME_PLATFORM_WORKSPACE } from '../../config/homePlatformPreview'

export default function HomePlatformWorkspacePreview() {
  const { theory, code, results, reflection } = HOME_PLATFORM_WORKSPACE

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-950 shadow-xl overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-4 h-11 border-b border-slate-800 bg-slate-900">
        <span className="text-[11px] font-bold text-white truncate">
          Bingo Academy · Study Center
          <span className="text-slate-500 font-normal mx-1.5">·</span>
          <span className="text-cyan-400">Lab: KNN evaluation</span>
        </span>
        <span className="text-[10px] text-slate-500 shrink-0 hidden sm:inline">Lesson + lab + results</span>
      </div>

      <div className="grid lg:grid-cols-3 min-h-[280px] sm:min-h-[320px]">
        <div className="border-b lg:border-b-0 lg:border-r border-slate-800 bg-slate-900/60 p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-500/80 mb-2">{theory.label}</p>
          <h3 className="text-sm font-bold text-white mb-2">{theory.title}</h3>
          <p className="text-xs text-slate-400 leading-relaxed mb-3">{theory.body}</p>
          <ul className="text-[11px] text-slate-500 space-y-1">
            {theory.bullets.map((item) => (
              <li key={item}>· {item}</li>
            ))}
          </ul>
        </div>

        <div className="border-b lg:border-b-0 lg:border-r border-slate-800 bg-slate-950 flex flex-col min-h-[200px]">
          <p className="text-[10px] font-bold uppercase tracking-wider text-violet-400/80 px-4 pt-3 pb-2">
            {code.label}
          </p>
          <pre className="flex-1 px-4 pb-3 text-[10px] sm:text-[11px] font-mono text-emerald-100/90 leading-relaxed overflow-auto">
            {code.snippet}
          </pre>
        </div>

        <div className="bg-slate-900/40 p-4 flex flex-col">
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400/80 mb-3">{results.label}</p>
          <div className="flex gap-3 mb-4">
            {results.metrics.map((m) => (
              <div key={m.label} className="rounded-lg bg-slate-800/80 border border-slate-700 px-3 py-2">
                <p className="text-[10px] text-slate-500">{m.label}</p>
                <p className="text-lg font-bold text-white tabular-nums">{m.value}</p>
              </div>
            ))}
          </div>
          <div className="flex items-end gap-1 h-20 mt-auto">
            {results.chartBars.map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t bg-gradient-to-t from-cyan-600/80 to-cyan-400/90"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800 bg-slate-900/80 px-4 py-3 sm:px-5 sm:py-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400/80 mb-2">{reflection.label}</p>
        <p className="text-xs text-slate-300 mb-1">{reflection.prompt}</p>
        <p className="text-[11px] text-emerald-400/90">{reflection.feedback}</p>
      </div>
    </div>
  )
}

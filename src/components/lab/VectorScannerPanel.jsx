import { useEffect, useState } from 'react'
import { Activity, Radar, ScanLine } from 'lucide-react'
import { formatVectorArray, VECTOR_SCANNER_EDUCATION } from '../../lib/wordEmbeddings'

/**
 * High-tech "AI Vector Scanner" — shows embedding + cosine math for last spawn.
 */
export default function VectorScannerPanel({ scan, targetWord }) {
  const [pulse, setPulse] = useState(false)

  useEffect(() => {
    if (!scan?.spawnedAt) return
    setPulse(true)
    const t = setTimeout(() => setPulse(false), 700)
    return () => clearTimeout(t)
  }, [scan?.spawnedAt])

  const idle = !scan?.vector
  const sim = scan?.similarity ?? 0
  const simPct = (sim * 100).toFixed(1)
  const simDisplay = sim.toFixed(2)

  return (
    <aside
      className="relative z-20 shrink-0 w-full md:w-[min(100%,300px)] lg:w-[320px] border-t md:border-t-0 md:border-l border-cyan-500/30 bg-slate-950/95 backdrop-blur-md flex flex-col max-h-[42vh] md:max-h-none md:h-auto overflow-hidden"
      aria-label="AI Vector Scanner"
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.07]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(34,211,238,0.5) 2px, rgba(34,211,238,0.5) 3px)',
        }}
        aria-hidden
      />

      <div className="relative px-4 py-3 border-b border-cyan-500/25 bg-gradient-to-r from-cyan-950/50 to-violet-950/30">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Radar
              className={`w-5 h-5 text-cyan-400 ${idle ? 'animate-spin' : ''}`}
              style={idle ? { animationDuration: '4s' } : undefined}
              aria-hidden
            />
            {!idle && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            )}
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300">
              AI Vector Scanner
            </p>
            <p className="text-[9px] text-cyan-600/90 font-mono">EMBED-5 · COSINE-ENGINE v1</p>
          </div>
          <ScanLine className="w-4 h-4 text-cyan-500/60 ml-auto animate-pulse" aria-hidden />
        </div>
        <div className="mt-2 flex gap-1">
          {['D1', 'D2', 'D3', 'D4', 'D5'].map((d) => (
            <span
              key={d}
              className={`flex-1 h-1 rounded-full ${
                idle ? 'bg-cyan-900/60' : pulse ? 'bg-cyan-400' : 'bg-cyan-600/80'
              } transition-colors duration-300`}
            />
          ))}
        </div>
      </div>

      <div className="relative flex-1 overflow-y-auto px-4 py-3 space-y-3 font-mono text-xs">
        {idle ? (
          <div className="rounded-lg border border-dashed border-cyan-800/60 bg-cyan-950/20 p-4 text-center">
            <Activity className="w-6 h-6 text-cyan-600/80 mx-auto mb-2 animate-pulse" aria-hidden />
            <p className="text-cyan-500/90 text-[11px] leading-relaxed">
              Standing by… Shoot a word into the field to scan its 5D vector.
            </p>
            <p className="text-[10px] text-slate-600 mt-2">TARGET LOCK: {targetWord}</p>
          </div>
        ) : (
          <>
            <div
              className={`rounded-lg border bg-slate-900/80 p-3 transition-all duration-300 ${
                pulse ? 'border-cyan-400 shadow-[0_0_24px_rgba(34,211,238,0.25)]' : 'border-cyan-800/50'
              }`}
            >
              <p className="text-[9px] uppercase tracking-widest text-cyan-500 mb-1.5 flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Particle vector · {scan.word}
              </p>
              <p className="text-cyan-100 text-[13px] leading-relaxed break-all tabular-nums">
                {formatVectorArray(scan.vector)}
              </p>
            </div>

            <div className="rounded-lg border border-violet-800/50 bg-violet-950/30 p-3">
              <p className="text-[9px] uppercase tracking-widest text-violet-400 mb-1.5">
                Target vector · {scan.target}
              </p>
              <p className="text-violet-200/90 text-[12px] leading-relaxed break-all tabular-nums">
                {formatVectorArray(scan.targetVector)}
              </p>
            </div>

            <div
              className={`rounded-lg border p-3 ${
                sim >= 0.7
                  ? 'border-fuchsia-500/50 bg-fuchsia-950/25'
                  : sim >= 0.4
                    ? 'border-amber-500/40 bg-amber-950/20'
                    : 'border-slate-600/50 bg-slate-900/60'
              }`}
            >
              <p className="text-[9px] uppercase tracking-widest text-slate-400 mb-2">
                Cosine similarity
              </p>
              <p className="text-base sm:text-lg font-bold text-white mb-2">
                <span className="text-cyan-300">{scan.word}</span>
                <span className="text-slate-500 mx-1">vs</span>
                <span className="text-fuchsia-300">{scan.target}</span>
                <span className="text-slate-500 mx-1">=</span>
                <span className={sim >= 0.7 ? 'text-fuchsia-300' : 'text-cyan-300'}>
                  {simDisplay}
                </span>
              </p>
              <div className="text-[10px] text-slate-400 space-y-1 leading-relaxed">
                <p className="text-cyan-600/90">cos(θ) = (A · B) / (|A| × |B|)</p>
                <p className="text-slate-500 tabular-nums">
                  = {scan.dotProduct.toFixed(3)} / ({scan.normSpawn.toFixed(3)} ×{' '}
                  {scan.normTarget.toFixed(3)})
                </p>
                <p className="text-emerald-400/90 tabular-nums">= {simDisplay}</p>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    sim >= 0.7 ? 'bg-fuchsia-500' : sim >= 0.4 ? 'bg-amber-400' : 'bg-slate-500'
                  }`}
                  style={{ width: `${Math.min(100, sim * 100)}%` }}
                />
              </div>
              <p className="text-[9px] text-slate-500 mt-1 tabular-nums">{simPct}% semantic match</p>
            </div>
          </>
        )}
      </div>

      <div className="relative shrink-0 px-4 py-3 border-t border-cyan-900/50 bg-slate-950/90">
        <p className="text-[11px] text-slate-400 leading-relaxed font-sans">{VECTOR_SCANNER_EDUCATION}</p>
      </div>
    </aside>
  )
}

import { LineChart, TrendingUp } from 'lucide-react'
import { POPULATION_SIZE, REWARD_SAFETY, REWARD_SPEED } from '../../config/evolveCar'

const EDUCATION =
  'In Reinforcement Learning, AI learns by Trial and Error. We guide it by setting a Reward Function. Change the reward, and watch how the car changes its driving style in the next generations!'

const CHART_W = 200
const CHART_H = 56
const PAD = 4

function buildChartPath(history) {
  if (!history?.length) return null
  const values = history.map((h) => h.best)
  const max = Math.max(...values, 1)
  const min = Math.min(...values, 0)
  const span = max - min || 1
  const n = values.length

  const points = values.map((v, i) => {
    const x = PAD + (i / Math.max(1, n - 1)) * (CHART_W - PAD * 2)
    const y = CHART_H - PAD - ((v - min) / span) * (CHART_H - PAD * 2)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })

  return {
    line: `M ${points.join(' L ')}`,
    max,
    latest: values[values.length - 1],
  }
}

/**
 * Live evolution stats + best-fitness history chart.
 */
export default function EvolveDashboard({
  visible,
  generation,
  livingCount,
  bestFitness,
  rewardMode,
  fitnessHistory,
}) {
  if (!visible) return null

  const chart = buildChartPath(fitnessHistory)
  const rewardLabel =
    rewardMode === REWARD_SPEED ? 'Speed prioritized' : 'Safety prioritized'

  return (
    <aside
      className="absolute top-3 right-3 z-10 w-[min(100%,280px)] pointer-events-none"
      aria-label="Evolution dashboard"
    >
      <div className="rounded-xl border border-cyan-500/35 bg-slate-950/92 backdrop-blur-md shadow-xl shadow-cyan-950/50 overflow-hidden font-mono">
        <div className="px-3 py-2 border-b border-cyan-500/20 bg-gradient-to-r from-cyan-950/60 to-emerald-950/40 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden />
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-cyan-200">
            Evolution Dashboard
          </p>
        </div>

        <div className="px-3 py-2.5 space-y-2 text-[11px]">
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 tabular-nums">
            <div>
              <span className="text-slate-500 block text-[9px] uppercase">Generation</span>
              <span className="text-emerald-300 font-bold text-sm">{generation}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[9px] uppercase">Alive</span>
              <span className="text-cyan-300 font-bold text-sm">
                {livingCount} / {POPULATION_SIZE}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-slate-500 block text-[9px] uppercase">Best fitness (live)</span>
              <span className="text-amber-300 font-bold text-sm">
                {Math.round(bestFitness).toLocaleString()}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-slate-500 block text-[9px] uppercase">Reward</span>
              <span
                className={
                  rewardMode === REWARD_SPEED
                    ? 'text-amber-300/95 font-semibold'
                    : 'text-emerald-300/95 font-semibold'
                }
              >
                {rewardLabel}
              </span>
            </div>
          </div>

          <div className="rounded-lg border border-cyan-800/50 bg-cyan-950/20 px-2 py-2">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[9px] text-cyan-500 uppercase flex items-center gap-1">
                <LineChart className="w-3 h-3" aria-hidden />
                Best fitness / gen
              </span>
              {chart && (
                <span className="text-[9px] text-amber-400/90 tabular-nums">
                  peak {Math.round(chart.max).toLocaleString()}
                </span>
              )}
            </div>
            {chart ? (
              <svg
                viewBox={`0 0 ${CHART_W} ${CHART_H}`}
                className="w-full h-14 text-emerald-400"
                role="img"
                aria-label={`Fitness trend across ${fitnessHistory.length} generations`}
              >
                <defs>
                  <linearGradient id="evolveFitnessFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(52, 211, 153, 0.35)" />
                    <stop offset="100%" stopColor="rgba(52, 211, 153, 0)" />
                  </linearGradient>
                </defs>
                <path
                  d={`${chart.line} L ${CHART_W - PAD},${CHART_H - PAD} L ${PAD},${CHART_H - PAD} Z`}
                  fill="url(#evolveFitnessFill)"
                />
                <path
                  d={chart.line}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <p className="text-[10px] text-slate-600 py-3 text-center">
                Chart fills in after generation 1 ends
              </p>
            )}
          </div>

          <p className="text-[10px] text-sky-400/90 leading-relaxed border-t border-slate-800/80 pt-2">
            {EDUCATION}
          </p>
        </div>
      </div>
    </aside>
  )
}

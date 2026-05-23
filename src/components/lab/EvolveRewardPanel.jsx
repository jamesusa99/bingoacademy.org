import { Gauge, Shield } from 'lucide-react'
import { REWARD_SAFETY, REWARD_SPEED } from '../../config/evolveCar'

const MODES = [
  {
    id: REWARD_SAFETY,
    label: 'Safety Prioritized',
    short: 'Safety',
    icon: Shield,
    formula: 'Distance − close calls − wall proximity',
    hint: 'Rewards careful driving away from walls',
  },
  {
    id: REWARD_SPEED,
    label: 'Speed Prioritized',
    short: 'Speed',
    icon: Gauge,
    formula: 'Distance × average speed',
    hint: 'Rewards going far while moving fast',
  },
]

/**
 * Student-facing reward function control for neuroevolution.
 */
export default function EvolveRewardPanel({ rewardMode, onRewardModeChange, disabled }) {
  return (
    <section
      className="flex-1 min-w-[240px] max-w-xl rounded-xl border border-violet-500/30 bg-violet-950/25 px-3 py-2.5 sm:px-4"
      aria-label="Reward function tuning"
    >
      <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-violet-300 mb-2">
        Reward Function
      </p>
      <div
        className="flex rounded-lg border border-slate-700/80 bg-slate-950/80 p-0.5"
        role="group"
        aria-label="Speed prioritized versus safety prioritized"
      >
        {MODES.map(({ id, label, short, icon: Icon }) => {
          const active = rewardMode === id
          return (
            <button
              key={id}
              type="button"
              disabled={disabled}
              onClick={() => onRewardModeChange(id)}
              className={`flex-1 min-h-[40px] px-2 sm:px-3 rounded-md text-[10px] sm:text-xs font-semibold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 ${
                active
                  ? id === REWARD_SPEED
                    ? 'bg-amber-500/25 text-amber-100 border border-amber-400/50 shadow-sm shadow-amber-900/30'
                    : 'bg-emerald-500/25 text-emerald-100 border border-emerald-400/50 shadow-sm shadow-emerald-900/30'
                  : 'text-slate-500 hover:text-slate-300 border border-transparent'
              }`}
              aria-pressed={active}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden />
              <span className="hidden sm:inline">{label}</span>
              <span className="sm:hidden">{short}</span>
            </button>
          )
        })}
      </div>
      <p className="mt-2 text-[10px] text-violet-400/90 leading-snug">
        {MODES.find((m) => m.id === rewardMode)?.formula}
        <span className="text-slate-600"> · </span>
        <span className="text-slate-500">{MODES.find((m) => m.id === rewardMode)?.hint}</span>
      </p>
      <p className="mt-1 text-[9px] text-slate-600">
        Applies to the next fitness scores — change mid-run and watch driving style shift over
        generations.
      </p>
    </section>
  )
}

import { Bot, HelpCircle, Sparkles } from 'lucide-react'

const MOOD_STYLES = {
  idle: {
    ring: 'border-slate-300 bg-slate-100',
    icon: 'text-slate-500',
    caption: 'Waiting for a doodle…',
    anim: '',
  },
  thinking: {
    ring: 'border-sky-300 bg-sky-50',
    icon: 'text-sky-600',
    caption: 'Scanning your monster…',
    anim: 'animate-pulse',
  },
  confident: {
    ring: 'border-emerald-400 bg-emerald-50 shadow-lg shadow-emerald-200/60',
    icon: 'text-emerald-600',
    caption: "I'm pretty sure!",
    anim: 'scale-110',
  },
  confused: {
    ring: 'border-amber-400 bg-amber-50 shadow-md shadow-amber-200/50',
    icon: 'text-amber-600',
    caption: 'Hmm… could be either!',
    anim: 'animate-doodle-wiggle',
  },
}

/**
 * Robot avatar that reacts to classifier confidence / uncertainty.
 */
export default function DoodleAiRobot({ mood = 'idle', topName, roundPct, spikyPct }) {
  const style = MOOD_STYLES[mood] ?? MOOD_STYLES.idle
  const showConfusedBadge = mood === 'confused'

  return (
    <div className="flex items-center gap-3">
      <div
        className={`relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-2 transition-all duration-500 ease-out ${style.ring} ${style.anim}`}
        aria-hidden
      >
        <Bot className={`w-9 h-9 transition-colors duration-500 ${style.icon}`} strokeWidth={2.2} />
        {showConfusedBadge && (
          <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-white shadow">
            <HelpCircle className="w-4 h-4" aria-hidden />
          </span>
        )}
        {mood === 'confident' && (
          <Sparkles
            className="absolute -bottom-1 -left-1 w-5 h-5 text-emerald-500 animate-pulse"
            aria-hidden
          />
        )}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">AI says</p>
        <p className="text-sm font-black text-slate-800 truncate">{topName}</p>
        <p className={`text-[11px] font-medium mt-0.5 transition-colors duration-500 ${style.icon}`}>
          {style.caption}
        </p>
        {mood !== 'idle' && (
          <p className="text-[10px] text-slate-500 tabular-nums mt-1">
            Round {roundPct}% · Spiky {spikyPct}%
          </p>
        )}
      </div>
    </div>
  )
}

import DoodleAiRobot from './DoodleAiRobot'

/**
 * Dual-color bar: blue = Round, red = Spiky (shares sum to 100%).
 */
export default function DoodleConfidenceMeter({
  roundPct = 0,
  spikyPct = 0,
  mood = 'idle',
  topName = 'Draw a monster!',
  visible,
}) {
  if (!visible) return null

  const roundWidth = Math.max(0, Math.min(100, roundPct))
  const spikyWidth = Math.max(0, Math.min(100, spikyPct))

  return (
    <section
      className="mt-4 rounded-2xl border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 shadow-inner"
      aria-label="AI confidence meter"
    >
      <DoodleAiRobot
        mood={mood}
        topName={topName}
        roundPct={roundPct}
        spikyPct={spikyPct}
      />

      <div className="mt-4">
        <div className="flex justify-between text-[10px] font-bold uppercase tracking-wide mb-1.5">
          <span className="text-blue-600">Round</span>
          <span className="text-slate-400">vs</span>
          <span className="text-red-600">Spiky</span>
        </div>

        <div
          className="relative flex h-10 w-full overflow-hidden rounded-full border-2 border-slate-200 shadow-inner"
          role="progressbar"
          aria-valuenow={roundWidth}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Round ${roundWidth} percent, Spiky ${spikyWidth} percent`}
        >
          <div
            className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500 ease-out flex items-center justify-end pr-2 min-w-0"
            style={{ width: `${roundWidth}%` }}
          >
            {roundWidth >= 18 && (
              <span className="text-[10px] font-black text-white drop-shadow tabular-nums">
                {roundWidth}%
              </span>
            )}
          </div>
          <div
            className="h-full bg-gradient-to-l from-red-500 to-red-600 transition-all duration-500 ease-out flex items-center justify-start pl-2 min-w-0"
            style={{ width: `${spikyWidth}%` }}
          >
            {spikyWidth >= 18 && (
              <span className="text-[10px] font-black text-white drop-shadow tabular-nums">
                {spikyWidth}%
              </span>
            )}
          </div>
          {roundWidth < 18 && spikyWidth < 18 && mood !== 'idle' && (
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-500">
              50 / 50 — uncertain!
            </span>
          )}
        </div>

        <div className="flex justify-between mt-2 text-[11px] font-semibold tabular-nums">
          <span className="text-blue-700">🔵 Class A: Round</span>
          <span className="text-red-700">⚡ Class B: Spiky</span>
        </div>

        <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
          {mood === 'confused'
            ? 'Hybrid monsters split the bar — the AI is torn between your two training tribes!'
            : mood === 'confident'
              ? 'Strong lean toward one class — the AI recognizes familiar shapes.'
              : 'Keep drawing — guesses update every half second in Test Mode.'}
        </p>
      </div>
    </section>
  )
}

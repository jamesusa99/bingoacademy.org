import {
  CYBER_TENNIS_EDUCATION,
  CYBER_TENNIS_TELEMETRY,
} from '../../config/cyberTennis'

function MetricRow({ label, value, unit, hint, featured = false }) {
  return (
    <div
      className={`rounded-xl border px-3 py-2.5 ${
        featured
          ? 'border-cyan-500/30 bg-cyan-950/25 col-span-2'
          : 'border-emerald-500/15 bg-slate-950/60'
      }`}
    >
      <p
        className={`text-[10px] font-bold uppercase tracking-wider ${
          featured ? 'text-cyan-300/90' : 'text-emerald-400/80'
        }`}
      >
        {label}
      </p>
      <p className="text-lg font-mono font-bold text-white mt-0.5 tabular-nums break-all">
        {value}
        {unit && value !== '—' ? (
          <span className="text-xs font-normal text-slate-500 ml-1">{unit}</span>
        ) : null}
      </p>
      {hint ? <p className="text-[10px] text-slate-500 mt-0.5">{hint}</p> : null}
    </div>
  )
}

export default function CyberTennisTelemetry({ active, metrics = {} }) {
  const featured = CYBER_TENNIS_TELEMETRY.filter((r) => r.featured)
  const secondary = CYBER_TENNIS_TELEMETRY.filter((r) => !r.featured)

  return (
    <aside className="flex flex-col gap-3 h-full">
      <div className="rounded-2xl border border-emerald-500/25 bg-slate-900/80 backdrop-blur-sm p-4 flex-1">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">AI Telemetry</p>
            <p className="text-xs text-slate-500 mt-0.5">Throttled live math · ~10 Hz</p>
          </div>
          <span
            className={`text-[10px] font-mono px-2 py-1 rounded-full border ${
              active
                ? 'border-emerald-400/40 text-emerald-300 bg-emerald-500/10'
                : 'border-slate-600 text-slate-500'
            }`}
          >
            {active ? '● LIVE' : '○ IDLE'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          {featured.map((row) => (
            <MetricRow
              key={row.id}
              label={row.label}
              value={metrics[row.id] ?? row.placeholder}
              unit={row.unit}
              featured
              hint={
                row.id === 'swingSpeed' && active
                  ? '‖Δx, Δy‖ between frames'
                  : row.id === 'aiConfidence' && active
                    ? 'MoveNet keypoint confidence'
                    : null
              }
            />
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2">
          {secondary.map((row) => (
            <MetricRow
              key={row.id}
              label={row.label}
              value={metrics[row.id] ?? row.placeholder}
              unit={row.unit}
              hint={row.id === 'collisions' && !active ? 'Start game to track' : null}
            />
          ))}
        </div>

        <div className="mt-4 rounded-xl border border-violet-500/25 bg-violet-950/20 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-violet-300 mb-2">
            How the math works
          </p>
          <p className="text-[11px] text-slate-300 leading-relaxed">{CYBER_TENNIS_EDUCATION}</p>
          <p className="text-[10px] text-slate-500 mt-2 font-mono">
            swing = √((x₂−x₁)² + (y₂−y₁)²) · return speed ∝ swing
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-fuchsia-500/20 bg-fuchsia-950/15 p-4 text-xs leading-relaxed">
        <p className="font-semibold text-fuchsia-200 mb-1">🎓 Exploration Lab</p>
        <p className="text-slate-400">
          Watch coordinates and swing velocity change as you move. A harder swing sends the ball back
          faster — the same vector idea used in real game engines and robotics.
        </p>
      </div>
    </aside>
  )
}

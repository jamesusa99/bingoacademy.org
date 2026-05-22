import { POSE_DATA_EDUCATION } from '../../config/conductorPose'

const EMPTY_SNAPSHOT = {
  rows: [
    { label: 'Left Wrist', x: null, y: null, jointScore: null },
    { label: 'Right Wrist', x: null, y: null, jointScore: null },
    { label: 'Nose', x: null, y: null, jointScore: null },
  ],
  poseScore: null,
  visibleJoints: 0,
}

function fmtCoord(v) {
  if (v == null) return '—'
  return String(v).padStart(4, ' ')
}

function fmtPct(score) {
  if (score == null) return '—'
  return `${(score * 100).toFixed(0)}%`
}

/**
 * Live pose coordinates for education — fed by throttled React state (~10 Hz).
 */
export default function PoseDataMatrix({ snapshot, frameSize, active }) {
  const data = snapshot ?? EMPTY_SNAPSHOT
  const posePct =
    data.poseScore != null ? `${(data.poseScore * 100).toFixed(1)}%` : '—'

  return (
    <div className="rounded-2xl border border-fuchsia-500/25 bg-slate-950/80 p-4 font-mono text-xs">
      <div className="flex items-center justify-between gap-2 mb-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-fuchsia-300">
          Data Matrix
        </p>
        <span
          className={`text-[9px] px-2 py-0.5 rounded-full border ${
            active
              ? 'border-[#22d3ee]/50 text-[#22d3ee] bg-[#22d3ee]/10'
              : 'border-slate-700 text-slate-600'
          }`}
        >
          {active ? 'LIVE' : 'IDLE'}
        </span>
      </div>

      {frameSize && (
        <p className="text-[9px] text-slate-600 mb-2">
          Grid: {frameSize.w} × {frameSize.h} px (video space)
        </p>
      )}

      <div className="overflow-x-auto -mx-1 px-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[9px] text-slate-500 uppercase tracking-wide border-b border-slate-800">
              <th className="py-1.5 pr-2 font-semibold">Joint</th>
              <th className="py-1.5 px-2 font-semibold text-right">X</th>
              <th className="py-1.5 px-2 font-semibold text-right">Y</th>
              <th className="py-1.5 pl-2 font-semibold text-right">Conf.</th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row) => (
              <tr
                key={row.label}
                className="border-b border-slate-800/80 last:border-0 transition-colors duration-150"
              >
                <td className="py-2 pr-2 text-violet-200/90 font-sans font-medium whitespace-nowrap">
                  {row.label}
                </td>
                <td className="py-2 px-2 text-right text-cyan-300 tabular-nums">{fmtCoord(row.x)}</td>
                <td className="py-2 px-2 text-right text-cyan-300 tabular-nums">{fmtCoord(row.y)}</td>
                <td className="py-2 pl-2 text-right text-amber-300/90 tabular-nums">
                  {fmtPct(row.jointScore)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-800 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className="text-[9px] text-slate-500 uppercase tracking-wide">Pose confidence</p>
          <p className="text-lg font-bold text-fuchsia-300 tabular-nums transition-all duration-200">
            {posePct}
          </p>
        </div>
        <p className="text-[9px] text-slate-600">
          {data.visibleJoints}/17 joints tracked
        </p>
      </div>

      <p className="mt-4 text-[11px] text-slate-400 leading-relaxed font-sans border-t border-slate-800/80 pt-3">
        {POSE_DATA_EDUCATION}
      </p>
    </div>
  )
}

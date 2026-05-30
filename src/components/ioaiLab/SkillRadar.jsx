import { SKILL_AXES } from '../../config/ioaiTrainingLab'

export default function SkillRadar({ values }) {
  const size = 200
  const center = size / 2
  const radius = 72
  const n = values.length

  const point = (i, r) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2
    return [center + r * Math.cos(angle), center + r * Math.sin(angle)]
  }

  const gridLevels = [0.25, 0.5, 0.75, 1]
  const dataPoints = values.map((v, i) => point(i, (v.value / 100) * radius))

  const polygon = dataPoints.map((p) => p.join(',')).join(' ')

  return (
    <div className="ioai-skill-radar">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
        {gridLevels.map((level) => (
          <polygon
            key={level}
            points={values.map((_, i) => point(i, radius * level).join(',')).join(' ')}
            fill="none"
            stroke="rgba(148,163,184,0.2)"
            strokeWidth="1"
          />
        ))}
        {values.map((v, i) => {
          const [x, y] = point(i, radius)
          const [lx, ly] = point(i, radius + 18)
          return (
            <g key={v.id}>
              <line x1={center} y1={center} x2={x} y2={y} stroke="rgba(148,163,184,0.15)" />
              <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" className="fill-slate-500 text-[8px]">
                {v.label.split(' ')[0]}
              </text>
            </g>
          )
        })}
        <polygon points={polygon} fill="rgba(34,211,238,0.25)" stroke="#22d3ee" strokeWidth="2" />
      </svg>
      <ul className="mt-3 grid grid-cols-2 gap-1 text-[10px] text-slate-400">
        {values.map((v) => (
          <li key={v.id}>
            {v.label}: <span className="text-cyan-400 font-semibold">{v.value}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

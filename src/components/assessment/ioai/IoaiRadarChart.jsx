export default function IoaiRadarChart({ values }) {
  const size = 280
  const center = size / 2
  const radius = 86
  const n = values.length || 1

  const point = (i, r) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2
    return [center + r * Math.cos(angle), center + r * Math.sin(angle)]
  }

  const gridLevels = [0.25, 0.5, 0.75, 1]
  const dataPoints = values.map((v, i) => point(i, ((v.value || 0) / 100) * radius))
  const polygon = dataPoints.map((p) => p.join(',')).join(' ')

  return (
    <div>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="mx-auto max-w-full h-auto"
        role="img"
        aria-label="IOAI syllabus coverage snapshot"
      >
        {gridLevels.map((level) => (
          <polygon
            key={level}
            points={values.map((_, i) => point(i, radius * level).join(',')).join(' ')}
            fill="none"
            stroke="#cbd5e1"
            strokeWidth="1"
          />
        ))}
        {values.map((v, i) => {
          const [x, y] = point(i, radius)
          const [lx, ly] = point(i, radius + 28)
          return (
            <g key={v.id}>
              <line x1={center} y1={center} x2={x} y2={y} stroke="#e2e8f0" />
              <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" className="fill-slate-600" fontSize="10">
                {v.shortLabel || v.label}
              </text>
            </g>
          )
        })}
        <polygon points={polygon} fill="rgba(14,165,183,0.22)" stroke="#0e93b0" strokeWidth="2" />
      </svg>
    </div>
  )
}

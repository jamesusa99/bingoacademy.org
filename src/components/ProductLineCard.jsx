import { Link } from 'react-router-dom'

export default function ProductLineCard({ line, compact = false }) {
  return (
    <Link
      to={line.to}
      className={`card block overflow-hidden border-2 ${line.border} hover:shadow-lg transition group`}
    >
      <div className={`bg-gradient-to-br ${line.gradient} p-5 sm:p-6`}>
        <div className="flex items-start gap-3">
          <span className="text-3xl sm:text-4xl">{line.icon}</span>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">{line.nameEn}</p>
            <h3 className="font-bold text-bingo-dark text-lg sm:text-xl group-hover:text-primary transition">{line.name}</h3>
            {!compact && <p className="text-sm text-slate-600 mt-1">{line.tagline}</p>}
          </div>
          <span className="text-slate-400 group-hover:text-primary transition shrink-0">→</span>
        </div>
      </div>
      {!compact && (
        <ul className="px-5 py-4 grid sm:grid-cols-2 gap-2 border-t border-slate-100 bg-white">
          {line.subcategories.map((s) => (
            <li key={s.id} className="flex items-center gap-2 text-xs text-slate-600">
              <span>{s.icon}</span>
              <span className="font-medium text-slate-700">{s.name}</span>
            </li>
          ))}
        </ul>
      )}
    </Link>
  )
}

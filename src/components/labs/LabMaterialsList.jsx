import { LAB_EXPERIMENTS_PORTAL } from '../../config/labExperiments'

export default function LabMaterialsList({ items, className = '', dark = false }) {
  const list = (items || []).filter((row) => row?.name)
  if (!list.length) return null

  if (dark) {
    return (
      <section className={className}>
        <h2 className="font-bold text-white text-sm mb-3">{LAB_EXPERIMENTS_PORTAL.materialsTitle}</h2>
        <ul className="divide-y divide-slate-700/80 border border-slate-700/80 rounded-xl overflow-hidden">
          {list.map((item, index) => (
            <li
              key={`${item.name}-${index}`}
              className="px-4 py-3 flex flex-wrap items-start justify-between gap-2 bg-slate-800/40"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-200">{item.name}</p>
                {item.note ? <p className="text-xs text-slate-500 mt-0.5">{item.note}</p> : null}
              </div>
              <div className="flex items-center gap-2 shrink-0 text-xs">
                {item.quantity ? <span className="text-slate-400">{item.quantity}</span> : null}
                <span
                  className={`font-semibold px-2 py-0.5 rounded-full ${
                    item.required !== false
                      ? 'bg-amber-500/15 text-amber-300'
                      : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  {item.required !== false
                    ? LAB_EXPERIMENTS_PORTAL.materialsRequired
                    : LAB_EXPERIMENTS_PORTAL.materialsOptional}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>
    )
  }

  return (
    <section className={className}>
      <h2 className="font-bold text-bingo-dark text-sm mb-3">{LAB_EXPERIMENTS_PORTAL.materialsTitle}</h2>
      <ul className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
        {list.map((item, index) => (
          <li key={`${item.name}-${index}`} className="px-4 py-3 flex flex-wrap items-start justify-between gap-2 bg-white">
            <div className="min-w-0">
              <p className="text-sm font-medium text-bingo-dark">{item.name}</p>
              {item.note ? <p className="text-xs text-slate-500 mt-0.5">{item.note}</p> : null}
            </div>
            <div className="flex items-center gap-2 shrink-0 text-xs">
              {item.quantity ? <span className="text-slate-600">{item.quantity}</span> : null}
              <span
                className={`font-semibold px-2 py-0.5 rounded-full ${
                  item.required !== false
                    ? 'bg-amber-50 text-amber-700'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {item.required !== false
                  ? LAB_EXPERIMENTS_PORTAL.materialsRequired
                  : LAB_EXPERIMENTS_PORTAL.materialsOptional}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

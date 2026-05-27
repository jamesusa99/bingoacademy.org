import { COURSES_PORTAL } from '../../config/coursesPortal'

export default function EmptyState({ onClear }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-12 text-center">
      <p className="text-4xl mb-4" aria-hidden>
        🔍
      </p>
      <h3 className="text-lg font-semibold text-white mb-2">{COURSES_PORTAL.emptyFilterTitle}</h3>
      <p className="text-sm text-slate-400 mb-6 max-w-md mx-auto">{COURSES_PORTAL.emptyFilterDesc}</p>
      {onClear ? (
        <button
          type="button"
          onClick={onClear}
          className="px-4 py-2 rounded-md bg-slate-700 text-white text-sm font-medium hover:bg-slate-600 transition"
        >
          {COURSES_PORTAL.clearFilters}
        </button>
      ) : null}
    </div>
  )
}

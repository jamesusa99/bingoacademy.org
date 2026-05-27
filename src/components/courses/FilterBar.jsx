import {
  COURSE_CATEGORIES,
  COURSE_LEVELS,
  COURSE_PRICE_FILTERS,
  COURSE_SORT_OPTIONS,
} from '../../config/courseListFilters'
import { COURSES_PORTAL } from '../../config/coursesPortal'

export default function FilterBar({ filters, onFiltersChange }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/80 p-4 sm:p-5 space-y-4">
      <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
        <label className="flex-1 relative">
          <span className="sr-only">{COURSES_PORTAL.searchPlaceholder}</span>
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" aria-hidden>
            🔍
          </span>
          <input
            type="search"
            value={filters.search}
            onChange={(e) => onFiltersChange({ search: e.target.value, page: 1 })}
            placeholder={COURSES_PORTAL.searchPlaceholder}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-900 border border-slate-600 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </label>
        <label className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-slate-400 whitespace-nowrap">{COURSES_PORTAL.sortLabel}</span>
          <select
            value={filters.sort}
            onChange={(e) => onFiltersChange({ sort: e.target.value, page: 1 })}
            className="py-2.5 px-3 rounded-lg bg-slate-900 border border-slate-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            {COURSE_SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 w-full sm:w-auto sm:mr-1">
            {COURSES_PORTAL.filterCategory}
          </span>
          {COURSE_CATEGORIES.map((c) => (
            <FilterChip
              key={c.value}
              active={filters.category === c.value}
              onClick={() => onFiltersChange({ category: c.value, page: 1 })}
            >
              {c.label}
            </FilterChip>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 w-full sm:w-auto sm:mr-1">
            {COURSES_PORTAL.filterLevel}
          </span>
          {COURSE_LEVELS.map((l) => (
            <FilterChip
              key={l.value}
              active={filters.level === l.value}
              onClick={() => onFiltersChange({ level: l.value, page: 1 })}
            >
              {l.label}
            </FilterChip>
          ))}
          <span className="hidden sm:inline w-px h-5 bg-slate-600 mx-1" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 w-full sm:w-auto sm:mr-1">
            {COURSES_PORTAL.filterPrice}
          </span>
          {COURSE_PRICE_FILTERS.map((p) => (
            <FilterChip
              key={p.value}
              active={filters.price === p.value}
              onClick={() => onFiltersChange({ price: p.value, page: 1 })}
            >
              {p.label}
            </FilterChip>
          ))}
        </div>
      </div>
    </div>
  )
}

function FilterChip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium transition min-h-[36px] ${
        active
          ? 'bg-blue-500 text-white'
          : 'bg-slate-900 text-slate-300 border border-slate-600 hover:border-slate-500'
      }`}
    >
      {children}
    </button>
  )
}

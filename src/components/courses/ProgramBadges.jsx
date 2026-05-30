import { getProductLine, subcategoryLabel } from '../../config/products'
import { getProgramByLine, USE_CASE_BY_LINE } from '../../config/programs'

export function ProgramBadge({ lineId, className = '' }) {
  const line = getProductLine(lineId)
  const program = getProgramByLine(lineId)
  const colors =
    lineId === 'ioai'
      ? 'bg-amber-100 text-amber-900'
      : lineId === 'k12'
        ? 'bg-violet-100 text-violet-900'
        : 'bg-cyan-100 text-cyan-900'

  return (
    <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${colors} ${className}`}>
      {line.icon} {program.title}
    </span>
  )
}

export function ModuleBadge({ lineId, subId, className = '' }) {
  if (!subId) return null
  return (
    <span className={`text-[10px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded ${className}`}>
      {subcategoryLabel(lineId, subId)}
    </span>
  )
}

export function UseCaseTag({ lineId, className = '' }) {
  const tag = USE_CASE_BY_LINE[lineId]
  if (!tag) return null
  return (
    <span className={`text-[10px] font-medium text-slate-500 ${className}`}>
      {tag.icon} {tag.label}
    </span>
  )
}

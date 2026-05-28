import { programBadgeForLine, LINE_TO_PROGRAM_SLUG } from '../../config/programs'
import { subcategoryLabel } from '../../config/products'

export function ProgramBadge({ lineId, className = '' }) {
  const { label } = programBadgeForLine(lineId)
  const colors =
    lineId === 'ioai'
      ? 'bg-amber-100 text-amber-900'
      : lineId === 'k12'
        ? 'bg-violet-100 text-violet-900'
        : 'bg-cyan-100 text-cyan-900'
  return (
    <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${colors} ${className}`}>
      {label}
    </span>
  )
}

export function ModuleBadge({ lineId, subId, className = '' }) {
  if (!subId) return null
  const name = subcategoryLabel(lineId, subId)
  return (
    <span className={`text-[10px] font-medium text-slate-500 ${className}`}>
      {name}
    </span>
  )
}

export function UseCaseTag({ lineId, className = '' }) {
  const { useCase } = programBadgeForLine(lineId)
  return <span className={`text-[10px] text-slate-500 ${className}`}>{useCase}</span>
}

export function programCompareHref(lineId) {
  const slug = LINE_TO_PROGRAM_SLUG[lineId]
  return slug ? `/programs/${slug}` : '/courses'
}

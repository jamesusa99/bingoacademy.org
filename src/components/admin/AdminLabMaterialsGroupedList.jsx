import { useMemo } from 'react'
import { getProgramCurriculum } from '../../config/programCurriculum'
import { groupLabMaterialsByLesson, labMaterialTypeLabel, normalizeLabMaterialSub } from '../../config/labMaterials'

function ItemRow({ row, labels, onEdit, onDelete }) {
  return (
    <tr className="border-t border-slate-100 hover:bg-slate-50/80">
      <td className="p-3">
        <span className="text-xs font-medium text-slate-700">{labMaterialTypeLabel(row.sub, row.line)}</span>
      </td>
      <td className="p-3 font-medium">{row.name}</td>
      <td className="p-3 text-slate-600">{labels.statusLabel(row.status)}</td>
      <td className="p-3 text-slate-600">{row.price || '—'}</td>
      <td className="p-3 text-xs font-mono text-slate-400">{row.slug}</td>
      <td className="p-3 whitespace-nowrap text-xs">
        <button type="button" onClick={() => onEdit(row)} className="text-primary mr-2">
          {labels.edit}
        </button>
        <button type="button" onClick={() => onDelete(row.slug)} className="text-red-600">
          {labels.delete}
        </button>
      </td>
    </tr>
  )
}

function LessonGroupTable({ items, labels, onEdit, onDelete }) {
  if (!items.length) return null
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 mb-3">
      <table className="w-full text-sm min-w-[640px]">
        <thead className="bg-slate-50 text-left text-slate-600 text-xs">
          <tr>
            <th className="p-2">{labels.colType}</th>
            <th className="p-2">{labels.name}</th>
            <th className="p-2">{labels.status}</th>
            <th className="p-2">{labels.price}</th>
            <th className="p-2">{labels.colSlug}</th>
            <th className="p-2" />
          </tr>
        </thead>
        <tbody>
          {items.map((row) => (
            <ItemRow key={row.slug} row={row} labels={labels} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function AdminLabMaterialsGroupedList({
  items,
  levelsByLine,
  lineFilter,
  typeFilter,
  labels,
  onEdit,
  onDelete,
}) {
  const filtered = useMemo(() => {
    let rows = items
    if (lineFilter !== 'all') rows = rows.filter((r) => r.line === lineFilter)
    if (typeFilter !== 'all') {
      rows = rows.filter((r) => normalizeLabMaterialSub(r.sub, r.line) === typeFilter)
    }
    return rows
  }, [items, lineFilter, typeFilter])

  const { groups, unassigned } = useMemo(
    () => groupLabMaterialsByLesson(filtered, levelsByLine, lineFilter),
    [filtered, levelsByLine, lineFilter]
  )

  if (!filtered.length) {
    return <p className="p-6 text-sm text-slate-500">{labels.noCourses}</p>
  }

  return (
    <div className="p-4 space-y-6">
      {groups.map(({ line, lesson, items: groupItems }) => {
        const config = getProgramCurriculum(line)
        return (
          <div key={`${line}-${lesson.lessonId}`} className="border-b border-slate-100 pb-6 last:border-0">
            <div className="mb-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                {config.icon} {config.adminTitle}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {labels.colStage}: {lesson.stage} · {labels.colCategory}: {lesson.category} · {labels.colModule}:{' '}
                {lesson.module}
              </p>
              <p className="text-sm font-semibold text-bingo-dark mt-1">
                {labels.colLesson}: {lesson.lessonTitle}
                <span className="ml-2 text-xs font-normal text-slate-400 font-mono">{lesson.catalogSlug}</span>
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {labels.lessonItemCount.replace('{{count}}', String(groupItems.length))}
              </p>
            </div>
            <LessonGroupTable items={groupItems} labels={labels} onEdit={onEdit} onDelete={onDelete} />
          </div>
        )
      })}

      {unassigned.length > 0 ? (
        <div>
          <p className="text-sm font-semibold text-amber-800 mb-2">{labels.unassignedHeading}</p>
          <p className="text-xs text-amber-700/80 mb-3">{labels.unassignedHint}</p>
          <LessonGroupTable items={unassigned} labels={labels} onEdit={onEdit} onDelete={onDelete} />
        </div>
      ) : null}
    </div>
  )
}

import DragHandle from './DragHandle'
import { useDragReorder } from '../../hooks/useDragReorder'

function sortByOrder(rows) {
  return [...rows].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
}

export function countLevelTree(level) {
  let themes = 0
  let modules = 0
  let lessons = 0
  for (const theme of level.themes || []) {
    themes += 1
    for (const mod of theme.modules || []) {
      modules += 1
      lessons += mod.lessons?.length || 0
    }
  }
  return { themes, modules, lessons }
}

/**
 * L1 stage list for curriculum admin (ioai / general / k12).
 */
export default function CurriculumLevel1List({
  levels,
  labels,
  onEdit,
  onDelete,
  onAdd,
  onReorder,
  activeId = null,
}) {
  const sorted = sortByOrder(levels || [])
  const drag = useDragReorder({
    items: sorted,
    getKey: (level) => level.id,
    onReorder: onReorder || (async () => {}),
    disabled: !onReorder,
  })

  if (!sorted.length) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm text-slate-500 mb-3">{labels.empty}</p>
        {onAdd ? (
          <button type="button" onClick={onAdd} className="btn-primary text-sm px-4 py-2">
            + {labels.addCourse}
          </button>
        ) : null}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      {onReorder && drag.saving ? (
        <p className="px-4 pt-3 text-xs text-primary">{labels.savingOrder}</p>
      ) : null}
      {onReorder ? (
        <p className="px-4 pt-3 text-[11px] text-slate-500">{labels.level1DragReorderHint || labels.dragReorderHint}</p>
      ) : null}
      <table className="w-full text-sm min-w-[680px]">
        <thead className="bg-slate-50 text-left text-slate-600 text-xs">
          <tr>
            {onReorder ? <th className="p-3 w-10" aria-label={labels.dragHint} /> : null}
            <th className="p-3 w-12"> </th>
            <th className="p-3">{labels.colStage}</th>
            <th className="p-3">Slug</th>
            <th className="p-3">{labels.colStatus}</th>
            <th className="p-3">{labels.colSortOrder}</th>
            <th className="p-3">{labels.colActions}</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((level) => {
            const stats = countLevelTree(level)
            const isActive = activeId === level.id
            const dragProps = onReorder ? drag.rowProps(level) : {}
            return (
              <tr
                key={level.id}
                {...dragProps}
                className={`border-t border-slate-100 ${isActive ? 'bg-primary/5' : 'hover:bg-slate-50/80'} ${dragProps.className || ''}`}
              >
                {onReorder ? (
                  <td className="p-2 w-10">
                    <DragHandle label={labels.dragHint} />
                  </td>
                ) : null}
                <td className="p-3 text-lg">{level.emoji || '—'}</td>
                <td className="p-3">
                  <p className="font-medium text-bingo-dark">{level.title}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {labels.stageStats(stats.themes, stats.modules, stats.lessons)}
                  </p>
                </td>
                <td className="p-3 text-xs font-mono text-slate-400">{level.slug}</td>
                <td className="p-3 text-xs">{labels.statusLabel?.(level.status) || level.status || '—'}</td>
                <td className="p-3 text-xs text-slate-500">{level.sort_order ?? 0}</td>
                <td className="p-3 whitespace-nowrap text-xs space-x-2">
                  <button type="button" onClick={() => onEdit(level)} className="text-primary font-semibold">
                    {labels.edit}
                  </button>
                  <button type="button" onClick={() => onDelete(level)} className="text-red-600 font-semibold">
                    {labels.deleteStage}
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

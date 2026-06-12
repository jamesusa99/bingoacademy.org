import { useMemo } from 'react'
import { getProgramCurriculum } from '../../config/programCurriculum'
import { useAdminLocale } from '../../contexts/AdminLocaleContext'
import {
  groupLabMaterialsByModule,
  labMaterialTypeLabel,
  normalizeLabMaterialSub,
  partitionLabAndMaterialItems,
} from '../../config/labMaterials'
import { useDragReorder } from '../../hooks/useDragReorder'
import DragHandle from './DragHandle'

function sortByOrder(rows) {
  return [...rows].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
}

function partitionModuleItems(items, productLine) {
  return partitionLabAndMaterialItems(items, productLine)
}

function ItemRow({ row, labels, onEdit, onDelete, dragProps }) {
  const { locale } = useAdminLocale()
  return (
    <tr {...dragProps} className={`border-t border-slate-100 hover:bg-slate-50/80 ${dragProps.className || ''}`}>
      <td className="p-2 w-10">
        <DragHandle label={labels.dragHint} />
      </td>
      <td className="p-3">
        <span className="text-xs font-medium text-slate-700">{labMaterialTypeLabel(row.sub, row.line, { locale })}</span>
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

function ModuleDragTable({ items, sectionTitle, labels, onEdit, onDelete, onReorder }) {
  const sorted = useMemo(() => sortByOrder(items), [items])

  if (!sorted.length) return null

  if (!onReorder) {
    return (
      <div className="mb-4 last:mb-0">
        {sectionTitle ? (
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 mb-2">{sectionTitle}</p>
        ) : null}
        <ModuleGroupTable items={sorted} labels={labels} onEdit={onEdit} onDelete={onDelete} />
      </div>
    )
  }

  const drag = useDragReorder({
    items: sorted,
    getKey: (row) => row.slug,
    onReorder,
  })

  return (
    <div className="mb-4 last:mb-0">
      {sectionTitle ? (
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 mb-2">{sectionTitle}</p>
      ) : null}
      {drag.saving ? (
        <p className="text-xs text-primary bg-primary/5 border border-primary/10 rounded-lg px-3 py-2 mb-2">
          {labels.savingOrder}
        </p>
      ) : null}
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-sm min-w-[680px]">
          <thead className="bg-slate-50 text-left text-slate-600 text-xs">
            <tr>
              <th className="p-2 w-10" aria-label={labels.dragHint} />
              <th className="p-2">{labels.colType}</th>
              <th className="p-2">{labels.name}</th>
              <th className="p-2">{labels.status}</th>
              <th className="p-2">{labels.price}</th>
              <th className="p-2">{labels.colSlug}</th>
              <th className="p-2" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => (
              <ItemRow
                key={row.slug}
                row={row}
                labels={labels}
                onEdit={onEdit}
                onDelete={onDelete}
                dragProps={drag.rowProps(row)}
              />
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[10px] text-slate-400 mt-1.5">{labels.dragReorderHint}</p>
    </div>
  )
}

function ModuleGroupTable({ items, labels, onEdit, onDelete }) {
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
            <tr key={row.slug} className="border-t border-slate-100 hover:bg-slate-50/80">
              <td className="p-3">
                <span className="text-xs font-medium text-slate-700">{labMaterialTypeLabel(row.sub, row.line, { locale })}</span>
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
  onReorderModuleItems,
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
    () => groupLabMaterialsByModule(filtered, levelsByLine, lineFilter),
    [filtered, levelsByLine, lineFilter]
  )

  if (!filtered.length) {
    return <p className="p-6 text-sm text-slate-500">{labels.noCourses}</p>
  }

  const handleReorder =
    onReorderModuleItems &&
    ((next) => onReorderModuleItems(next))

  return (
    <div className="p-4 space-y-6">
      {groups.map(({ line, module, items: groupItems }) => {
        const config = getProgramCurriculum(line)
        const extrasCents = groupItems.reduce((sum, row) => {
          const cents = row.price_cents > 0 ? row.price_cents : null
          return sum + (cents || 0)
        }, 0)
        const { labs, materials } = partitionModuleItems(groupItems, line)
        const showSplit = handleReorder && typeFilter === 'all'

        return (
          <div key={`${line}-${module.moduleId}`} className="border-b border-slate-100 pb-6 last:border-0">
            <div className="mb-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                {config.icon} {config.adminTitle}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {labels.colStage}: {module.stage} · {labels.colCategory}: {module.category}
              </p>
              <p className="text-sm font-semibold text-bingo-dark mt-1">
                {labels.colModule}: {module.module}
                <span className="ml-2 text-xs font-normal text-slate-400 font-mono">{module.catalogSlug}</span>
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {labels.moduleItemCount.replace('{{count}}', String(groupItems.length))}
                {extrasCents > 0 && labels.moduleExtrasPrice
                  ? ` · ${labels.moduleExtrasPrice.replace('{{price}}', `$${(extrasCents / 100).toLocaleString()}`)}`
                  : ''}
              </p>
            </div>

            {showSplit ? (
              <>
                <ModuleDragTable
                  items={labs}
                  sectionTitle={labels.sectionLabs}
                  labels={labels}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onReorder={handleReorder}
                />
                <ModuleDragTable
                  items={materials}
                  sectionTitle={labels.sectionMaterials}
                  labels={labels}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onReorder={handleReorder}
                />
              </>
            ) : (
              <ModuleDragTable
                items={groupItems}
                labels={labels}
                onEdit={onEdit}
                onDelete={onDelete}
                onReorder={handleReorder || undefined}
              />
            )}
          </div>
        )
      })}

      {unassigned.length > 0 ? (
        <div>
          <p className="text-sm font-semibold text-amber-800 mb-2">{labels.unassignedHeading}</p>
          <p className="text-xs text-amber-700/80 mb-3">{labels.unassignedHint}</p>
          <ModuleGroupTable items={unassigned} labels={labels} onEdit={onEdit} onDelete={onDelete} />
        </div>
      ) : null}
    </div>
  )
}

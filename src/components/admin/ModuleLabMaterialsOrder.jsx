import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { labMaterialTypeLabel, partitionLabAndMaterialItems } from '../../config/labMaterials'
import { useDragReorder } from '../../hooks/useDragReorder'
import DragHandle from './DragHandle'

function sortByOrder(rows) {
  return [...rows].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
}

function CatalogSortList({ items, title, emptyHint, labels, onReorder }) {
  const sorted = useMemo(() => sortByOrder(items), [items])
  const drag = useDragReorder({
    items: sorted,
    getKey: (row) => row.slug,
    onReorder: onReorder || (async () => {}),
    disabled: !onReorder,
  })

  return (
    <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
      <p className="text-xs font-semibold text-slate-600 mb-2">{title}</p>
      {drag.saving ? <p className="text-xs text-primary mb-2">{labels.savingOrder}</p> : null}
      {sorted.length ? (
        <ul className="text-xs text-slate-600 space-y-1">
          {sorted.map((row) => {
            const dragProps = onReorder ? drag.rowProps(row) : null
            return (
              <li
                key={row.slug}
                {...(dragProps || {})}
                className={`flex items-center gap-2 rounded-lg px-1 py-1.5 bg-white border border-slate-100 ${dragProps?.className || ''}`}
              >
                {onReorder ? <DragHandle label={labels.dragHint} className="w-7 h-7 shrink-0" /> : null}
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                    {labMaterialTypeLabel(row.sub, row.line)}
                  </p>
                  <p className="font-medium text-bingo-dark truncate">{row.name}</p>
                  <p className="text-[10px] font-mono text-slate-400 truncate">{row.slug}</p>
                </div>
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="text-xs text-slate-400">{emptyHint}</p>
      )}
      {onReorder && sorted.length ? (
        <p className="text-[10px] text-slate-400 mt-2">{labels.dragReorderHint}</p>
      ) : null}
    </div>
  )
}

/** L3 module — draggable L4 lab + material kit lists */
export default function ModuleLabMaterialsOrder({
  items = [],
  productLine,
  labels,
  onReorder,
  labsAdminHref,
}) {
  const { labs, materials } = useMemo(
    () => partitionLabAndMaterialItems(items, productLine),
    [items, productLine]
  )

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold text-slate-600">{labels.moduleExtrasTitle}</p>
        {labsAdminHref ? (
          <Link to={labsAdminHref} className="text-[10px] text-primary hover:underline">
            {labels.manageLabsLink}
          </Link>
        ) : null}
      </div>
      <CatalogSortList
        items={labs}
        title={labels.sectionLabs}
        emptyHint={labels.moduleLabsEmpty}
        labels={labels}
        onReorder={onReorder}
      />
      <CatalogSortList
        items={materials}
        title={labels.sectionMaterials}
        emptyHint={labels.moduleMaterialsEmpty}
        labels={labels}
        onReorder={onReorder}
      />
    </div>
  )
}

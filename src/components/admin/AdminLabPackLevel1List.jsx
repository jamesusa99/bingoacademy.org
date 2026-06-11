import { Link } from 'react-router-dom'
import { deliveryTypeForLabSub, labMaterialTypeLabel, normalizeLabMaterialSub } from '../../config/labMaterials'
import { getProgramCurriculum } from '../../config/programCurriculum'

function sortByOrder(rows) {
  return [...rows].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
}

/**
 * Flat L1 list — edit, delete, manage experiments.
 */
export default function AdminLabPackLevel1List({
  items,
  labels,
  onEdit,
  onDelete,
  onAdd,
  activeSlug = null,
}) {
  const sorted = sortByOrder(items)

  if (!sorted.length) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm text-slate-500 mb-3">{labels.noCourses}</p>
        <button type="button" onClick={onAdd} className="btn-primary text-sm px-4 py-2">
          {labels.addCourse}
        </button>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[720px]">
        <thead className="bg-slate-50 text-left text-slate-600 text-xs">
          <tr>
            <th className="p-3">{labels.colName}</th>
            <th className="p-3">{labels.colType}</th>
            <th className="p-3">{labels.colProductLine}</th>
            <th className="p-3">{labels.colStatus}</th>
            <th className="p-3">{labels.colSlug}</th>
            <th className="p-3 w-48">{labels.actions}</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => {
            const lineConfig = getProgramCurriculum(row.line)
            const isActive = activeSlug === row.slug
            const isLab = deliveryTypeForLabSub(normalizeLabMaterialSub(row.sub, row.line), row.line) === 'lab'
            return (
              <tr
                key={row.slug}
                className={`border-t border-slate-100 ${isActive ? 'bg-primary/5' : 'hover:bg-slate-50/80'}`}
              >
                <td className="p-3 font-medium text-bingo-dark">{row.name}</td>
                <td className="p-3 text-xs">{labMaterialTypeLabel(row.sub, row.line)}</td>
                <td className="p-3 text-xs text-slate-600">
                  {lineConfig?.icon} {lineConfig?.adminTitle || row.line}
                </td>
                <td className="p-3 text-xs">{labels.statusLabel(row.status)}</td>
                <td className="p-3 text-xs font-mono text-slate-400">{row.slug}</td>
                <td className="p-3 whitespace-nowrap text-xs space-x-2">
                  <button type="button" onClick={() => onEdit(row)} className="text-primary font-semibold">
                    {labels.edit}
                  </button>
                  {isLab ? (
                    <Link
                      to={`/admin/labs-materials/${encodeURIComponent(row.slug)}/experiments`}
                      className="text-slate-600 hover:text-primary font-semibold"
                    >
                      {labels.manageExperiments}
                    </Link>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => onDelete(row.slug)}
                    className="text-red-600 font-semibold"
                  >
                    {labels.delete}
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

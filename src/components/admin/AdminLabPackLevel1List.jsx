import { Link } from 'react-router-dom'
import { labMaterialTypeLabel } from '../../config/labMaterials'
import { getProgramCurriculum } from '../../config/programCurriculum'
import { useAdminLocale } from '../../contexts/AdminLocaleContext'

function sortByOrder(rows) {
  return [...rows].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
}

/**
 * L1 pack list — each row is one sellable pack; L2 experiments live inside via Manage content.
 */
export default function AdminLabPackLevel1List({
  items,
  labels,
  experimentCounts = {},
  onEdit,
  onDelete,
  onAdd,
  activeSlug = null,
}) {
  const { locale } = useAdminLocale()
  const sorted = sortByOrder(items)

  if (!sorted.length) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm text-slate-500 mb-3">{labels.noCourses}</p>
        <button type="button" onClick={onAdd} className="btn-primary text-sm px-4 py-2">
          {labels.addPack || labels.addCourse}
        </button>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[780px]">
        <thead className="bg-slate-50 text-left text-slate-600 text-xs">
          <tr>
            <th className="p-3">{labels.colName}</th>
            <th className="p-3">{labels.colType}</th>
            <th className="p-3">{labels.colProductLine}</th>
            <th className="p-3">{labels.colExperimentCount}</th>
            <th className="p-3">{labels.colStatus}</th>
            <th className="p-3">{labels.colSlug}</th>
            <th className="p-3 w-52">{labels.actions}</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => {
            const lineConfig = getProgramCurriculum(row.line)
            const isActive = activeSlug === row.slug
            const expCount = experimentCounts[row.slug] ?? 0
            const manageHref = `/admin/labs-materials/${encodeURIComponent(row.slug)}/experiments`
            return (
              <tr
                key={row.slug}
                className={`border-t border-slate-100 ${isActive ? 'bg-primary/5' : 'hover:bg-slate-50/80'}`}
              >
                <td className="p-3 font-medium text-bingo-dark">{row.name}</td>
                <td className="p-3 text-xs">{labMaterialTypeLabel(row.sub, row.line, { locale })}</td>
                <td className="p-3 text-xs text-slate-600">
                  {lineConfig?.icon} {lineConfig?.adminTitle || row.line}
                </td>
                <td className="p-3 text-xs text-slate-600">
                  {expCount > 0 ? (
                    <span className="font-semibold text-bingo-dark">{expCount}</span>
                  ) : (
                    <span className="text-amber-600">{labels.noExperimentsShort || '0'}</span>
                  )}
                </td>
                <td className="p-3 text-xs">{labels.statusLabel(row.status)}</td>
                <td className="p-3 text-xs font-mono text-slate-400">{row.slug}</td>
                <td className="p-3 whitespace-nowrap text-xs space-x-2">
                  <Link
                    to={manageHref}
                    className="inline-flex items-center rounded-lg bg-primary text-white font-semibold px-2.5 py-1 hover:opacity-90"
                  >
                    {labels.manageContent || labels.manageExperiments}
                  </Link>
                  <button type="button" onClick={() => onEdit(row)} className="text-slate-600 font-semibold hover:text-primary">
                    {labels.editPack || labels.edit}
                  </button>
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

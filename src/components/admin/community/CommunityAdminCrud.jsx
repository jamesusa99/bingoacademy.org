export const inputClass = 'w-full rounded-xl border border-slate-200 px-3 py-2 text-sm'
export const textareaClass = `${inputClass} min-h-[72px] resize-y`

export function CrudTable({ columns, rows, onEdit, onDelete, editLabel, deleteLabel, empty }) {
  if (!rows.length) {
    return <div className="p-8 text-center text-slate-500">{empty}</div>
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 text-left">
            {columns.map((col) => (
              <th key={col.key} className="p-3">
                {col.label}
              </th>
            ))}
            <th className="p-3 w-28">{editLabel}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t border-slate-100">
              {columns.map((col) => (
                <td key={col.key} className="p-3 max-w-xs truncate">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
              <td className="p-3 whitespace-nowrap">
                <button type="button" onClick={() => onEdit(row)} className="text-primary hover:underline mr-2">
                  {editLabel}
                </button>
                <button type="button" onClick={() => onDelete(row.id)} className="text-red-600 hover:underline">
                  {deleteLabel}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

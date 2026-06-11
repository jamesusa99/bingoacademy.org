import AdminField from './AdminField'

function parseItems(raw) {
  if (Array.isArray(raw)) return raw
  try {
    const parsed = JSON.parse(raw || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const emptyRow = () => ({ name: '', quantity: '', note: '', required: true })

/**
 * Structured editor for [{ name, quantity, note, required }]
 * @param {{ value: string, onChange: (json: string) => void, label?: string, hint?: string }} props
 */
export default function AdminMaterialsListEditor({ value, onChange, label, hint }) {
  const items = parseItems(value)

  const sync = (next) => onChange(JSON.stringify(next, null, 2))

  const updateRow = (index, patch) => {
    const next = items.map((row, i) => (i === index ? { ...row, ...patch } : row))
    sync(next)
  }

  const addRow = () => sync([...items, emptyRow()])

  const removeRow = (index) => sync(items.filter((_, i) => i !== index))

  return (
    <AdminField label={label} className="sm:col-span-2 lg:col-span-3">
      {hint ? <p className="text-[10px] text-slate-500 mb-2">{hint}</p> : null}
      <div className="space-y-2">
        {items.map((row, index) => (
          <div key={index} className="grid sm:grid-cols-12 gap-2 items-start p-3 rounded-xl border border-slate-200 bg-slate-50/50">
            <input
              className="sm:col-span-4 rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
              placeholder="Material name"
              value={row.name || ''}
              onChange={(e) => updateRow(index, { name: e.target.value })}
            />
            <input
              className="sm:col-span-2 rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
              placeholder="Qty"
              value={row.quantity || ''}
              onChange={(e) => updateRow(index, { quantity: e.target.value })}
            />
            <input
              className="sm:col-span-4 rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
              placeholder="Note"
              value={row.note || ''}
              onChange={(e) => updateRow(index, { note: e.target.value })}
            />
            <label className="sm:col-span-1 flex items-center gap-1 text-xs text-slate-600 pt-1.5">
              <input
                type="checkbox"
                checked={row.required !== false}
                onChange={(e) => updateRow(index, { required: e.target.checked })}
              />
              Req.
            </label>
            <button
              type="button"
              onClick={() => removeRow(index)}
              className="sm:col-span-1 text-xs text-red-600 pt-1.5"
            >
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addRow}
          className="text-xs font-semibold text-primary hover:underline"
        >
          + Add material item
        </button>
      </div>
    </AdminField>
  )
}

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const fields = ['title','company','level','salary','location','skill','course_linked','sort_order']

export default function AdminCareer() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(Object.fromEntries(fields.map((k) => [k, k === 'course_linked' ? false : k === 'sort_order' ? 0 : ''])))

  const fetchItems = async () => { setLoading(true); const { data } = await supabase.from('career_jobs').select('*').order('sort_order'); setItems(data || []); setLoading(false) }
  useEffect(() => { fetchItems() }, [])

  const save = async () => {
    setError(null)
    const payload = { ...form, course_linked: !!form.course_linked, sort_order: parseInt(form.sort_order) || 0 }
    if (editing) { const { error: e } = await supabase.from('career_jobs').update(payload).eq('id', editing.id); setError(e?.message); if (!e) { setEditing(null); setForm(Object.fromEntries(fields.map((k) => [k, k === 'course_linked' ? false : k === 'sort_order' ? 0 : '']))); fetchItems() } }
    else { const { error: e } = await supabase.from('career_jobs').insert(payload); setError(e?.message); if (!e) { setForm(Object.fromEntries(fields.map((k) => [k, k === 'course_linked' ? false : k === 'sort_order' ? 0 : '']))); fetchItems() } }
  }
  const startEdit = (r) => { setEditing(r); setForm(Object.fromEntries(fields.map((k) => [k, r[k] ?? (k === 'course_linked' ? false : k === 'sort_order' ? 0 : '')]))) }
  const del = async (id) => { if (!confirm('Delete?')) return; await supabase.from('career_jobs').delete().eq('id', id); fetchItems() }

  return (
    <div>
      <h1 className="text-2xl font-bold text-bingo-dark mb-6">Smart Careers</h1>
      {error && <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-sm">{error}</div>}
      <div className="card p-6 mb-6">
        <h2 className="font-semibold mb-4">{editing ? 'Edit Job' : 'Add Job'}</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {fields.map((k) => (
            <div key={k}>
              <label className="text-xs font-medium text-slate-600 block mb-1">{k}</label>
              {k === 'course_linked' ? <label className="flex items-center gap-2"><input type="checkbox" checked={!!form.course_linked} onChange={(e) => setForm((f) => ({ ...f, course_linked: e.target.checked }))} /> Course linked</label> : <input type={k === 'sort_order' ? 'number' : 'text'} value={form[k] ?? ''} onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))} className="w-full rounded-xl border px-3 py-2 text-sm" />}
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={save} className="btn-primary px-5 py-2 rounded-xl text-sm">Save</button>
          {editing && <button onClick={() => { setEditing(null); setForm(Object.fromEntries(fields.map((k) => [k, k === 'course_linked' ? false : k === 'sort_order' ? 0 : '']))) }} className="px-5 py-2 border rounded-xl text-sm">Cancel</button>}
        </div>
      </div>
      <div className="card overflow-hidden">
        <div className="p-4 border-b font-semibold">Jobs List</div>
        {loading ? <div className="p-8 text-center text-slate-500">Loading...</div> : <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="bg-slate-50 text-left"><th className="p-3">Title</th><th className="p-3">Company</th><th className="p-3">Salary</th><th className="p-3 w-28">Actions</th></tr></thead><tbody>{items.map((r) => (<tr key={r.id} className="border-t"><td className="p-3">{r.title}</td><td className="p-3">{r.company}</td><td className="p-3">{r.salary}</td><td className="p-3"><button onClick={() => startEdit(r)} className="text-primary mr-2">Edit</button><button onClick={() => del(r.id)} className="text-red-600">Delete</button></td></tr>))}</tbody></table></div>}
      </div>
    </div>
  )
}

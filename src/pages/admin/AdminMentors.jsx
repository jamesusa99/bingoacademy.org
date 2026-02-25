import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const fields = ['name','title','photo','tag','intro','awards','type','sort_order']

export default function AdminMentors() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(Object.fromEntries(fields.map((k) => [k, k === 'sort_order' ? 0 : ''])))

  const fetchItems = async () => { setLoading(true); const { data } = await supabase.from('community_mentors').select('*').order('sort_order'); setItems(data || []); setLoading(false) }
  useEffect(() => { fetchItems() }, [])

  const save = async () => {
    setError(null)
    const payload = { ...form, sort_order: parseInt(form.sort_order) || 0 }
    if (editing) { const { error: e } = await supabase.from('community_mentors').update(payload).eq('id', editing.id); setError(e?.message); if (!e) { setEditing(null); setForm(Object.fromEntries(fields.map((k) => [k, k === 'sort_order' ? 0 : '']))); fetchItems() } }
    else { const { error: e } = await supabase.from('community_mentors').insert(payload); setError(e?.message); if (!e) { setForm(Object.fromEntries(fields.map((k) => [k, k === 'sort_order' ? 0 : '']))); fetchItems() } }
  }
  const startEdit = (r) => { setEditing(r); setForm(Object.fromEntries(fields.map((k) => [k, r[k] ?? (k === 'sort_order' ? 0 : '')]))) }
  const del = async (id) => { if (!confirm('Delete?')) return; await supabase.from('community_mentors').delete().eq('id', id); fetchItems() }

  return (
    <div>
      <h1 className="text-2xl font-bold text-bingo-dark mb-6">AI Community Mentors</h1>
      {error && <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-sm">{error}</div>}
      <div className="card p-6 mb-6">
        <h2 className="font-semibold mb-4">{editing ? 'Edit Mentor' : 'Add Mentor'}</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {fields.map((k) => (
            <div key={k} className={['intro','awards'].includes(k) ? 'sm:col-span-2' : ''}>
              <label className="text-xs font-medium text-slate-600 block mb-1">{k}</label>
              {['intro','awards'].includes(k) ? <textarea value={form[k] ?? ''} onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))} rows={2} className="w-full rounded-xl border px-3 py-2 text-sm" /> : <input type={k === 'sort_order' ? 'number' : 'text'} value={form[k] ?? ''} onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))} className="w-full rounded-xl border px-3 py-2 text-sm" />}
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={save} className="btn-primary px-5 py-2 rounded-xl text-sm">Save</button>
          {editing && <button onClick={() => { setEditing(null); setForm(Object.fromEntries(fields.map((k) => [k, k === 'sort_order' ? 0 : '']))) }} className="px-5 py-2 border rounded-xl text-sm">Cancel</button>}
        </div>
      </div>
      <div className="card overflow-hidden">
        <div className="p-4 border-b font-semibold">Mentors List</div>
        {loading ? <div className="p-8 text-center text-slate-500">Loading...</div> : <ul className="divide-y">{items.map((r) => (<li key={r.id} className="p-4 flex justify-between"><span>{r.name} · {r.title}</span><span><button onClick={() => startEdit(r)} className="text-primary mr-2">Edit</button><button onClick={() => del(r.id)} className="text-red-600">Delete</button></span></li>))}</ul>}
      </div>
    </div>
  )
}

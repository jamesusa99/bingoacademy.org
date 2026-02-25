import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const fields = ['tier_id','stars','name','chinese','color','bg','border','inst','teacher','learner','weeks','criteria','sort_order']

export default function AdminCert() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(Object.fromEntries([...fields.map((k) => [k, k === 'sort_order' ? 0 : '']), ['courses', ''], ['benefits', '']]))

  const fetchItems = async () => { setLoading(true); const { data } = await supabase.from('cert_tiers').select('*').order('sort_order'); setItems(data || []); setLoading(false) }
  useEffect(() => { fetchItems() }, [])

  const toPayload = () => ({
    tier_id: form.tier_id || null,
    stars: form.stars || null,
    name: form.name,
    chinese: form.chinese || null,
    color: form.color || null,
    bg: form.bg || null,
    border: form.border || null,
    inst: form.inst || null,
    teacher: form.teacher || null,
    learner: form.learner || null,
    weeks: form.weeks || null,
    criteria: form.criteria || null,
    sort_order: parseInt(form.sort_order) || 0,
    courses: form.courses ? JSON.parse(form.courses) : [],
    benefits: form.benefits ? JSON.parse(form.benefits) : [],
  })

  const save = async () => {
    setError(null)
    let payload; try { payload = toPayload() } catch (e) { setError('courses/benefits must be JSON arrays'); return }
    if (editing) { const { error: e } = await supabase.from('cert_tiers').update(payload).eq('id', editing.id); setError(e?.message); if (!e) { setEditing(null); setForm(Object.fromEntries([...fields.map((k) => [k, k === 'sort_order' ? 0 : '']), ['courses', '[]'], ['benefits', '[]']])); fetchItems() } }
    else { const { error: e } = await supabase.from('cert_tiers').insert(payload); setError(e?.message); if (!e) { setForm(Object.fromEntries([...fields.map((k) => [k, k === 'sort_order' ? 0 : '']), ['courses', '[]'], ['benefits', '[]']])); fetchItems() } }
  }
  const startEdit = (r) => { setEditing(r); setForm({ ...Object.fromEntries(fields.map((k) => [k, r[k] ?? (k === 'sort_order' ? 0 : '')])), courses: JSON.stringify(r.courses || [], null, 2), benefits: JSON.stringify(r.benefits || [], null, 2) }) }
  const del = async (id) => { if (!confirm('Delete?')) return; await supabase.from('cert_tiers').delete().eq('id', id); fetchItems() }

  return (
    <div>
      <h1 className="text-2xl font-bold text-bingo-dark mb-6">Certification Tiers</h1>
      {error && <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-sm">{error}</div>}
      <div className="card p-6 mb-6">
        <h2 className="font-semibold mb-4">{editing ? 'Edit Tier' : 'Add Tier'}</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {fields.map((k) => (
            <div key={k} className={['criteria'].includes(k) ? 'sm:col-span-2' : ''}>
              <label className="text-xs font-medium text-slate-600 block mb-1">{k}</label>
              {k === 'criteria' ? <textarea value={form[k] ?? ''} onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))} rows={2} className="w-full rounded-xl border px-3 py-2 text-sm" /> : <input type={k === 'sort_order' ? 'number' : 'text'} value={form[k] ?? ''} onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))} className="w-full rounded-xl border px-3 py-2 text-sm" />}
            </div>
          ))}
          <div className="sm:col-span-2"><label className="text-xs font-medium text-slate-600 block mb-1">courses (JSON array)</label><textarea value={form.courses} onChange={(e) => setForm((f) => ({ ...f, courses: e.target.value }))} rows={3} className="w-full rounded-xl border px-3 py-2 text-sm font-mono" /></div>
          <div className="sm:col-span-2"><label className="text-xs font-medium text-slate-600 block mb-1">benefits (JSON array)</label><textarea value={form.benefits} onChange={(e) => setForm((f) => ({ ...f, benefits: e.target.value }))} rows={3} className="w-full rounded-xl border px-3 py-2 text-sm font-mono" /></div>
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={save} className="btn-primary px-5 py-2 rounded-xl text-sm">Save</button>
          {editing && <button onClick={() => { setEditing(null); setForm(Object.fromEntries([...fields.map((k) => [k, k === 'sort_order' ? 0 : '']), ['courses', '[]'], ['benefits', '[]']])) }} className="px-5 py-2 border rounded-xl text-sm">Cancel</button>}
        </div>
      </div>
      <div className="card overflow-hidden">
        <div className="p-4 border-b font-semibold">Tiers List</div>
        {loading ? <div className="p-8 text-center text-slate-500">Loading...</div> : <ul className="divide-y">{items.map((r) => (<li key={r.id} className="p-4 flex justify-between"><span>{r.stars} {r.name}</span><span><button onClick={() => startEdit(r)} className="text-primary mr-2">Edit</button><button onClick={() => del(r.id)} className="text-red-600">Delete</button></span></li>))}</ul>}
      </div>
    </div>
  )
}

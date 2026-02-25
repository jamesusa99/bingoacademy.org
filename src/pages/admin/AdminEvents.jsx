import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

function toDb(row) {
  return {
    name: row.name,
    type: row.type,
    stage: row.stage,
    students: row.students,
    award: row.award,
    enrolled: parseInt(row.enrolled) || 0,
    whitelist: !!row.whitelist,
    ai_course: !!row.aiCourse,
    desc: row.desc,
  }
}

function fromDb(row) {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    stage: row.stage,
    students: row.students,
    award: row.award,
    enrolled: row.enrolled,
    whitelist: row.whitelist,
    aiCourse: row.ai_course,
    desc: row.desc,
  }
}

const INIT = { name: '', type: 'ai', stage: '', students: '', award: '', enrolled: '0', whitelist: true, aiCourse: true, desc: '' }

export default function AdminEvents() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(INIT)
  const [error, setError] = useState(null)

  const fetchEvents = async () => {
    setLoading(true)
    const { data, error: e } = await supabase.from('events').select('*').order('created_at', { ascending: false })
    setError(e?.message)
    setItems((data || []).map(fromDb))
    setLoading(false)
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  const handleSave = async () => {
    setError(null)
    const payload = toDb(form)
    if (editing) {
      const { error: e } = await supabase.from('events').update(payload).eq('id', editing.id)
      setError(e?.message)
      if (!e) {
        setEditing(null)
        setForm(INIT)
        fetchEvents()
      }
    } else {
      const { error: e } = await supabase.from('events').insert(payload)
      setError(e?.message)
      if (!e) {
        setForm(INIT)
        fetchEvents()
      }
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this event?')) return
    setError(null)
    const { error: e } = await supabase.from('events').delete().eq('id', id)
    setError(e?.message)
    if (!e) fetchEvents()
  }

  const startEdit = (item) => {
    setEditing(item)
    setForm({
      name: item.name,
      type: item.type || 'ai',
      stage: item.stage || '',
      students: item.students || '',
      award: item.award || '',
      enrolled: String(item.enrolled ?? 0),
      whitelist: !!item.whitelist,
      aiCourse: !!item.aiCourse,
      desc: item.desc || '',
    })
  }

  const cancelEdit = () => {
    setEditing(null)
    setForm(INIT)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-bingo-dark mb-6">Events Management</h1>

      {error && <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-sm">{error}</div>}

      <div className="card p-6 mb-6">
        <h2 className="font-semibold text-bingo-dark mb-4">{editing ? 'Edit Event' : 'Add Event'}</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {['name','type','stage','students','award','enrolled','desc'].map((k) => (
            <div key={k}>
              <label className="text-xs font-medium text-slate-600 block mb-1">{k}</label>
              {k === 'desc' ? (
                <textarea value={form[k]} onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))} rows={2} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
              ) : (
                <input
                  type={k === 'enrolled' ? 'number' : 'text'}
                  value={form[k]}
                  onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              )}
            </div>
          ))}
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Whitelist</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.whitelist} onChange={(e) => setForm((f) => ({ ...f, whitelist: e.target.checked }))} /> Yes</label>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">AI Course</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.aiCourse} onChange={(e) => setForm((f) => ({ ...f, aiCourse: e.target.checked }))} /> Yes</label>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={handleSave} className="btn-primary px-5 py-2 rounded-xl text-sm">Save</button>
          {editing && <button onClick={cancelEdit} className="px-5 py-2 rounded-xl border border-slate-300 text-sm">Cancel</button>}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 border-b border-slate-100 font-semibold text-bingo-dark">Event List</div>
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left">
                  <th className="p-3">Name</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Stage</th>
                  <th className="p-3">Enrolled</th>
                  <th className="p-3 w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((r) => (
                  <tr key={r.id} className="border-t border-slate-100">
                    <td className="p-3">{r.name}</td>
                    <td className="p-3">{r.type}</td>
                    <td className="p-3">{r.stage}</td>
                    <td className="p-3">{r.enrolled}</td>
                    <td className="p-3">
                      <button onClick={() => startEdit(r)} className="text-primary hover:underline mr-2">Edit</button>
                      <button onClick={() => handleDelete(r.id)} className="text-red-600 hover:underline">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {items.length === 0 && <div className="p-8 text-center text-slate-500">No events yet. Add one above.</div>}
          </div>
        )}
      </div>
    </div>
  )
}

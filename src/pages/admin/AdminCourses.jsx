import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

function toDb(row) {
  return {
    name: row.name,
    type: row.type || 'course',
    cat: row.cat,
    tag: row.tag,
    price: row.price ? parseFloat(row.price) : null,
    b_price: row.bPrice,
    sold: parseInt(row.sold) || 0,
    rating: row.rating ? parseFloat(row.rating) : null,
    desc: row.desc,
    badge: row.badge,
    ai_lab: !!row.aiLab,
  }
}

function fromDb(row) {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    cat: row.cat,
    tag: row.tag,
    price: row.price,
    bPrice: row.b_price,
    sold: row.sold,
    rating: row.rating,
    desc: row.desc,
    badge: row.badge,
    aiLab: row.ai_lab,
  }
}

const INIT = { name: '', type: 'course', cat: '', tag: '', price: '', bPrice: '', sold: '0', rating: '', desc: '', badge: '', aiLab: false }

export default function AdminCourses() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(INIT)
  const [error, setError] = useState(null)

  const fetchCourses = async () => {
    setLoading(true)
    const { data, error: e } = await supabase.from('courses').select('*').order('created_at', { ascending: false })
    setError(e?.message)
    setItems((data || []).map(fromDb))
    setLoading(false)
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  const handleSave = async () => {
    setError(null)
    const payload = toDb(form)
    if (editing) {
      const { error: e } = await supabase.from('courses').update(payload).eq('id', editing.id)
      setError(e?.message)
      if (!e) {
        setEditing(null)
        setForm(INIT)
        fetchCourses()
      }
    } else {
      const { error: e } = await supabase.from('courses').insert(payload)
      setError(e?.message)
      if (!e) {
        setForm(INIT)
        fetchCourses()
      }
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this course?')) return
    setError(null)
    const { error: e } = await supabase.from('courses').delete().eq('id', id)
    setError(e?.message)
    if (!e) fetchCourses()
  }

  const startEdit = (item) => {
    setEditing(item)
    setForm({
      name: item.name,
      type: item.type || 'course',
      cat: item.cat || '',
      tag: item.tag || '',
      price: item.price ?? '',
      bPrice: item.bPrice || '',
      sold: String(item.sold ?? 0),
      rating: item.rating ?? '',
      desc: item.desc || '',
      badge: item.badge || '',
      aiLab: !!item.aiLab,
    })
  }

  const cancelEdit = () => {
    setEditing(null)
    setForm(INIT)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-bingo-dark mb-6">Courses Management</h1>

      {error && <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-sm">{error}</div>}

      {/* Form */}
      <div className="card p-6 mb-6">
        <h2 className="font-semibold text-bingo-dark mb-4">{editing ? 'Edit Course' : 'Add Course'}</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {['name','type','cat','tag','price','bPrice','sold','rating','desc','badge'].map((k) => (
            <div key={k}>
              <label className="text-xs font-medium text-slate-600 block mb-1">{k}</label>
              {k === 'desc' ? (
                <textarea value={form[k]} onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))} rows={2} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
              ) : k === 'aiLab' ? (
                <label className="flex items-center gap-2"><input type="checkbox" checked={form.aiLab} onChange={(e) => setForm((f) => ({ ...f, aiLab: e.target.checked }))} /> AI Lab</label>
              ) : (
                <input
                  type={['price','sold','rating'].includes(k) ? 'number' : 'text'}
                  value={form[k]}
                  onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              )}
            </div>
          ))}
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">AI Lab</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.aiLab} onChange={(e) => setForm((f) => ({ ...f, aiLab: e.target.checked }))} /> Yes</label>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={handleSave} className="btn-primary px-5 py-2 rounded-xl text-sm">Save</button>
          {editing && <button onClick={cancelEdit} className="px-5 py-2 rounded-xl border border-slate-300 text-sm">Cancel</button>}
        </div>
      </div>

      {/* List */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-slate-100 font-semibold text-bingo-dark">Course List</div>
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left">
                  <th className="p-3">Name</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Sold</th>
                  <th className="p-3 w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((r) => (
                  <tr key={r.id} className="border-t border-slate-100">
                    <td className="p-3">{r.name}</td>
                    <td className="p-3">{r.type}</td>
                    <td className="p-3">{r.price != null ? `$${r.price}` : '—'}</td>
                    <td className="p-3">{r.sold}</td>
                    <td className="p-3">
                      <button onClick={() => startEdit(r)} className="text-primary hover:underline mr-2">Edit</button>
                      <button onClick={() => handleDelete(r.id)} className="text-red-600 hover:underline">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {items.length === 0 && <div className="p-8 text-center text-slate-500">No courses yet. Add one above.</div>}
          </div>
        )}
      </div>
    </div>
  )
}

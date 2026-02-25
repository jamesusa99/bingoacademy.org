import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

function toDbThread(row) {
  return {
    title: row.title,
    content: row.content,
    author: row.author || 'Anonymous',
    avatar: row.avatar,
    category: row.category || 'Discussion',
    image: row.image || null,
  }
}

function fromDbThread(row) {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    author: row.author,
    avatar: row.avatar,
    category: row.category,
    image: row.image,
    createdAt: row.created_at,
    replyCount: row.reply_count ?? 0,
  }
}

const INIT = { title: '', content: '', author: 'Admin', category: 'Discussion', image: '' }

export default function AdminForum() {
  const [threads, setThreads] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(INIT)
  const [error, setError] = useState(null)

  const fetchThreads = async () => {
    setLoading(true)
    const { data: rows, error: e } = await supabase.from('forum_threads').select('*').order('created_at', { ascending: false })
    setError(e?.message)
    if (rows) {
      const withCount = await Promise.all(
        rows.map(async (r) => {
          const { count } = await supabase.from('forum_replies').select('id', { count: 'exact', head: true }).eq('thread_id', r.id)
          return { ...r, reply_count: count ?? 0 }
        })
      )
      setThreads(withCount.map(fromDbThread))
    } else {
      setThreads([])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchThreads()
  }, [])

  const handleSave = async () => {
    setError(null)
    const payload = toDbThread(form)
    if (editing) {
      const { error: e } = await supabase.from('forum_threads').update(payload).eq('id', editing.id)
      setError(e?.message)
      if (!e) {
        setEditing(null)
        setForm(INIT)
        fetchThreads()
      }
    } else {
      const { error: e } = await supabase.from('forum_threads').insert(payload)
      setError(e?.message)
      if (!e) {
        setForm(INIT)
        fetchThreads()
      }
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this thread and all replies?')) return
    setError(null)
    const { error: e } = await supabase.from('forum_threads').delete().eq('id', id)
    setError(e?.message)
    if (!e) fetchThreads()
  }

  const startEdit = (t) => {
    setEditing(t)
    setForm({
      title: t.title,
      content: t.content,
      author: t.author || 'Admin',
      category: t.category || 'Discussion',
      image: t.image || '',
    })
  }

  const cancelEdit = () => {
    setEditing(null)
    setForm(INIT)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-bingo-dark mb-6">Forum Management</h1>

      {error && <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-sm">{error}</div>}

      <div className="card p-6 mb-6">
        <h2 className="font-semibold text-bingo-dark mb-4">{editing ? 'Edit Thread' : 'Add Thread'}</h2>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Title</label>
            <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Content</label>
            <textarea value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} rows={3} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Author</label>
              <input value={form.author} onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Category</label>
              <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white">
                {['Discussion','Parent Experience','Competition','Course Q&A','Resources','Other'].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Image URL</label>
            <input value={form.image} onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))} placeholder="https://..." className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={handleSave} className="btn-primary px-5 py-2 rounded-xl text-sm">Save</button>
          {editing && <button onClick={cancelEdit} className="px-5 py-2 rounded-xl border border-slate-300 text-sm">Cancel</button>}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 border-b border-slate-100 font-semibold text-bingo-dark">Thread List</div>
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left">
                  <th className="p-3">Title</th>
                  <th className="p-3">Author</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Replies</th>
                  <th className="p-3 w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {threads.map((r) => (
                  <tr key={r.id} className="border-t border-slate-100">
                    <td className="p-3 max-w-xs truncate">{r.title}</td>
                    <td className="p-3">{r.author}</td>
                    <td className="p-3">{r.category}</td>
                    <td className="p-3">{r.replyCount}</td>
                    <td className="p-3">
                      <button onClick={() => startEdit(r)} className="text-primary hover:underline mr-2">Edit</button>
                      <button onClick={() => handleDelete(r.id)} className="text-red-600 hover:underline">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {threads.length === 0 && <div className="p-8 text-center text-slate-500">No threads yet. Add one above.</div>}
          </div>
        )}
      </div>
    </div>
  )
}

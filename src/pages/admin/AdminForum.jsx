import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { adminInsert, adminUpdate, adminDelete } from '../../lib/admin/db'
import AdminField from '../../components/admin/AdminField'
import { useAdminCrud } from '../../hooks/useAdminCrud'

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
  const c = useAdminCrud()
  const itemLabel = c.t('pages.forum.item')
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
    try {
      if (editing) {
        await adminUpdate('forum_threads', editing.id, payload)
        setEditing(null)
        setForm(INIT)
      } else {
        await adminInsert('forum_threads', payload)
        setForm(INIT)
      }
      fetchThreads()
    } catch (e) {
      setError(e.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm(c.t('pages.forum.confirmDelete'))) return
    setError(null)
    try {
      await adminDelete('forum_threads', id)
      fetchThreads()
    } catch (e) {
      setError(e.message)
    }
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
      <h1 className="text-2xl font-bold text-bingo-dark mb-6">{c.pageTitle('forum')}</h1>

      {error && <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-sm">{error}</div>}

      <div className="card p-6 mb-6">
        <h2 className="font-semibold text-bingo-dark mb-4">{editing ? c.editItem(itemLabel) : c.addItem(itemLabel)}</h2>
        <div className="space-y-4">
          <AdminField label={c.title} required>
            <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          </AdminField>
          <AdminField label={c.t('pages.forum.content')} required>
            <textarea value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} rows={3} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          </AdminField>
          <div className="grid sm:grid-cols-2 gap-4">
            <AdminField label={c.t('pages.forum.author')}>
              <input value={form.author} onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
            </AdminField>
            <AdminField label={c.t('pages.forum.category')}>
              <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white">
                {['Discussion','Parent Experience','Competition','Course Q&A','Resources','Other'].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </AdminField>
          </div>
          <AdminField label={c.t('pages.forum.imageUrl')}>
            <input value={form.image} onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))} placeholder="https://..." className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          </AdminField>
        </div>
        <div className="flex gap-2 mt-4">
          <button type="button" onClick={handleSave} className="btn-primary px-5 py-2 rounded-xl text-sm">{c.save}</button>
          {editing && <button type="button" onClick={cancelEdit} className="px-5 py-2 rounded-xl border border-slate-300 text-sm">{c.cancel}</button>}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 border-b border-slate-100 font-semibold text-bingo-dark">{c.t('pages.forum.list')}</div>
        {loading ? (
          <div className="p-8 text-center text-slate-500">{c.loading}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left">
                  <th className="p-3">{c.title}</th>
                  <th className="p-3">{c.t('pages.forum.author')}</th>
                  <th className="p-3">{c.t('pages.forum.category')}</th>
                  <th className="p-3">{c.t('pages.forum.replies')}</th>
                  <th className="p-3 w-24">{c.actions}</th>
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
                      <button type="button" onClick={() => startEdit(r)} className="text-primary hover:underline mr-2">{c.edit}</button>
                      <button type="button" onClick={() => handleDelete(r.id)} className="text-red-600 hover:underline">{c.delete}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {threads.length === 0 && <div className="p-8 text-center text-slate-500">{c.t('pages.forum.noThreads')}</div>}
          </div>
        )}
      </div>
    </div>
  )
}

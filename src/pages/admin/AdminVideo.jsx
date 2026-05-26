import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminAlert from '../../components/admin/AdminAlert'
import { createStreamUploadUrl } from '../../lib/admin/api'
import { logAdminAction } from '../../lib/admin/auth'

const INIT = { title: '', description: '', status: 'pending' }

export default function AdminVideo() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [info, setInfo] = useState(null)
  const [form, setForm] = useState(INIT)
  const [uploading, setUploading] = useState(false)

  const fetchItems = async () => {
    setLoading(true)
    const { data, error: e } = await supabase.from('video_assets').select('*').order('created_at', { ascending: false })
    setError(e?.message || null)
    setItems(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const handleCreateRecord = async () => {
    setError(null)
    if (!form.title.trim()) {
      setError('Title is required')
      return
    }
    const { data, error: e } = await supabase.from('video_assets').insert(form).select().single()
    if (e) {
      setError(e.message)
      return
    }
    await logAdminAction('create', 'video_assets', data.id)
    setForm(INIT)
    fetchItems()
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this video record? (Does not remove from Cloudflare.)')) return
    const { error: e } = await supabase.from('video_assets').delete().eq('id', id)
    if (e) setError(e.message)
    else {
      await logAdminAction('delete', 'video_assets', id)
      fetchItems()
    }
  }

  const handleDirectUpload = async () => {
    setError(null)
    setInfo(null)
    if (!form.title.trim()) {
      setError('Enter a title before requesting an upload URL')
      return
    }
    setUploading(true)
    try {
      const { uploadURL, uid } = await createStreamUploadUrl({
        title: form.title,
        maxDurationSeconds: 3600,
      })

      const { data: row, error: insertErr } = await supabase
        .from('video_assets')
        .insert({
          title: form.title,
          description: form.description,
          cloudflare_uid: uid,
          status: 'processing',
        })
        .select()
        .single()

      if (insertErr) throw new Error(insertErr.message)

      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'video/*'
      input.onchange = async () => {
        const file = input.files?.[0]
        if (!file) return
        setInfo('Uploading to Cloudflare Stream…')
        const fd = new FormData()
        fd.append('file', file)
        const up = await fetch(uploadURL, { method: 'POST', body: fd })
        if (!up.ok) throw new Error('Upload to Cloudflare failed')
        await supabase
          .from('video_assets')
          .update({ status: 'ready' })
          .eq('id', row.id)
        await logAdminAction('upload', 'video_assets', row.id, { uid })
        setInfo('Upload complete. Playback URL sync can be added via Stream webhooks.')
        setForm(INIT)
        fetchItems()
      }
      input.click()
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Video library"
        description="Cloudflare Stream assets linked in Supabase. Direct upload requires CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN on the API server."
      />

      {error ? <AdminAlert type="error" onDismiss={() => setError(null)}>{error}</AdminAlert> : null}
      {info ? <AdminAlert type="info" onDismiss={() => setInfo(null)}>{info}</AdminAlert> : null}

      <div className="card p-6 mb-6">
        <h2 className="font-semibold text-bingo-dark mb-4">New asset</h2>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <input
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={handleCreateRecord} className="px-4 py-2 rounded-xl bg-slate-200 text-sm font-medium">
            Save metadata only
          </button>
          <button
            type="button"
            onClick={handleDirectUpload}
            disabled={uploading}
            className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium disabled:opacity-60"
          >
            {uploading ? 'Preparing…' : 'Direct upload (Stream)'}
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <p className="p-6 text-slate-500 text-sm">Loading…</p>
        ) : items.length === 0 ? (
          <p className="p-6 text-slate-500 text-sm">No video assets yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="p-3">Title</th>
                <th className="p-3">Status</th>
                <th className="p-3">Cloudflare UID</th>
                <th className="p-3 w-24" />
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={row.id} className="border-t border-slate-100">
                  <td className="p-3 font-medium">{row.title}</td>
                  <td className="p-3">{row.status}</td>
                  <td className="p-3 text-xs text-slate-500 font-mono truncate max-w-[200px]">{row.cloudflare_uid || '—'}</td>
                  <td className="p-3">
                    <button type="button" onClick={() => handleDelete(row.id)} className="text-red-600 hover:underline text-xs">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

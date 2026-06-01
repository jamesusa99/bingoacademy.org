import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminAlert from '../../components/admin/AdminAlert'
import { createStreamUploadUrl, syncStreamVideo, assignStreamToCourse } from '../../lib/admin/api'
import { adminInsert, adminUpdate, adminDelete } from '../../lib/admin/db'
import { logAdminAction } from '../../lib/admin/auth'

const INIT = { title: '', description: '', catalog_slug: '' }

export default function AdminVideo() {
  const [items, setItems] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [info, setInfo] = useState(null)
  const [form, setForm] = useState(INIT)
  const [uploading, setUploading] = useState(false)
  const [syncingId, setSyncingId] = useState(null)
  const [assignSlug, setAssignSlug] = useState({})

  const fetchItems = async () => {
    setLoading(true)
    const [{ data, error: e }, { data: catalog }] = await Promise.all([
      supabase.from('video_assets').select('*').order('created_at', { ascending: false }),
      supabase.from('courses_catalog').select('slug, name, delivery_type').order('sort_order'),
    ])
    setError(e?.message || null)
    setItems(data || [])
    setCourses(catalog || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const videoCourses = courses.filter((c) => c.delivery_type === 'video')

  const handleSync = async (row) => {
    setError(null)
    setInfo(null)
    setSyncingId(row.id)
    try {
      const result = await syncStreamVideo({ videoAssetId: row.id, wait: true })
      setInfo(result.message || 'Playback URLs synced from Cloudflare Stream.')
      await fetchItems()
    } catch (err) {
      setError(err.message)
    } finally {
      setSyncingId(null)
    }
  }

  const handleAssign = async (row) => {
    const slug = assignSlug[row.id] || row.catalog_slug || form.catalog_slug
    if (!slug) {
      setError('Select a course slug to assign this video.')
      return
    }
    setError(null)
    setInfo(null)
    setSyncingId(row.id)
    try {
      const result = await assignStreamToCourse({ videoAssetId: row.id, catalogSlug: slug })
      setInfo(result.message || `Assigned to ${slug}. Course page will play this video.`)
      await logAdminAction('assign', 'video_assets', row.id, { catalogSlug: slug })
      await fetchItems()
    } catch (err) {
      setError(err.message)
    } finally {
      setSyncingId(null)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this video record? (Does not remove from Cloudflare.)')) return
    try {
      await adminDelete('video_assets', id)
      await logAdminAction('delete', 'video_assets', id)
      fetchItems()
    } catch (e) {
      setError(e.message)
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

      const row = await adminInsert('video_assets', {
        title: form.title,
        description: form.description,
        cloudflare_uid: uid,
        catalog_slug: form.catalog_slug || null,
        status: 'processing',
      })

      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'video/*'
      input.onchange = async () => {
        const file = input.files?.[0]
        if (!file) return
        setUploading(true)
        setInfo('Uploading to Cloudflare Stream…')
        try {
          const fd = new FormData()
          fd.append('file', file)
          const up = await fetch(uploadURL, { method: 'POST', body: fd })
          if (!up.ok) throw new Error('Upload to Cloudflare failed')

          setInfo('Upload complete — syncing playback URLs…')
          const syncResult = await syncStreamVideo({ videoAssetId: row.id, wait: true })

          if (form.catalog_slug) {
            await assignStreamToCourse({ videoAssetId: row.id, catalogSlug: form.catalog_slug })
            setInfo(`Video uploaded and assigned to ${form.catalog_slug}.`)
          } else {
            setInfo(syncResult.message || 'Upload complete. Assign to a course below.')
          }

          await logAdminAction('upload', 'video_assets', row.id, { uid })
          setForm(INIT)
          fetchItems()
        } catch (err) {
          setError(err.message)
        } finally {
          setUploading(false)
        }
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
        title="Video library (Cloudflare Stream)"
        description="Upload videos to Cloudflare Stream, sync playback URLs, and assign them to courses_catalog entries. Run migration 010 for video columns. Frontend plays HLS via courses_catalog.video_url."
      />

      {error ? <AdminAlert type="error" onDismiss={() => setError(null)}>{error}</AdminAlert> : null}
      {info ? <AdminAlert type="info" onDismiss={() => setInfo(null)}>{info}</AdminAlert> : null}

      <div className="card p-6 mb-6">
        <h2 className="font-semibold text-bingo-dark mb-4">Upload to Stream</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <input
            placeholder="Title *"
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
          <select
            value={form.catalog_slug}
            onChange={(e) => setForm({ ...form, catalog_slug: e.target.value })}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">Assign to course (optional)</option>
            {videoCourses.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.slug} — {c.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={handleDirectUpload}
          disabled={uploading}
          className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium disabled:opacity-60"
        >
          {uploading ? 'Working…' : 'Upload video to Cloudflare Stream'}
        </button>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <p className="p-6 text-slate-500 text-sm">Loading…</p>
        ) : items.length === 0 ? (
          <p className="p-6 text-slate-500 text-sm">No video assets yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-600">
                <tr>
                  <th className="p-3">Title</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Playback</th>
                  <th className="p-3">Course</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((row) => (
                  <tr key={row.id} className="border-t border-slate-100 align-top">
                    <td className="p-3">
                      <div className="font-medium">{row.title}</div>
                      <div className="text-[10px] font-mono text-slate-400 mt-1 truncate max-w-[180px]">
                        {row.cloudflare_uid || '—'}
                      </div>
                    </td>
                    <td className="p-3 capitalize">{row.status}</td>
                    <td className="p-3">
                      {row.playback_url ? (
                        <a
                          href={row.playback_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-primary hover:underline break-all"
                        >
                          HLS manifest
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400">Not synced</span>
                      )}
                    </td>
                    <td className="p-3">
                      {row.catalog_slug ? (
                        <a
                          href={`/courses/detail/${row.catalog_slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-primary hover:underline font-mono"
                        >
                          {row.catalog_slug}
                        </a>
                      ) : (
                        <select
                          value={assignSlug[row.id] || ''}
                          onChange={(e) => setAssignSlug((s) => ({ ...s, [row.id]: e.target.value }))}
                          className="text-xs rounded border border-slate-200 px-2 py-1 max-w-[160px]"
                        >
                          <option value="">Select course…</option>
                          {videoCourses.map((c) => (
                            <option key={c.slug} value={c.slug}>
                              {c.slug}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="p-3 whitespace-nowrap space-x-2">
                      <button
                        type="button"
                        disabled={syncingId === row.id}
                        onClick={() => handleSync(row)}
                        className="text-xs text-primary hover:underline disabled:opacity-50"
                      >
                        Sync
                      </button>
                      {!row.catalog_slug ? (
                        <button
                          type="button"
                          disabled={syncingId === row.id}
                          onClick={() => handleAssign(row)}
                          className="text-xs text-emerald-600 hover:underline disabled:opacity-50"
                        >
                          Assign
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => handleDelete(row.id)}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

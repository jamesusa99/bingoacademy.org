import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminAlert from '../../components/admin/AdminAlert'
import {
  createStreamUploadUrl,
  fetchStreamUploadLimits,
  syncStreamVideo,
  assignStreamToCourse,
} from '../../lib/admin/api'
import { adminInsert, adminUpdate, adminDelete } from '../../lib/admin/db'
import { logAdminAction } from '../../lib/admin/auth'
import { formatBytes, uploadFileToStream } from '../../lib/streamUpload'

const INIT = { title: '', description: '', catalog_slug: '' }

const DEFAULT_LIMITS = {
  maxFileBytes: 30 * 1024 * 1024 * 1024,
  recommendedMaxFileBytes: 4 * 1024 * 1024 * 1024,
  maxDurationSeconds: 21_600,
}

function streamPreviewUrl(uid) {
  if (!uid) return null
  return `https://iframe.cloudflarestream.com/${uid}`
}

export default function AdminVideo() {
  const [items, setItems] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [info, setInfo] = useState(null)
  const [form, setForm] = useState(INIT)
  const [uploading, setUploading] = useState(false)
  const [uploadPct, setUploadPct] = useState(null)
  const [syncingId, setSyncingId] = useState(null)
  const [assignSlug, setAssignSlug] = useState({})
  const [limits, setLimits] = useState(DEFAULT_LIMITS)

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
    fetchStreamUploadLimits()
      .then(setLimits)
      .catch(() => setLimits(DEFAULT_LIMITS))
  }, [])

  const videoCourses = courses.filter((c) => c.delivery_type === 'video')

  const handleSync = async (row) => {
    setError(null)
    setInfo(null)
    setSyncingId(row.id)
    try {
      const result = await syncStreamVideo({ videoAssetId: row.id, wait: true })
      if (result.pending) {
        setInfo(result.message || 'Still encoding on Cloudflare — click Sync again in a minute.')
      } else {
        setInfo(result.message || 'Playback URLs synced from Cloudflare Stream.')
      }
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
      if (result.pending) {
        setInfo(
          result.message ||
            `Assigned to ${slug}, but video is still encoding. Sync again when status is ready.`
        )
      } else {
        setInfo(result.message || `Assigned to ${slug}. Course page will play this video.`)
      }
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

  const pickFileAndUpload = () => {
    setError(null)
    setInfo(null)
    if (!form.title.trim()) {
      setError('Enter a title before uploading')
      return
    }

    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'video/*'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return

      if (file.size > limits.maxFileBytes) {
        setError(
          `File is ${formatBytes(file.size)} — Cloudflare Stream maximum is ${formatBytes(limits.maxFileBytes)} (30 GB).`
        )
        return
      }
      if (file.size > limits.recommendedMaxFileBytes) {
        const ok = confirm(
          `This file is ${formatBytes(file.size)}. Browser uploads work best under ${formatBytes(limits.recommendedMaxFileBytes)} (~4 GB). Continue anyway?`
        )
        if (!ok) return
      }

      setUploading(true)
      setUploadPct(0)
      let rowId = null

      try {
        const { uploadURL, uid } = await createStreamUploadUrl({
          title: form.title,
          maxDurationSeconds: limits.maxDurationSeconds,
        })

        const row = await adminInsert('video_assets', {
          title: form.title,
          description: form.description,
          cloudflare_uid: uid,
          catalog_slug: form.catalog_slug || null,
          status: 'processing',
        })
        rowId = row.id

        setInfo(`Uploading ${file.name} (${formatBytes(file.size)})…`)
        await uploadFileToStream(uploadURL, file, {
          onProgress: (pct) => setUploadPct(pct),
        })

        setUploadPct(null)
        setInfo('Upload complete — waiting for Cloudflare to encode (may take several minutes)…')
        const syncResult = await syncStreamVideo({ videoAssetId: row.id, wait: true })

        if (form.catalog_slug) {
          await assignStreamToCourse({ videoAssetId: row.id, catalogSlug: form.catalog_slug })
        }

        if (syncResult.pending) {
          setInfo(
            syncResult.message ||
              'Upload finished. Encoding still in progress — click Sync on this row in 1–3 minutes, then assign to the course.'
          )
        } else if (form.catalog_slug) {
          setInfo(`Video ready and assigned to ${form.catalog_slug}.`)
        } else {
          setInfo(syncResult.message || 'Video ready. Assign to a course below.')
        }

        await logAdminAction('upload', 'video_assets', row.id, { uid, size: file.size })
        setForm(INIT)
        fetchItems()
      } catch (err) {
        setError(err.message)
        if (rowId) {
          try {
            await adminUpdate('video_assets', rowId, { status: 'error' })
            fetchItems()
          } catch {
            /* ignore */
          }
        }
      } finally {
        setUploading(false)
        setUploadPct(null)
      }
    }
    input.click()
  }

  const maxGb = limits.maxFileBytes / (1024 ** 3)
  const recGb = limits.recommendedMaxFileBytes / (1024 ** 3)
  const maxHours = Math.round(limits.maxDurationSeconds / 3600)

  return (
    <div>
      <AdminPageHeader
        title="Video library (Cloudflare Stream)"
        description="Upload to Cloudflare Stream, sync when encoding completes, assign to courses. Course pages play HLS in the video player (not by opening the .m3u8 link in a new tab)."
      />

      {error ? (
        <AdminAlert type="error" onDismiss={() => setError(null)}>
          {error}
        </AdminAlert>
      ) : null}
      {info ? (
        <AdminAlert type="info" onDismiss={() => setInfo(null)}>
          {info}
        </AdminAlert>
      ) : null}

      <div className="card p-6 mb-6">
        <h2 className="font-semibold text-bingo-dark mb-2">Upload to Stream</h2>
        <p className="text-xs text-slate-500 mb-4 leading-relaxed">
          <strong>Size:</strong> Cloudflare allows up to {maxGb} GB per file; this admin uploader works
          reliably up to ~{recGb} GB in the browser. Larger files may fail due to network timeouts — export
          a smaller MP4 or use wired connection. <strong>Duration:</strong> up to {maxHours} hours per
          video. <strong>Quality:</strong> upload at least 1080p source; playback starts at adaptive quality
          and ramps up after a few seconds. Wait until status is <em>ready</em> before assigning to a course.
        </p>
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
          onClick={pickFileAndUpload}
          disabled={uploading}
          className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium disabled:opacity-60"
        >
          {uploading
            ? uploadPct != null
              ? `Uploading… ${uploadPct}%`
              : 'Working…'
            : 'Choose file & upload'}
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
                {items.map((row) => {
                  const preview = streamPreviewUrl(row.cloudflare_uid)
                  const ready = row.status === 'ready' && row.playback_url
                  return (
                    <tr key={row.id} className="border-t border-slate-100 align-top">
                      <td className="p-3">
                        <div className="font-medium">{row.title}</div>
                        <div className="text-[10px] font-mono text-slate-400 mt-1 truncate max-w-[180px]">
                          {row.cloudflare_uid || '—'}
                        </div>
                      </td>
                      <td className="p-3 capitalize">
                        <span
                          className={
                            row.status === 'ready'
                              ? 'text-emerald-600'
                              : row.status === 'error'
                                ? 'text-red-600'
                                : 'text-amber-600'
                          }
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="p-3">
                        {ready ? (
                          <div className="space-y-1">
                            {preview ? (
                              <a
                                href={preview}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-primary hover:underline block"
                              >
                                Preview player
                              </a>
                            ) : null}
                            <span
                              className="text-[10px] text-slate-400 break-all block max-w-[200px]"
                              title={row.playback_url}
                            >
                              HLS ready (used on course page)
                            </span>
                          </div>
                        ) : row.status === 'error' ? (
                          <span className="text-xs text-red-500">Upload/encode failed — delete and retry</span>
                        ) : (
                          <span className="text-xs text-amber-600">
                            Encoding… use Sync, then Preview
                          </span>
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
                            disabled={syncingId === row.id || !ready}
                            title={!ready ? 'Wait until status is ready' : undefined}
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
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

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
import { useAdminLocale } from '../../contexts/AdminLocaleContext'
import { adminVideoStatusKey } from '../../config/adminI18n'

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
  const { t } = useAdminLocale()
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
  const [preview, setPreview] = useState(null)

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

  const videoCourses = courses

  const handleSync = async (row) => {
    const slug = assignSlug[row.id] || row.catalog_slug || ''
    setError(null)
    setInfo(null)
    setSyncingId(row.id)
    try {
      const result = await syncStreamVideo({
        videoAssetId: row.id,
        wait: true,
        catalogSlug: slug || undefined,
      })
      if (result.pending) {
        setInfo(
          slug
            ? t('video.infoAssignPending', { slug })
            : t('video.infoSyncStillEncoding')
        )
      } else if (slug && result.catalogSlug) {
        setInfo(t('video.infoAssignSuccess', { slug: result.catalogSlug }))
      } else {
        setInfo(t('video.infoSyncSuccess'))
      }
      setAssignSlug((s) => {
        const next = { ...s }
        delete next[row.id]
        return next
      })
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
      setError(t('video.errSelectCourse'))
      return
    }
    setError(null)
    setInfo(null)
    setSyncingId(row.id)
    try {
      const result = await assignStreamToCourse({ videoAssetId: row.id, catalogSlug: slug })
      if (result.pending) {
        setInfo(t('video.infoAssignPending', { slug }))
      } else {
        setInfo(t('video.infoAssignSuccess', { slug: result.catalogSlug || slug }))
      }
      await logAdminAction('assign', 'video_assets', row.id, { catalogSlug: slug })
      setAssignSlug((s) => {
        const next = { ...s }
        delete next[row.id]
        return next
      })
      await fetchItems()
    } catch (err) {
      setError(err.message)
    } finally {
      setSyncingId(null)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm(t('video.deleteConfirm'))) return
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
      setError(t('video.errTitleRequired'))
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
          t('video.errFileTooLarge', {
            size: formatBytes(file.size),
            max: formatBytes(limits.maxFileBytes),
          })
        )
        return
      }
      if (file.size > limits.recommendedMaxFileBytes) {
        const ok = confirm(
          t('video.confirmLargeFile', {
            size: formatBytes(file.size),
            max: formatBytes(limits.recommendedMaxFileBytes),
          })
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

        setInfo(t('video.infoUploading', { name: file.name, size: formatBytes(file.size) }))
        await uploadFileToStream(uploadURL, file, {
          onProgress: (pct) => setUploadPct(pct),
        })

        setUploadPct(null)
        setInfo(t('video.infoUploadDoneEncoding'))
        const syncResult = await syncStreamVideo({ videoAssetId: row.id, wait: true })

        if (form.catalog_slug) {
          await assignStreamToCourse({ videoAssetId: row.id, catalogSlug: form.catalog_slug })
        }

        if (syncResult.pending) {
          setInfo(t('video.infoUploadPendingAssign'))
        } else if (form.catalog_slug) {
          setInfo(t('video.infoUploadReadyAssigned', { slug: form.catalog_slug }))
        } else {
          setInfo(t('video.infoUploadReady'))
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
      <AdminPageHeader title={t('video.title')} description={t('video.description')} />

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

      {videoCourses.length === 0 ? (
        <AdminAlert type="info">
          {t('video.noCoursesHint')}
        </AdminAlert>
      ) : null}

      {preview ? (
        <div className="fixed inset-0 z-[100] flex flex-col bg-black/90">
          <div className="flex items-center justify-between gap-3 px-4 py-3 bg-slate-900 text-white shrink-0">
            <button
              type="button"
              onClick={() => setPreview(null)}
              className="text-sm font-medium text-white/90 hover:text-white"
            >
              ← {t('video.previewBack')}
            </button>
            <span className="text-sm text-white/70 truncate">{preview.title}</span>
            <span className="w-16" />
          </div>
          <iframe
            title={preview.title}
            src={preview.url}
            className="flex-1 w-full border-0 bg-black"
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : null}

      <div className="card p-6 mb-6">
        <h2 className="font-semibold text-bingo-dark mb-2">{t('video.uploadHeading')}</h2>
        <p className="text-xs text-slate-500 mb-4 leading-relaxed">
          {t('video.helpSize', { maxGb: String(maxGb), recGb: String(recGb) })}{' '}
          {t('video.helpDuration', { maxHours: String(maxHours) })}{' '}
          {t('video.helpQuality')}
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <input
            placeholder={t('video.placeholderTitle')}
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            placeholder={t('video.placeholderDescription')}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
          />
          <select
            value={form.catalog_slug}
            onChange={(e) => setForm({ ...form, catalog_slug: e.target.value })}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">{t('video.assignCourseOptional')}</option>
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
              ? t('video.uploadingPct', { pct: String(uploadPct) })
              : t('video.working')
            : t('video.chooseFileUpload')}
        </button>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <p className="p-6 text-slate-500 text-sm">{t('video.loadingList')}</p>
        ) : items.length === 0 ? (
          <p className="p-6 text-slate-500 text-sm">{t('video.emptyList')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-600">
                <tr>
                  <th className="p-3">{t('video.colTitle')}</th>
                  <th className="p-3">{t('video.colStatus')}</th>
                  <th className="p-3">{t('video.colPlayback')}</th>
                  <th className="p-3">{t('video.colCourse')}</th>
                  <th className="p-3">{t('video.colActions')}</th>
                </tr>
              </thead>
              <tbody>
                {items.map((row) => {
                  const previewUrl = streamPreviewUrl(row.cloudflare_uid)
                  const ready = row.status === 'ready' && row.playback_url
                  const selectedSlug = assignSlug[row.id] || row.catalog_slug || ''
                  return (
                    <tr key={row.id} className="border-t border-slate-100 align-top">
                      <td className="p-3">
                        <div className="font-medium">{row.title}</div>
                        <div className="text-[10px] font-mono text-slate-400 mt-1 truncate max-w-[180px]">
                          {row.cloudflare_uid || '—'}
                        </div>
                      </td>
                      <td className="p-3">
                        <span
                          className={
                            row.status === 'ready'
                              ? 'text-emerald-600'
                              : row.status === 'error'
                                ? 'text-red-600'
                                : 'text-amber-600'
                          }
                        >
                          {t(adminVideoStatusKey(row.status))}
                        </span>
                      </td>
                      <td className="p-3">
                        {ready ? (
                          <div className="space-y-1">
                            {previewUrl ? (
                              <button
                                type="button"
                                onClick={() =>
                                  setPreview({ url: previewUrl, title: row.title || row.cloudflare_uid })
                                }
                                className="text-xs text-primary hover:underline block text-left"
                              >
                                {t('video.previewPlayer')}
                              </button>
                            ) : null}
                            <span
                              className="text-[10px] text-slate-400 break-all block max-w-[200px]"
                              title={row.playback_url}
                            >
                              {t('video.hlsReadyHint')}
                            </span>
                          </div>
                        ) : row.status === 'error' ? (
                          <span className="text-xs text-red-500">{t('video.encodeFailedHint')}</span>
                        ) : (
                          <span className="text-xs text-amber-600">{t('video.encodingHint')}</span>
                        )}
                      </td>
                      <td className="p-3">
                        {row.catalog_slug ? (
                          <div className="space-y-1">
                            <a
                              href={`/courses/detail/${row.catalog_slug}?preview=1&from=admin`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-primary hover:underline font-mono block"
                            >
                              {row.catalog_slug}
                            </a>
                          </div>
                        ) : null}
                        <select
                          value={selectedSlug}
                          onChange={(e) => setAssignSlug((s) => ({ ...s, [row.id]: e.target.value }))}
                          className="text-xs rounded border border-slate-200 px-2 py-1 max-w-[200px] w-full mt-1"
                        >
                          <option value="">{t('video.selectCourse')}</option>
                          {videoCourses.map((c) => (
                            <option key={c.slug} value={c.slug}>
                              {c.slug} — {c.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-3 whitespace-nowrap space-x-2">
                        <button
                          type="button"
                          disabled={syncingId === row.id}
                          onClick={() => handleSync(row)}
                          className="text-xs text-primary hover:underline disabled:opacity-50"
                          title={
                            assignSlug[row.id] && !row.catalog_slug
                              ? t('video.syncAndAssignHint')
                              : undefined
                          }
                        >
                          {assignSlug[row.id] && !row.catalog_slug
                            ? t('video.syncAndAssign')
                            : t('video.sync')}
                        </button>
                        <button
                          type="button"
                          disabled={syncingId === row.id || !selectedSlug}
                          onClick={() => handleAssign(row)}
                          className="text-xs text-emerald-600 hover:underline disabled:opacity-50"
                        >
                          {t('video.assign')}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(row.id)}
                          className="text-xs text-red-600 hover:underline"
                        >
                          {t('video.delete')}
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

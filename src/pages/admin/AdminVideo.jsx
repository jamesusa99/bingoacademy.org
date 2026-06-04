import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminAlert from '../../components/admin/AdminAlert'
import CurriculumPathPicker, { CURRICULUM_NEW } from '../../components/admin/CurriculumPathPicker'
import AdminVideoGroupedList from '../../components/admin/AdminVideoGroupedList'
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
import { CURRICULUM_LINES, getProgramCurriculum, isCurriculumLine } from '../../config/programCurriculum'
import { fetchCurriculumAdmin } from '../../lib/ioaiCurriculumAdmin'
import { resolveCurriculumLabels } from '../../lib/videoCurriculum'
import { useAdminFormDraft } from '../../hooks/useAdminFormDraft'
import { useAdminCrud } from '../../hooks/useAdminCrud'

const DEFAULT_LIMITS = {
  maxFileBytes: 30 * 1024 * 1024 * 1024,
  recommendedMaxFileBytes: 4 * 1024 * 1024 * 1024,
  maxDurationSeconds: 21_600,
}

const UPLOAD_INIT = {
  productLine: 'ioai',
  path: {
    stageChoice: '',
    themeChoice: '',
    moduleChoice: '',
    newStage: { title: '', slug: '', emoji: '🟢' },
    newTheme: { title: '', slug: '', category_label: '' },
    newModule: { title: '', slug: '' },
  },
  title: '',
  description: '',
  catalog_slug: '',
}

export default function AdminVideo() {
  const { t } = useAdminLocale()
  const c = useAdminCrud()
  const [items, setItems] = useState([])
  const [courses, setCourses] = useState([])
  const [levelsByLine, setLevelsByLine] = useState({ ioai: [], general: [], k12: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [info, setInfo] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadPct, setUploadPct] = useState(null)
  const [syncingId, setSyncingId] = useState(null)
  const [assignSlug, setAssignSlug] = useState({})
  const [limits, setLimits] = useState(DEFAULT_LIMITS)
  const [preview, setPreview] = useState(null)
  const [lineFilter, setLineFilter] = useState('all')

  const [form, setForm, clearUploadDraft] = useAdminFormDraft('admin-video-upload-form', UPLOAD_INIT)

  const productLine = isCurriculumLine(form.productLine) ? form.productLine : 'ioai'
  const config = getProgramCurriculum(productLine)
  const i18nRoot = `pages.${config.i18nKey}`
  const levels = levelsByLine[productLine] || []

  const pathLabels = useMemo(
    () => ({
      colStage: c.t(`${i18nRoot}.colStage`),
      colCategory: c.t(`${i18nRoot}.colCategory`),
      colModule: c.t(`${i18nRoot}.colModule`),
      newStage: c.t(`${i18nRoot}.newStage`),
      newCategory: c.t(`${i18nRoot}.newCategory`),
      newModule: c.t(`${i18nRoot}.newModule`),
      newStageTitle: c.t(`${i18nRoot}.newStageTitle`),
      newStageSlug: c.t(`${i18nRoot}.newStageSlug`),
      newStageEmoji: c.t(`${i18nRoot}.newStageEmoji`),
      newCategoryTitle: c.t(`${i18nRoot}.newCategoryTitle`),
      newCategorySlug: c.t(`${i18nRoot}.newCategorySlug`),
      newModuleTitle: c.t(`${i18nRoot}.newModuleTitle`),
      newModuleSlug: c.t(`${i18nRoot}.newModuleSlug`),
      phStageTitle: c.t(`${i18nRoot}.phStageTitle`),
      phCategoryTitle: c.t(`${i18nRoot}.phCategoryTitle`),
      phModuleTitle: c.t(`${i18nRoot}.phModuleTitle`),
    }),
    [c, i18nRoot]
  )

  const fetchItems = async () => {
    setLoading(true)
    const [{ data, error: e }, { data: catalog }, ...curriculumResults] = await Promise.all([
      supabase.from('video_assets').select('*').order('created_at', { ascending: false }),
      supabase.from('courses_catalog').select('slug, name, delivery_type, line').order('sort_order'),
      ...CURRICULUM_LINES.map((line) => fetchCurriculumAdmin(line).catch(() => ({ levels: [] }))),
    ])
    setError(e?.message || null)
    setItems(data || [])
    setCourses(catalog || [])
    setLevelsByLine(
      Object.fromEntries(CURRICULUM_LINES.map((line, i) => [line, curriculumResults[i]?.levels || []]))
    )
    setLoading(false)
  }

  useEffect(() => {
    fetchItems()
    fetchStreamUploadLimits()
      .then(setLimits)
      .catch(() => setLimits(DEFAULT_LIMITS))
  }, [])

  const videoCourses = useMemo(
    () => courses.filter((c) => c.line === productLine || !c.line),
    [courses, productLine]
  )

  const listLabels = useMemo(
    () => ({
      colTitle: t('video.colTitle'),
      colStatus: t('video.colStatus'),
      colPlayback: t('video.colPlayback'),
      colCourse: t('video.colCourse'),
      colActions: t('video.colActions'),
      colStage: c.t(`${i18nRoot}.colStage`),
      colCategory: c.t(`${i18nRoot}.colCategory`),
      colModule: c.t(`${i18nRoot}.colModule`),
      previewPlayer: t('video.previewPlayer'),
      encodingHint: t('video.encodingHint'),
      selectCourse: t('video.selectCourse'),
      sync: t('video.sync'),
      assign: t('video.assign'),
      delete: t('video.delete'),
      emptyList: t('video.emptyList'),
      unclassifiedHeading: t('video.unclassifiedHeading'),
      statusKey: adminVideoStatusKey,
    }),
    [t, c, i18nRoot]
  )

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
        setInfo(slug ? t('video.infoAssignPending', { slug }) : t('video.infoSyncStillEncoding'))
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

  const setFormField = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const pickFileAndUpload = () => {
    setError(null)
    setInfo(null)
    if (!form.title.trim()) {
      setError(t('video.errTitleRequired'))
      return
    }

    const curriculumMeta = resolveCurriculumLabels(levels, form.path)

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
          product_line: productLine,
          ...curriculumMeta,
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

        await logAdminAction('upload', 'video_assets', row.id, { uid, size: file.size, productLine })
        clearUploadDraft()
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

  const maxGb = limits.maxFileBytes / 1024 ** 3
  const recGb = limits.recommendedMaxFileBytes / 1024 ** 3
  const maxHours = Math.round(limits.maxDurationSeconds / 3600)

  const filteredItems = useMemo(() => {
    if (lineFilter === 'all') return items
    if (lineFilter === 'other') return items.filter((v) => !v.product_line)
    return items.filter((v) => v.product_line === lineFilter)
  }, [items, lineFilter])

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
        <p className="text-xs text-slate-500 mb-1 leading-relaxed">{t('video.curriculumClassifyHint')}</p>
        <p className="text-[10px] text-slate-400 mb-4">{t('video.draftHint')}</p>
        <p className="text-xs text-slate-500 mb-4 leading-relaxed">
          {t('video.helpSize', { maxGb: String(maxGb), recGb: String(recGb) })}{' '}
          {t('video.helpDuration', { maxHours: String(maxHours) })}{' '}
          {t('video.helpQuality')}
        </p>

        <div className="mb-4">
          <label className="text-xs font-medium text-slate-600 block mb-1">{t('video.productLine')}</label>
          <select
            value={productLine}
            onChange={(e) => setFormField('productLine', e.target.value)}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm max-w-xs"
          >
            {CURRICULUM_LINES.map((line) => (
              <option key={line} value={line}>
                {getProgramCurriculum(line).adminTitle}
              </option>
            ))}
          </select>
        </div>

        <CurriculumPathPicker
          levels={levels}
          labels={pathLabels}
          value={form.path}
          onChange={(path) => setFormField('path', path)}
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4 mt-4 pt-4 border-t border-slate-100">
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">{t('video.placeholderTitle')}</label>
            <input
              placeholder={t('video.placeholderTitle')}
              value={form.title}
              onChange={(e) => setFormField('title', e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">{t('video.placeholderDescription')}</label>
            <input
              placeholder={t('video.placeholderDescription')}
              value={form.description}
              onChange={(e) => setFormField('description', e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">{t('video.assignCourseOptional')}</label>
            <select
              value={form.catalog_slug}
              onChange={(e) => setFormField('catalog_slug', e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">{t('video.assignCourseOptional')}</option>
              {videoCourses.map((cRow) => (
                <option key={cRow.slug} value={cRow.slug}>
                  {cRow.slug} — {cRow.name}
                </option>
              ))}
            </select>
          </div>
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
        <div className="p-4 border-b flex flex-wrap justify-between items-center gap-3">
          <span className="font-semibold text-bingo-dark">{t('video.libraryHeading')}</span>
          <select
            value={lineFilter}
            onChange={(e) => setLineFilter(e.target.value)}
            className="text-xs rounded-lg border border-slate-200 px-2 py-1.5"
          >
            <option value="all">{t('video.filterAllLines')}</option>
            {CURRICULUM_LINES.map((line) => (
              <option key={line} value={line}>
                {getProgramCurriculum(line).adminTitle}
              </option>
            ))}
            <option value="other">{t('video.unclassifiedHeading')}</option>
          </select>
        </div>
        {loading ? (
          <p className="p-6 text-slate-500 text-sm">{t('video.loadingList')}</p>
        ) : (
          <AdminVideoGroupedList
            items={filteredItems}
            lineFilter={lineFilter}
            labels={listLabels}
            t={t}
            assignSlug={assignSlug}
            syncingId={syncingId}
            courseOptions={courses}
            onPreview={setPreview}
            onSync={handleSync}
            onAssign={handleAssign}
            onDelete={handleDelete}
            onAssignChange={(id, slug) => setAssignSlug((s) => ({ ...s, [id]: slug }))}
          />
        )}
      </div>
    </div>
  )
}

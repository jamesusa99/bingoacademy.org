import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { PRODUCT_LINES } from '../../config/products'
import { COURSE_CATEGORIES, COURSE_LEVELS } from '../../config/courseListFilters'
import { COURSE_STATUS } from '../../config/coursesCatalog'
import {
  CATALOG_FORM_EMPTY,
  catalogRowToForm,
  formToCatalogPayload,
} from '../../lib/catalogCourse'
import { saveCatalogCourse, deleteCatalogCourse } from '../../lib/admin/catalog'
import DraggableCatalogList from '../../components/admin/DraggableCatalogList'
import { assignStreamToCourse } from '../../lib/admin/api'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminAlert from '../../components/admin/AdminAlert'
import { useAdminCrud } from '../../hooks/useAdminCrud'

function statusOptions(t) {
  return [
    { value: COURSE_STATUS.LIVE, label: t('pages.coursesCatalog.statusLive') },
    { value: COURSE_STATUS.COMING_SOON, label: t('pages.coursesCatalog.statusComingSoon') },
  ]
}

const DELIVERY_TYPES = ['video', 'camp', 'self-study', 'classroom', 'lab', 'materials', 'books']

function Field({ label, children, className = '' }) {
  return (
    <div className={className}>
      <label className="text-xs font-medium text-slate-600 block mb-1">{label}</label>
      {children}
    </div>
  )
}

const inputClass = 'w-full rounded-xl border border-slate-200 px-3 py-2 text-sm'

export default function AdminCoursesCatalog() {
  const c = useAdminCrud()
  const STATUS_OPTIONS = statusOptions(c.t)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [syncingVideo, setSyncingVideo] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [editingSlug, setEditingSlug] = useState(null)
  const [form, setForm] = useState(CATALOG_FORM_EMPTY)
  const [lineFilter, setLineFilter] = useState('all')
  const [groupedIOAI, setGroupedIOAI] = useState(true)

  const lineDef = PRODUCT_LINES.find((p) => p.id === form.line) || PRODUCT_LINES[0]

  const fetchItems = async () => {
    setLoading(true)
    const { data, error: e } = await supabase.from('courses_catalog').select('*').order('sort_order')
    setError(e?.message || null)
    setItems(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const startAdd = () => {
    setEditingSlug(null)
    setForm({ ...CATALOG_FORM_EMPTY, line: 'general', sub: 'course' })
    setSuccess(null)
    setError(null)
  }

  const startEdit = (row) => {
    setEditingSlug(row.slug)
    setForm(catalogRowToForm(row))
    setSuccess(null)
    setError(null)
  }

  const handleStreamSync = async () => {
    if (!form.cloudflare_uid?.trim()) {
      setError(c.t('pages.coursesCatalog.streamUidRequired'))
      return
    }
    if (!form.slug?.trim()) {
      setError(c.t('pages.coursesCatalog.slugSaveFirst'))
      return
    }
    setError(null)
    setSuccess(null)
    setSyncingVideo(true)
    try {
      const result = await assignStreamToCourse({
        uid: form.cloudflare_uid.trim(),
        catalogSlug: form.slug.trim(),
      })
      const course = result.course
      if (course) {
        setForm(catalogRowToForm(course))
      }
      setSuccess(result.message || 'Video synced from Cloudflare Stream.')
      await fetchItems()
    } catch (e) {
      setError(e.message)
    } finally {
      setSyncingVideo(false)
    }
  }

  const handleSave = async () => {
    setError(null)
    setSuccess(null)
    setSaving(true)
    try {
      const payload = formToCatalogPayload(form)
      if (!payload.slug) throw new Error(c.t('pages.coursesCatalog.slugRequired'))
      await saveCatalogCourse(payload)
      setSuccess(editingSlug ? c.t('pages.coursesCatalog.courseUpdated') : c.t('pages.coursesCatalog.courseSaved'))
      if (!editingSlug) {
        setEditingSlug(payload.slug)
      }
      await fetchItems()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (slug) => {
    if (!confirm(c.t('pages.coursesCatalog.confirmDelete', { slug }))) return
    setError(null)
    setSuccess(null)
    try {
      await deleteCatalogCourse(slug)
      setSuccess(c.t('pages.coursesCatalog.courseDeleted'))
      if (editingSlug === slug) {
        setEditingSlug(null)
        setForm(CATALOG_FORM_EMPTY)
      }
      await fetchItems()
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div>
      <AdminPageHeader titleKey="pages.coursesCatalog.title" descriptionKey="pages.coursesCatalog.desc" />

      {error ? (
        <AdminAlert type="error" onDismiss={() => setError(null)}>
          {error.includes('does not exist') ? c.t('pages.coursesCatalog.migrationHint') : error}
        </AdminAlert>
      ) : null}
      {success ? (
        <AdminAlert type="success" onDismiss={() => setSuccess(null)}>
          {success}
        </AdminAlert>
      ) : null}

      <div className="card p-6 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="font-semibold text-bingo-dark">
            {editingSlug ? c.t('pages.coursesCatalog.editCourse', { slug: editingSlug }) : c.t('pages.coursesCatalog.addCourse')}
          </h2>
          <button type="button" onClick={startAdd} className="text-sm text-primary hover:underline">
            {c.t('pages.coursesCatalog.newCourse')}
          </button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label="Slug (ID) *">
            <input
              value={form.slug}
              onChange={(e) => set('slug', e.target.value)}
              disabled={!!editingSlug}
              placeholder="ioai-whitelist"
              className={`${inputClass} font-mono disabled:bg-slate-50`}
            />
          </Field>
          <Field label="Product line *">
            <select value={form.line} onChange={(e) => set('line', e.target.value)} className={inputClass}>
              {PRODUCT_LINES.map((pl) => (
                <option key={pl.id} value={pl.id}>
                  {pl.icon} {pl.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Subcategory *">
            <select value={form.sub} onChange={(e) => set('sub', e.target.value)} className={inputClass}>
              {lineDef.subcategories.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.icon} {s.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Status">
            <select value={form.status} onChange={(e) => set('status', e.target.value)} className={inputClass}>
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Delivery type">
            <select
              value={form.delivery_type}
              onChange={(e) => set('delivery_type', e.target.value)}
              className={inputClass}
            >
              {DELIVERY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Sort order">
            <input
              type="number"
              value={form.sort_order}
              onChange={(e) => set('sort_order', e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Name *" className="sm:col-span-2">
            <input value={form.name} onChange={(e) => set('name', e.target.value)} className={inputClass} />
          </Field>
          <Field label="Name (EN)">
            <input value={form.name_en} onChange={(e) => set('name_en', e.target.value)} className={inputClass} />
          </Field>
          <Field label="Badge">
            <input value={form.badge} onChange={(e) => set('badge', e.target.value)} className={inputClass} />
          </Field>
          <Field label="Price (display)">
            <input value={form.price} onChange={(e) => set('price', e.target.value)} placeholder="$299" className={inputClass} />
          </Field>
          <Field label="Stripe price (cents)">
            <input
              type="number"
              value={form.price_cents}
              onChange={(e) => set('price_cents', e.target.value)}
              placeholder="29900"
              className={inputClass}
            />
            <p className="text-[10px] text-slate-500 mt-1">Optional — overrides parsed display price for checkout (e.g. 29900 = $299)</p>
          </Field>
          <Field label="Currency">
            <input value={form.currency} onChange={(e) => set('currency', e.target.value)} placeholder="usd" className={inputClass} />
          </Field>
          <Field label="Online purchasable">
            <select
              value={form.purchasable === '' ? '' : form.purchasable ? 'yes' : 'no'}
              onChange={(e) => {
                const v = e.target.value
                set('purchasable', v === '' ? '' : v === 'yes')
              }}
              className={inputClass}
            >
              <option value="">Auto (from price)</option>
              <option value="yes">Yes — enable Stripe checkout</option>
              <option value="no">No — contact sales only</option>
            </select>
          </Field>
          <Field label="Hours / duration label">
            <input value={form.hours} onChange={(e) => set('hours', e.target.value)} className={inputClass} />
          </Field>
          <Field label="List: category (filter)">
            <select value={form.category} onChange={(e) => set('category', e.target.value)} className={inputClass}>
              {COURSE_CATEGORIES.filter((c) => c.value !== 'all').map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="List: level">
            <select value={form.level} onChange={(e) => set('level', e.target.value)} className={inputClass}>
              {COURSE_LEVELS.filter((l) => l.value !== 'all').map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Lessons count">
            <input
              type="number"
              value={form.lessons}
              onChange={(e) => set('lessons', e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Rating">
            <input
              type="number"
              step="0.1"
              min="0"
              max="5"
              value={form.rating}
              onChange={(e) => set('rating', e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Students count">
            <input
              type="number"
              value={form.students}
              onChange={(e) => set('students', e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Thumbnail URL">
            <input
              value={form.thumbnail_url}
              onChange={(e) => set('thumbnail_url', e.target.value)}
              placeholder="https://…"
              className={inputClass}
            />
          </Field>
          <Field label="Featured (IOAI highlight)">
            <label className="flex items-center gap-2 text-sm mt-2">
              <input type="checkbox" checked={form.featured} onChange={(e) => set('featured', e.target.checked)} />
              Show in featured blocks
            </label>
          </Field>
          <Field label="Audience" className="sm:col-span-2 lg:col-span-3">
            <input value={form.audience} onChange={(e) => set('audience', e.target.value)} className={inputClass} />
          </Field>
          <Field label="Description" className="sm:col-span-2 lg:col-span-3">
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={3}
              className={inputClass}
            />
          </Field>
          <Field label="Outcomes (JSON array or one per line)" className="sm:col-span-2 lg:col-span-3">
            <textarea value={form.outcomes} onChange={(e) => set('outcomes', e.target.value)} rows={3} className={`${inputClass} font-mono text-xs`} />
          </Field>
          <Field label="Syllabus (JSON array or one per line)" className="sm:col-span-2 lg:col-span-3">
            <textarea value={form.syllabus} onChange={(e) => set('syllabus', e.target.value)} rows={3} className={`${inputClass} font-mono text-xs`} />
          </Field>
          <Field label="Lab slugs (JSON array)" className="sm:col-span-2 lg:col-span-3">
            <textarea
              value={form.lab_slugs}
              onChange={(e) => set('lab_slugs', e.target.value)}
              rows={2}
              placeholder='["doodle-monsters","evolve-car"]'
              className={`${inputClass} font-mono text-xs`}
            />
          </Field>

          {form.delivery_type === 'video' ? (
            <div className="sm:col-span-2 lg:col-span-3 rounded-xl border border-cyan-200 bg-cyan-50/50 p-4 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-bingo-dark text-sm">{c.t('pages.coursesCatalog.streamSection')}</h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {c.t('pages.coursesCatalog.streamHintPrefix')}{' '}
                    <a href="/admin/video" className="text-primary hover:underline">
                      {c.t('nav.video')}
                    </a>
                    {c.t('pages.coursesCatalog.streamHintSuffix')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleStreamSync}
                  disabled={syncingVideo || !form.cloudflare_uid}
                  className="text-xs px-3 py-2 rounded-lg bg-primary text-white font-medium disabled:opacity-50"
                >
                  {syncingVideo ? c.t('pages.coursesCatalog.syncing') : c.t('pages.coursesCatalog.syncStream')}
                </button>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Cloudflare Stream UID">
                  <input
                    value={form.cloudflare_uid}
                    onChange={(e) => set('cloudflare_uid', e.target.value)}
                    placeholder="Stream video UID"
                    className={`${inputClass} font-mono text-xs`}
                  />
                </Field>
                <Field label="Preview seconds (freemium)">
                  <input
                    type="number"
                    min={0}
                    value={form.preview_seconds}
                    onChange={(e) => set('preview_seconds', e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="Video URL (HLS — auto-filled on sync)" className="sm:col-span-2">
                  <input
                    value={form.video_url}
                    onChange={(e) => set('video_url', e.target.value)}
                    placeholder="https://customer-….cloudflarestream.com/…/manifest/video.m3u8"
                    className={`${inputClass} font-mono text-xs`}
                  />
                </Field>
                <Field label="Poster / thumbnail URL" className="sm:col-span-2">
                  <input
                    value={form.video_poster}
                    onChange={(e) => set('video_poster', e.target.value)}
                    placeholder="https://…"
                    className={`${inputClass} font-mono text-xs`}
                  />
                </Field>
              </div>
              {form.video_url ? (
                <p className="text-xs text-emerald-700">
                  {c.t('pages.coursesCatalog.videoConfigured')}{' '}
                  <a
                    href={`/courses/detail/${form.slug || 'ioai-1-1'}?preview=1&from=admin`}
                    target="_blank"
                    rel="noreferrer"
                    className="underline"
                  >
                    {c.t('pages.coursesCatalog.courseDetail')}
                  </a>
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="flex gap-2 mt-6">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="btn-primary px-5 py-2 rounded-xl text-sm disabled:opacity-60"
          >
            {saving ? c.saving : c.t('pages.coursesCatalog.saveCourse')}
          </button>
          {editingSlug ? (
            <button
              type="button"
              onClick={() => {
                setEditingSlug(null)
                setForm(CATALOG_FORM_EMPTY)
              }}
              className="px-5 py-2 rounded-xl border text-sm"
            >
              {c.cancel}
            </button>
          ) : null}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 border-b flex flex-wrap justify-between items-center gap-3">
          <span className="font-semibold">{c.t('pages.coursesCatalog.allCourses', { count: String(items.length) })}</span>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={lineFilter}
              onChange={(e) => setLineFilter(e.target.value)}
              className="text-xs rounded-lg border border-slate-200 px-2 py-1.5"
            >
              <option value="all">{c.t('pages.coursesCatalog.filterAllLines')}</option>
              {PRODUCT_LINES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            {lineFilter === 'ioai' ? (
              <label className="inline-flex items-center gap-1.5 text-xs text-slate-600">
                <input
                  type="checkbox"
                  checked={groupedIOAI}
                  onChange={(e) => setGroupedIOAI(e.target.checked)}
                />
                {c.t('pages.coursesCatalog.groupIOAI')}
              </label>
            ) : null}
            <a
              href="/courses?line=general&sub=course"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-primary hover:underline"
            >
              {c.previewOnSite}
            </a>
          </div>
        </div>
        {loading ? (
          <p className="p-6 text-sm text-slate-500">{c.loading}</p>
        ) : items.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">{c.t('pages.coursesCatalog.noCourses')}</p>
        ) : (
          <DraggableCatalogList
            items={items}
            lineFilter={lineFilter}
            groupedIOAI={groupedIOAI}
            onEdit={startEdit}
            onDelete={handleDelete}
            onReorderComplete={fetchItems}
            labels={{
              name: c.name,
              status: c.status,
              price: c.price,
              video: c.t('pages.coursesCatalog.streamSection'),
              edit: c.edit,
              delete: c.delete,
              dragHint: c.t('pages.coursesCatalog.dragHint'),
              dragModule: c.t('pages.coursesCatalog.dragModule'),
              dragLesson: c.t('pages.coursesCatalog.dragLesson'),
              savingOrder: c.t('pages.coursesCatalog.savingOrder'),
              ioaiDragHint: c.t('pages.coursesCatalog.ioaiDragHint'),
              coursePackage: c.t('pages.coursesCatalog.coursePackage'),
              module: c.t('pages.coursesCatalog.module'),
              lessons: c.t('pages.coursesCatalog.lessons'),
              streamOk: c.t('pages.coursesCatalog.streamOk'),
              noVideo: c.t('pages.coursesCatalog.noVideo'),
              noCourses: c.t('pages.coursesCatalog.noCourses'),
            }}
          />
        )}
      </div>
    </div>
  )
}

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
import { assignStreamToCourse } from '../../lib/admin/api'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminAlert from '../../components/admin/AdminAlert'

const STATUS_OPTIONS = [
  { value: COURSE_STATUS.LIVE, label: 'Live (enrolling)' },
  { value: COURSE_STATUS.COMING_SOON, label: 'Coming soon' },
]

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
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [syncingVideo, setSyncingVideo] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [editingSlug, setEditingSlug] = useState(null)
  const [form, setForm] = useState(CATALOG_FORM_EMPTY)

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
      setError('Enter a Cloudflare UID or assign via Admin → Video library.')
      return
    }
    if (!form.slug?.trim()) {
      setError('Save the course slug first.')
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
      if (!payload.slug) throw new Error('Slug is required (e.g. g1, ioai-whitelist)')
      await saveCatalogCourse(payload)
      setSuccess(editingSlug ? 'Course updated.' : 'Course saved.')
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
    if (!confirm(`Delete course "${slug}"? This cannot be undone.`)) return
    setError(null)
    setSuccess(null)
    try {
      await deleteCatalogCourse(slug)
      setSuccess('Course deleted.')
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
      <AdminPageHeader
        title="Courses Management"
        description="Manage all courses shown on /courses (product lines, video list, detail pages). Changes appear on the site after save. Run migration 008 for list fields (category, level, rating)."
      />

      {error ? (
        <AdminAlert type="error" onDismiss={() => setError(null)}>
          {error.includes('does not exist')
            ? 'Run supabase/migrations/007 and 008, then npm run seed'
            : error}
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
            {editingSlug ? `Edit: ${editingSlug}` : 'Add course'}
          </h2>
          <button type="button" onClick={startAdd} className="text-sm text-primary hover:underline">
            + New course
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
          <Field label="Price">
            <input value={form.price} onChange={(e) => set('price', e.target.value)} placeholder="$299" className={inputClass} />
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
                  <h3 className="font-semibold text-bingo-dark text-sm">Cloudflare Stream video</h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Upload at <a href="/admin/video" className="text-primary hover:underline">Admin → Video library</a>, or paste a Stream UID and sync.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleStreamSync}
                  disabled={syncingVideo || !form.cloudflare_uid}
                  className="text-xs px-3 py-2 rounded-lg bg-primary text-white font-medium disabled:opacity-50"
                >
                  {syncingVideo ? 'Syncing…' : 'Sync from Stream'}
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
                  ✓ Video configured — preview at{' '}
                  <a
                    href={`/courses/detail/${form.slug || 'ioai-1-1'}`}
                    target="_blank"
                    rel="noreferrer"
                    className="underline"
                  >
                    course detail page
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
            {saving ? 'Saving…' : 'Save course'}
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
              Cancel
            </button>
          ) : null}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 border-b font-semibold flex justify-between items-center">
          <span>All courses ({items.length})</span>
          <a href="/courses?line=general&sub=course" target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">
            Preview on site →
          </a>
        </div>
        {loading ? (
          <p className="p-6 text-sm text-slate-500">Loading…</p>
        ) : items.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">No courses. Add one above or Platform → Import site data.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-600">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">Line / Sub</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Level</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Slug</th>
                  <th className="p-3">Video</th>
                  <th className="p-3" />
                </tr>
              </thead>
              <tbody>
                {items.map((row) => (
                  <tr key={row.slug} className="border-t border-slate-100">
                    <td className="p-3 font-medium">
                      {row.name}
                      {row.featured ? <span className="ml-1 text-xs text-amber-600">★</span> : null}
                    </td>
                    <td className="p-3 text-xs capitalize">
                      {row.line} / {row.sub}
                    </td>
                    <td className="p-3">{row.status}</td>
                    <td className="p-3 capitalize">{row.level || '—'}</td>
                    <td className="p-3 text-slate-600">{row.price || '—'}</td>
                    <td className="p-3 text-xs font-mono text-slate-400">{row.slug}</td>
                    <td className="p-3 text-xs">
                      {row.video_url ? (
                        <span className="text-emerald-600 font-medium">Stream ✓</span>
                      ) : row.delivery_type === 'video' ? (
                        <span className="text-amber-600">No video</span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <button type="button" onClick={() => startEdit(row)} className="text-primary mr-2">
                        Edit
                      </button>
                      <button type="button" onClick={() => handleDelete(row.slug)} className="text-red-600">
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

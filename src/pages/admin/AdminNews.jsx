import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { adminInsert, adminUpdate, adminDelete } from '../../lib/admin/db'
import AdminField from '../../components/admin/AdminField'
import { useAdminCrud } from '../../hooks/useAdminCrud'
import { NEWS_CATEGORIES } from '../../config/newsArticles'
import { mapNewsRow } from '../../lib/newsArticlesApi'

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'live', label: 'Live (public)' },
  { value: 'hidden', label: 'Hidden' },
]

const EMPTY_FORM = {
  slug: '',
  title: '',
  excerpt: '',
  body: '',
  category: 'curriculum',
  keywords: '',
  published_at: new Date().toISOString().slice(0, 10),
  status: 'draft',
  sort_order: 0,
  og_image: '',
}

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

export default function AdminNews() {
  const c = useAdminCrud()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ ...EMPTY_FORM })

  const fetchItems = async () => {
    setLoading(true)
    setError(null)
    const { data, error: fetchError } = await supabase
      .from('news_articles')
      .select('*')
      .order('published_at', { ascending: false })
      .order('sort_order', { ascending: true })

    if (fetchError) {
      setError(fetchError.message)
      setItems([])
    } else {
      setItems((data || []).map(mapNewsRow))
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const toPayload = () => ({
    slug: form.slug.trim(),
    title: form.title.trim(),
    excerpt: form.excerpt.trim() || null,
    body: form.body,
    category: form.category,
    keywords: form.keywords
      ? form.keywords.split(',').map((k) => k.trim()).filter(Boolean)
      : [],
    published_at: form.published_at,
    status: form.status,
    sort_order: parseInt(form.sort_order, 10) || 0,
    og_image: form.og_image.trim() || null,
    updated_at: new Date().toISOString(),
  })

  const validate = () => {
    if (!form.slug.trim()) return c.t('pages.news.errSlug')
    if (!form.title.trim()) return c.t('pages.news.errTitle')
    if (!form.body.trim()) return c.t('pages.news.errBody')
    return null
  }

  const handleSave = async () => {
    setError(null)
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    const payload = toPayload()
    try {
      if (editing) {
        await adminUpdate('news_articles', editing.id, payload)
        setEditing(null)
      } else {
        await adminInsert('news_articles', payload)
      }
      setForm({ ...EMPTY_FORM })
      fetchItems()
    } catch (e) {
      setError(e.message)
    }
  }

  const startAdd = () => {
    setEditing(null)
    setForm({ ...EMPTY_FORM, sort_order: items.length })
  }

  const startEdit = (row) => {
    setEditing(row)
    setForm({
      slug: row.slug,
      title: row.title,
      excerpt: row.excerpt || '',
      body: row.body || '',
      category: row.category,
      keywords: (row.keywords || []).join(', '),
      published_at: row.date,
      status: row.status || 'draft',
      sort_order: row.sortOrder ?? 0,
      og_image: row.ogImage || '',
    })
  }

  const handleDelete = async (id) => {
    if (!c.confirmDeleteGeneric()) return
    setError(null)
    try {
      await adminDelete('news_articles', id)
      if (editing?.id === id) {
        setEditing(null)
        setForm({ ...EMPTY_FORM })
      }
      fetchItems()
    } catch (e) {
      setError(e.message)
    }
  }

  const suggestSlug = () => {
    if (form.slug.trim()) return
    const suggested = slugify(form.title)
    if (suggested) setForm((f) => ({ ...f, slug: suggested }))
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-bingo-dark">{c.pageTitle('news')}</h1>
          <p className="text-sm text-slate-500 mt-1">{c.t('pages.news.desc')}</p>
        </div>
        <Link to="/news" target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline shrink-0">
          {c.t('pages.news.viewPublic')} →
        </Link>
      </div>

      {error ? <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-sm">{error}</div> : null}

      <div className="card p-6 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="font-semibold">{editing ? c.editItem(c.t('pages.news.item')) : c.addItem(c.t('pages.news.item'))}</h2>
          {editing ? (
            <button type="button" onClick={startAdd} className="text-sm text-slate-500 hover:text-slate-800">
              {c.t('pages.news.cancelEdit')}
            </button>
          ) : null}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <AdminField label={c.t('pages.news.fieldTitle')} required className="sm:col-span-2">
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              onBlur={suggestSlug}
              className="w-full rounded-xl border px-3 py-2 text-sm"
            />
          </AdminField>

          <AdminField label={c.t('pages.news.fieldSlug')} required>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              placeholder="my-article-slug"
              className="w-full rounded-xl border px-3 py-2 text-sm font-mono"
            />
          </AdminField>

          <AdminField label={c.t('pages.news.fieldStatus')} required>
            <select
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              className="w-full rounded-xl border px-3 py-2 text-sm"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </AdminField>

          <AdminField label={c.t('pages.news.fieldCategory')} required>
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="w-full rounded-xl border px-3 py-2 text-sm"
            >
              {NEWS_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </AdminField>

          <AdminField label={c.t('pages.news.fieldPublishedAt')} required>
            <input
              type="date"
              value={form.published_at}
              onChange={(e) => setForm((f) => ({ ...f, published_at: e.target.value }))}
              className="w-full rounded-xl border px-3 py-2 text-sm"
            />
          </AdminField>

          <AdminField label={c.t('pages.news.fieldKeywords')} className="sm:col-span-2">
            <input
              type="text"
              value={form.keywords}
              onChange={(e) => setForm((f) => ({ ...f, keywords: e.target.value }))}
              placeholder="AI classes for kids, STEM Education"
              className="w-full rounded-xl border px-3 py-2 text-sm"
            />
          </AdminField>

          <AdminField label={c.t('pages.news.fieldExcerpt')} className="sm:col-span-2">
            <textarea
              value={form.excerpt}
              onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
              rows={2}
              className="w-full rounded-xl border px-3 py-2 text-sm"
            />
          </AdminField>

          <AdminField label={c.t('pages.news.fieldBody')} required className="sm:col-span-2">
            <textarea
              value={form.body}
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              rows={12}
              className="w-full rounded-xl border px-3 py-2 text-sm font-mono"
              placeholder="Markdown supported (**bold**, *italic*)"
            />
          </AdminField>

          <AdminField label={c.t('pages.news.fieldOgImage')}>
            <input
              type="text"
              value={form.og_image}
              onChange={(e) => setForm((f) => ({ ...f, og_image: e.target.value }))}
              placeholder="https://www.bingoacademy.org/images/..."
              className="w-full rounded-xl border px-3 py-2 text-sm"
            />
          </AdminField>

          <AdminField label={c.t('pages.news.fieldSortOrder')}>
            <input
              type="number"
              value={form.sort_order}
              onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))}
              className="w-full rounded-xl border px-3 py-2 text-sm"
            />
          </AdminField>
        </div>

        <div className="mt-4 flex gap-2">
          <button type="button" onClick={handleSave} className="btn-primary px-4 py-2 text-sm rounded-xl">
            {c.save}
          </button>
          {!editing ? (
            <button type="button" onClick={startAdd} className="px-4 py-2 text-sm rounded-xl border border-slate-200">
              {c.t('pages.news.resetForm')}
            </button>
          ) : null}
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold mb-4">{c.t('pages.news.listTitle')}</h2>
        {loading ? (
          <p className="text-sm text-slate-500">{c.loading}</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-slate-500">{c.t('pages.news.empty')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b">
                  <th className="py-2 pr-4">{c.t('pages.news.colTitle')}</th>
                  <th className="py-2 pr-4">{c.t('pages.news.colStatus')}</th>
                  <th className="py-2 pr-4">{c.t('pages.news.fieldPublishedAt')}</th>
                  <th className="py-2 pr-4">{c.t('pages.news.colActions')}</th>
                </tr>
              </thead>
              <tbody>
                {items.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-3 pr-4">
                      <div className="font-medium text-bingo-dark">{row.title}</div>
                      <div className="text-xs text-slate-400 font-mono">/news/{row.slug}</div>
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          row.status === 'live'
                            ? 'bg-emerald-100 text-emerald-700'
                            : row.status === 'hidden'
                              ? 'bg-slate-100 text-slate-600'
                              : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-slate-600">{row.date}</td>
                    <td className="py-3 pr-4">
                      <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => startEdit(row)} className="text-primary hover:underline">
                          {c.edit}
                        </button>
                        {row.status === 'live' ? (
                          <Link to={`/news/${row.slug}`} target="_blank" rel="noreferrer" className="text-slate-500 hover:underline">
                            View
                          </Link>
                        ) : null}
                        <button type="button" onClick={() => handleDelete(row.id)} className="text-red-600 hover:underline">
                          {c.delete}
                        </button>
                      </div>
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

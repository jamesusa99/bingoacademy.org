import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../../lib/supabase'
import { adminInsert, adminUpdate, adminDelete } from '../../lib/admin/db'
import AdminField from '../../components/admin/AdminField'
import { useAdminCrud } from '../../hooks/useAdminCrud'
import { filterMallCoursesForTab } from '../../lib/mallTabFilters'

function toDb(row) {
  return {
    name: row.name,
    type: row.type || 'course',
    cat: row.cat,
    tag: row.tag,
    price: row.price ? parseFloat(row.price) : null,
    b_price: row.bPrice,
    sold: parseInt(row.sold, 10) || 0,
    rating: row.rating ? parseFloat(row.rating) : null,
    desc: row.desc,
    badge: row.badge,
    ai_lab: !!row.aiLab,
    mall_tab: row.mallTab || null,
    featured_home: !!row.featuredHome,
    sort_order: parseInt(row.sortOrder, 10) || 0,
  }
}

function fromDb(row) {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    cat: row.cat,
    tag: row.tag,
    price: row.price,
    bPrice: row.b_price,
    sold: row.sold,
    rating: row.rating,
    desc: row.desc,
    badge: row.badge,
    aiLab: row.ai_lab,
    mallTab: row.mall_tab || '',
    featuredHome: !!row.featured_home,
    sortOrder: row.sort_order ?? 0,
  }
}

function emptyCourseForm(mallTab) {
  return {
    name: '',
    type: 'course',
    cat: mallTab === 'ioai' ? 'competition' : '',
    tag: '',
    price: '',
    bPrice: '',
    sold: '0',
    rating: '',
    desc: '',
    badge: mallTab === 'ioai' ? 'Competition' : '',
    aiLab: false,
    mallTab: mallTab || '',
    featuredHome: false,
    sortOrder: '0',
  }
}

const COURSE_REQUIRED = new Set(['name'])

export default function AdminCourses({ embedded = false, mallTab = null }) {
  const c = useAdminCrud()
  const itemLabel = c.t('pages.mall.item')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(() => emptyCourseForm(mallTab))
  const [error, setError] = useState(null)

  const visibleItems = useMemo(() => {
    if (!mallTab) return items
    return filterMallCoursesForTab(items, mallTab)
  }, [items, mallTab])

  const fetchCourses = async () => {
    setLoading(true)
    const { data, error: e } = await supabase.from('courses').select('*').order('created_at', { ascending: false })
    setError(e?.message)
    setItems((data || []).map(fromDb))
    setLoading(false)
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  useEffect(() => {
    if (!editing) setForm(emptyCourseForm(mallTab))
  }, [mallTab, editing])

  const handleSave = async () => {
    setError(null)
    const payload = toDb({ ...form, mallTab: form.mallTab || mallTab || null })
    try {
      if (editing) {
        await adminUpdate('courses', editing.id, payload)
        setEditing(null)
        setForm(emptyCourseForm(mallTab))
      } else {
        await adminInsert('courses', payload)
        setForm(emptyCourseForm(mallTab))
      }
      fetchCourses()
    } catch (e) {
      setError(e.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm(c.t('pages.mall.confirmDelete'))) return
    setError(null)
    try {
      await adminDelete('courses', id)
      fetchCourses()
    } catch (e) {
      setError(e.message)
    }
  }

  const startEdit = (item) => {
    setEditing(item)
    setForm({
      name: item.name,
      type: item.type || 'course',
      cat: item.cat || '',
      tag: item.tag || '',
      price: item.price ?? '',
      bPrice: item.bPrice || '',
      sold: String(item.sold ?? 0),
      rating: item.rating ?? '',
      desc: item.desc || '',
      badge: item.badge || '',
      aiLab: !!item.aiLab,
      mallTab: item.mallTab || mallTab || '',
      featuredHome: !!item.featuredHome,
      sortOrder: String(item.sortOrder ?? 0),
    })
  }

  const cancelEdit = () => {
    setEditing(null)
    setForm(emptyCourseForm(mallTab))
  }

  return (
    <div className={embedded ? 'mb-8' : ''}>
      {!embedded && (
        <>
          <h1 className="text-2xl font-bold text-bingo-dark mb-2">{c.pageTitle('mall')}</h1>
          <p className="text-slate-600 text-sm mb-6">{c.pageDesc('mall')}</p>
        </>
      )}

      {error && <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-sm">{error}</div>}

      <div className="card p-6 mb-6">
        <h2 className="font-semibold text-bingo-dark mb-4">{editing ? c.editItem(itemLabel) : c.addItem(itemLabel)}</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {['name', 'type', 'cat', 'tag', 'price', 'bPrice', 'sold', 'rating', 'desc', 'badge'].map((k) => (
            <AdminField key={k} label={k} required={COURSE_REQUIRED.has(k)} className={k === 'desc' ? 'sm:col-span-2' : ''}>
              {k === 'desc' ? (
                <textarea value={form[k]} onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))} rows={2} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
              ) : (
                <input
                  type={['price', 'sold', 'rating'].includes(k) ? 'number' : 'text'}
                  value={form[k]}
                  onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              )}
            </AdminField>
          ))}
          <AdminField label="AI Lab">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.aiLab} onChange={(e) => setForm((f) => ({ ...f, aiLab: e.target.checked }))} /> {c.yes}
            </label>
          </AdminField>
          <AdminField label={c.t('pages.mall.fields.featuredHome')}>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.featuredHome} onChange={(e) => setForm((f) => ({ ...f, featuredHome: e.target.checked }))} /> {c.t('pages.mall.fields.featuredHomeHint')}
            </label>
          </AdminField>
          <AdminField label="sort_order">
            <input type="number" value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          </AdminField>
        </div>
        <div className="flex gap-2 mt-4">
          <button type="button" onClick={handleSave} className="btn-primary px-5 py-2 rounded-xl text-sm">{c.save}</button>
          {editing && <button type="button" onClick={cancelEdit} className="px-5 py-2 rounded-xl border border-slate-300 text-sm">{c.cancel}</button>}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 border-b border-slate-100 font-semibold text-bingo-dark">{c.t('pages.mall.list')}</div>
        {loading ? (
          <div className="p-8 text-center text-slate-500">{c.loading}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left">
                  <th className="p-3">{c.name}</th>
                  <th className="p-3">{c.type}</th>
                  <th className="p-3">{c.price}</th>
                  <th className="p-3">Featured</th>
                  <th className="p-3">Sold</th>
                  <th className="p-3 w-24">{c.actions}</th>
                </tr>
              </thead>
              <tbody>
                {visibleItems.map((r) => (
                  <tr key={r.id} className="border-t border-slate-100">
                    <td className="p-3">{r.name}</td>
                    <td className="p-3">{r.type}</td>
                    <td className="p-3">{r.price != null ? `$${r.price}` : '—'}</td>
                    <td className="p-3">{r.featuredHome ? '⭐' : '—'}</td>
                    <td className="p-3">{r.sold}</td>
                    <td className="p-3">
                      <button type="button" onClick={() => startEdit(r)} className="text-primary hover:underline mr-2">{c.edit}</button>
                      <button type="button" onClick={() => handleDelete(r.id)} className="text-red-600 hover:underline">{c.delete}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {visibleItems.length === 0 && <div className="p-8 text-center text-slate-500">{c.noItemsYet}</div>}
          </div>
        )}
      </div>
    </div>
  )
}

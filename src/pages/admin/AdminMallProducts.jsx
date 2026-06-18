import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../../lib/supabase'
import { adminInsert, adminUpdate, adminDelete } from '../../lib/admin/db'
import AdminField from '../../components/admin/AdminField'
import { useAdminCrud } from '../../hooks/useAdminCrud'
import { filterMallProductsForTab } from '../../lib/mallTabFilters'

const ALL_TYPES = ['event', 'cert', 'material', 'lab', 'training']
const fields = ['name', 'type', 'tag', 'price', 'b_price', 'desc', 'deadline', 'sort_order', 'featured_home']
const MALL_PRODUCT_REQUIRED = new Set(['name'])

function emptyProductForm(mallTab, defaultType = 'cert') {
  return Object.fromEntries(
    fields.map((k) => [
      k,
      k === 'sort_order' ? 0 : k === 'type' ? defaultType || 'cert' : k === 'featured_home' ? false : '',
    ])
  )
}

export default function AdminMallProducts({
  embedded = false,
  mallTab = null,
  allowedTypes = ALL_TYPES,
  defaultType = 'cert',
}) {
  const c = useAdminCrud()
  const itemLabel = c.t('pages.mallProducts.item')
  const typeOptions = allowedTypes.length ? allowedTypes : ALL_TYPES
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(() => emptyProductForm(mallTab, defaultType))

  const visibleItems = useMemo(() => {
    if (!mallTab) return items
    return filterMallProductsForTab(items, mallTab)
  }, [items, mallTab])

  const fetchItems = async () => {
    setLoading(true)
    const { data } = await supabase.from('mall_products').select('*').order('sort_order')
    setItems(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchItems()
  }, [])

  useEffect(() => {
    if (!editing) setForm(emptyProductForm(mallTab, defaultType))
  }, [mallTab, defaultType, editing])

  const save = async () => {
    setError(null)
    const payload = {
      ...form,
      type: typeOptions.includes(form.type) ? form.type : typeOptions[0],
      price: form.price ? parseFloat(form.price) : null,
      sort_order: parseInt(form.sort_order, 10) || 0,
      mall_tab: mallTab || null,
      featured_home: !!form.featured_home,
    }
    try {
      if (editing) {
        await adminUpdate('mall_products', editing.id, payload)
        setEditing(null)
        setForm(emptyProductForm(mallTab, defaultType))
      } else {
        await adminInsert('mall_products', payload)
        setForm(emptyProductForm(mallTab, defaultType))
      }
      fetchItems()
    } catch (e) {
      setError(e.message)
    }
  }

  const startEdit = (r) => {
    setEditing(r)
    setForm(
      Object.fromEntries(
        fields.map((k) => [
          k,
          r[k] ?? (k === 'sort_order' ? 0 : k === 'type' ? defaultType : k === 'featured_home' ? false : ''),
        ])
      )
    )
  }

  const del = async (id) => {
    if (!c.confirmDeleteGeneric()) return
    setError(null)
    try {
      await adminDelete('mall_products', id)
      fetchItems()
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div>
      {!embedded && <h1 className="text-2xl font-bold text-bingo-dark mb-6">{c.pageTitle('mallProducts')}</h1>}
      {error && <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-sm">{error}</div>}
      <div className="card p-6 mb-6">
        <h2 className="font-semibold mb-4">{editing ? c.editItem(itemLabel) : c.addItem(itemLabel)}</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <AdminField label="type">
            <select
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              className="w-full rounded-xl border px-3 py-2 text-sm"
            >
              {typeOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </AdminField>
          {fields
            .filter((k) => k !== 'type' && k !== 'featured_home')
            .map((k) => (
              <AdminField
                key={k}
                label={k}
                required={MALL_PRODUCT_REQUIRED.has(k)}
                className={k === 'desc' ? 'sm:col-span-2' : ''}
              >
                {k === 'desc' ? (
                  <textarea
                    value={form[k] ?? ''}
                    onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))}
                    rows={2}
                    className="w-full rounded-xl border px-3 py-2 text-sm"
                  />
                ) : (
                  <input
                    type={['price', 'sort_order'].includes(k) ? 'number' : 'text'}
                    value={form[k] ?? ''}
                    onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))}
                    className="w-full rounded-xl border px-3 py-2 text-sm"
                  />
                )}
              </AdminField>
            ))}
          <AdminField label={c.t('pages.mall.fields.featuredHome')}>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!form.featured_home}
                onChange={(e) => setForm((f) => ({ ...f, featured_home: e.target.checked }))}
              />
              {c.t('pages.mall.fields.featuredHomeHint')}
            </label>
          </AdminField>
        </div>
        <div className="flex gap-2 mt-4">
          <button type="button" onClick={save} className="btn-primary px-5 py-2 rounded-xl text-sm">
            {c.save}
          </button>
          {editing && (
            <button
              type="button"
              onClick={() => {
                setEditing(null)
                setForm(emptyProductForm(mallTab, defaultType))
              }}
              className="px-5 py-2 border rounded-xl text-sm"
            >
              {c.cancel}
            </button>
          )}
        </div>
      </div>
      <div className="card overflow-hidden">
        <div className="p-4 border-b font-semibold">{c.t('pages.mallProducts.productsList')}</div>
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
                  <th className="p-3 w-28">{c.actions}</th>
                </tr>
              </thead>
              <tbody>
                {visibleItems.map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="p-3">{r.name}</td>
                    <td className="p-3">{r.type}</td>
                    <td className="p-3">{r.price != null ? `$${r.price}` : '—'}</td>
                    <td className="p-3">{r.featured_home ? '⭐' : '—'}</td>
                    <td className="p-3">
                      <button type="button" onClick={() => startEdit(r)} className="text-primary mr-2">
                        {c.edit}
                      </button>
                      <button type="button" onClick={() => del(r.id)} className="text-red-600">
                        {c.delete}
                      </button>
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

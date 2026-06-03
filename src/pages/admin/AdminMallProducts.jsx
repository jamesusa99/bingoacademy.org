import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { adminInsert, adminUpdate, adminDelete } from '../../lib/admin/db'
import { useAdminCrud } from '../../hooks/useAdminCrud'

const TYPES = ['event','cert','material','lab','training']
const fields = ['name','type','tag','price','b_price','desc','deadline','sort_order']

export default function AdminMallProducts() {
  const c = useAdminCrud()
  const itemLabel = c.t('pages.mallProducts.item')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(Object.fromEntries(fields.map((k) => [k, k === 'sort_order' ? 0 : k === 'type' ? 'cert' : ''])))

  const fetchItems = async () => { setLoading(true); const { data } = await supabase.from('mall_products').select('*').order('sort_order'); setItems(data || []); setLoading(false) }
  useEffect(() => { fetchItems() }, [])

  const emptyForm = () => Object.fromEntries(fields.map((k) => [k, k === 'sort_order' ? 0 : k === 'type' ? 'cert' : '']))

  const save = async () => {
    setError(null)
    const payload = { ...form, price: form.price ? parseFloat(form.price) : null, sort_order: parseInt(form.sort_order, 10) || 0 }
    try {
      if (editing) {
        await adminUpdate('mall_products', editing.id, payload)
        setEditing(null)
        setForm(emptyForm())
      } else {
        await adminInsert('mall_products', payload)
        setForm(emptyForm())
      }
      fetchItems()
    } catch (e) {
      setError(e.message)
    }
  }
  const startEdit = (r) => { setEditing(r); setForm(Object.fromEntries(fields.map((k) => [k, r[k] ?? (k === 'sort_order' ? 0 : k === 'type' ? 'cert' : '')]))) }
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
      <h1 className="text-2xl font-bold text-bingo-dark mb-6">{c.pageTitle('mallProducts')}</h1>
      {error && <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-sm">{error}</div>}
      <div className="card p-6 mb-6">
        <h2 className="font-semibold mb-4">{editing ? c.editItem(itemLabel) : c.addItem(itemLabel)}</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className="text-xs font-medium text-slate-600 block mb-1">type</label><select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className="w-full rounded-xl border px-3 py-2 text-sm">{TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</select></div>
          {fields.filter((k) => k !== 'type').map((k) => (
            <div key={k} className={k === 'desc' ? 'sm:col-span-2' : ''}>
              <label className="text-xs font-medium text-slate-600 block mb-1">{k}</label>
              {k === 'desc' ? <textarea value={form[k] ?? ''} onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))} rows={2} className="w-full rounded-xl border px-3 py-2 text-sm" /> : <input type={['price','sort_order'].includes(k) ? 'number' : 'text'} value={form[k] ?? ''} onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))} className="w-full rounded-xl border px-3 py-2 text-sm" />}
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-4">
          <button type="button" onClick={save} className="btn-primary px-5 py-2 rounded-xl text-sm">{c.save}</button>
          {editing && <button type="button" onClick={() => { setEditing(null); setForm(emptyForm()) }} className="px-5 py-2 border rounded-xl text-sm">{c.cancel}</button>}
        </div>
      </div>
      <div className="card overflow-hidden">
        <div className="p-4 border-b font-semibold">{c.t('pages.mallProducts.productsList')}</div>
        {loading ? <div className="p-8 text-center text-slate-500">{c.loading}</div> : <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="bg-slate-50 text-left"><th className="p-3">{c.name}</th><th className="p-3">{c.type}</th><th className="p-3">{c.price}</th><th className="p-3 w-28">{c.actions}</th></tr></thead><tbody>{items.map((r) => (<tr key={r.id} className="border-t"><td className="p-3">{r.name}</td><td className="p-3">{r.type}</td><td className="p-3">{r.price != null ? `$${r.price}` : '—'}</td><td className="p-3"><button type="button" onClick={() => startEdit(r)} className="text-primary mr-2">{c.edit}</button><button type="button" onClick={() => del(r.id)} className="text-red-600">{c.delete}</button></td></tr>))}</tbody></table></div>}
      </div>
    </div>
  )
}

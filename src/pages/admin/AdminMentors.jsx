import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../../lib/supabase'
import { adminInsert, adminUpdate, adminDelete } from '../../lib/admin/db'
import AdminField from '../../components/admin/AdminField'
import AdminImageUpload from '../../components/admin/AdminImageUpload'
import { useAdminCrud } from '../../hooks/useAdminCrud'

const fields = ['name','title','photo','tag','intro','awards','type','sort_order']
const fieldLabels = { name:'Name', title:'Title', photo:'Photo URL', tag:'Tag', intro:'Bio', awards:'Awards', type:'Type', sort_order:'Sort order' }
const MENTOR_REQUIRED = new Set(['name', 'title'])
const TEXT_FIELDS = fields.filter((k) => k !== 'photo')

export default function AdminMentors({ embedded = false }) {
  const c = useAdminCrud()
  const itemLabel = c.t('pages.mentors.item')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(Object.fromEntries(fields.map((k) => [k, k === 'sort_order' ? 0 : ''])))

  const fetchItems = async () => { setLoading(true); const { data } = await supabase.from('community_mentors').select('*').order('sort_order'); setItems(data || []); setLoading(false) }
  useEffect(() => { fetchItems() }, [])

  const save = async () => {
    setError(null)
    const payload = { ...form, sort_order: parseInt(form.sort_order, 10) || 0 }
    const empty = Object.fromEntries(fields.map((k) => [k, k === 'sort_order' ? 0 : '']))
    try {
      if (editing) {
        await adminUpdate('community_mentors', editing.id, payload)
        setEditing(null)
        setForm(empty)
      } else {
        await adminInsert('community_mentors', payload)
        setForm(empty)
      }
      fetchItems()
    } catch (e) {
      setError(e.message)
    }
  }
  const startEdit = (r) => { setEditing(r); setForm(Object.fromEntries(fields.map((k) => [k, r[k] ?? (k === 'sort_order' ? 0 : '')]))) }
  const del = async (id) => {
    if (!confirm(c.t('pages.mentors.confirmDelete'))) return
    setError(null)
    try {
      await adminDelete('community_mentors', id)
      fetchItems()
    } catch (e) {
      setError(e.message)
    }
  }

  const photoLabels = useMemo(() => ({
    label: c.t('pages.mentors.photo'),
    upload: c.t('pages.mentors.photoUpload'),
    uploading: c.t('pages.mentors.photoUploading'),
    remove: c.t('pages.mentors.photoRemove'),
    dropzone: c.t('pages.mentors.photoDropzone'),
    dropzoneActive: c.t('pages.mentors.photoDropzoneActive'),
    replace: c.t('pages.mentors.photoReplace'),
    replaceBtn: c.t('pages.mentors.photoReplaceBtn'),
    formats: c.t('pages.mentors.photoFormats'),
    advanced: c.t('pages.mentors.photoAdvanced'),
    urlPlaceholder: c.t('pages.mentors.photoUrlPlaceholder'),
    hint: c.t('pages.mentors.photoHint'),
  }), [c])

  return (
    <div>
      {!embedded ? (
        <>
          <h1 className="text-2xl font-bold text-bingo-dark mb-2">{c.pageTitle('mentors')}</h1>
          <p className="text-slate-600 text-sm mb-6">{c.pageDesc('mentors')}</p>
        </>
      ) : null}
      {error && <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-sm">{error}</div>}
      <div className="card p-6 mb-6">
        <h2 className="font-semibold mb-4">{editing ? c.editItem(itemLabel) : c.addItem(itemLabel)}</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <AdminImageUpload
              value={form.photo ?? ''}
              onChange={(url) => setForm((f) => ({ ...f, photo: url }))}
              labels={photoLabels}
              folder="mentors"
            />
          </div>
          {TEXT_FIELDS.map((k) => (
            <AdminField
              key={k}
              label={fieldLabels[k] ?? k}
              required={MENTOR_REQUIRED.has(k)}
              className={['intro','awards'].includes(k) ? 'sm:col-span-2' : ''}
            >
              {['intro','awards'].includes(k) ? <textarea value={form[k] ?? ''} onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))} rows={2} className="w-full rounded-xl border px-3 py-2 text-sm" /> : <input type={k === 'sort_order' ? 'number' : 'text'} value={form[k] ?? ''} onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))} className="w-full rounded-xl border px-3 py-2 text-sm" />}
            </AdminField>
          ))}
        </div>
        <div className="flex gap-2 mt-4">
          <button type="button" onClick={save} className="btn-primary px-5 py-2 rounded-xl text-sm">{c.save}</button>
          {editing && <button type="button" onClick={() => { setEditing(null); setForm(Object.fromEntries(fields.map((k) => [k, k === 'sort_order' ? 0 : '']))) }} className="px-5 py-2 border rounded-xl text-sm">{c.cancel}</button>}
        </div>
      </div>
      <div className="card overflow-hidden">
        <div className="p-4 border-b font-semibold">{c.t('pages.mentors.list')}</div>
        {loading ? <div className="p-8 text-center text-slate-500">{c.loading}</div> : <ul className="divide-y">{items.map((r) => (<li key={r.id} className="p-4 flex items-center justify-between gap-4"><span className="flex items-center gap-3 min-w-0"><span className="shrink-0 w-10 h-10 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center text-xs text-slate-500">{r.photo ? <img src={r.photo} alt="" className="w-full h-full object-cover" /> : r.name?.charAt(0)}</span><span className="truncate">{r.name} · {r.title}</span></span><span className="shrink-0"><button type="button" onClick={() => startEdit(r)} className="text-primary mr-2">{c.edit}</button><button type="button" onClick={() => del(r.id)} className="text-red-600">{c.delete}</button></span></li>))}</ul>}
      </div>
    </div>
  )
}

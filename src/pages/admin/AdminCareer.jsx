import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { adminInsert, adminUpdate, adminDelete } from '../../lib/admin/db'
import AdminField from '../../components/admin/AdminField'
import { useAdminCrud } from '../../hooks/useAdminCrud'

const fields = ['title', 'company', 'level', 'salary', 'location', 'skill', 'course_linked', 'sort_order']
const CAREER_REQUIRED = new Set(['title', 'company'])

export default function AdminCareer() {
  const c = useAdminCrud()
  const itemLabel = c.t('pages.career.item')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(
    Object.fromEntries(fields.map((k) => [k, k === 'course_linked' ? false : k === 'sort_order' ? 0 : '']))
  )

  const empty = () =>
    Object.fromEntries(fields.map((k) => [k, k === 'course_linked' ? false : k === 'sort_order' ? 0 : '']))

  const fetchItems = async () => {
    setLoading(true)
    const { data } = await supabase.from('career_jobs').select('*').order('sort_order')
    setItems(data || [])
    setLoading(false)
  }
  useEffect(() => {
    fetchItems()
  }, [])

  const save = async () => {
    setError(null)
    const payload = { ...form, course_linked: !!form.course_linked, sort_order: parseInt(form.sort_order, 10) || 0 }
    try {
      if (editing) {
        await adminUpdate('career_jobs', editing.id, payload)
        setEditing(null)
        setForm(empty())
      } else {
        await adminInsert('career_jobs', payload)
        setForm(empty())
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
        fields.map((k) => [k, r[k] ?? (k === 'course_linked' ? false : k === 'sort_order' ? 0 : '')])
      )
    )
  }
  const del = async (id) => {
    if (!c.confirmDeleteGeneric()) return
    setError(null)
    try {
      await adminDelete('career_jobs', id)
      fetchItems()
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-bingo-dark mb-6">{c.pageTitle('career')}</h1>
      {error && <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-sm">{error}</div>}
      <div className="card p-6 mb-6">
        <h2 className="font-semibold mb-4">{editing ? c.editItem(itemLabel) : c.addItem(itemLabel)}</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {fields.map((k) => (
            <AdminField key={k} label={k} required={CAREER_REQUIRED.has(k)}>
              {k === 'course_linked' ? (
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!!form.course_linked}
                    onChange={(e) => setForm((f) => ({ ...f, course_linked: e.target.checked }))}
                  />{' '}
                  {c.t('pages.career.courseLinked')}
                </label>
              ) : (
                <input
                  type={k === 'sort_order' ? 'number' : 'text'}
                  value={form[k] ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))}
                  className="w-full rounded-xl border px-3 py-2 text-sm"
                />
              )}
            </AdminField>
          ))}
        </div>
        <div className="flex gap-2 mt-4">
          <button type="button" onClick={save} className="btn-primary px-5 py-2 rounded-xl text-sm">
            {c.save}
          </button>
          {editing ? (
            <button
              type="button"
              onClick={() => {
                setEditing(null)
                setForm(empty())
              }}
              className="px-5 py-2 border rounded-xl text-sm"
            >
              {c.cancel}
            </button>
          ) : null}
        </div>
      </div>
      <div className="card overflow-hidden">
        <div className="p-4 border-b font-semibold">{c.t('pages.career.list')}</div>
        {loading ? (
          <div className="p-8 text-center text-slate-500">{c.loading}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left">
                  <th className="p-3">{c.title}</th>
                  <th className="p-3">{c.company}</th>
                  <th className="p-3">{c.salary}</th>
                  <th className="p-3 w-28">{c.actions}</th>
                </tr>
              </thead>
              <tbody>
                {items.map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="p-3">{r.title}</td>
                    <td className="p-3">{r.company}</td>
                    <td className="p-3">{r.salary}</td>
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
          </div>
        )}
      </div>
    </div>
  )
}

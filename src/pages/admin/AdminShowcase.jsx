import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { adminInsert, adminUpdate, adminDelete } from '../../lib/admin/db'
import AdminField from '../../components/admin/AdminField'
import { useAdminCrud } from '../../hooks/useAdminCrud'

const AWARD_REQUIRED = new Set(['student', 'result'])

const AWARD_FIELD_KEYS = [
  'student',
  'grade',
  'pain',
  'path',
  'result',
  'detail',
  'duration',
  'tags',
  'sort_order',
]

function awardFields(t) {
  return AWARD_FIELD_KEYS.map((key) => ({
    key,
    label: t(`pages.showcase.field.${key}`),
    placeholder: t(`pages.showcase.ph.${key}`),
    textarea: ['pain', 'path', 'detail'].includes(key),
  }))
}

export default function AdminShowcase() {
  const c = useAdminCrud()
  const fields = awardFields(c.t)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState(null)
  const [awardForm, setAwardForm] = useState({
    student: '', grade: '', pain: '', path: '', result: '', detail: '', duration: '', tags: '', sort_order: 0,
  })

  const fetchItems = async () => {
    setLoading(true)
    const { data } = await supabase.from('showcase_cases').select('*').order('sort_order')
    setItems(data || [])
    setLoading(false)
  }
  useEffect(() => { fetchItems() }, [])

  const toAwardPayload = () => ({
    type: 'competition',
    student: awardForm.student || null,
    grade: awardForm.grade || null,
    pain: awardForm.pain || null,
    path: awardForm.path || null,
    result: awardForm.result || null,
    detail: awardForm.detail || null,
    duration: awardForm.duration || null,
    sort_order: parseInt(awardForm.sort_order) || 0,
    tags: awardForm.tags ? awardForm.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    org: null,
    region: null,
    role: null,
    solution: null,
    timeline: null,
    months: null,
    improvement: null,
  })

  const handleSaveAward = async () => {
    setError(null)
    const payload = toAwardPayload()
    try {
      if (editing) {
        await adminUpdate('showcase_cases', editing.id, payload)
        setEditing(null)
        resetAwardForm()
      } else {
        await adminInsert('showcase_cases', payload)
        resetAwardForm()
      }
      fetchItems()
    } catch (e) {
      setError(e.message)
    }
  }

  const awardCasesOnly = items.filter((r) => r.type === 'competition')
  const resetAwardForm = () => setAwardForm({
    student: '', grade: '', pain: '', path: '', result: '', detail: '', duration: '', tags: '', sort_order: awardCasesOnly.length,
  })
  const startAddAwardCase = () => {
    setEditing(null)
    setAwardForm({
      student: '', grade: '', pain: '', path: '', result: '', detail: '', duration: '', tags: '', sort_order: awardCasesOnly.length,
    })
  }
  const startEditAward = (r) => {
    setEditing(r)
    setAwardForm({
      student: r.student || '',
      grade: r.grade || '',
      pain: r.pain || '',
      path: r.path || '',
      result: r.result || '',
      detail: r.detail || '',
      duration: r.duration || '',
      tags: (r.tags || []).join(', '),
      sort_order: r.sort_order ?? 0,
    })
  }
  const handleDelete = async (id) => {
    if (!confirm(c.t('pages.showcase.confirmDelete'))) return
    setError(null)
    try {
      await adminDelete('showcase_cases', id)
      fetchItems()
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-bingo-dark mb-6">{c.pageTitle('showcase')}</h1>
      {error && <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-sm">{error}</div>}

      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-bingo-dark">{c.t('pages.showcase.awardSection')}</h2>
          <button type="button" onClick={startAddAwardCase} className="text-sm btn-primary px-4 py-2 rounded-xl">{c.t('pages.showcase.addCase')}</button>
        </div>
        <p className="text-sm text-slate-500 mb-4">{c.t('pages.showcase.awardDesc')}</p>
        <div className="card p-6 mb-4">
          <h3 className="font-semibold text-bingo-dark mb-4">{editing ? c.t('pages.showcase.editCase') : c.t('pages.showcase.addCaseForm')}</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {fields.map(({ key, label, placeholder, textarea }) => (
              <AdminField
                key={key}
                label={label}
                required={AWARD_REQUIRED.has(key)}
                className={textarea ? 'sm:col-span-2' : ''}
              >
                {textarea ? (
                  <textarea value={awardForm[key] ?? ''} onChange={(e) => setAwardForm((f) => ({ ...f, [key]: e.target.value }))} rows={2} placeholder={placeholder} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                ) : (
                  <input type={key === 'sort_order' ? 'number' : 'text'} value={awardForm[key] ?? ''} onChange={(e) => setAwardForm((f) => ({ ...f, [key]: e.target.value }))} placeholder={placeholder} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                )}
              </AdminField>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <button type="button" onClick={handleSaveAward} className="btn-primary px-5 py-2 rounded-xl text-sm">{c.save}</button>
            {editing && <button type="button" onClick={() => { setEditing(null); resetAwardForm() }} className="px-5 py-2 rounded-xl border text-sm">{c.cancel}</button>}
          </div>
        </div>
        <div className="card overflow-hidden">
          <div className="p-4 border-b font-semibold text-bingo-dark">{c.t('pages.showcase.awardList')}</div>
          {loading ? <div className="p-8 text-center text-slate-500">{c.loading}</div> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-slate-50 text-left"><th className="p-3">{c.type}</th><th className="p-3">{c.t('pages.showcase.colStudent')}</th><th className="p-3">{c.t('pages.showcase.colGrade')}</th><th className="p-3">{c.t('pages.showcase.colResult')}</th><th className="p-3 w-32">{c.actions}</th></tr></thead>
                <tbody>
                  {awardCasesOnly.length === 0 ? (
                    <tr><td colSpan={5} className="p-6 text-center text-slate-500">{c.t('pages.showcase.noAwardCases')}</td></tr>
                  ) : (
                    awardCasesOnly.map((r) => (
                      <tr key={r.id} className="border-t border-slate-100"><td className="p-3"><span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">competition</span></td><td className="p-3">{r.student}</td><td className="p-3">{r.grade || '—'}</td><td className="p-3 line-clamp-1">{r.result}</td><td className="p-3"><button type="button" onClick={() => startEditAward(r)} className="text-primary mr-2">{c.edit}</button><button type="button" onClick={() => handleDelete(r.id)} className="text-red-600">{c.delete}</button></td></tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-bingo-dark mb-3">{c.t('pages.showcase.allCases')}</h2>
        <div className="card overflow-hidden">
          <div className="p-4 border-b font-semibold text-slate-600">{c.t('pages.showcase.allCasesList')}</div>
          {loading ? <div className="p-8 text-center text-slate-500">{c.loading}</div> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-slate-50 text-left"><th className="p-3">{c.type}</th><th className="p-3">{c.t('pages.showcase.colNameOrg')}</th><th className="p-3">{c.t('pages.showcase.colResult')}</th><th className="p-3 w-32">{c.actions}</th></tr></thead>
                <tbody>
                  {items.map((r) => (
                    <tr key={r.id} className="border-t"><td className="p-3">{r.type}</td><td className="p-3">{r.student || r.org}</td><td className="p-3 line-clamp-1">{r.result}</td><td className="p-3"><button type="button" onClick={() => r.type === 'competition' ? startEditAward(r) : alert(c.t('pages.showcase.editOtherType'))} className="text-primary mr-2">{c.edit}</button><button type="button" onClick={() => handleDelete(r.id)} className="text-red-600">{c.delete}</button></td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

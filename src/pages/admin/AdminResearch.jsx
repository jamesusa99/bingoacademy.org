import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { adminInsert, adminUpdate, adminDelete } from '../../lib/admin/db'
import { useAdminCrud } from '../../hooks/useAdminCrud'

const campFields = ['title','age','icon','direction','core','highlight','outcome','ratio','competition','price','weeks','sort_order']
const facultyFields = ['name','team','area','exp','philosophy','type','sort_order']

export default function AdminResearch() {
  const c = useAdminCrud()
  const [tab, setTab] = useState('camps')
  const [camps, setCamps] = useState([])
  const [faculty, setFaculty] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [formCamp, setFormCamp] = useState(Object.fromEntries(campFields.map((k) => [k, k === 'sort_order' ? 0 : ''])))
  const [formFaculty, setFormFaculty] = useState(Object.fromEntries(facultyFields.map((k) => [k, k === 'sort_order' ? 0 : ''])))
  const [editingCamp, setEditingCamp] = useState(null)
  const [editingFaculty, setEditingFaculty] = useState(null)

  const fetchCamps = async () => { const { data } = await supabase.from('research_camps').select('*').order('sort_order'); setCamps(data || []) }
  const fetchFaculty = async () => { const { data } = await supabase.from('research_faculty').select('*').order('sort_order'); setFaculty(data || []) }
  useEffect(() => { setLoading(true); Promise.all([fetchCamps(), fetchFaculty()]).finally(() => setLoading(false)) }, [])

  const emptyCamp = () => Object.fromEntries(campFields.map((k) => [k, k === 'sort_order' ? 0 : '']))
  const emptyFaculty = () => Object.fromEntries(facultyFields.map((k) => [k, k === 'sort_order' ? 0 : '']))

  const saveCamp = async () => {
    setError(null)
    const payload = { ...formCamp, sort_order: parseInt(formCamp.sort_order, 10) || 0 }
    try {
      if (editingCamp) {
        await adminUpdate('research_camps', editingCamp.id, payload)
        setEditingCamp(null)
        setFormCamp(emptyCamp())
      } else {
        await adminInsert('research_camps', payload)
        setFormCamp(emptyCamp())
      }
      fetchCamps()
    } catch (e) {
      setError(e.message)
    }
  }
  const saveFaculty = async () => {
    setError(null)
    const payload = { ...formFaculty, sort_order: parseInt(formFaculty.sort_order, 10) || 0 }
    try {
      if (editingFaculty) {
        await adminUpdate('research_faculty', editingFaculty.id, payload)
        setEditingFaculty(null)
        setFormFaculty(emptyFaculty())
      } else {
        await adminInsert('research_faculty', payload)
        setFormFaculty(emptyFaculty())
      }
      fetchFaculty()
    } catch (e) {
      setError(e.message)
    }
  }

  const deleteCamp = async (id) => {
    if (!confirm(c.t('pages.research.confirmDelete'))) return
    setError(null)
    try {
      await adminDelete('research_camps', id)
      fetchCamps()
    } catch (e) {
      setError(e.message)
    }
  }

  const deleteFaculty = async (id) => {
    if (!confirm(c.t('pages.research.confirmDelete'))) return
    setError(null)
    try {
      await adminDelete('research_faculty', id)
      fetchFaculty()
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-bingo-dark mb-2">{c.pageTitle('research')}</h1>
      <p className="text-slate-600 text-sm mb-6">{c.pageDesc('research')}</p>
      {error && <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-sm">{error}</div>}
      <div className="flex gap-2 mb-6">
        <button type="button" onClick={() => setTab('camps')} className={`px-4 py-2 rounded-xl text-sm font-medium ${tab === 'camps' ? 'bg-primary text-white' : 'bg-slate-200'}`}>{c.t('pages.research.camps')}</button>
        <button type="button" onClick={() => setTab('faculty')} className={`px-4 py-2 rounded-xl text-sm font-medium ${tab === 'faculty' ? 'bg-primary text-white' : 'bg-slate-200'}`}>{c.t('pages.research.faculty')}</button>
      </div>
      {tab === 'camps' && (
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="font-semibold mb-4">{c.t('pages.research.editCamp')}</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {campFields.map((k) => (
                <div key={k} className={['core','highlight','outcome','ratio','competition'].includes(k) ? 'sm:col-span-2' : ''}>
                  <label className="text-xs font-medium text-slate-600 block mb-1">{k}</label>
                  {['core','highlight','outcome','ratio','competition'].includes(k) ? <textarea value={formCamp[k] ?? ''} onChange={(e) => setFormCamp((f) => ({ ...f, [k]: e.target.value }))} rows={2} className="w-full rounded-xl border px-3 py-2 text-sm" /> : <input type={k === 'sort_order' ? 'number' : 'text'} value={formCamp[k] ?? ''} onChange={(e) => setFormCamp((f) => ({ ...f, [k]: e.target.value }))} className="w-full rounded-xl border px-3 py-2 text-sm" />}
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <button type="button" onClick={saveCamp} className="btn-primary px-5 py-2 rounded-xl text-sm">{c.save}</button>
              {editingCamp && <button type="button" onClick={() => { setEditingCamp(null); setFormCamp(emptyCamp()) }} className="px-5 py-2 border rounded-xl text-sm">{c.cancel}</button>}
            </div>
          </div>
          <div className="card overflow-hidden">
            <div className="p-4 border-b font-semibold">{c.t('pages.research.campList')}</div>
            {loading ? <div className="p-8 text-center text-slate-500">{c.loading}</div> : <ul className="divide-y">{camps.map((row) => (<li key={row.id} className="p-4 flex justify-between"><span>{row.icon} {row.title} · {row.age}</span><span><button type="button" onClick={() => { setEditingCamp(row); setFormCamp(Object.fromEntries(campFields.map((k) => [k, row[k] ?? (k === 'sort_order' ? 0 : '')]))) }} className="text-primary mr-2">{c.edit}</button><button type="button" onClick={() => deleteCamp(row.id)} className="text-red-600">{c.delete}</button></span></li>))}</ul>}
          </div>
        </div>
      )}
      {tab === 'faculty' && (
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="font-semibold mb-4">{c.t('pages.research.editFaculty')}</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {facultyFields.map((k) => (
                <div key={k} className={['exp','philosophy'].includes(k) ? 'sm:col-span-2' : ''}>
                  <label className="text-xs font-medium text-slate-600 block mb-1">{k}</label>
                  {['exp','philosophy'].includes(k) ? <textarea value={formFaculty[k] ?? ''} onChange={(e) => setFormFaculty((f) => ({ ...f, [k]: e.target.value }))} rows={2} className="w-full rounded-xl border px-3 py-2 text-sm" /> : <input type={k === 'sort_order' ? 'number' : 'text'} value={formFaculty[k] ?? ''} onChange={(e) => setFormFaculty((f) => ({ ...f, [k]: e.target.value }))} className="w-full rounded-xl border px-3 py-2 text-sm" />}
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <button type="button" onClick={saveFaculty} className="btn-primary px-5 py-2 rounded-xl text-sm">{c.save}</button>
              {editingFaculty && <button type="button" onClick={() => { setEditingFaculty(null); setFormFaculty(emptyFaculty()) }} className="px-5 py-2 border rounded-xl text-sm">{c.cancel}</button>}
            </div>
          </div>
          <div className="card overflow-hidden">
            <div className="p-4 border-b font-semibold">{c.t('pages.research.facultyList')}</div>
            {loading ? <div className="p-8 text-center text-slate-500">{c.loading}</div> : <ul className="divide-y">{faculty.map((f) => (<li key={f.id} className="p-4 flex justify-between"><span>{f.name} · {f.team}</span><span><button type="button" onClick={() => { setEditingFaculty(f); setFormFaculty(Object.fromEntries(facultyFields.map((k) => [k, f[k] ?? (k === 'sort_order' ? 0 : '')]))) }} className="text-primary mr-2">{c.edit}</button><button type="button" onClick={() => deleteFaculty(f.id)} className="text-red-600">{c.delete}</button></span></li>))}</ul>}
          </div>
        </div>
      )}
    </div>
  )
}

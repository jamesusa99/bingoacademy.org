import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const campFields = ['title','age','icon','direction','core','highlight','outcome','ratio','competition','price','weeks','sort_order']
const facultyFields = ['name','team','area','exp','philosophy','type','sort_order']

export default function AdminResearch() {
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

  const saveCamp = async () => {
    setError(null)
    const payload = { ...formCamp, sort_order: parseInt(formCamp.sort_order) || 0 }
    if (editingCamp) { const { error: e } = await supabase.from('research_camps').update(payload).eq('id', editingCamp.id); setError(e?.message); if (!e) { setEditingCamp(null); setFormCamp(Object.fromEntries(campFields.map((k) => [k, k === 'sort_order' ? 0 : '']))); fetchCamps() } }
    else { const { error: e } = await supabase.from('research_camps').insert(payload); setError(e?.message); if (!e) { setFormCamp(Object.fromEntries(campFields.map((k) => [k, k === 'sort_order' ? 0 : '']))); fetchCamps() } }
  }
  const saveFaculty = async () => {
    setError(null)
    const payload = { ...formFaculty, sort_order: parseInt(formFaculty.sort_order) || 0 }
    if (editingFaculty) { const { error: e } = await supabase.from('research_faculty').update(payload).eq('id', editingFaculty.id); setError(e?.message); if (!e) { setEditingFaculty(null); setFormFaculty(Object.fromEntries(facultyFields.map((k) => [k, k === 'sort_order' ? 0 : '']))); fetchFaculty() } }
    else { const { error: e } = await supabase.from('research_faculty').insert(payload); setError(e?.message); if (!e) { setFormFaculty(Object.fromEntries(facultyFields.map((k) => [k, k === 'sort_order' ? 0 : '']))); fetchFaculty() } }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-bingo-dark mb-6">AI Camp (Research)</h1>
      {error && <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-sm">{error}</div>}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab('camps')} className={`px-4 py-2 rounded-xl text-sm font-medium ${tab === 'camps' ? 'bg-primary text-white' : 'bg-slate-200'}`}>Camps</button>
        <button onClick={() => setTab('faculty')} className={`px-4 py-2 rounded-xl text-sm font-medium ${tab === 'faculty' ? 'bg-primary text-white' : 'bg-slate-200'}`}>Faculty</button>
      </div>
      {tab === 'camps' && (
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="font-semibold mb-4">Add / Edit Camp</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {campFields.map((k) => (
                <div key={k} className={['core','highlight','outcome','ratio','competition'].includes(k) ? 'sm:col-span-2' : ''}>
                  <label className="text-xs font-medium text-slate-600 block mb-1">{k}</label>
                  {['core','highlight','outcome','ratio','competition'].includes(k) ? <textarea value={formCamp[k] ?? ''} onChange={(e) => setFormCamp((f) => ({ ...f, [k]: e.target.value }))} rows={2} className="w-full rounded-xl border px-3 py-2 text-sm" /> : <input type={k === 'sort_order' ? 'number' : 'text'} value={formCamp[k] ?? ''} onChange={(e) => setFormCamp((f) => ({ ...f, [k]: e.target.value }))} className="w-full rounded-xl border px-3 py-2 text-sm" />}
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={saveCamp} className="btn-primary px-5 py-2 rounded-xl text-sm">Save</button>
              {editingCamp && <button onClick={() => { setEditingCamp(null); setFormCamp(Object.fromEntries(campFields.map((k) => [k, k === 'sort_order' ? 0 : '']))) }} className="px-5 py-2 border rounded-xl text-sm">Cancel</button>}
            </div>
          </div>
          <div className="card overflow-hidden">
            <div className="p-4 border-b font-semibold">Camps List</div>
            {loading ? <div className="p-8 text-center text-slate-500">Loading...</div> : <ul className="divide-y">{camps.map((c) => (<li key={c.id} className="p-4 flex justify-between"><span>{c.icon} {c.title} · {c.age}</span><span><button onClick={() => { setEditingCamp(c); setFormCamp(Object.fromEntries(campFields.map((k) => [k, c[k] ?? (k === 'sort_order' ? 0 : '')]))) }} className="text-primary mr-2">Edit</button><button onClick={async () => { if (confirm('Delete?')) await supabase.from('research_camps').delete().eq('id', c.id); fetchCamps() }} className="text-red-600">Delete</button></span></li>))}</ul>}
          </div>
        </div>
      )}
      {tab === 'faculty' && (
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="font-semibold mb-4">Add / Edit Faculty</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {facultyFields.map((k) => (
                <div key={k} className={['exp','philosophy'].includes(k) ? 'sm:col-span-2' : ''}>
                  <label className="text-xs font-medium text-slate-600 block mb-1">{k}</label>
                  {['exp','philosophy'].includes(k) ? <textarea value={formFaculty[k] ?? ''} onChange={(e) => setFormFaculty((f) => ({ ...f, [k]: e.target.value }))} rows={2} className="w-full rounded-xl border px-3 py-2 text-sm" /> : <input type={k === 'sort_order' ? 'number' : 'text'} value={formFaculty[k] ?? ''} onChange={(e) => setFormFaculty((f) => ({ ...f, [k]: e.target.value }))} className="w-full rounded-xl border px-3 py-2 text-sm" />}
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={saveFaculty} className="btn-primary px-5 py-2 rounded-xl text-sm">Save</button>
              {editingFaculty && <button onClick={() => { setEditingFaculty(null); setFormFaculty(Object.fromEntries(facultyFields.map((k) => [k, k === 'sort_order' ? 0 : '']))) }} className="px-5 py-2 border rounded-xl text-sm">Cancel</button>}
            </div>
          </div>
          <div className="card overflow-hidden">
            <div className="p-4 border-b font-semibold">Faculty List</div>
            {loading ? <div className="p-8 text-center text-slate-500">Loading...</div> : <ul className="divide-y">{faculty.map((f) => (<li key={f.id} className="p-4 flex justify-between"><span>{f.name} · {f.team}</span><span><button onClick={() => { setEditingFaculty(f); setFormFaculty(Object.fromEntries(facultyFields.map((k) => [k, f[k] ?? (k === 'sort_order' ? 0 : '')]))) }} className="text-primary mr-2">Edit</button><button onClick={async () => { if (confirm('Delete?')) await supabase.from('research_faculty').delete().eq('id', f.id); fetchFaculty() }} className="text-red-600">Delete</button></span></li>))}</ul>}
          </div>
        </div>
      )}
    </div>
  )
}

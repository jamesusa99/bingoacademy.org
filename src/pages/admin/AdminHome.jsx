import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function AdminHome() {
  const [activeTab, setActiveTab] = useState('stats')
  const [stats, setStats] = useState([])
  const [testimonials, setTestimonials] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [formStats, setFormStats] = useState({ icon: '', value: '', label: '', sort_order: 0 })
  const [formTest, setFormTest] = useState({ quote: '', name: '', role: '', stars: 5, sort_order: 0 })
  const [editingStats, setEditingStats] = useState(null)
  const [editingTest, setEditingTest] = useState(null)

  const fetchStats = async () => {
    const { data } = await supabase.from('home_stats').select('*').order('sort_order')
    setStats(data || [])
  }
  const fetchTestimonials = async () => {
    const { data } = await supabase.from('home_testimonials').select('*').order('sort_order')
    setTestimonials(data || [])
  }
  useEffect(() => {
    setLoading(true)
    Promise.all([fetchStats(), fetchTestimonials()]).finally(() => setLoading(false))
  }, [])

  const saveStat = async () => {
    setError(null)
    const payload = { icon: formStats.icon, value: formStats.value, label: formStats.label, sort_order: parseInt(formStats.sort_order) || 0 }
    if (editingStats) {
      const { error: e } = await supabase.from('home_stats').update(payload).eq('id', editingStats.id)
      setError(e?.message)
      if (!e) { setEditingStats(null); setFormStats({ icon: '', value: '', label: '', sort_order: 0 }); fetchStats() }
    } else {
      const { error: e } = await supabase.from('home_stats').insert(payload)
      setError(e?.message)
      if (!e) { setFormStats({ icon: '', value: '', label: '', sort_order: 0 }); fetchStats() }
    }
  }
  const saveTestimonial = async () => {
    setError(null)
    const payload = { quote: formTest.quote, name: formTest.name, role: formTest.role, stars: parseInt(formTest.stars) || 5, sort_order: parseInt(formTest.sort_order) || 0 }
    if (editingTest) {
      const { error: e } = await supabase.from('home_testimonials').update(payload).eq('id', editingTest.id)
      setError(e?.message)
      if (!e) { setEditingTest(null); setFormTest({ quote: '', name: '', role: '', stars: 5, sort_order: 0 }); fetchTestimonials() }
    } else {
      const { error: e } = await supabase.from('home_testimonials').insert(payload)
      setError(e?.message)
      if (!e) { setFormTest({ quote: '', name: '', role: '', stars: 5, sort_order: 0 }); fetchTestimonials() }
    }
  }
  const deleteStat = async (id) => { if (!confirm('Delete?')) return; await supabase.from('home_stats').delete().eq('id', id); fetchStats() }
  const deleteTestimonial = async (id) => { if (!confirm('Delete?')) return; await supabase.from('home_testimonials').delete().eq('id', id); fetchTestimonials() }

  return (
    <div>
      <h1 className="text-2xl font-bold text-bingo-dark mb-6">AI Era Portal (Home)</h1>
      {error && <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-sm">{error}</div>}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setActiveTab('stats')} className={`px-4 py-2 rounded-xl text-sm font-medium ${activeTab === 'stats' ? 'bg-primary text-white' : 'bg-slate-200'}`}>Trust Stats</button>
        <button onClick={() => setActiveTab('testimonials')} className={`px-4 py-2 rounded-xl text-sm font-medium ${activeTab === 'testimonials' ? 'bg-primary text-white' : 'bg-slate-200'}`}>Testimonials</button>
      </div>
      {activeTab === 'stats' && (
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="font-semibold text-bingo-dark mb-4">Add / Edit Trust Stat</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {['icon','value','label','sort_order'].map((k) => (
                <div key={k}>
                  <label className="text-xs font-medium text-slate-600 block mb-1">{k}</label>
                  <input type={k === 'sort_order' ? 'number' : 'text'} value={formStats[k] ?? ''} onChange={(e) => setFormStats((f) => ({ ...f, [k]: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={saveStat} className="btn-primary px-5 py-2 rounded-xl text-sm">Save</button>
              {editingStats && <button onClick={() => { setEditingStats(null); setFormStats({ icon: '', value: '', label: '', sort_order: 0 }) }} className="px-5 py-2 rounded-xl border text-sm">Cancel</button>}
            </div>
          </div>
          <div className="card overflow-hidden">
            <div className="p-4 border-b font-semibold">Stats List</div>
            {loading ? <div className="p-8 text-center text-slate-500">Loading...</div> : (
              <ul className="divide-y">
                {stats.map((s) => (
                  <li key={s.id} className="p-4 flex items-center justify-between">
                    <span>{s.icon} {s.value} — {s.label}</span>
                    <span>
                      <button onClick={() => { setEditingStats(s); setFormStats({ icon: s.icon || '', value: s.value || '', label: s.label || '', sort_order: s.sort_order || 0 }) }} className="text-primary mr-2">Edit</button>
                      <button onClick={() => deleteStat(s.id)} className="text-red-600">Delete</button>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
      {activeTab === 'testimonials' && (
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="font-semibold text-bingo-dark mb-4">Add / Edit Testimonial</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-slate-600 block mb-1">quote</label>
                <textarea value={formTest.quote} onChange={(e) => setFormTest((f) => ({ ...f, quote: e.target.value }))} rows={3} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
              </div>
              {['name','role','stars','sort_order'].map((k) => (
                <div key={k}>
                  <label className="text-xs font-medium text-slate-600 block mb-1">{k}</label>
                  <input type={['stars','sort_order'].includes(k) ? 'number' : 'text'} value={formTest[k] ?? ''} onChange={(e) => setFormTest((f) => ({ ...f, [k]: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={saveTestimonial} className="btn-primary px-5 py-2 rounded-xl text-sm">Save</button>
              {editingTest && <button onClick={() => { setEditingTest(null); setFormTest({ quote: '', name: '', role: '', stars: 5, sort_order: 0 }) }} className="px-5 py-2 rounded-xl border text-sm">Cancel</button>}
            </div>
          </div>
          <div className="card overflow-hidden">
            <div className="p-4 border-b font-semibold">Testimonials List</div>
            {loading ? <div className="p-8 text-center text-slate-500">Loading...</div> : (
              <ul className="divide-y">
                {testimonials.map((t) => (
                  <li key={t.id} className="p-4">
                    <p className="text-sm text-slate-700 line-clamp-2">{t.quote}</p>
                    <p className="text-xs text-slate-500 mt-1">{t.name} · {t.role}</p>
                    <span className="mt-2 inline-block">
                      <button onClick={() => { setEditingTest(t); setFormTest({ quote: t.quote || '', name: t.name || '', role: t.role || '', stars: t.stars ?? 5, sort_order: t.sort_order || 0 }) }} className="text-primary mr-2">Edit</button>
                      <button onClick={() => deleteTestimonial(t.id)} className="text-red-600">Delete</button>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

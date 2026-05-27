import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { adminInsert, adminUpdate, adminDelete } from '../../lib/admin/db'
import AdminAlert from '../../components/admin/AdminAlert'

export default function AdminHome() {
  const [activeTab, setActiveTab] = useState('stats')
  const [stats, setStats] = useState([])
  const [testimonials, setTestimonials] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [saving, setSaving] = useState(false)
  const [formStats, setFormStats] = useState({ icon: '', value: '', label: '', sort_order: 0 })
  const [formTest, setFormTest] = useState({ quote: '', name: '', role: '', stars: 5, sort_order: 0 })
  const [editingStats, setEditingStats] = useState(null)
  const [editingTest, setEditingTest] = useState(null)

  const fetchStats = async () => {
    const { data, error: e } = await supabase.from('home_stats').select('*').order('sort_order')
    if (e) setError(e.message)
    setStats(data || [])
  }
  const fetchTestimonials = async () => {
    const { data, error: e } = await supabase.from('home_testimonials').select('*').order('sort_order')
    if (e) setError(e.message)
    setTestimonials(data || [])
  }
  useEffect(() => {
    setLoading(true)
    Promise.all([fetchStats(), fetchTestimonials()]).finally(() => setLoading(false))
  }, [])

  const saveStat = async () => {
    setError(null)
    setSuccess(null)
    setSaving(true)
    const payload = {
      icon: formStats.icon,
      value: formStats.value,
      label: formStats.label,
      sort_order: parseInt(formStats.sort_order, 10) || 0,
    }
    try {
      if (editingStats) {
        await adminUpdate('home_stats', editingStats.id, payload)
        setSuccess('Stat updated. Check the list below for changes.')
        setEditingStats(null)
        setFormStats({ icon: '', value: '', label: '', sort_order: 0 })
      } else {
        await adminInsert('home_stats', payload)
        setSuccess('Stat added.')
        setFormStats({ icon: '', value: '', label: '', sort_order: 0 })
      }
      await fetchStats()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const saveTestimonial = async () => {
    setError(null)
    setSuccess(null)
    setSaving(true)
    const payload = {
      quote: formTest.quote,
      name: formTest.name,
      role: formTest.role,
      stars: parseInt(formTest.stars, 10) || 5,
      sort_order: parseInt(formTest.sort_order, 10) || 0,
    }
    try {
      if (editingTest) {
        await adminUpdate('home_testimonials', editingTest.id, payload)
        setSuccess('Testimonial updated. Check the list below for changes.')
        setEditingTest(null)
        setFormTest({ quote: '', name: '', role: '', stars: 5, sort_order: 0 })
      } else {
        await adminInsert('home_testimonials', payload)
        setSuccess('Testimonial added.')
        setFormTest({ quote: '', name: '', role: '', stars: 5, sort_order: 0 })
      }
      await fetchTestimonials()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const deleteStat = async (id) => {
    if (!confirm('Delete?')) return
    setError(null)
    setSuccess(null)
    try {
      await adminDelete('home_stats', id)
      setSuccess('Stat deleted.')
      if (editingStats?.id === id) {
        setEditingStats(null)
        setFormStats({ icon: '', value: '', label: '', sort_order: 0 })
      }
      await fetchStats()
    } catch (e) {
      setError(e.message)
    }
  }

  const deleteTestimonial = async (id) => {
    if (!confirm('Delete?')) return
    setError(null)
    setSuccess(null)
    try {
      await adminDelete('home_testimonials', id)
      setSuccess('Testimonial deleted.')
      if (editingTest?.id === id) {
        setEditingTest(null)
        setFormTest({ quote: '', name: '', role: '', stars: 5, sort_order: 0 })
      }
      await fetchTestimonials()
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-bingo-dark mb-2">AI Era Portal (Home)</h1>
      <p className="text-sm text-slate-600 mb-6">
        Click <strong>Edit</strong> on a row, change fields in the form above, then <strong>Save</strong>.
      </p>
      {error ? <AdminAlert type="error" onDismiss={() => setError(null)}>{error}</AdminAlert> : null}
      {success ? <AdminAlert type="success" onDismiss={() => setSuccess(null)}>{success}</AdminAlert> : null}
      <div className="flex gap-2 mb-6">
        <button type="button" onClick={() => setActiveTab('stats')} className={`px-4 py-2 rounded-xl text-sm font-medium ${activeTab === 'stats' ? 'bg-primary text-white' : 'bg-slate-200'}`}>Trust Stats</button>
        <button type="button" onClick={() => setActiveTab('testimonials')} className={`px-4 py-2 rounded-xl text-sm font-medium ${activeTab === 'testimonials' ? 'bg-primary text-white' : 'bg-slate-200'}`}>Testimonials</button>
      </div>
      {activeTab === 'stats' && (
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="font-semibold text-bingo-dark mb-1">{editingStats ? 'Edit Trust Stat' : 'Add Trust Stat'}</h2>
            {editingStats ? (
              <p className="text-xs text-primary mb-4">Editing: {editingStats.label || editingStats.value}</p>
            ) : null}
            <div className="grid sm:grid-cols-2 gap-4">
              {['icon', 'value', 'label', 'sort_order'].map((k) => (
                <div key={k}>
                  <label className="text-xs font-medium text-slate-600 block mb-1">{k}</label>
                  <input
                    type={k === 'sort_order' ? 'number' : 'text'}
                    value={formStats[k] ?? ''}
                    onChange={(e) => setFormStats((f) => ({ ...f, [k]: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <button type="button" onClick={saveStat} disabled={saving} className="btn-primary px-5 py-2 rounded-xl text-sm disabled:opacity-60">
                {saving ? 'Saving…' : 'Save'}
              </button>
              {editingStats ? (
                <button
                  type="button"
                  onClick={() => {
                    setEditingStats(null)
                    setFormStats({ icon: '', value: '', label: '', sort_order: 0 })
                  }}
                  className="px-5 py-2 rounded-xl border text-sm"
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </div>
          <div className="card overflow-hidden">
            <div className="p-4 border-b font-semibold">Stats List</div>
            {loading ? (
              <div className="p-8 text-center text-slate-500">Loading...</div>
            ) : stats.length === 0 ? (
              <div className="p-8 text-center text-slate-500">No stats yet. Add one above or run Platform → Import site data.</div>
            ) : (
              <ul className="divide-y">
                {stats.map((s) => (
                  <li key={s.id} className="p-4 flex items-center justify-between">
                    <span>{s.icon} {s.value} — {s.label}</span>
                    <span>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingStats(s)
                          setFormStats({
                            icon: s.icon || '',
                            value: s.value || '',
                            label: s.label || '',
                            sort_order: s.sort_order || 0,
                          })
                          setSuccess(null)
                          setError(null)
                        }}
                        className="text-primary mr-2"
                      >
                        Edit
                      </button>
                      <button type="button" onClick={() => deleteStat(s.id)} className="text-red-600">
                        Delete
                      </button>
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
            <h2 className="font-semibold text-bingo-dark mb-4">{editingTest ? 'Edit Testimonial' : 'Add Testimonial'}</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-slate-600 block mb-1">quote</label>
                <textarea
                  value={formTest.quote}
                  onChange={(e) => setFormTest((f) => ({ ...f, quote: e.target.value }))}
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
              {['name', 'role', 'stars', 'sort_order'].map((k) => (
                <div key={k}>
                  <label className="text-xs font-medium text-slate-600 block mb-1">{k}</label>
                  <input
                    type={['stars', 'sort_order'].includes(k) ? 'number' : 'text'}
                    value={formTest[k] ?? ''}
                    onChange={(e) => setFormTest((f) => ({ ...f, [k]: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <button type="button" onClick={saveTestimonial} disabled={saving} className="btn-primary px-5 py-2 rounded-xl text-sm disabled:opacity-60">
                {saving ? 'Saving…' : 'Save'}
              </button>
              {editingTest ? (
                <button
                  type="button"
                  onClick={() => {
                    setEditingTest(null)
                    setFormTest({ quote: '', name: '', role: '', stars: 5, sort_order: 0 })
                  }}
                  className="px-5 py-2 rounded-xl border text-sm"
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </div>
          <div className="card overflow-hidden">
            <div className="p-4 border-b font-semibold">Testimonials List</div>
            {loading ? (
              <div className="p-8 text-center text-slate-500">Loading...</div>
            ) : (
              <ul className="divide-y">
                {testimonials.map((t) => (
                  <li key={t.id} className="p-4">
                    <p className="text-sm text-slate-700 line-clamp-2">{t.quote}</p>
                    <p className="text-xs text-slate-500 mt-1">{t.name} · {t.role}</p>
                    <span className="mt-2 inline-block">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingTest(t)
                          setFormTest({
                            quote: t.quote || '',
                            name: t.name || '',
                            role: t.role || '',
                            stars: t.stars ?? 5,
                            sort_order: t.sort_order || 0,
                          })
                          setSuccess(null)
                          setError(null)
                        }}
                        className="text-primary mr-2"
                      >
                        Edit
                      </button>
                      <button type="button" onClick={() => deleteTestimonial(t.id)} className="text-red-600">
                        Delete
                      </button>
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

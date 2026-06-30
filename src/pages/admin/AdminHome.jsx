import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { adminInsert, adminUpdate, adminDelete } from '../../lib/admin/db'
import AdminAlert from '../../components/admin/AdminAlert'
import AdminField from '../../components/admin/AdminField'
import AdminHomeHeroProgramsEditor from '../../components/admin/AdminHomeHeroProgramsEditor'
import { useAdminCrud } from '../../hooks/useAdminCrud'

const STAT_REQUIRED = new Set(['value', 'label'])
const TEST_REQUIRED = new Set(['quote', 'name'])

export default function AdminHome() {
  const c = useAdminCrud()
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
        setSuccess(c.t('pages.home.statUpdated'))
        setEditingStats(null)
        setFormStats({ icon: '', value: '', label: '', sort_order: 0 })
      } else {
        await adminInsert('home_stats', payload)
        setSuccess(c.t('pages.home.statAdded'))
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
        setSuccess(c.t('pages.home.testUpdated'))
        setEditingTest(null)
        setFormTest({ quote: '', name: '', role: '', stars: 5, sort_order: 0 })
      } else {
        await adminInsert('home_testimonials', payload)
        setSuccess(c.t('pages.home.testAdded'))
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
    if (!c.confirmDeleteGeneric()) return
    setError(null)
    setSuccess(null)
    try {
      await adminDelete('home_stats', id)
      setSuccess(c.t('pages.home.statDeleted'))
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
    if (!c.confirmDeleteGeneric()) return
    setError(null)
    setSuccess(null)
    try {
      await adminDelete('home_testimonials', id)
      setSuccess(c.t('pages.home.testDeleted'))
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
      <h1 className="text-2xl font-bold text-bingo-dark mb-2">{c.pageTitle('home')}</h1>
      <p className="text-sm text-slate-600 mb-6" dangerouslySetInnerHTML={{ __html: c.t('pages.home.hint') }} />
      {error ? <AdminAlert type="error" onDismiss={() => setError(null)}>{error}</AdminAlert> : null}
      {success ? <AdminAlert type="success" onDismiss={() => setSuccess(null)}>{success}</AdminAlert> : null}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button type="button" onClick={() => setActiveTab('stats')} className={`px-4 py-2 rounded-xl text-sm font-medium ${activeTab === 'stats' ? 'bg-primary text-white' : 'bg-slate-200'}`}>{c.t('pages.home.tabStats')}</button>
        <button type="button" onClick={() => setActiveTab('testimonials')} className={`px-4 py-2 rounded-xl text-sm font-medium ${activeTab === 'testimonials' ? 'bg-primary text-white' : 'bg-slate-200'}`}>{c.t('pages.home.tabTestimonials')}</button>
        <button type="button" onClick={() => setActiveTab('heroPrograms')} className={`px-4 py-2 rounded-xl text-sm font-medium ${activeTab === 'heroPrograms' ? 'bg-primary text-white' : 'bg-slate-200'}`}>{c.t('pages.home.tabHeroPrograms')}</button>
      </div>
      {activeTab === 'heroPrograms' ? (
        <div className="card p-6 mb-6">
          <AdminHomeHeroProgramsEditor
            labels={{
              desc: c.t('pages.home.heroProgramsDesc'),
              loading: c.loading,
              saved: c.t('pages.home.heroProgramsSaved'),
              coverLabel: c.t('pages.home.heroProgramCover'),
              coverHint: c.t('pages.home.heroProgramCoverHint'),
              coverUpload: c.t('pages.home.heroProgramCoverUpload'),
              coverUploading: c.t('pages.home.heroProgramCoverUploading'),
              coverRemove: c.t('pages.home.heroProgramCoverRemove'),
              coverDropzone: c.t('pages.home.heroProgramCoverDropzone'),
              coverDropzoneActive: c.t('pages.home.heroProgramCoverDropzoneActive'),
              coverReplace: c.t('pages.home.heroProgramCoverReplace'),
              coverReplaceBtn: c.t('pages.home.heroProgramCoverReplaceBtn'),
              coverFormats: c.t('pages.home.heroProgramCoverFormats'),
              coverAdvanced: c.t('pages.home.heroProgramCoverAdvanced'),
              coverUrlOptional: c.t('pages.home.heroProgramCoverUrlOptional'),
            }}
            saveLabel={c.save}
            savingLabel={c.saving}
            cancelLabel={c.t('pages.home.heroProgramsReset')}
          />
        </div>
      ) : null}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="font-semibold text-bingo-dark mb-1">{editingStats ? c.t('pages.home.editStat') : c.t('pages.home.addStat')}</h2>
            {editingStats ? (
              <p className="text-xs text-primary mb-4">Editing: {editingStats.label || editingStats.value}</p>
            ) : null}
            <div className="grid sm:grid-cols-2 gap-4">
              {['icon', 'value', 'label', 'sort_order'].map((k) => (
                <AdminField key={k} label={k} required={STAT_REQUIRED.has(k)}>
                  <input
                    type={k === 'sort_order' ? 'number' : 'text'}
                    value={formStats[k] ?? ''}
                    onChange={(e) => setFormStats((f) => ({ ...f, [k]: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  />
                </AdminField>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <button type="button" onClick={saveStat} disabled={saving} className="btn-primary px-5 py-2 rounded-xl text-sm disabled:opacity-60">
                {saving ? c.saving : c.save}
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
                  {c.cancel}
                </button>
              ) : null}
            </div>
          </div>
          <div className="card overflow-hidden">
            <div className="p-4 border-b font-semibold">{c.t('pages.home.tabStats')}</div>
            {loading ? (
              <div className="p-8 text-center text-slate-500">{c.loading}</div>
            ) : stats.length === 0 ? (
              <div className="p-8 text-center text-slate-500">{c.t('pages.home.noStats')}</div>
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
                        {c.edit}
                      </button>
                      <button type="button" onClick={() => deleteStat(s.id)} className="text-red-600">
                        {c.delete}
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
            <h2 className="font-semibold text-bingo-dark mb-4">{editingTest ? c.t('pages.home.editTestimonial') : c.t('pages.home.addTestimonial')}</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <AdminField label="quote" required className="sm:col-span-2">
                <textarea
                  value={formTest.quote}
                  onChange={(e) => setFormTest((f) => ({ ...f, quote: e.target.value }))}
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </AdminField>
              {['name', 'role', 'stars', 'sort_order'].map((k) => (
                <AdminField key={k} label={k} required={TEST_REQUIRED.has(k)}>
                  <input
                    type={['stars', 'sort_order'].includes(k) ? 'number' : 'text'}
                    value={formTest[k] ?? ''}
                    onChange={(e) => setFormTest((f) => ({ ...f, [k]: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  />
                </AdminField>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <button type="button" onClick={saveTestimonial} disabled={saving} className="btn-primary px-5 py-2 rounded-xl text-sm disabled:opacity-60">
                {saving ? c.saving : c.save}
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
                  {c.cancel}
                </button>
              ) : null}
            </div>
          </div>
          <div className="card overflow-hidden">
            <div className="p-4 border-b font-semibold">{c.t('pages.home.tabTestimonials')}</div>
            {loading ? (
              <div className="p-8 text-center text-slate-500">{c.loading}</div>
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
                        {c.edit}
                      </button>
                      <button type="button" onClick={() => deleteTestimonial(t.id)} className="text-red-600">
                        {c.delete}
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

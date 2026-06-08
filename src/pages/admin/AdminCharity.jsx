import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { adminInsert, adminUpdate, adminDelete } from '../../lib/admin/db'
import AdminField from '../../components/admin/AdminField'
import { useAdminCrud } from '../../hooks/useAdminCrud'

export default function AdminCharity() {
  const c = useAdminCrud()
  const [tab, setTab] = useState('reports')
  const [reports, setReports] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [formReport, setFormReport] = useState({ type: 'Trending', text: '', report_date: '', sort_order: 0 })
  const [formProject, setFormProject] = useState({ title: '', desc: '', sort_order: 0 })
  const [editingReport, setEditingReport] = useState(null)
  const [editingProject, setEditingProject] = useState(null)

  const fetchReports = async () => { const { data } = await supabase.from('charity_reports').select('*').order('sort_order'); setReports(data || []) }
  const fetchProjects = async () => { const { data } = await supabase.from('charity_projects').select('*').order('sort_order'); setProjects(data || []) }
  useEffect(() => { setLoading(true); Promise.all([fetchReports(), fetchProjects()]).finally(() => setLoading(false)) }, [])

  const saveReport = async () => {
    setError(null)
    const payload = { ...formReport, sort_order: parseInt(formReport.sort_order, 10) || 0 }
    const empty = { type: 'Trending', text: '', report_date: '', sort_order: 0 }
    try {
      if (editingReport) {
        await adminUpdate('charity_reports', editingReport.id, payload)
        setEditingReport(null)
        setFormReport(empty)
      } else {
        await adminInsert('charity_reports', payload)
        setFormReport(empty)
      }
      fetchReports()
    } catch (e) {
      setError(e.message)
    }
  }
  const saveProject = async () => {
    setError(null)
    const payload = { ...formProject, sort_order: parseInt(formProject.sort_order, 10) || 0 }
    const empty = { title: '', desc: '', sort_order: 0 }
    try {
      if (editingProject) {
        await adminUpdate('charity_projects', editingProject.id, payload)
        setEditingProject(null)
        setFormProject(empty)
      } else {
        await adminInsert('charity_projects', payload)
        setFormProject(empty)
      }
      fetchProjects()
    } catch (e) {
      setError(e.message)
    }
  }

  const deleteReport = async (id) => {
    if (!c.confirmDeleteGeneric()) return
    setError(null)
    try {
      await adminDelete('charity_reports', id)
      fetchReports()
    } catch (e) {
      setError(e.message)
    }
  }

  const deleteProject = async (id) => {
    if (!c.confirmDeleteGeneric()) return
    setError(null)
    try {
      await adminDelete('charity_projects', id)
      fetchProjects()
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-bingo-dark mb-6">{c.pageTitle('charity')}</h1>
      {error && <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-sm">{error}</div>}
      <div className="flex gap-2 mb-6">
        <button type="button" onClick={() => setTab('reports')} className={`px-4 py-2 rounded-xl text-sm font-medium ${tab === 'reports' ? 'bg-primary text-white' : 'bg-slate-200'}`}>{c.t('pages.charity.reportsTab')}</button>
        <button type="button" onClick={() => setTab('projects')} className={`px-4 py-2 rounded-xl text-sm font-medium ${tab === 'projects' ? 'bg-primary text-white' : 'bg-slate-200'}`}>{c.t('pages.charity.projectsTab')}</button>
      </div>
      {tab === 'reports' && (
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="font-semibold mb-4">{c.t('pages.charity.editReport')}</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <AdminField label="type">
                <select value={formReport.type} onChange={(e) => setFormReport((f) => ({ ...f, type: e.target.value }))} className="w-full rounded-xl border px-3 py-2 text-sm"><option value="Trending">Trending</option><option value="Industry">Industry</option><option value="Honor">Honor</option></select>
              </AdminField>
              <AdminField label="report_date">
                <input value={formReport.report_date} onChange={(e) => setFormReport((f) => ({ ...f, report_date: e.target.value }))} placeholder="2025-02" className="w-full rounded-xl border px-3 py-2 text-sm" />
              </AdminField>
              <AdminField label="text" required className="sm:col-span-2">
                <input value={formReport.text} onChange={(e) => setFormReport((f) => ({ ...f, text: e.target.value }))} className="w-full rounded-xl border px-3 py-2 text-sm" />
              </AdminField>
              <AdminField label="sort_order">
                <input type="number" value={formReport.sort_order} onChange={(e) => setFormReport((f) => ({ ...f, sort_order: e.target.value }))} className="w-full rounded-xl border px-3 py-2 text-sm" />
              </AdminField>
            </div>
            <div className="flex gap-2 mt-4">
              <button type="button" onClick={saveReport} className="btn-primary px-5 py-2 rounded-xl text-sm">{c.save}</button>
              {editingReport && <button onClick={() => { setEditingReport(null); setFormReport({ type: 'Trending', text: '', report_date: '', sort_order: 0 }) }} className="px-5 py-2 border rounded-xl text-sm">Cancel</button>}
            </div>
          </div>
          <div className="card overflow-hidden">
            <div className="p-4 border-b font-semibold">Reports List</div>
            {loading ? <div className="p-8 text-center text-slate-500">{c.loading}</div> : <ul className="divide-y">{reports.map((r) => (<li key={r.id} className="p-4 flex justify-between"><span><span className="text-xs px-2 py-0.5 rounded bg-slate-100">{r.type}</span> {r.text}</span><span><button type="button" onClick={() => { setEditingReport(r); setFormReport({ type: r.type || 'Trending', text: r.text || '', report_date: r.report_date || '', sort_order: r.sort_order || 0 }) }} className="text-primary mr-2">{c.edit}</button><button type="button" onClick={() => deleteReport(r.id)} className="text-red-600">{c.delete}</button></span></li>))}</ul>}
          </div>
        </div>
      )}
      {tab === 'projects' && (
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="font-semibold mb-4">{c.t('pages.charity.editProject')}</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <AdminField label="title" required>
                <input value={formProject.title} onChange={(e) => setFormProject((f) => ({ ...f, title: e.target.value }))} className="w-full rounded-xl border px-3 py-2 text-sm" />
              </AdminField>
              <AdminField label="sort_order">
                <input type="number" value={formProject.sort_order} onChange={(e) => setFormProject((f) => ({ ...f, sort_order: e.target.value }))} className="w-full rounded-xl border px-3 py-2 text-sm" />
              </AdminField>
              <AdminField label="desc" className="sm:col-span-2">
                <textarea value={formProject.desc} onChange={(e) => setFormProject((f) => ({ ...f, desc: e.target.value }))} rows={2} className="w-full rounded-xl border px-3 py-2 text-sm" />
              </AdminField>
            </div>
            <div className="flex gap-2 mt-4">
              <button type="button" onClick={saveProject} className="btn-primary px-5 py-2 rounded-xl text-sm">{c.save}</button>
              {editingProject && <button onClick={() => { setEditingProject(null); setFormProject({ title: '', desc: '', sort_order: 0 }) }} className="px-5 py-2 border rounded-xl text-sm">Cancel</button>}
            </div>
          </div>
          <div className="card overflow-hidden">
            <div className="p-4 border-b font-semibold">Projects List</div>
            {loading ? <div className="p-8 text-center text-slate-500">{c.loading}</div> : <ul className="divide-y">{projects.map((p) => (<li key={p.id} className="p-4 flex justify-between"><span><strong>{p.title}</strong> — {p.desc}</span><span><button type="button" onClick={() => { setEditingProject(p); setFormProject({ title: p.title || '', desc: p.desc || '', sort_order: p.sort_order || 0 }) }} className="text-primary mr-2">{c.edit}</button><button type="button" onClick={() => deleteProject(p.id)} className="text-red-600">{c.delete}</button></span></li>))}</ul>}
          </div>
        </div>
      )}
    </div>
  )
}

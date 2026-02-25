import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function AdminCharity() {
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
    const payload = { ...formReport, sort_order: parseInt(formReport.sort_order) || 0 }
    if (editingReport) { const { error: e } = await supabase.from('charity_reports').update(payload).eq('id', editingReport.id); setError(e?.message); if (!e) { setEditingReport(null); setFormReport({ type: 'Trending', text: '', report_date: '', sort_order: 0 }); fetchReports() } }
    else { const { error: e } = await supabase.from('charity_reports').insert(payload); setError(e?.message); if (!e) { setFormReport({ type: 'Trending', text: '', report_date: '', sort_order: 0 }); fetchReports() } }
  }
  const saveProject = async () => {
    setError(null)
    const payload = { ...formProject, sort_order: parseInt(formProject.sort_order) || 0 }
    if (editingProject) { const { error: e } = await supabase.from('charity_projects').update(payload).eq('id', editingProject.id); setError(e?.message); if (!e) { setEditingProject(null); setFormProject({ title: '', desc: '', sort_order: 0 }); fetchProjects() } }
    else { const { error: e } = await supabase.from('charity_projects').insert(payload); setError(e?.message); if (!e) { setFormProject({ title: '', desc: '', sort_order: 0 }); fetchProjects() } }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-bingo-dark mb-6">Honors & Charity</h1>
      {error && <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-sm">{error}</div>}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab('reports')} className={`px-4 py-2 rounded-xl text-sm font-medium ${tab === 'reports' ? 'bg-primary text-white' : 'bg-slate-200'}`}>Reports / Coverage</button>
        <button onClick={() => setTab('projects')} className={`px-4 py-2 rounded-xl text-sm font-medium ${tab === 'projects' ? 'bg-primary text-white' : 'bg-slate-200'}`}>Charity Projects</button>
      </div>
      {tab === 'reports' && (
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="font-semibold mb-4">Add / Edit Report</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><label className="text-xs font-medium text-slate-600 block mb-1">type</label><select value={formReport.type} onChange={(e) => setFormReport((f) => ({ ...f, type: e.target.value }))} className="w-full rounded-xl border px-3 py-2 text-sm"><option value="Trending">Trending</option><option value="Industry">Industry</option><option value="Honor">Honor</option></select></div>
              <div><label className="text-xs font-medium text-slate-600 block mb-1">report_date</label><input value={formReport.report_date} onChange={(e) => setFormReport((f) => ({ ...f, report_date: e.target.value }))} placeholder="2025-02" className="w-full rounded-xl border px-3 py-2 text-sm" /></div>
              <div className="sm:col-span-2"><label className="text-xs font-medium text-slate-600 block mb-1">text</label><input value={formReport.text} onChange={(e) => setFormReport((f) => ({ ...f, text: e.target.value }))} className="w-full rounded-xl border px-3 py-2 text-sm" /></div>
              <div><label className="text-xs font-medium text-slate-600 block mb-1">sort_order</label><input type="number" value={formReport.sort_order} onChange={(e) => setFormReport((f) => ({ ...f, sort_order: e.target.value }))} className="w-full rounded-xl border px-3 py-2 text-sm" /></div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={saveReport} className="btn-primary px-5 py-2 rounded-xl text-sm">Save</button>
              {editingReport && <button onClick={() => { setEditingReport(null); setFormReport({ type: 'Trending', text: '', report_date: '', sort_order: 0 }) }} className="px-5 py-2 border rounded-xl text-sm">Cancel</button>}
            </div>
          </div>
          <div className="card overflow-hidden">
            <div className="p-4 border-b font-semibold">Reports List</div>
            {loading ? <div className="p-8 text-center text-slate-500">Loading...</div> : <ul className="divide-y">{reports.map((r) => (<li key={r.id} className="p-4 flex justify-between"><span><span className="text-xs px-2 py-0.5 rounded bg-slate-100">{r.type}</span> {r.text}</span><span><button onClick={() => { setEditingReport(r); setFormReport({ type: r.type || 'Trending', text: r.text || '', report_date: r.report_date || '', sort_order: r.sort_order || 0 }) }} className="text-primary mr-2">Edit</button><button onClick={async () => { if (confirm('Delete?')) await supabase.from('charity_reports').delete().eq('id', r.id); fetchReports() }} className="text-red-600">Delete</button></span></li>))}</ul>}
          </div>
        </div>
      )}
      {tab === 'projects' && (
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="font-semibold mb-4">Add / Edit Project</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><label className="text-xs font-medium text-slate-600 block mb-1">title</label><input value={formProject.title} onChange={(e) => setFormProject((f) => ({ ...f, title: e.target.value }))} className="w-full rounded-xl border px-3 py-2 text-sm" /></div>
              <div><label className="text-xs font-medium text-slate-600 block mb-1">sort_order</label><input type="number" value={formProject.sort_order} onChange={(e) => setFormProject((f) => ({ ...f, sort_order: e.target.value }))} className="w-full rounded-xl border px-3 py-2 text-sm" /></div>
              <div className="sm:col-span-2"><label className="text-xs font-medium text-slate-600 block mb-1">desc</label><textarea value={formProject.desc} onChange={(e) => setFormProject((f) => ({ ...f, desc: e.target.value }))} rows={2} className="w-full rounded-xl border px-3 py-2 text-sm" /></div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={saveProject} className="btn-primary px-5 py-2 rounded-xl text-sm">Save</button>
              {editingProject && <button onClick={() => { setEditingProject(null); setFormProject({ title: '', desc: '', sort_order: 0 }) }} className="px-5 py-2 border rounded-xl text-sm">Cancel</button>}
            </div>
          </div>
          <div className="card overflow-hidden">
            <div className="p-4 border-b font-semibold">Projects List</div>
            {loading ? <div className="p-8 text-center text-slate-500">Loading...</div> : <ul className="divide-y">{projects.map((p) => (<li key={p.id} className="p-4 flex justify-between"><span><strong>{p.title}</strong> — {p.desc}</span><span><button onClick={() => { setEditingProject(p); setFormProject({ title: p.title || '', desc: p.desc || '', sort_order: p.sort_order || 0 }) }} className="text-primary mr-2">Edit</button><button onClick={async () => { if (confirm('Delete?')) await supabase.from('charity_projects').delete().eq('id', p.id); fetchProjects() }} className="text-red-600">Delete</button></span></li>))}</ul>}
          </div>
        </div>
      )}
    </div>
  )
}

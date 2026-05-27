import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { adminInsert, adminUpdate, adminDelete } from '../../lib/admin/db'

const AWARD_FIELDS = [
  { key: 'student', label: 'Student name', placeholder: 'e.g. Student A', textarea: false },
  { key: 'grade', label: 'Grade', placeholder: 'e.g. Grade 6 · Primary', textarea: false },
  { key: 'pain', label: 'Starting challenge', placeholder: 'Problem the student/parent faced initially', textarea: true },
  { key: 'path', label: 'Bingo solution path', placeholder: 'e.g. AI Literacy Camp → Bootcamp → 1-on-1 Coach', textarea: true },
  { key: 'result', label: 'Award result', placeholder: 'e.g. National 1st Prize', textarea: false },
  { key: 'detail', label: 'Full story', placeholder: 'Describe the journey from start to award', textarea: true },
  { key: 'duration', label: 'Duration', placeholder: 'e.g. 6 months', textarea: false },
  { key: 'tags', label: 'Tags', placeholder: 'Comma-separated: AI Zero Background, Competition, Primary', textarea: false },
  { key: 'sort_order', label: 'Sort order', placeholder: '0', textarea: false },
]

export default function AdminShowcase() {
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
    if (!confirm('Delete this case?')) return
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
      <h1 className="text-2xl font-bold text-bingo-dark mb-6">Achievements (Showcase)</h1>
      {error && <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-sm">{error}</div>}

      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-bingo-dark">Student Award Cases</h2>
          <button type="button" onClick={startAddAwardCase} className="text-sm btn-primary px-4 py-2 rounded-xl">+ Add Case</button>
        </div>
        <p className="text-sm text-slate-500 mb-4">Manage competition award cases shown on the public Achievements page (type: competition).</p>
        <div className="card p-6 mb-4">
          <h3 className="font-semibold text-bingo-dark mb-4">{editing ? 'Edit Case' : 'Add Case'} (Student Award Case)</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {AWARD_FIELDS.map(({ key, label, placeholder, textarea }) => (
              <div key={key} className={textarea ? 'sm:col-span-2' : ''}>
                <label className="text-xs font-medium text-slate-600 block mb-1">{label}</label>
                {textarea ? (
                  <textarea value={awardForm[key] ?? ''} onChange={(e) => setAwardForm((f) => ({ ...f, [key]: e.target.value }))} rows={2} placeholder={placeholder} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                ) : (
                  <input type={key === 'sort_order' ? 'number' : 'text'} value={awardForm[key] ?? ''} onChange={(e) => setAwardForm((f) => ({ ...f, [key]: e.target.value }))} placeholder={placeholder} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleSaveAward} className="btn-primary px-5 py-2 rounded-xl text-sm">Save</button>
            {editing && <button type="button" onClick={() => { setEditing(null); resetAwardForm() }} className="px-5 py-2 rounded-xl border text-sm">Cancel</button>}
          </div>
        </div>
        <div className="card overflow-hidden">
          <div className="p-4 border-b font-semibold text-bingo-dark">Student Award Cases List</div>
          {loading ? <div className="p-8 text-center text-slate-500">Loading...</div> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-slate-50 text-left"><th className="p-3">Type</th><th className="p-3">Student / Name</th><th className="p-3">Grade</th><th className="p-3">Result</th><th className="p-3 w-32">Actions</th></tr></thead>
                <tbody>
                  {awardCasesOnly.length === 0 ? (
                    <tr><td colSpan={5} className="p-6 text-center text-slate-500">No Student Award Cases yet. Click &quot;Add Case&quot; above.</td></tr>
                  ) : (
                    awardCasesOnly.map((r) => (
                      <tr key={r.id} className="border-t border-slate-100"><td className="p-3"><span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">competition</span></td><td className="p-3">{r.student}</td><td className="p-3">{r.grade || '—'}</td><td className="p-3 line-clamp-1">{r.result}</td><td className="p-3"><button type="button" onClick={() => startEditAward(r)} className="text-primary mr-2">Edit</button><button type="button" onClick={() => handleDelete(r.id)} className="text-red-600">Delete</button></td></tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-bingo-dark mb-3">All Cases (by type)</h2>
        <div className="card overflow-hidden">
          <div className="p-4 border-b font-semibold text-slate-600">Cases List (All Types)</div>
          {loading ? <div className="p-8 text-center text-slate-500">Loading...</div> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-slate-50 text-left"><th className="p-3">Type</th><th className="p-3">Name/Org</th><th className="p-3">Result</th><th className="p-3 w-32">Actions</th></tr></thead>
                <tbody>
                  {items.map((r) => (
                    <tr key={r.id} className="border-t"><td className="p-3">{r.type}</td><td className="p-3">{r.student || r.org}</td><td className="p-3 line-clamp-1">{r.result}</td><td className="p-3"><button type="button" onClick={() => r.type === 'competition' ? startEditAward(r) : alert('Only competition-type cases can be edited in Student Award Cases above.')} className="text-primary mr-2">Edit</button><button type="button" onClick={() => handleDelete(r.id)} className="text-red-600">Delete</button></td></tr>
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

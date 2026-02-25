import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

// Student Award Cases 专用属性：student, grade, pain, path, result, detail, tags, duration
const AWARD_FIELDS = [
  { key: 'student', label: '学生姓名', placeholder: 'e.g. Student A', textarea: false },
  { key: 'grade', label: '年级', placeholder: 'e.g. Grade 6 · Primary', textarea: false },
  { key: 'pain', label: '起始痛点', placeholder: '学生/家长最初遇到的问题', textarea: true },
  { key: 'path', label: 'Bingo 解决方案路径', placeholder: 'e.g. AI Literacy Camp → Bootcamp → 1-on-1 Coach', textarea: true },
  { key: 'result', label: '获奖结果', placeholder: 'e.g. 🥇 National 1st Prize', textarea: false },
  { key: 'detail', label: '完整历程', placeholder: '详细描述学生从入门到获奖的完整过程', textarea: true },
  { key: 'duration', label: '时长', placeholder: 'e.g. 6 months', textarea: false },
  { key: 'tags', label: '标签', placeholder: '逗号分隔，如：AI Zero Background, Competition, Primary', textarea: false },
  { key: 'sort_order', label: '排序', placeholder: '0', textarea: false },
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
    if (editing) {
      const { error: e } = await supabase.from('showcase_cases').update(payload).eq('id', editing.id)
      setError(e?.message)
      if (!e) { setEditing(null); resetAwardForm(); fetchItems() }
    } else {
      const { error: e } = await supabase.from('showcase_cases').insert(payload)
      setError(e?.message)
      if (!e) { resetAwardForm(); fetchItems() }
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
  const handleDelete = async (id) => { if (!confirm('删除该案例？')) return; await supabase.from('showcase_cases').delete().eq('id', id); fetchItems() }

  return (
    <div>
      <h1 className="text-2xl font-bold text-bingo-dark mb-6">Achievements (Showcase)</h1>
      {error && <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-sm">{error}</div>}

      {/* Student Award Cases 区块 */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-bingo-dark">Student Award Cases</h2>
          <button type="button" onClick={startAddAwardCase} className="text-sm btn-primary px-4 py-2 rounded-xl">+ 添加案例</button>
        </div>
        <p className="text-sm text-slate-500 mb-4">管理前端「Student Award Cases」展示的竞赛获奖案例，对应类型为 competition。</p>
        <div className="card p-6 mb-4">
          <h3 className="font-semibold text-bingo-dark mb-4">{editing ? '编辑案例' : '添加案例'} (Student Award Case)</h3>
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
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={handleSaveAward} className="btn-primary px-5 py-2 rounded-xl text-sm">保存</button>
          {editing && <button type="button" onClick={() => { setEditing(null); resetAwardForm() }} className="px-5 py-2 rounded-xl border text-sm">取消</button>}
        </div>
      </div>
        <div className="card overflow-hidden">
          <div className="p-4 border-b font-semibold text-bingo-dark">Student Award Cases 列表</div>
          {loading ? <div className="p-8 text-center text-slate-500">Loading...</div> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-slate-50 text-left"><th className="p-3">Type</th><th className="p-3">Student / Name</th><th className="p-3">Grade</th><th className="p-3">Result</th><th className="p-3 w-32">操作</th></tr></thead>
                <tbody>
                  {awardCasesOnly.length === 0 ? (
                    <tr><td colSpan={5} className="p-6 text-center text-slate-500">暂无 Student Award Cases，点击上方「添加案例」创建。</td></tr>
                  ) : (
                    awardCasesOnly.map((r) => (
                      <tr key={r.id} className="border-t border-slate-100"><td className="p-3"><span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">competition</span></td><td className="p-3">{r.student}</td><td className="p-3">{r.grade || '—'}</td><td className="p-3 line-clamp-1">{r.result}</td><td className="p-3"><button type="button" onClick={() => startEditAward(r)} className="text-primary mr-2">编辑</button><button type="button" onClick={() => handleDelete(r.id)} className="text-red-600">删除</button></td></tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* 全部案例 */}
      <section>
        <h2 className="text-lg font-semibold text-bingo-dark mb-3">全部案例（按类型筛选）</h2>
        <div className="card overflow-hidden">
          <div className="p-4 border-b font-semibold text-slate-600">Cases List (All Types)</div>
          {loading ? <div className="p-8 text-center text-slate-500">Loading...</div> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-slate-50 text-left"><th className="p-3">Type</th><th className="p-3">Name/Org</th><th className="p-3">Result</th><th className="p-3 w-32">Actions</th></tr></thead>
                <tbody>
                  {items.map((r) => (
                    <tr key={r.id} className="border-t"><td className="p-3">{r.type}</td><td className="p-3">{r.student || r.org}</td><td className="p-3 line-clamp-1">{r.result}</td><td className="p-3"><button type="button" onClick={() => r.type === 'competition' ? startEditAward(r) : alert('仅 competition 类型可在上方 Student Award Cases 编辑')} className="text-primary mr-2">Edit</button><button type="button" onClick={() => handleDelete(r.id)} className="text-red-600">Delete</button></td></tr>
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

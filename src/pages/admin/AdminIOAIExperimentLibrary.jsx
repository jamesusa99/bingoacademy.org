import { useCallback, useEffect, useState } from 'react'
import { Copy, Plus, Trash2 } from 'lucide-react'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminAlert from '../../components/admin/AdminAlert'
import AdminField from '../../components/admin/AdminField'
import { useAdminCrud } from '../../hooks/useAdminCrud'
import {
  adminCopyExperiment,
  adminDeleteExperiment,
  adminGetExperiment,
  adminListExperiments,
  adminSaveExperiment,
  adminSaveExperimentStep,
  adminDeleteExperimentStep,
} from '../../lib/ioaiExperimentsApi'
import { LAB_STEP_TYPES } from '../../config/labExperiments'

const inputClass = 'w-full rounded-xl border border-slate-200 px-3 py-2 text-sm'
const textareaClass = `${inputClass} min-h-[88px]`

const EMPTY = {
  slug: '',
  title: '',
  content: '',
  purpose: '',
  status: 'live',
  sortOrder: 0,
  materialFiles: [],
}

export default function AdminIOAIExperimentLibrary() {
  const c = useAdminCrud()
  const [rows, setRows] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [steps, setSteps] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { experiments } = await adminListExperiments()
      setRows(experiments || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const openExperiment = async (id) => {
    setActiveId(id)
    setError(null)
    try {
      const { experiment } = await adminGetExperiment(id)
      setForm({
        slug: experiment.slug,
        title: experiment.title,
        content: experiment.content,
        purpose: experiment.purpose,
        status: experiment.status,
        sortOrder: experiment.sortOrder ?? 0,
        materialFiles: experiment.materialFiles || [],
      })
      setSteps(experiment.steps || [])
    } catch (e) {
      setError(e.message)
    }
  }

  const startNew = () => {
    setActiveId('new')
    setForm(EMPTY)
    setSteps([])
  }

  const saveExperiment = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const payload = {
        slug: form.slug,
        title: form.title,
        content: form.content,
        purpose: form.purpose,
        status: form.status,
        sort_order: form.sortOrder,
        materialFiles: form.materialFiles,
      }
      const res = await adminSaveExperiment(payload, activeId === 'new' ? null : activeId)
      setSuccess('Experiment saved')
      setActiveId(res.experiment.id)
      await load()
      await openExperiment(res.experiment.id)
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleCopy = async (id) => {
    try {
      const res = await adminCopyExperiment(id)
      await load()
      if (res.experiment?.id) await openExperiment(res.experiment.id)
      setSuccess('Experiment copied')
    } catch (e) {
      setError(e.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this experiment from the public library?')) return
    try {
      await adminDeleteExperiment(id)
      if (activeId === id) {
        setActiveId(null)
        setForm(EMPTY)
        setSteps([])
      }
      await load()
    } catch (e) {
      setError(e.message)
    }
  }

  const saveStep = async (step, index) => {
    if (!activeId || activeId === 'new') return
    const payload = {
      title: step.title,
      step_type: step.stepType || 'text',
      body: step.body,
      sort_order: step.sortOrder ?? index,
    }
    const res = step.id
      ? await adminSaveExperimentStep(activeId, payload, step.id)
      : await adminSaveExperimentStep(activeId, payload)
    return res.step
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="IOAI · Public experiment library"
        description="Create once, reuse in L4 lessons and standalone lab packs."
      />

      {error ? <AdminAlert variant="error">{error}</AdminAlert> : null}
      {success ? <AdminAlert variant="success">{success}</AdminAlert> : null}

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-bingo-dark text-sm">Experiments ({rows.length})</h2>
            <button type="button" onClick={startNew} className="btn-primary text-xs px-3 py-1.5 inline-flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" /> New
            </button>
          </div>
          {loading ? (
            <p className="p-4 text-sm text-slate-500">Loading…</p>
          ) : (
            <ul className="divide-y divide-slate-100 max-h-[70vh] overflow-y-auto">
              {rows.map((row) => (
                <li key={row.id} className={`px-4 py-3 ${activeId === row.id ? 'bg-primary/5' : ''}`}>
                  <div className="flex items-start justify-between gap-2">
                    <button type="button" onClick={() => openExperiment(row.id)} className="text-left min-w-0 flex-1">
                      <p className="text-sm font-medium text-bingo-dark truncate">{row.title}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{row.slug}</p>
                      <p className="text-[10px] text-slate-500 mt-1">{row.status} · {row.stepCount ?? 0} steps</p>
                    </button>
                    <div className="flex gap-1 shrink-0">
                      <button type="button" onClick={() => handleCopy(row.id)} className="p-1 text-slate-400 hover:text-primary" title="Copy">
                        <Copy className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => handleDelete(row.id)} className="p-1 text-slate-400 hover:text-red-600" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="lg:col-span-3 card p-5 space-y-4">
          {!activeId ? (
            <p className="text-sm text-slate-500">Select an experiment or create a new one.</p>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 gap-4">
                <AdminField label="Slug" required>
                  <input className={inputClass} value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} />
                </AdminField>
                <AdminField label="Title" required>
                  <input className={inputClass} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
                </AdminField>
                <AdminField label="Status">
                  <select className={inputClass} value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
                    <option value="live">live</option>
                    <option value="draft">draft</option>
                    <option value="hidden">hidden</option>
                  </select>
                </AdminField>
                <AdminField label="Sort order">
                  <input type="number" className={inputClass} value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: parseInt(e.target.value, 10) || 0 }))} />
                </AdminField>
              </div>
              <AdminField label="Content">
                <textarea className={textareaClass} value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} />
              </AdminField>
              <AdminField label="Purpose">
                <textarea className={textareaClass} value={form.purpose} onChange={(e) => setForm((f) => ({ ...f, purpose: e.target.value }))} />
              </AdminField>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-bingo-dark">Material files</h3>
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, materialFiles: [...f.materialFiles, { title: '', fileUrl: '' }] }))}
                    className="text-xs font-semibold text-primary"
                  >
                    + Add file
                  </button>
                </div>
                {form.materialFiles.map((file, index) => (
                  <div key={index} className="grid sm:grid-cols-2 gap-2 mb-2">
                    <input className={inputClass} placeholder="Title" value={file.title} onChange={(e) => setForm((f) => ({ ...f, materialFiles: f.materialFiles.map((m, i) => (i === index ? { ...m, title: e.target.value } : m)) }))} />
                    <input className={inputClass} placeholder="File URL" value={file.fileUrl} onChange={(e) => setForm((f) => ({ ...f, materialFiles: f.materialFiles.map((m, i) => (i === index ? { ...m, fileUrl: e.target.value } : m)) }))} />
                  </div>
                ))}
              </div>

              {activeId !== 'new' ? (
                <div className="border-t border-slate-100 pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-bingo-dark">Steps ({steps.length})</h3>
                    <button
                      type="button"
                      onClick={() => setSteps((prev) => [...prev, { title: '', stepType: 'text', body: '', sortOrder: prev.length }])}
                      className="text-xs font-semibold text-primary"
                    >
                      + Add step
                    </button>
                  </div>
                  {steps.map((step, index) => (
                    <div key={step.id || `new-${index}`} className="rounded-xl border border-slate-200 p-3 space-y-2">
                      <div className="grid sm:grid-cols-2 gap-2">
                        <input className={inputClass} placeholder="Step title" value={step.title} onChange={(e) => setSteps((prev) => prev.map((s, i) => (i === index ? { ...s, title: e.target.value } : s)))} />
                        <select className={inputClass} value={step.stepType || 'text'} onChange={(e) => setSteps((prev) => prev.map((s, i) => (i === index ? { ...s, stepType: e.target.value } : s)))}>
                          {LAB_STEP_TYPES.map((t) => (
                            <option key={t.id} value={t.id}>{t.label}</option>
                          ))}
                        </select>
                      </div>
                      <textarea className={textareaClass} placeholder="Step body" value={step.body || ''} onChange={(e) => setSteps((prev) => prev.map((s, i) => (i === index ? { ...s, body: e.target.value } : s)))} />
                      <div className="flex gap-2">
                        <button type="button" className="text-xs font-semibold text-primary" onClick={async () => {
                          const saved = await saveStep(step, index)
                          setSteps((prev) => prev.map((s, i) => (i === index ? { ...s, id: saved.id, stepType: saved.step_type, title: saved.title, body: saved.body } : s)))
                        }}>
                          Save step
                        </button>
                        {step.id ? (
                          <button type="button" className="text-xs text-red-600" onClick={async () => {
                            await adminDeleteExperimentStep(activeId, step.id)
                            setSteps((prev) => prev.filter((_, i) => i !== index))
                          }}>
                            Delete
                          </button>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}

              <button type="button" disabled={saving} onClick={saveExperiment} className="btn-primary text-sm px-5 py-2 disabled:opacity-60">
                {saving ? 'Saving…' : 'Save experiment'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

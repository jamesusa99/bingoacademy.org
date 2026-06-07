import { useCallback, useEffect, useState } from 'react'
import {
  adminFetchExperiments,
  adminFetchLessonExperiments,
  adminSaveLessonExperiments,
} from '../../lib/ioaiExperimentsClient'

const inputClass = 'w-full rounded-xl border border-slate-200 px-3 py-2 text-sm'

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-600 block mb-1">{label}</label>
      {children}
    </div>
  )
}

/**
 * Admin panel: bind public experiments to L4 + upload lesson materials.
 */
export default function LessonExperimentsPanel({ lessonId, disabled }) {
  const [library, setLibrary] = useState([])
  const [bindings, setBindings] = useState([])
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    if (!lessonId) return
    setLoading(true)
    setError(null)
    try {
      const [{ experiments }, lessonData] = await Promise.all([
        adminFetchExperiments(),
        adminFetchLessonExperiments(lessonId),
      ])
      setLibrary(experiments || [])
      setBindings(lessonData.bindings || [])
      setMaterials(
        (lessonData.materials || []).map((m) => ({
          file_name: m.file_name,
          file_url: m.file_url,
          sort_order: m.sort_order ?? 0,
        }))
      )
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [lessonId])

  useEffect(() => {
    load()
  }, [load])

  const boundIds = new Set(bindings.map((b) => b.experiment_id))

  const toggleExperiment = (experimentId) => {
    setBindings((prev) => {
      if (prev.some((b) => b.experiment_id === experimentId)) {
        return prev.filter((b) => b.experiment_id !== experimentId)
      }
      return [...prev, { experiment_id: experimentId, enabled: true, sort_order: prev.length }]
    })
  }

  const addMaterial = () => {
    setMaterials((prev) => [...prev, { file_name: '', file_url: '', sort_order: prev.length }])
  }

  const save = async () => {
    setSaving(true)
    setError(null)
    setMessage(null)
    try {
      await adminSaveLessonExperiments(lessonId, { bindings, materials })
      setMessage('Experiments & materials saved.')
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (!lessonId) return null
  if (loading) return <p className="text-xs text-slate-500">Loading experiments…</p>

  return (
    <div className="border border-violet-200 rounded-xl p-4 space-y-4 bg-violet-50/30">
      <div>
        <p className="text-xs font-bold uppercase text-violet-800">Lesson experiments (free with L3)</p>
        <p className="text-[10px] text-slate-500 mt-0.5">Select from the public experiment library. Manage library at Admin → IOAI Experiments.</p>
      </div>

      {error ? <p className="text-xs text-red-600">{error}</p> : null}
      {message ? <p className="text-xs text-emerald-700">{message}</p> : null}

      <div className="max-h-40 overflow-y-auto space-y-1">
        {library.map((exp) => (
          <label key={exp.id} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              disabled={disabled || saving}
              checked={boundIds.has(exp.id)}
              onChange={() => toggleExperiment(exp.id)}
            />
            <span>{exp.title}</span>
            <span className="text-[10px] text-slate-400 font-mono">{exp.slug}</span>
          </label>
        ))}
        {!library.length ? <p className="text-xs text-slate-500">No experiments in library yet.</p> : null}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium text-slate-600">Lesson materials (worksheets, slides)</p>
          <button type="button" onClick={addMaterial} className="text-xs text-primary hover:underline" disabled={disabled}>
            + Add file
          </button>
        </div>
        <div className="space-y-2">
          {materials.map((m, i) => (
            <div key={i} className="grid sm:grid-cols-2 gap-2">
              <input
                className={inputClass}
                placeholder="File name"
                disabled={disabled || saving}
                value={m.file_name}
                onChange={(e) => {
                  const next = [...materials]
                  next[i] = { ...next[i], file_name: e.target.value }
                  setMaterials(next)
                }}
              />
              <input
                className={inputClass}
                placeholder="File URL"
                disabled={disabled || saving}
                value={m.file_url}
                onChange={(e) => {
                  const next = [...materials]
                  next[i] = { ...next[i], file_url: e.target.value }
                  setMaterials(next)
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        disabled={disabled || saving}
        onClick={save}
        className="text-xs font-semibold text-violet-800 hover:underline disabled:opacity-50"
      >
        {saving ? 'Saving…' : 'Save experiments & materials'}
      </button>
    </div>
  )
}

import { useEffect, useMemo, useState } from 'react'
import AdminField from './AdminField'
import AdminAlert from './AdminAlert'
import {
  adminFetchLessonResources,
  adminListExperiments,
  adminSaveLessonExperimentBindings,
  adminSaveLessonMaterials,
} from '../../lib/ioaiExperimentsApi'

const inputClass = 'w-full rounded-xl border border-slate-200 px-3 py-2 text-sm'

export default function AdminLessonResourcePanel({ lessonId, labels = {} }) {
  const L = (key, fallback) => labels[key] || fallback
  const [library, setLibrary] = useState([])
  const [selectedIds, setSelectedIds] = useState([])
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([adminListExperiments(), adminFetchLessonResources(lessonId)])
      .then(([libRes, lessonRes]) => {
        if (cancelled) return
        setLibrary(libRes.experiments || [])
        setSelectedIds((lessonRes.experiments || []).map((e) => e.id))
        setMaterials(
          (lessonRes.lessonMaterials || []).map((m) => ({
            title: m.title,
            fileUrl: m.fileUrl,
            fileName: m.fileName,
          }))
        )
      })
      .catch((e) => {
        if (!cancelled) setError(e.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [lessonId])

  const toggleExperiment = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const addMaterial = () => {
    setMaterials((prev) => [...prev, { title: '', fileUrl: '', fileName: '' }])
  }

  const updateMaterial = (index, key, value) => {
    setMaterials((prev) => prev.map((row, i) => (i === index ? { ...row, [key]: value } : row)))
  }

  const removeMaterial = (index) => {
    setMaterials((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      await adminSaveLessonExperimentBindings(
        lessonId,
        selectedIds.map((experimentId, sort_order) => ({ experimentId, enabled: true, sort_order }))
      )
      await adminSaveLessonMaterials(lessonId, materials.filter((m) => m.fileUrl?.trim()))
      setSuccess(L('lessonResourcesSaved', 'Lesson experiments and materials saved'))
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const sortedLibrary = useMemo(
    () => [...library].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    [library]
  )

  if (loading) {
    return <p className="text-sm text-slate-500">{L('loadingLessonResources', 'Loading lesson resources…')}</p>
  }

  return (
    <div className="space-y-4 border-t border-slate-200 pt-4">
      <div>
        <h3 className="text-sm font-semibold text-bingo-dark">{L('lessonExperimentsTitle', 'Public library experiments')}</h3>
        <p className="text-xs text-slate-500 mt-1">{L('lessonExperimentsHint', 'Optional. Select experiments from the shared library to attach to this lesson.')}</p>
      </div>

      {error ? <AdminAlert variant="error">{error}</AdminAlert> : null}
      {success ? <AdminAlert variant="success">{success}</AdminAlert> : null}

      <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200 divide-y divide-slate-100">
        {sortedLibrary.length ? (
          sortedLibrary.map((exp) => (
            <label key={exp.id} className="flex items-start gap-3 px-3 py-2.5 cursor-pointer hover:bg-slate-50">
              <input
                type="checkbox"
                checked={selectedIds.includes(exp.id)}
                onChange={() => toggleExperiment(exp.id)}
                className="mt-1"
              />
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-800">{exp.title}</p>
                <p className="text-[11px] text-slate-400 font-mono">{exp.slug}</p>
              </div>
            </label>
          ))
        ) : (
          <p className="px-3 py-4 text-sm text-slate-500">{L('noPublicExperiments', 'No experiments in the public library yet.')}</p>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <h3 className="text-sm font-semibold text-bingo-dark">{L('lessonMaterialsTitle', 'Lesson materials')}</h3>
          <button type="button" onClick={addMaterial} className="text-xs font-semibold text-primary">
            + {L('addLessonMaterial', 'Add file')}
          </button>
        </div>
        <div className="space-y-2">
          {materials.map((row, index) => (
            <div key={index} className="grid sm:grid-cols-2 gap-2 items-start">
              <AdminField label={L('materialTitle', 'Title')} showBadge={false}>
                <input
                  className={inputClass}
                  value={row.title}
                  onChange={(e) => updateMaterial(index, 'title', e.target.value)}
                />
              </AdminField>
              <AdminField label={L('materialUrl', 'File URL')} showBadge={false}>
                <input
                  className={inputClass}
                  value={row.fileUrl}
                  onChange={(e) => updateMaterial(index, 'fileUrl', e.target.value)}
                  placeholder="https://…"
                />
              </AdminField>
              <button type="button" onClick={() => removeMaterial(index)} className="text-xs text-red-600 sm:col-span-2 text-left">
                {L('removeMaterial', 'Remove')}
              </button>
            </div>
          ))}
        </div>
      </div>

      <button type="button" disabled={saving} onClick={handleSave} className="btn-primary text-sm px-4 py-2 disabled:opacity-60">
        {saving ? L('saving', 'Saving…') : L('saveLessonResources', 'Save lesson resources')}
      </button>
    </div>
  )
}

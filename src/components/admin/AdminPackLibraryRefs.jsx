import { useEffect, useState } from 'react'
import { adminListExperiments, adminSavePackExperimentRefs } from '../../lib/ioaiExperimentsApi'

export default function AdminPackLibraryRefs({ packSlug, labels = {} }) {
  const L = (key, fallback) => labels[key] || fallback
  const [library, setLibrary] = useState([])
  const [selected, setSelected] = useState([])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    adminListExperiments()
      .then((res) => setLibrary(res.experiments || []))
      .catch(() => setLibrary([]))
  }, [])

  const toggle = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const save = async () => {
    setSaving(true)
    setMessage(null)
    try {
      await adminSavePackExperimentRefs(packSlug, selected)
      setMessage(L('packRefsSaved', 'Pack experiments updated from public library'))
    } catch (e) {
      setMessage(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="card p-4 space-y-3 border border-emerald-200/60 bg-emerald-50/20">
      <div>
        <h3 className="text-sm font-semibold text-bingo-dark">{L('packLibraryRefsTitle', 'Public library experiments')}</h3>
        <p className="text-xs text-slate-500 mt-1">
          {L('packLibraryRefsHint', 'Select experiments from the shared library for this pack. Saving replaces pack-local experiment refs.')}
        </p>
      </div>
      <div className="max-h-40 overflow-y-auto rounded-lg border border-slate-200 bg-white divide-y">
        {library.map((exp) => (
          <label key={exp.id} className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-slate-50">
            <input type="checkbox" checked={selected.includes(exp.id)} onChange={() => toggle(exp.id)} />
            <span className="truncate">{exp.title}</span>
            <span className="text-[10px] text-slate-400 font-mono ml-auto">{exp.slug}</span>
          </label>
        ))}
        {!library.length ? <p className="px-3 py-4 text-xs text-slate-500">{L('noPublicExperiments', 'No public experiments yet.')}</p> : null}
      </div>
      {message ? <p className="text-xs text-slate-600">{message}</p> : null}
      <button type="button" disabled={saving} onClick={save} className="btn-primary text-xs px-4 py-2 disabled:opacity-60">
        {saving ? L('saving', 'Saving…') : L('savePackRefs', 'Save library selection')}
      </button>
    </div>
  )
}

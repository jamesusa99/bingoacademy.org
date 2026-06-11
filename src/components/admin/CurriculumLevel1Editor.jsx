import { useState } from 'react'
import { COURSE_STATUS } from '../../config/coursesCatalog'
import AdminField from './AdminField'

const inputClass = 'w-full rounded-xl border border-slate-200 px-3 py-2 text-sm'

function statusOptions(labels) {
  return [
    { value: COURSE_STATUS.LIVE, label: labels.statusLive },
    { value: COURSE_STATUS.COMING_SOON, label: labels.statusComingSoon },
    { value: COURSE_STATUS.OFFLINE, label: labels.statusOffline },
  ]
}

/**
 * L1 stage editor — title, slug, emoji, summary, status, sort order.
 */
export default function CurriculumLevel1Editor({ level, labels, saving, onSave, onDelete, onClose }) {
  const [form, setForm] = useState(() => ({
    title: level.title || '',
    slug: level.slug || '',
    emoji: level.emoji || '',
    summary: level.summary || '',
    status: level.status || COURSE_STATUS.LIVE,
    sort_order: level.sort_order ?? 0,
  }))

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))
  const STATUS_OPTIONS = statusOptions(labels)

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(form)
  }

  return (
    <div className="card p-5 sm:p-6 border-2 border-primary/20 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-primary mb-1">{labels.colStage}</p>
          <h3 className="font-semibold text-bingo-dark">{level.title}</h3>
          <p className="text-[10px] font-mono text-slate-400 mt-0.5">{level.slug}</p>
        </div>
        <button type="button" onClick={onClose} className="text-xs text-slate-500 hover:text-slate-700">
          {labels.close}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AdminField label={labels.colStage} required>
            <input className={inputClass} value={form.title} onChange={(e) => set('title', e.target.value)} />
          </AdminField>
          <AdminField label={labels.phStageSlug}>
            <input
              className={`${inputClass} font-mono`}
              value={form.slug}
              onChange={(e) => set('slug', e.target.value)}
              placeholder={labels.phStageSlug}
            />
            {level.slug !== form.slug?.trim() ? (
              <p className="text-[10px] text-amber-700 mt-1">{labels.slugRenameStageHint}</p>
            ) : null}
          </AdminField>
          <AdminField label={labels.newStageEmoji}>
            <input className={inputClass} value={form.emoji} onChange={(e) => set('emoji', e.target.value)} />
          </AdminField>
          <AdminField label={labels.colStatus}>
            <select className={inputClass} value={form.status} onChange={(e) => set('status', e.target.value)}>
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </AdminField>
          <AdminField label={labels.colSortOrder}>
            <input
              type="number"
              className={inputClass}
              value={form.sort_order}
              onChange={(e) => set('sort_order', e.target.value)}
            />
          </AdminField>
          <AdminField label={labels.colStageSummary} className="sm:col-span-2 lg:col-span-3">
            <textarea
              className={`${inputClass} min-h-[80px]`}
              value={form.summary}
              onChange={(e) => set('summary', e.target.value)}
              placeholder={labels.phStageSummary}
            />
          </AdminField>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <button type="submit" disabled={saving} className="btn-primary text-sm px-4 py-2 disabled:opacity-60">
            {saving ? labels.saving : labels.saveStage}
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="text-sm px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50"
          >
            {labels.deleteStage}
          </button>
        </div>
      </form>
    </div>
  )
}

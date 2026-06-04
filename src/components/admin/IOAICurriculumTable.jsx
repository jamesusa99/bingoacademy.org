import { useMemo, useState } from 'react'
import { ExternalLink, Pencil, Video } from 'lucide-react'

const inputClass = 'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm'
const textareaClass = `${inputClass} min-h-[88px] resize-y`

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-600 block mb-1">{label}</label>
      {children}
    </div>
  )
}

export default function IOAICurriculumTable({ rows, loading, labels, onEditLesson, onAddCourse }) {
  const [stageFilter, setStageFilter] = useState('all')

  const stages = useMemo(() => {
    const seen = new Map()
    for (const row of rows) {
      if (!seen.has(row.stageSlug)) seen.set(row.stageSlug, row.stage)
    }
    return [...seen.entries()].map(([slug, title]) => ({ slug, title }))
  }, [rows])

  const visible = useMemo(() => {
    if (stageFilter === 'all') return rows
    return rows.filter((r) => r.stageSlug === stageFilter)
  }, [rows, stageFilter])

  if (loading) {
    return <p className="p-8 text-sm text-slate-500 text-center">{labels.loading}</p>
  }

  if (!rows.length) {
    return (
      <div className="p-8 text-center text-sm text-slate-500 space-y-4">
        <p>{labels.empty}</p>
        <p className="text-xs text-slate-400">{labels.emptyHint}</p>
        {onAddCourse ? (
          <button type="button" onClick={onAddCourse} className="btn-primary text-sm px-5 py-2.5">
            + {labels.addCourse}
          </button>
        ) : null}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setStageFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
            stageFilter === 'all' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'
          }`}
        >
          {labels.allStages}
        </button>
        {stages.map((s) => (
          <button
            key={s.slug}
            type="button"
            onClick={() => setStageFilter(s.slug)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              stageFilter === s.slug ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {s.title}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm min-w-[960px]">
          <thead className="bg-slate-50 text-left text-slate-600 border-b border-slate-200">
            <tr>
              <th className="p-3 font-semibold whitespace-nowrap">{labels.colStage}</th>
              <th className="p-3 font-semibold whitespace-nowrap">{labels.colModule}</th>
              <th className="p-3 font-semibold whitespace-nowrap">{labels.colCategory}</th>
              <th className="p-3 font-semibold whitespace-nowrap">{labels.colLesson}</th>
              <th className="p-3 font-semibold min-w-[140px]">{labels.colKnowledge}</th>
              <th className="p-3 font-semibold min-w-[160px]">{labels.colGoals}</th>
              <th className="p-3 font-semibold w-24">{labels.colVideo}</th>
              <th className="p-3 w-20" />
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr key={row.lessonId} className="border-t border-slate-100 hover:bg-slate-50/80 align-top">
                <td className="p-3 whitespace-nowrap">
                  <span className="text-xs text-slate-400 block">{row.stageEmoji}</span>
                  <span className="font-medium text-bingo-dark">{row.stage}</span>
                </td>
                <td className="p-3 text-slate-700">{row.module}</td>
                <td className="p-3">
                  <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">
                    {row.category}
                  </span>
                </td>
                <td className="p-3">
                  <p className="font-medium text-bingo-dark">{row.lessonTitle}</p>
                  <p className="text-[10px] font-mono text-slate-400 mt-0.5">{row.lessonSlug}</p>
                </td>
                <td className="p-3 text-xs text-slate-600">
                  {row.knowledgePoints ? (
                    <span className="line-clamp-3">{row.knowledgePoints}</span>
                  ) : (
                    <span className="text-slate-300 italic">{labels.notSet}</span>
                  )}
                </td>
                <td className="p-3 text-xs text-slate-600">
                  {row.contentGoals ? (
                    <span className="line-clamp-3">{row.contentGoals}</span>
                  ) : (
                    <span className="text-slate-300 italic">{labels.notSet}</span>
                  )}
                </td>
                <td className="p-3 text-xs">
                  {row.cloudflareVideoId ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                      <Video className="w-3.5 h-3.5" />
                      OK
                    </span>
                  ) : (
                    <span className="text-amber-600">{labels.noVideo}</span>
                  )}
                </td>
                <td className="p-3">
                  <button
                    type="button"
                    onClick={() => onEditLesson(row)}
                    className="inline-flex items-center gap-1 text-primary text-xs font-semibold hover:underline"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    {labels.edit}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function IOAILessonEditor({ row, labels, saving, onSave, onClose }) {
  const [form, setForm] = useState({
    title: row.lessonTitle || '',
    knowledge_points: row.knowledgePoints || '',
    content_goals: row.contentGoals || '',
    cloudflare_video_id: row.cloudflareVideoId || '',
    catalog_slug: row.catalogSlug || row.lessonSlug || '',
  })

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  return (
    <div className="card p-5 sm:p-6 border-2 border-primary/20 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-primary mb-1">
            {labels.editLesson}
          </p>
          <p className="text-sm text-slate-600">
            {row.stage} · {row.category} · {row.module}
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href={`/courses/detail/${form.catalog_slug || row.lessonSlug}?preview=1&from=admin`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            {labels.preview}
          </a>
          <button type="button" onClick={onClose} className="text-xs text-slate-500 hover:text-slate-700">
            {labels.close}
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label={labels.colStage}>
          <input className={inputClass} value={row.stage} readOnly disabled />
        </Field>
        <Field label={labels.colCategory}>
          <input className={inputClass} value={row.category} readOnly disabled />
        </Field>
        <Field label={labels.colModule}>
          <input className={inputClass} value={row.module} readOnly disabled />
        </Field>
        <Field label={labels.colLesson}>
          <input className={inputClass} value={form.title} onChange={(e) => set('title', e.target.value)} />
        </Field>
      </div>

      <Field label={labels.colKnowledge}>
        <textarea
          className={textareaClass}
          value={form.knowledge_points}
          onChange={(e) => set('knowledge_points', e.target.value)}
          placeholder={labels.phKnowledge}
        />
      </Field>

      <Field label={labels.colGoals}>
        <textarea
          className={textareaClass}
          value={form.content_goals}
          onChange={(e) => set('content_goals', e.target.value)}
          placeholder={labels.phGoals}
        />
      </Field>

      <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
        <Field label={labels.catalogSlug}>
          <input
            className={inputClass}
            value={form.catalog_slug}
            onChange={(e) => set('catalog_slug', e.target.value)}
          />
        </Field>
        <Field label={labels.cloudflareUid}>
          <input
            className={inputClass}
            value={form.cloudflare_video_id}
            onChange={(e) => set('cloudflare_video_id', e.target.value)}
            placeholder="Cloudflare Stream UID"
          />
        </Field>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
        >
          {labels.cancel}
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => onSave(form)}
          className="btn-primary px-5 py-2 text-sm disabled:opacity-60"
        >
          {saving ? labels.saving : labels.save}
        </button>
      </div>
    </div>
  )
}

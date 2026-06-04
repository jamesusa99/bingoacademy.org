import { useMemo } from 'react'
import { Plus } from 'lucide-react'
import CurriculumPathPicker, { CURRICULUM_NEW, curriculumInputClass } from './CurriculumPathPicker'
import { useAdminFormDraft } from '../../hooks/useAdminFormDraft'

const textareaClass = `${curriculumInputClass} min-h-[72px] resize-y`

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-600 block mb-1">{label}</label>
      {children}
    </div>
  )
}

const PATH_INIT = {
  stageChoice: '',
  themeChoice: '',
  moduleChoice: '',
  newStage: { title: '', slug: '', emoji: '🟢' },
  newTheme: { title: '', slug: '', category_label: '' },
  newModule: { title: '', slug: '' },
}

const FORM_INIT = {
  path: PATH_INIT,
  lessonTitle: '',
  lessonSlug: '',
  knowledgePoints: '',
  contentGoals: '',
  cloudflareUid: '',
  syncCatalog: true,
}

export default function IOAIAddCourseForm({
  productLine = 'ioai',
  levels,
  labels,
  saving,
  onSave,
  onClose,
  videoAssets = [],
}) {
  const draftKey = `admin-curriculum-add-${productLine}`
  const [form, setForm] = useAdminFormDraft(draftKey, FORM_INIT)

  const setPath = (path) => setForm((f) => ({ ...f, path }))
  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const groupedVideoOptions = useMemo(() => {
    const groups = new Map()
    for (const asset of videoAssets.filter((a) => a.cloudflare_uid)) {
      const key = asset.product_line || 'other'
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key).push(asset)
    }
    return groups
  }, [videoAssets])

  const handleSubmit = () => {
    const { path } = form
    onSave({
      levelId: path.stageChoice !== CURRICULUM_NEW ? path.stageChoice : null,
      newLevel: path.stageChoice === CURRICULUM_NEW ? path.newStage : null,
      themeId: path.themeChoice !== CURRICULUM_NEW ? path.themeChoice : null,
      newTheme: path.themeChoice === CURRICULUM_NEW ? path.newTheme : null,
      moduleId: path.moduleChoice !== CURRICULUM_NEW ? path.moduleChoice : null,
      newModule: path.moduleChoice === CURRICULUM_NEW ? path.newModule : null,
      lessonTitle: form.lessonTitle,
      lessonSlug: form.lessonSlug.trim() || undefined,
      knowledge_points: form.knowledgePoints,
      content_goals: form.contentGoals,
      cloudflare_video_id: form.cloudflareUid,
      syncCatalog: form.syncCatalog,
    })
  }

  const handleClose = () => {
    onClose()
  }

  return (
    <div className="card p-5 sm:p-6 border-2 border-emerald-200/80 bg-emerald-50/30 space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-700 mb-1 flex items-center gap-1">
            <Plus className="w-3.5 h-3.5" />
            {labels.addCourseTitle}
          </p>
          <p className="text-sm text-slate-600">{labels.addCourseDesc}</p>
          <p className="text-[10px] text-slate-400 mt-1">{labels.draftHint}</p>
        </div>
        <button type="button" onClick={handleClose} className="text-xs text-slate-500 hover:text-slate-700">
          {labels.close}
        </button>
      </div>

      <CurriculumPathPicker levels={levels} labels={labels} value={form.path} onChange={setPath} />

      <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
        <Field label={labels.colLesson}>
          <input
            className={curriculumInputClass}
            value={form.lessonTitle}
            onChange={(e) => setField('lessonTitle', e.target.value)}
            placeholder={labels.phLessonTitle}
          />
        </Field>
        <Field label={labels.lessonSlug}>
          <input
            className={curriculumInputClass}
            value={form.lessonSlug}
            onChange={(e) => setField('lessonSlug', e.target.value)}
            placeholder={labels.phLessonSlug}
          />
        </Field>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label={labels.colKnowledge}>
          <textarea
            className={textareaClass}
            value={form.knowledgePoints}
            onChange={(e) => setField('knowledgePoints', e.target.value)}
            placeholder={labels.phKnowledge}
          />
        </Field>
        <Field label={labels.colGoals}>
          <textarea
            className={textareaClass}
            value={form.contentGoals}
            onChange={(e) => setField('contentGoals', e.target.value)}
            placeholder={labels.phGoals}
          />
        </Field>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 items-end">
        <Field label={labels.cloudflareUid}>
          <input
            className={curriculumInputClass}
            value={form.cloudflareUid}
            onChange={(e) => setField('cloudflareUid', e.target.value)}
            placeholder="Cloudflare Stream UID"
          />
        </Field>
        {groupedVideoOptions.size > 0 ? (
          <Field label={labels.pickFromVideoLibrary}>
            <select
              className={curriculumInputClass}
              defaultValue=""
              onChange={(e) => {
                const asset = videoAssets.find((a) => a.id === e.target.value)
                if (asset?.cloudflare_uid) setField('cloudflareUid', asset.cloudflare_uid)
              }}
            >
              <option value="">{labels.pickVideoPlaceholder}</option>
              {[...groupedVideoOptions.entries()].map(([line, assets]) => (
                <optgroup key={line} label={line === 'other' ? labels.unclassifiedVideos : line.toUpperCase()}>
                  {assets.map((asset) => (
                    <option key={asset.id} value={asset.id}>
                      {asset.stage_title ? `${asset.stage_title} · ${asset.category_label || ''} · ` : ''}
                      {asset.title}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </Field>
        ) : (
          <label className="flex items-center gap-2 text-sm text-slate-600 pb-2">
            <input
              type="checkbox"
              checked={form.syncCatalog}
              onChange={(e) => setField('syncCatalog', e.target.checked)}
              className="rounded border-slate-300"
            />
            {labels.syncCatalog}
          </label>
        )}
      </div>

      {groupedVideoOptions.size > 0 ? (
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={form.syncCatalog}
            onChange={(e) => setField('syncCatalog', e.target.checked)}
            className="rounded border-slate-300"
          />
          {labels.syncCatalog}
        </label>
      ) : null}

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={handleClose}
          className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
        >
          {labels.cancel}
        </button>
        <button
          type="button"
          disabled={saving || !form.lessonTitle.trim()}
          onClick={handleSubmit}
          className="btn-primary px-5 py-2 text-sm disabled:opacity-60 inline-flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          {saving ? labels.saving : labels.addCourse}
        </button>
      </div>
    </div>
  )
}

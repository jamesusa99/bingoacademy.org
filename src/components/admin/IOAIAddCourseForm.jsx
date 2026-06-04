import { useEffect, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'

const inputClass = 'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm'
const textareaClass = `${inputClass} min-h-[72px] resize-y`

const NEW = '__new__'

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-600 block mb-1">{label}</label>
      {children}
    </div>
  )
}

function sortByOrder(rows) {
  return [...(rows || [])].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
}

export default function IOAIAddCourseForm({ levels, labels, saving, onSave, onClose, videoAssets = [] }) {
  const [stageChoice, setStageChoice] = useState('')
  const [themeChoice, setThemeChoice] = useState('')
  const [moduleChoice, setModuleChoice] = useState('')
  const [newStage, setNewStage] = useState({ title: '', slug: '', emoji: '🟢' })
  const [newTheme, setNewTheme] = useState({ title: '', slug: '', category_label: '' })
  const [newModule, setNewModule] = useState({ title: '', slug: '' })
  const [lessonTitle, setLessonTitle] = useState('')
  const [lessonSlug, setLessonSlug] = useState('')
  const [knowledgePoints, setKnowledgePoints] = useState('')
  const [contentGoals, setContentGoals] = useState('')
  const [cloudflareUid, setCloudflareUid] = useState('')
  const [syncCatalog, setSyncCatalog] = useState(true)

  const sortedLevels = useMemo(() => sortByOrder(levels), [levels])

  useEffect(() => {
    if (!stageChoice && sortedLevels.length === 0) {
      setStageChoice(NEW)
    } else if (!stageChoice && sortedLevels.length > 0) {
      setStageChoice(sortedLevels[0].id)
    }
  }, [sortedLevels, stageChoice])

  const selectedLevel = useMemo(
    () => sortedLevels.find((l) => l.id === stageChoice),
    [sortedLevels, stageChoice]
  )

  const themes = useMemo(() => sortByOrder(selectedLevel?.themes), [selectedLevel])

  useEffect(() => {
    if (stageChoice === NEW) {
      setThemeChoice(NEW)
      return
    }
    if (themes.length === 0) {
      setThemeChoice(NEW)
      return
    }
    setThemeChoice((current) => {
      if (current === NEW) return NEW
      if (themes.some((t) => t.id === current)) return current
      return themes[0].id
    })
  }, [stageChoice, themes])

  const selectedTheme = useMemo(
    () => themes.find((t) => t.id === themeChoice),
    [themes, themeChoice]
  )

  const modules = useMemo(() => sortByOrder(selectedTheme?.modules), [selectedTheme])

  useEffect(() => {
    if (themeChoice === NEW) {
      setModuleChoice(NEW)
      return
    }
    if (modules.length === 0) {
      setModuleChoice(NEW)
      return
    }
    setModuleChoice((current) => {
      if (current === NEW) return NEW
      if (modules.some((m) => m.id === current)) return current
      return modules[0].id
    })
  }, [themeChoice, modules])

  const handleSubmit = () => {
    onSave({
      levelId: stageChoice !== NEW ? stageChoice : null,
      newLevel: stageChoice === NEW ? newStage : null,
      themeId: themeChoice !== NEW ? themeChoice : null,
      newTheme: themeChoice === NEW ? newTheme : null,
      moduleId: moduleChoice !== NEW ? moduleChoice : null,
      newModule: moduleChoice === NEW ? newModule : null,
      lessonTitle,
      lessonSlug: lessonSlug.trim() || undefined,
      knowledge_points: knowledgePoints,
      content_goals: contentGoals,
      cloudflare_video_id: cloudflareUid,
      syncCatalog,
    })
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
        </div>
        <button type="button" onClick={onClose} className="text-xs text-slate-500 hover:text-slate-700">
          {labels.close}
        </button>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Field label={labels.colStage}>
          <select
            className={inputClass}
            value={stageChoice}
            onChange={(e) => setStageChoice(e.target.value)}
          >
            {sortedLevels.map((l) => (
              <option key={l.id} value={l.id}>
                {l.emoji ? `${l.emoji} ` : ''}
                {l.title}
              </option>
            ))}
            <option value={NEW}>{labels.newStage}</option>
          </select>
        </Field>

        <Field label={labels.colCategory}>
          <select
            className={inputClass}
            value={themeChoice}
            onChange={(e) => setThemeChoice(e.target.value)}
          >
            {stageChoice !== NEW &&
              themes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.category_label || t.title}
                </option>
              ))}
            <option value={NEW}>{labels.newCategory}</option>
          </select>
        </Field>

        <Field label={labels.colModule}>
          <select
            className={inputClass}
            value={moduleChoice}
            onChange={(e) => setModuleChoice(e.target.value)}
          >
            {themeChoice !== NEW &&
              modules.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            <option value={NEW}>{labels.newModule}</option>
          </select>
        </Field>
      </div>

      {stageChoice === NEW ? (
        <div className="grid sm:grid-cols-3 gap-4 p-4 rounded-lg bg-white border border-slate-200">
          <Field label={labels.newStageTitle}>
            <input
              className={inputClass}
              value={newStage.title}
              onChange={(e) => setNewStage((s) => ({ ...s, title: e.target.value }))}
              placeholder={labels.phStageTitle}
            />
          </Field>
          <Field label={labels.newStageSlug}>
            <input
              className={inputClass}
              value={newStage.slug}
              onChange={(e) => setNewStage((s) => ({ ...s, slug: e.target.value }))}
              placeholder="intro"
            />
          </Field>
          <Field label={labels.newStageEmoji}>
            <input
              className={inputClass}
              value={newStage.emoji}
              onChange={(e) => setNewStage((s) => ({ ...s, emoji: e.target.value }))}
              placeholder="🟢"
            />
          </Field>
        </div>
      ) : null}

      {themeChoice === NEW ? (
        <div className="grid sm:grid-cols-3 gap-4 p-4 rounded-lg bg-white border border-slate-200">
          <Field label={labels.newCategoryTitle}>
            <input
              className={inputClass}
              value={newTheme.title}
              onChange={(e) => setNewTheme((s) => ({ ...s, title: e.target.value }))}
              placeholder={labels.phCategoryTitle}
            />
          </Field>
          <Field label={labels.newCategoryLabel}>
            <input
              className={inputClass}
              value={newTheme.category_label}
              onChange={(e) => setNewTheme((s) => ({ ...s, category_label: e.target.value }))}
              placeholder={labels.phCategoryLabel}
            />
          </Field>
          <Field label={labels.newCategorySlug}>
            <input
              className={inputClass}
              value={newTheme.slug}
              onChange={(e) => setNewTheme((s) => ({ ...s, slug: e.target.value }))}
              placeholder="math"
            />
          </Field>
        </div>
      ) : null}

      {moduleChoice === NEW ? (
        <div className="grid sm:grid-cols-2 gap-4 p-4 rounded-lg bg-white border border-slate-200">
          <Field label={labels.newModuleTitle}>
            <input
              className={inputClass}
              value={newModule.title}
              onChange={(e) => setNewModule((s) => ({ ...s, title: e.target.value }))}
              placeholder={labels.phModuleTitle}
            />
          </Field>
          <Field label={labels.newModuleSlug}>
            <input
              className={inputClass}
              value={newModule.slug}
              onChange={(e) => setNewModule((s) => ({ ...s, slug: e.target.value }))}
              placeholder="part-1-linear-algebra"
            />
          </Field>
        </div>
      ) : null}

      <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
        <Field label={labels.colLesson}>
          <input
            className={inputClass}
            value={lessonTitle}
            onChange={(e) => setLessonTitle(e.target.value)}
            placeholder={labels.phLessonTitle}
          />
        </Field>
        <Field label={labels.lessonSlug}>
          <input
            className={inputClass}
            value={lessonSlug}
            onChange={(e) => setLessonSlug(e.target.value)}
            placeholder={labels.phLessonSlug}
          />
        </Field>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label={labels.colKnowledge}>
          <textarea
            className={textareaClass}
            value={knowledgePoints}
            onChange={(e) => setKnowledgePoints(e.target.value)}
            placeholder={labels.phKnowledge}
          />
        </Field>
        <Field label={labels.colGoals}>
          <textarea
            className={textareaClass}
            value={contentGoals}
            onChange={(e) => setContentGoals(e.target.value)}
            placeholder={labels.phGoals}
          />
        </Field>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 items-end">
        <Field label={labels.cloudflareUid}>
          <input
            className={inputClass}
            value={cloudflareUid}
            onChange={(e) => setCloudflareUid(e.target.value)}
            placeholder="Cloudflare Stream UID"
          />
        </Field>
        {videoAssets.filter((a) => a.cloudflare_uid).length > 0 ? (
          <Field label={labels.pickFromVideoLibrary}>
            <select
              className={inputClass}
              defaultValue=""
              onChange={(e) => {
                const asset = videoAssets.find((a) => a.id === e.target.value)
                if (asset?.cloudflare_uid) setCloudflareUid(asset.cloudflare_uid)
              }}
            >
              <option value="">{labels.pickVideoPlaceholder}</option>
              {videoAssets
                .filter((a) => a.cloudflare_uid)
                .map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.title}
                  </option>
                ))}
            </select>
          </Field>
        ) : (
          <label className="flex items-center gap-2 text-sm text-slate-600 pb-2">
            <input
              type="checkbox"
              checked={syncCatalog}
              onChange={(e) => setSyncCatalog(e.target.checked)}
              className="rounded border-slate-300"
            />
            {labels.syncCatalog}
          </label>
        )}
      </div>

      {videoAssets.filter((a) => a.cloudflare_uid).length > 0 ? (
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={syncCatalog}
            onChange={(e) => setSyncCatalog(e.target.checked)}
            className="rounded border-slate-300"
          />
          {labels.syncCatalog}
        </label>
      ) : null}

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
          disabled={saving || !lessonTitle.trim()}
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

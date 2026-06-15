import { Plus } from 'lucide-react'
import CurriculumPathPicker, { CURRICULUM_NEW, curriculumInputClass } from './CurriculumPathPicker'
import CurriculumCatalogFields, { CATALOG_FORM_DEFAULTS } from './CurriculumCatalogFields'
import CurriculumVideoUpload from './CurriculumVideoUpload'
import AdminField from './AdminField'
import { useAdminFormDraft } from '../../hooks/useAdminFormDraft'
import { DEFAULT_ADMIN_PRODUCT_LINE } from '../../config/programCurriculum'

const textareaClass = `${curriculumInputClass} min-h-[72px] resize-y`

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
  ...CATALOG_FORM_DEFAULTS,
}

export default function IOAIAddCourseForm({
  productLine = DEFAULT_ADMIN_PRODUCT_LINE,
  levels,
  levelsLoading = false,
  labels,
  saving,
  onSave,
  onClose,
}) {
  const draftKey = `admin-curriculum-add-${productLine}`
  const [form, setForm] = useAdminFormDraft(draftKey, FORM_INIT, { mergePathKey: 'path' })

  const setPath = (path) => setForm((f) => ({ ...f, path }))
  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = () => {
    const { path } = form
    const isNew = (choice) => choice === CURRICULUM_NEW

    if (isNew(path.stageChoice) && !path.newStage?.title?.trim()) {
      window.alert(labels.phStageTitle || '请填写阶段名称，或从下拉框选择已有阶段')
      return
    }
    if (isNew(path.themeChoice) && !path.newTheme?.title?.trim() && !path.newTheme?.category_label?.trim()) {
      window.alert(labels.phCategoryTitle || '请填写类别名称，或选择已有类别')
      return
    }
    if (isNew(path.moduleChoice) && !path.newModule?.title?.trim()) {
      window.alert(labels.phModuleTitle || '请填写模块名称，或选择已有模块')
      return
    }

    onSave({
      levelId: !isNew(path.stageChoice) ? path.stageChoice : null,
      newLevel: isNew(path.stageChoice) ? path.newStage : null,
      themeId: !isNew(path.themeChoice) ? path.themeChoice : null,
      newTheme: isNew(path.themeChoice) ? path.newTheme : null,
      moduleId: !isNew(path.moduleChoice) ? path.moduleChoice : null,
      newModule: isNew(path.moduleChoice) ? path.newModule : null,
      lessonTitle: form.lessonTitle,
      lessonSlug: form.lessonSlug.trim() || undefined,
      knowledge_points: form.knowledgePoints,
      content_goals: form.contentGoals,
      cloudflare_video_id: form.cloudflareUid,
      syncCatalog: form.syncCatalog,
      status: form.status,
      price: form.price,
      price_cents: form.price_cents,
      currency: form.currency,
      sort_order: form.sort_order,
      rating: form.rating,
      students: form.students,
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
          <p className="text-[10px] text-slate-400 mt-1">{labels.draftHint}</p>
        </div>
        <button type="button" onClick={onClose} className="text-xs text-slate-500 hover:text-slate-700">
          {labels.close}
        </button>
      </div>

      <CurriculumPathPicker
        levels={levels}
        levelsLoading={levelsLoading}
        labels={labels}
        value={form.path}
        onChange={setPath}
      />

      <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
        <AdminField label={labels.colLesson} required>
          <input
            className={curriculumInputClass}
            value={form.lessonTitle}
            onChange={(e) => setField('lessonTitle', e.target.value)}
            placeholder={labels.phLessonTitle}
          />
        </AdminField>
        <AdminField label={labels.lessonSlug}>
          <input
            className={curriculumInputClass}
            value={form.lessonSlug}
            onChange={(e) => setField('lessonSlug', e.target.value)}
            placeholder={labels.phLessonSlug}
          />
        </AdminField>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <AdminField label={labels.colKnowledge}>
          <textarea
            className={textareaClass}
            value={form.knowledgePoints}
            onChange={(e) => setField('knowledgePoints', e.target.value)}
            placeholder={labels.phKnowledge}
          />
        </AdminField>
        <AdminField label={labels.colGoals}>
          <textarea
            className={textareaClass}
            value={form.contentGoals}
            onChange={(e) => setField('contentGoals', e.target.value)}
            placeholder={labels.phGoals}
          />
        </AdminField>
      </div>

      <CurriculumVideoUpload
        productLine={productLine}
        levels={levels}
        path={form.path}
        lessonTitle={form.lessonTitle}
        catalogSlug={form.lessonSlug.trim() || undefined}
        cloudflareUid={form.cloudflareUid}
        onUidChange={(uid) => setField('cloudflareUid', uid)}
        labels={labels}
        disabled={saving}
      />

      <label className="flex items-center gap-2 text-sm text-slate-600">
        <input
          type="checkbox"
          checked={form.syncCatalog}
          onChange={(e) => setField('syncCatalog', e.target.checked)}
          className="rounded border-slate-300"
        />
        {labels.syncCatalog}
      </label>

      <CurriculumCatalogFields form={form} setForm={setForm} labels={labels} />

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
          disabled={saving || !form.lessonTitle.trim()}
          onClick={handleSubmit}
          className="btn-primary px-5 py-2 text-sm disabled:opacity-60 inline-flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          {saving ? labels.saving : labels.saveCourse}
        </button>
      </div>
    </div>
  )
}

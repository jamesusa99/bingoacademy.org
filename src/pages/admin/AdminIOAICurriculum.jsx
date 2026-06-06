import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminAlert from '../../components/admin/AdminAlert'
import IOAICurriculumTable, { IOAILessonEditor } from '../../components/admin/IOAICurriculumTable'
import IOAIAddCourseForm from '../../components/admin/IOAIAddCourseForm'
import { ADMIN_LABS_MATERIALS_PATH } from '../../config/adminNav'
import { getProgramCurriculum, isCurriculumLine } from '../../config/programCurriculum'
import {
  createProgramCourse,
  fetchCurriculumAdmin,
  saveProgramLessonConfig,
} from '../../lib/ioaiCurriculumAdmin'
import { readAdminUiDraft, writeAdminUiDraft, clearAdminUiDraft } from '../../hooks/useAdminFormDraft'
import { useAdminCrud } from '../../hooks/useAdminCrud'

export default function AdminIOAICurriculum() {
  const { line: lineParam = 'ioai' } = useParams()
  const productLine = isCurriculumLine(lineParam) ? lineParam : 'ioai'
  const config = getProgramCurriculum(productLine)
  const c = useAdminCrud()
  const [rows, setRows] = useState([])
  const [levels, setLevels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [editingRow, setEditingRow] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const editorRef = useRef(null)

  const i18nRoot = `pages.${config.i18nKey}`

  const labels = useMemo(
    () => ({
      loading: c.t(`${i18nRoot}.loading`),
      empty: c.t(`${i18nRoot}.empty`),
      emptyHint: c.t(`${i18nRoot}.emptyHint`),
      allStages: c.t(`${i18nRoot}.allStages`),
      colStage: c.t(`${i18nRoot}.colStage`),
      colModule: c.t(`${i18nRoot}.colModule`),
      colCategory: c.t(`${i18nRoot}.colCategory`),
      colLesson: c.t(`${i18nRoot}.colLesson`),
      colKnowledge: c.t(`${i18nRoot}.colKnowledge`),
      colGoals: c.t(`${i18nRoot}.colGoals`),
      colVideo: c.t(`${i18nRoot}.colVideo`),
      colStatus: c.t(`${i18nRoot}.colStatus`),
      colPrice: c.t(`${i18nRoot}.colPrice`),
      colSortOrder: c.t(`${i18nRoot}.colSortOrder`),
      colPriceCents: c.t(`${i18nRoot}.colPriceCents`),
      colCurrency: c.t(`${i18nRoot}.colCurrency`),
      colRating: c.t(`${i18nRoot}.colRating`),
      colStudents: c.t(`${i18nRoot}.colStudents`),
      catalogSectionTitle: c.t(`${i18nRoot}.catalogSectionTitle`),
      statusLive: c.t('pages.coursesCatalog.statusLive'),
      statusComingSoon: c.t('pages.coursesCatalog.statusComingSoon'),
      notSet: c.t(`${i18nRoot}.notSet`),
      noVideo: c.t(`${i18nRoot}.noVideo`),
      edit: c.t(`${i18nRoot}.edit`),
      editLesson: c.t(`${i18nRoot}.editLesson`),
      preview: c.t(`${i18nRoot}.preview`),
      close: c.t(`${i18nRoot}.close`),
      cancel: c.t(`${i18nRoot}.cancel`),
      save: c.t(`${i18nRoot}.save`),
      saving: c.saving,
      phKnowledge: c.t(`${i18nRoot}.phKnowledge`),
      phGoals: c.t(`${i18nRoot}.phGoals`),
      catalogSlug: c.t(`${i18nRoot}.catalogSlug`),
      cloudflareUid: c.t(`${i18nRoot}.cloudflareUid`),
      cloudflareUidPlaceholder: c.t(`${i18nRoot}.cloudflareUidPlaceholder`),
      phPrice: c.t(`${i18nRoot}.phPrice`),
      phPriceCents: c.t(`${i18nRoot}.phPriceCents`),
      phCurrency: c.t(`${i18nRoot}.phCurrency`),
      phStageSlug: c.t(`${i18nRoot}.phStageSlug`),
      phCategorySlug: c.t(`${i18nRoot}.phCategorySlug`),
      phModuleSlugExample: c.t(`${i18nRoot}.phModuleSlugExample`),
      videoOk: c.t(`${i18nRoot}.videoOk`),
      addCourse: c.t(`${i18nRoot}.addCourse`),
      addCourseTitle: c.t(`${i18nRoot}.addCourseTitle`),
      addCourseDesc: c.t(`${i18nRoot}.addCourseDesc`),
      newStage: c.t(`${i18nRoot}.newStage`),
      newCategory: c.t(`${i18nRoot}.newCategory`),
      newModule: c.t(`${i18nRoot}.newModule`),
      newStageTitle: c.t(`${i18nRoot}.newStageTitle`),
      newStageSlug: c.t(`${i18nRoot}.newStageSlug`),
      newStageEmoji: c.t(`${i18nRoot}.newStageEmoji`),
      newCategoryTitle: c.t(`${i18nRoot}.newCategoryTitle`),
      newCategoryLabel: c.t(`${i18nRoot}.newCategoryLabel`),
      newCategorySlug: c.t(`${i18nRoot}.newCategorySlug`),
      newModuleTitle: c.t(`${i18nRoot}.newModuleTitle`),
      newModuleSlug: c.t(`${i18nRoot}.newModuleSlug`),
      lessonSlug: c.t(`${i18nRoot}.lessonSlug`),
      syncCatalog: c.t(`${i18nRoot}.syncCatalog`),
      phStageTitle: c.t(`${i18nRoot}.phStageTitle`),
      phCategoryTitle: c.t(`${i18nRoot}.phCategoryTitle`),
      phCategoryLabel: c.t(`${i18nRoot}.phCategoryLabel`),
      phModuleTitle: c.t(`${i18nRoot}.phModuleTitle`),
      phLessonTitle: c.t(`${i18nRoot}.phLessonTitle`),
      phLessonSlug: c.t(`${i18nRoot}.phLessonSlug`),
      courseAdded: c.t(`${i18nRoot}.courseAdded`),
      draftHint: c.t(`${i18nRoot}.draftHint`),
      pathSummaryTitle: c.t(`${i18nRoot}.pathSummaryTitle`),
      pathSummaryEmpty: c.t(`${i18nRoot}.pathSummaryEmpty`),
      uploadVideo: c.t(`${i18nRoot}.uploadVideo`),
      chooseVideoFile: c.t(`${i18nRoot}.chooseVideoFile`),
      replaceVideo: c.t(`${i18nRoot}.replaceVideo`),
      uploadingVideoPct: c.t(`${i18nRoot}.uploadingVideoPct`),
      videoUploadWorking: c.t(`${i18nRoot}.videoUploadWorking`),
      videoUploadReady: c.t(`${i18nRoot}.videoUploadReady`),
      videoUploadHint: c.t(`${i18nRoot}.videoUploadHint`),
      videoAttached: c.t(`${i18nRoot}.videoAttached`),
      noVideoAttached: c.t(`${i18nRoot}.noVideoAttached`),
      removeVideo: c.t(`${i18nRoot}.removeVideo`),
      previewVideo: c.t(`${i18nRoot}.previewVideo`),
      hidePreview: c.t(`${i18nRoot}.hidePreview`),
      localPreview: c.t(`${i18nRoot}.localPreview`),
      videoPreviewProcessing: c.t(`${i18nRoot}.videoPreviewProcessing`),
      videoPreviewRefresh: c.t(`${i18nRoot}.videoPreviewRefresh`),
      videoFileMeta: c.t(`${i18nRoot}.videoFileMeta`),
      videoDurationTooLong: c.t(`${i18nRoot}.videoDurationTooLong`),
    }),
    [c, i18nRoot]
  )

  const uiKey = `admin-curriculum-ui-${productLine}`

  useEffect(() => {
    const ui = readAdminUiDraft(uiKey)
    if (ui?.showAddForm) setShowAddForm(true)
  }, [uiKey])

  useEffect(() => {
    if (!rows.length || editingRow) return
    const ui = readAdminUiDraft(uiKey)
    if (!ui?.editingLessonId) return
    const row = rows.find((r) => r.lessonId === ui.editingLessonId)
    if (row) setEditingRow(row)
  }, [rows, uiKey, editingRow])

  useEffect(() => {
    if (!editingRow?.lessonId || !rows.length) return
    const fresh = rows.find((r) => r.lessonId === editingRow.lessonId)
    if (!fresh) return
    if (
      fresh.cloudflareVideoId !== editingRow.cloudflareVideoId ||
      fresh.lessonTitle !== editingRow.lessonTitle ||
      fresh.knowledgePoints !== editingRow.knowledgePoints
    ) {
      setEditingRow(fresh)
    }
  }, [rows, editingRow?.lessonId])

  useEffect(() => {
    writeAdminUiDraft(uiKey, {
      showAddForm,
      editingLessonId: editingRow?.lessonId || null,
    })
  }, [showAddForm, editingRow, uiKey])

  const closeEditor = () => {
    writeAdminUiDraft(uiKey, { showAddForm, editingLessonId: null })
    setEditingRow(null)
  }

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { rows: next, levels: tree } = await fetchCurriculumAdmin(productLine)
      setRows(next)
      setLevels(tree)
    } catch (e) {
      setError(e.message)
      setRows([])
      setLevels([])
    } finally {
      setLoading(false)
    }
  }, [productLine])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    const refreshIfVisible = () => {
      if (document.visibilityState === 'visible') load()
    }
    window.addEventListener('focus', refreshIfVisible)
    document.addEventListener('visibilitychange', refreshIfVisible)
    return () => {
      window.removeEventListener('focus', refreshIfVisible)
      document.removeEventListener('visibilitychange', refreshIfVisible)
    }
  }, [load])

  useEffect(() => {
    if (editingRow && editorRef.current) {
      editorRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [editingRow?.lessonId])

  if (!isCurriculumLine(lineParam)) {
    return <Navigate to="/admin/curriculum/ioai" replace />
  }

  const handleSave = async (form) => {
    if (!editingRow) return
    setSaving(true)
    setError(null)
    try {
      await saveProgramLessonConfig(productLine, editingRow.lessonId, form)
      setSuccess(c.t(`${i18nRoot}.saved`))
      setEditingRow(null)
      sessionStorage.removeItem(`admin-curriculum-edit-${editingRow.lessonId}`)
      clearAdminUiDraft(uiKey)
      await load()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleAddCourse = async (form) => {
    setSaving(true)
    setError(null)
    try {
      await createProgramCourse(productLine, form)
      setSuccess(c.t(`${i18nRoot}.courseAdded`))
      setShowAddForm(false)
      sessionStorage.removeItem(`admin-curriculum-add-${productLine}`)
      clearAdminUiDraft(uiKey)
      await load()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader titleKey={`${i18nRoot}.title`} descriptionKey={`${i18nRoot}.desc`} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3 text-sm">
          <Link to={ADMIN_LABS_MATERIALS_PATH} className="text-primary hover:underline">
            ← {c.t(`${i18nRoot}.backCatalog`)}
          </Link>
          <Link to={config.frontendPath} target="_blank" rel="noreferrer" className="text-slate-600 hover:text-primary">
            {c.t(`${i18nRoot}.viewFrontend`)} ↗
          </Link>
        </div>
        {!showAddForm && !editingRow ? (
          <button
            type="button"
            onClick={() => {
              setShowAddForm(true)
              setEditingRow(null)
              setSuccess(null)
            }}
            className="btn-primary text-sm px-4 py-2 min-h-[40px]"
          >
            + {c.t(`${i18nRoot}.addCourse`)}
          </button>
        ) : null}
      </div>

      {error ? (
        <AdminAlert variant="error">
          {error.includes('does not exist') ? c.t(`${i18nRoot}.migrationHint`) : error}
        </AdminAlert>
      ) : null}
      {success ? <AdminAlert variant="success">{success}</AdminAlert> : null}

      <div className={`card p-4 sm:p-5 border ${config.bannerClass}`}>
        <p className={`text-xs font-bold uppercase tracking-wide mb-2 ${config.bannerTextClass}`}>
          {c.t(`${i18nRoot}.structureTitle`)}
        </p>
        <p className={`text-sm ${config.bannerBodyClass}`}>{c.t(`${i18nRoot}.structureDesc`)}</p>
      </div>

      {showAddForm ? (
        <IOAIAddCourseForm
          productLine={productLine}
          levels={levels}
          labels={labels}
          saving={saving}
          onSave={handleAddCourse}
          onClose={() => setShowAddForm(false)}
        />
      ) : null}

      {editingRow ? (
        <div ref={editorRef} className="scroll-mt-24">
          <IOAILessonEditor
            key={editingRow.lessonId}
            row={editingRow}
            productLine={productLine}
            levels={levels}
            labels={labels}
            saving={saving}
            onSave={handleSave}
            onClose={closeEditor}
          />
        </div>
      ) : null}

      <IOAICurriculumTable
        rows={rows}
        loading={loading}
        labels={labels}
        onEditLesson={(row) => {
          setShowAddForm(false)
          setEditingRow(row)
        }}
        onAddCourse={() => {
          setEditingRow(null)
          setShowAddForm(true)
        }}
      />
    </div>
  )
}

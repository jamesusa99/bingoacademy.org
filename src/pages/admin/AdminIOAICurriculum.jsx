import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminAlert from '../../components/admin/AdminAlert'
import IOAICurriculumTable, { IOAILessonEditor, ProgramModuleEditor } from '../../components/admin/IOAICurriculumTable'
import IOAIAddCourseForm from '../../components/admin/IOAIAddCourseForm'
import { ADMIN_LABS_MATERIALS_PATH } from '../../config/adminNav'
import { DEFAULT_ADMIN_PRODUCT_LINE, getProgramCurriculum, isCurriculumLine } from '../../config/programCurriculum'
import { filterLabMaterialsForModule } from '../../config/labMaterials'
import { isLabMaterialsCatalogRow } from '../../lib/catalogCourse'
import { reorderScopedCatalogItems } from '../../lib/admin/catalog'
import { supabase } from '../../lib/supabase'
import {
  createProgramCourse,
  deleteProgramLesson,
  deleteProgramModule,
  fetchCurriculumAdmin,
  reorderModuleLessons,
  saveProgramLessonConfig,
  saveProgramModuleConfig,
} from '../../lib/ioaiCurriculumAdmin'
import { readAdminUiDraft, writeAdminUiDraft, clearAdminUiDraft } from '../../hooks/useAdminFormDraft'
import { useAdminCrud } from '../../hooks/useAdminCrud'

export default function AdminIOAICurriculum() {
  const { line: lineParam = DEFAULT_ADMIN_PRODUCT_LINE } = useParams()
  const productLine = isCurriculumLine(lineParam) ? lineParam : DEFAULT_ADMIN_PRODUCT_LINE
  const config = getProgramCurriculum(productLine)
  const c = useAdminCrud()
  const [rows, setRows] = useState([])
  const [moduleGroups, setModuleGroups] = useState([])
  const [levels, setLevels] = useState([])
  const [initialLoading, setInitialLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const hasLoadedOnceRef = useRef(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [editingRow, setEditingRow] = useState(null)
  const [editingModule, setEditingModule] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [addFormKey, setAddFormKey] = useState('new')
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [deletingModuleId, setDeletingModuleId] = useState(null)
  const [catalogItems, setCatalogItems] = useState([])
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
      colActions: c.t(`${i18nRoot}.colActions`),
      expandContent: c.t(`${i18nRoot}.expandContent`),
      collapseContent: c.t(`${i18nRoot}.collapseContent`),
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
      statusOffline: c.t('pages.coursesCatalog.statusOffline'),
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
      saveCourse: c.t(`${i18nRoot}.saveCourse`),
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
      pathHierarchyHint: c.t(`${i18nRoot}.pathHierarchyHint`),
      lockedNewCategoryHint: c.t(`${i18nRoot}.lockedNewCategoryHint`),
      lockedNewModuleHint: c.t(`${i18nRoot}.lockedNewModuleHint`),
      newStagePanelHint: c.t(`${i18nRoot}.newStagePanelHint`),
      newCategoryPanelHint: c.t(`${i18nRoot}.newCategoryPanelHint`),
      newModulePanelHint: c.t(`${i18nRoot}.newModulePanelHint`),
      selectedFromTreeHint: c.t(`${i18nRoot}.selectedFromTreeHint`),
      newStagePanelTitle: c.t(`${i18nRoot}.newStagePanelTitle`),
      newCategoryPanelTitle: c.t(`${i18nRoot}.newCategoryPanelTitle`),
      newModulePanelTitle: c.t(`${i18nRoot}.newModulePanelTitle`),
      selectedStagePanelTitle: c.t(`${i18nRoot}.selectedStagePanelTitle`),
      selectedCategoryPanelTitle: c.t(`${i18nRoot}.selectedCategoryPanelTitle`),
      selectedModulePanelTitle: c.t(`${i18nRoot}.selectedModulePanelTitle`),
      levelsLoadingHint: c.t(`${i18nRoot}.levelsLoadingHint`),
      noModulesForStage: c.t(`${i18nRoot}.noModulesForStage`),
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
      deleteLesson: c.t(`${i18nRoot}.deleteLesson`),
      deleteModule: c.t(`${i18nRoot}.deleteModule`),
      confirmDeleteLesson: (title) => c.t(`${i18nRoot}.confirmDeleteLesson`, { title }),
      confirmDeleteModule: (title) => c.t(`${i18nRoot}.confirmDeleteModule`, { title }),
      lessonDeleted: c.t(`${i18nRoot}.lessonDeleted`),
      moduleDeleted: c.t(`${i18nRoot}.moduleDeleted`),
      deleting: c.t(`${i18nRoot}.deleting`),
      editModule: c.t(`${i18nRoot}.editModule`),
      saveModule: c.t(`${i18nRoot}.saveModule`),
      moduleSaved: c.t(`${i18nRoot}.moduleSaved`),
      colModulePrice: c.t(`${i18nRoot}.colModulePrice`),
      colModulePriceCents: c.t(`${i18nRoot}.colModulePriceCents`),
      moduleCatalogSectionTitle: c.t(`${i18nRoot}.moduleCatalogSectionTitle`),
      moduleCatalogSectionHint: c.t(`${i18nRoot}.moduleCatalogSectionHint`),
      modulePriceHint: c.t(`${i18nRoot}.modulePriceHint`),
      moduleCatalogSlug: c.t(`${i18nRoot}.moduleCatalogSlug`),
      phModuleCatalogSlug: c.t(`${i18nRoot}.phModuleCatalogSlug`),
      moduleSummaryLabel: c.t(`${i18nRoot}.moduleSummaryLabel`),
      phModuleSummary: c.t(`${i18nRoot}.phModuleSummary`),
      moduleIntro: c.t(`${i18nRoot}.moduleIntro`),
      phModuleIntro: c.t(`${i18nRoot}.phModuleIntro`),
      moduleCover: c.t(`${i18nRoot}.moduleCover`),
      phModuleCover: c.t(`${i18nRoot}.phModuleCover`),
      moduleCoverHint: c.t(`${i18nRoot}.moduleCoverHint`),
      moduleCoverUpload: c.t(`${i18nRoot}.moduleCoverUpload`),
      moduleCoverUploading: c.t(`${i18nRoot}.moduleCoverUploading`),
      moduleCoverRemove: c.t(`${i18nRoot}.moduleCoverRemove`),
      moduleCoverDropzone: c.t(`${i18nRoot}.moduleCoverDropzone`),
      moduleCoverDropzoneActive: c.t(`${i18nRoot}.moduleCoverDropzoneActive`),
      moduleCoverReplace: c.t(`${i18nRoot}.moduleCoverReplace`),
      moduleCoverFormats: c.t(`${i18nRoot}.moduleCoverFormats`),
      moduleCoverAdvanced: c.t(`${i18nRoot}.moduleCoverAdvanced`),
      moduleCoverUrlOptional: c.t(`${i18nRoot}.moduleCoverUrlOptional`),
      moduleCoverDefaultBadge: c.t(`${i18nRoot}.moduleCoverDefaultBadge`),
      moduleCoverDefaultHint: c.t(`${i18nRoot}.moduleCoverDefaultHint`),
      moduleContainsLessons: c.t(`${i18nRoot}.moduleContainsLessons`),
      moduleLessonCount: (n) => c.t(`${i18nRoot}.moduleLessonCount`, { count: n }),
      moduleLessonsTitle: (n) => c.t(`${i18nRoot}.moduleLessonsTitle`, { count: n }),
      moduleLessonsHint: c.t(`${i18nRoot}.moduleLessonsHint`),
      lessonIncludedInModule: c.t(`${i18nRoot}.lessonIncludedInModule`),
      lessonCatalogPriceHint: c.t(`${i18nRoot}.lessonCatalogPriceHint`),
      addLessonToModule: c.t(`${i18nRoot}.addLessonToModule`),
      previewModule: c.t(`${i18nRoot}.previewModule`),
      moduleSummary: (modules, lessons) => c.t(`${i18nRoot}.moduleSummaryStats`, { modules, lessons }),
      dragHint: c.t(`${i18nRoot}.dragHint`),
      savingOrder: c.t(`${i18nRoot}.savingOrder`),
      dragReorderHint: c.t(`${i18nRoot}.dragReorderHint`),
      sectionLessons: c.t(`${i18nRoot}.sectionLessons`),
      sectionLabs: c.t(`${i18nRoot}.sectionLabs`),
      sectionMaterials: c.t(`${i18nRoot}.sectionMaterials`),
      moduleExtrasTitle: c.t(`${i18nRoot}.moduleExtrasTitle`),
      moduleLabsEmpty: c.t(`${i18nRoot}.moduleLabsEmpty`),
      moduleMaterialsEmpty: c.t(`${i18nRoot}.moduleMaterialsEmpty`),
      manageLabsLink: c.t(`${i18nRoot}.manageLabsLink`),
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

  const closeModuleEditor = () => {
    setEditingModule(null)
  }

  const load = useCallback(async ({ background = false } = {}) => {
    if (background) {
      setRefreshing(true)
    } else if (!hasLoadedOnceRef.current) {
      setInitialLoading(true)
    }
    setError(null)
    try {
      const [{ rows: next, moduleGroups: groups, levels: tree }, catalogRes] = await Promise.all([
        fetchCurriculumAdmin(productLine),
        supabase.from('courses_catalog').select('*').order('sort_order'),
      ])
      if (catalogRes.error) throw new Error(catalogRes.error.message)
      setRows(next)
      setModuleGroups(groups)
      setLevels(tree)
      setCatalogItems(catalogRes.data || [])
      return { rows: next, moduleGroups: groups, levels: tree }
    } catch (e) {
      setError(e.message)
      if (!background) {
        setRows([])
        setModuleGroups([])
        setLevels([])
        setCatalogItems([])
      }
      return { rows: [], moduleGroups: [], levels: [] }
    } finally {
      hasLoadedOnceRef.current = true
      setInitialLoading(false)
      setRefreshing(false)
    }
  }, [productLine])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    const refreshIfVisible = () => {
      if (document.visibilityState !== 'visible') return
      if (showAddForm || editingRow || editingModule || saving) return
      load({ background: true })
    }
    window.addEventListener('focus', refreshIfVisible)
    document.addEventListener('visibilitychange', refreshIfVisible)
    return () => {
      window.removeEventListener('focus', refreshIfVisible)
      document.removeEventListener('visibilitychange', refreshIfVisible)
    }
  }, [load, showAddForm, editingRow, editingModule, saving])

  useEffect(() => {
    if ((editingRow || editingModule) && editorRef.current) {
      editorRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [editingRow?.lessonId, editingModule?.moduleDbId])

  if (!isCurriculumLine(lineParam)) {
    return <Navigate to={`/admin/curriculum/${DEFAULT_ADMIN_PRODUCT_LINE}`} replace />
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

  const handleDelete = async (row) => {
    const title = row.lessonTitle || row.lessonSlug || row.lessonId
    if (!confirm(labels.confirmDeleteLesson(title))) return
    setDeletingId(row.lessonId)
    setError(null)
    try {
      await deleteProgramLesson(productLine, {
        lessonId: row.lessonId,
        catalogSlug: row.catalogSlug || row.lessonSlug,
      })
      setSuccess(labels.lessonDeleted)
      if (editingRow?.lessonId === row.lessonId) {
        sessionStorage.removeItem(`admin-curriculum-edit-${row.lessonId}`)
        closeEditor()
      }
      clearAdminUiDraft(uiKey)
      await load()
    } catch (e) {
      setError(e.message)
    } finally {
      setDeletingId(null)
    }
  }

  const handleDeleteModule = async () => {
    if (!editingModule) return
    const title = editingModule.moduleTitle || editingModule.moduleSlug || editingModule.moduleDbId
    if (!confirm(labels.confirmDeleteModule(title))) return
    setDeletingModuleId(editingModule.moduleDbId)
    setError(null)
    try {
      await deleteProgramModule(productLine, { moduleDbId: editingModule.moduleDbId })
      setSuccess(labels.moduleDeleted)
      sessionStorage.removeItem(`admin-curriculum-module-${editingModule.moduleDbId}`)
      closeModuleEditor()
      clearAdminUiDraft(uiKey)
      await load()
    } catch (e) {
      setError(e.message)
    } finally {
      setDeletingModuleId(null)
    }
  }

  const handleSaveModule = async (form) => {
    if (!editingModule) return
    setSaving(true)
    setError(null)
    try {
      await saveProgramModuleConfig(productLine, editingModule.moduleDbId, form, {
        stage: editingModule.stage,
        category: editingModule.category,
        categorySlug: editingModule.categorySlug,
        levelSlug: editingModule.levelSlug,
        moduleSlug: editingModule.moduleSlug,
        moduleTitle: editingModule.moduleTitle,
        sortOrder: editingModule.sortOrder,
        lessonCount: editingModule.lessons?.length || 0,
        lessons: editingModule.lessons,
      })
      setSuccess(c.t(`${i18nRoot}.moduleSaved`))
      closeModuleEditor()
      sessionStorage.removeItem(`admin-curriculum-module-${editingModule.moduleDbId}`)
      clearAdminUiDraft(uiKey)
      await load()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const labCatalogItems = useMemo(
    () => catalogItems.filter(isLabMaterialsCatalogRow),
    [catalogItems]
  )

  const moduleLabItems = useMemo(() => {
    if (!editingModule?.moduleDbId) return []
    const lessonIds = (editingModule.lessons || []).map((lesson) => lesson.lessonId)
    return filterLabMaterialsForModule(
      labCatalogItems,
      editingModule.moduleDbId,
      productLine,
      lessonIds
    )
  }, [labCatalogItems, editingModule, productLine])

  const handleReorderLessons = async (moduleDbId, orderedLessons) => {
    setError(null)
    try {
      await reorderModuleLessons(
        moduleDbId,
        orderedLessons.map((lesson) => lesson.lessonId)
      )
      const { moduleGroups: groups } = await load()
      setEditingModule((prev) => {
        if (prev?.moduleDbId !== moduleDbId) return prev
        return groups.find((group) => group.moduleDbId === moduleDbId) || prev
      })
    } catch (e) {
      setError(e.message)
    }
  }

  const handleReorderLabMaterials = async (reorderedItems) => {
    setError(null)
    try {
      await reorderScopedCatalogItems(catalogItems, reorderedItems)
      await load()
    } catch (e) {
      setError(e.message)
    }
  }

  const handleAddLessonToModule = (group) => {
    writeAdminUiDraft(`admin-curriculum-add-${productLine}`, {
      path: {
        stageChoice: group.levelDbId,
        themeChoice: group.themeDbId,
        moduleChoice: group.moduleDbId,
        newStage: { title: '', slug: '', emoji: '🟢' },
        newTheme: { title: '', slug: '', category_label: '' },
        newModule: { title: '', slug: '' },
      },
      lessonTitle: '',
      lessonSlug: '',
      knowledgePoints: '',
      contentGoals: '',
      cloudflareUid: '',
      syncCatalog: true,
    })
    setAddFormKey(`module-${group.moduleDbId}-${Date.now()}`)
    setShowAddForm(true)
    setEditingRow(null)
    setEditingModule(null)
    setSuccess(null)
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
        {!showAddForm && !editingRow && !editingModule ? (
          <button
            type="button"
            onClick={() => {
              setAddFormKey(`new-${Date.now()}`)
              setShowAddForm(true)
              setEditingRow(null)
              setEditingModule(null)
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
          key={addFormKey}
          productLine={productLine}
          levels={levels}
          levelsLoading={initialLoading && levels.length === 0}
          labels={labels}
          saving={saving}
          onSave={handleAddCourse}
          onClose={() => setShowAddForm(false)}
        />
      ) : null}

      {editingModule ? (
        <div ref={editorRef} className="scroll-mt-24">
          <ProgramModuleEditor
            key={editingModule.moduleDbId}
            group={editingModule}
            productLine={productLine}
            labels={labels}
            saving={saving}
            deleting={deletingModuleId === editingModule.moduleDbId}
            onSave={handleSaveModule}
            onDelete={handleDeleteModule}
            onClose={closeModuleEditor}
            onReorderLessons={handleReorderLessons}
            moduleLabItems={moduleLabItems}
            onReorderLabMaterials={handleReorderLabMaterials}
            labsAdminHref={ADMIN_LABS_MATERIALS_PATH}
          />
        </div>
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
            deleting={deletingId === editingRow.lessonId}
            onSave={handleSave}
            onDelete={() => handleDelete(editingRow)}
            onClose={closeEditor}
          />
        </div>
      ) : null}

      <IOAICurriculumTable
        moduleGroups={moduleGroups}
        loading={initialLoading}
        refreshing={refreshing}
        labels={labels}
        deletingId={deletingId}
        onEditModule={(group) => {
          sessionStorage.removeItem(`admin-curriculum-module-${group.moduleDbId}`)
          setShowAddForm(false)
          setEditingRow(null)
          setEditingModule(group)
        }}
        onEditLesson={(row) => {
          setShowAddForm(false)
          setEditingModule(null)
          setEditingRow(row)
        }}
        onDeleteLesson={handleDelete}
        onReorderLessons={handleReorderLessons}
        onAddLessonToModule={handleAddLessonToModule}
        onAddCourse={() => {
          setEditingRow(null)
          setEditingModule(null)
          setShowAddForm(true)
        }}
      />
    </div>
  )
}

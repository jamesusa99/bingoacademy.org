import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminCoursesLineHeroEditor from '../../components/admin/AdminCoursesLineHeroEditor'
import AdminAlert from '../../components/admin/AdminAlert'
import IOAICurriculumTable, { IOAILessonEditor, ProgramModuleEditor } from '../../components/admin/IOAICurriculumTable'
import IoaiQuestionBankModal from '../../components/admin/IoaiQuestionBankModal'
import IOAIAddCourseForm from '../../components/admin/IOAIAddCourseForm'
import CurriculumLevel1List from '../../components/admin/CurriculumLevel1List'
import CurriculumLevel1Editor from '../../components/admin/CurriculumLevel1Editor'
import { ADMIN_LABS_MATERIALS_PATH } from '../../config/adminNav'
import { DEFAULT_ADMIN_PRODUCT_LINE, getProgramCurriculum, isCurriculumLine, CURRICULUM_LINES } from '../../config/programCurriculum'
import { COURSE_STATUS } from '../../config/coursesCatalog'
import { filterLabMaterialsForModule } from '../../config/labMaterials'
import { isLabMaterialsCatalogRow } from '../../lib/catalogCourse'
import { reorderScopedCatalogItems } from '../../lib/admin/catalog'
import { supabase } from '../../lib/supabase'
import {
  createProgramCourse,
  deleteProgramLesson,
  deleteProgramLevel,
  deleteProgramModule,
  fetchCurriculumAdmin,
  reorderModuleLessons,
  reorderProgramLevels,
  saveProgramLessonConfig,
  saveProgramLevelConfig,
  saveProgramModuleConfig,
} from '../../lib/ioaiCurriculumAdmin'
import { invalidateFreeTrialLessonCache } from '../../hooks/useFreeTrialLesson'
import { fetchQuestionCountsForLessons } from '../../lib/ioaiQuestionsAdmin'
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
  const [editingLevel, setEditingLevel] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [addFormKey, setAddFormKey] = useState('new')
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [deletingModuleId, setDeletingModuleId] = useState(null)
  const [deletingLevelId, setDeletingLevelId] = useState(null)
  const [catalogItems, setCatalogItems] = useState([])
  const [exerciseCounts, setExerciseCounts] = useState({})
  const [exerciseModalLesson, setExerciseModalLesson] = useState(null)
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
      statusLabel: (status) => {
        if (status === COURSE_STATUS.COMING_SOON) return c.t('pages.coursesCatalog.statusComingSoonShort')
        if (status === COURSE_STATUS.LIVE) return c.t('pages.coursesCatalog.statusLiveShort')
        if (status === COURSE_STATUS.OFFLINE) return c.t('pages.coursesCatalog.statusOfflineShort')
        return status || '—'
      },
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
      moduleObjectivesLabel: c.t(`${i18nRoot}.moduleObjectivesLabel`),
      phModuleObjectives: c.t(`${i18nRoot}.phModuleObjectives`),
      moduleOutcomesLabel: c.t(`${i18nRoot}.moduleOutcomesLabel`),
      phModuleOutcomes: c.t(`${i18nRoot}.phModuleOutcomes`),
      moduleFieldsRequired: c.t(`${i18nRoot}.moduleFieldsRequired`),
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
      goLabEnabled: c.t(`${i18nRoot}.goLabEnabled`),
      goLabEnabledHint: c.t(`${i18nRoot}.goLabEnabledHint`),
      goLabEnabledOn: c.t(`${i18nRoot}.goLabEnabledOn`),
      goLabEnabledOff: c.t(`${i18nRoot}.goLabEnabledOff`),
      freeTrialLesson: c.t(`${i18nRoot}.freeTrialLesson`),
      freeTrialLessonHint: c.t(`${i18nRoot}.freeTrialLessonHint`),
      freeTrialLessonOn: c.t(`${i18nRoot}.freeTrialLessonOn`),
      freeTrialLessonOff: c.t(`${i18nRoot}.freeTrialLessonOff`),
      trialLessonBadge: c.t(`${i18nRoot}.trialLessonBadge`),
      addLessonToModule: c.t(`${i18nRoot}.addLessonToModule`),
      previewModule: c.t(`${i18nRoot}.previewModule`),
      refreshData: c.t(`${i18nRoot}.refreshData`),
      heroSectionTitle: c.t(`${i18nRoot}.heroSectionTitle`),
      heroSectionDesc: c.t(`${i18nRoot}.heroSectionDesc`),
      heroExpand: c.t(`${i18nRoot}.heroExpand`),
      heroCollapse: c.t(`${i18nRoot}.heroCollapse`),
      heroModulesTitle: c.t(`${i18nRoot}.heroModulesTitle`),
      heroModulesSubtitle: c.t(`${i18nRoot}.heroModulesSubtitle`),
      heroStatStudents: c.t(`${i18nRoot}.heroStatStudents`),
      heroStatRating: c.t(`${i18nRoot}.heroStatRating`),
      heroStatsHint: c.t(`${i18nRoot}.heroStatsHint`),
      heroSave: c.t(`${i18nRoot}.heroSave`),
      heroSaved: c.t(`${i18nRoot}.heroSaved`),
      heroResetDefaults: c.t(`${i18nRoot}.heroResetDefaults`),
      heroPreview: c.t(`${i18nRoot}.heroPreview`),
      refreshing: c.t(`${i18nRoot}.refreshing`),
      moduleSummary: (modules, lessons) => c.t(`${i18nRoot}.moduleSummaryStats`, { modules, lessons }),
      dragHint: c.t(`${i18nRoot}.dragHint`),
      savingOrder: c.t(`${i18nRoot}.savingOrder`),
      dragReorderHint: c.t(`${i18nRoot}.dragReorderHint`),
      level1DragReorderHint: c.t(`${i18nRoot}.level1DragReorderHint`),
      levelOrderSaved: c.t(`${i18nRoot}.levelOrderSaved`),
      sectionLessons: c.t(`${i18nRoot}.sectionLessons`),
      sectionLabs: c.t(`${i18nRoot}.sectionLabs`),
      sectionMaterials: c.t(`${i18nRoot}.sectionMaterials`),
      moduleExtrasTitle: c.t(`${i18nRoot}.moduleExtrasTitle`),
      moduleLabsEmpty: c.t(`${i18nRoot}.moduleLabsEmpty`),
      moduleMaterialsEmpty: c.t(`${i18nRoot}.moduleMaterialsEmpty`),
      manageLabsLink: c.t(`${i18nRoot}.manageLabsLink`),
      level1ListTitle: c.t(`${i18nRoot}.level1ListTitle`),
      level1ListHint: c.t(`${i18nRoot}.level1ListHint`),
      saveStage: c.t(`${i18nRoot}.saveStage`),
      stageSaved: c.t(`${i18nRoot}.stageSaved`),
      deleteStage: c.t(`${i18nRoot}.deleteStage`),
      confirmDeleteStage: (title) => c.t(`${i18nRoot}.confirmDeleteStage`, { title }),
      stageDeleted: c.t(`${i18nRoot}.stageDeleted`),
      colStageSummary: c.t(`${i18nRoot}.colStageSummary`),
      phStageSummary: c.t(`${i18nRoot}.phStageSummary`),
      slugRenameStageHint: c.t(`${i18nRoot}.slugRenameStageHint`),
      stageStats: (themes, modules, lessons) =>
        c.t(`${i18nRoot}.stageStats`, { themes: String(themes), modules: String(modules), lessons: String(lessons) }),
      addExercises: c.t('pages.ioaiCurriculum.questionBank.addExercises'),
      exerciseCount: (total, live) =>
        c.t('pages.ioaiCurriculum.questionBank.exerciseCountBadge', { total: String(total), live: String(live) }),
      exerciseCountHint: c.t('pages.ioaiCurriculum.questionBank.exerciseCountHint'),
    }),
    [c, i18nRoot]
  )

  const uiKey = `admin-curriculum-ui-${productLine}`

  useEffect(() => {
    const ui = readAdminUiDraft(uiKey)
    if (ui?.showAddForm) setShowAddForm(true)
  }, [uiKey])

  useEffect(() => {
    if (editingRow || editingModule) return
    const ui = readAdminUiDraft(uiKey)
    if (ui?.editingLessonId && rows.length) {
      const row = rows.find((r) => r.lessonId === ui.editingLessonId)
      if (row) {
        setEditingRow(row)
        return
      }
    }
    if (ui?.editingModuleId && moduleGroups.length) {
      const group = moduleGroups.find((g) => g.moduleDbId === ui.editingModuleId)
      if (group) setEditingModule(group)
    }
  }, [rows, moduleGroups, uiKey, editingRow, editingModule])

  const refreshExerciseCounts = useCallback(async () => {
    if (productLine !== 'ioai') return
    const lessonIds = moduleGroups.flatMap((g) => (g.lessons || []).map((l) => l.lessonId)).filter(Boolean)
    if (!lessonIds.length) {
      setExerciseCounts({})
      return
    }
    try {
      const counts = await fetchQuestionCountsForLessons(lessonIds)
      setExerciseCounts(counts)
    } catch {
      /* non-fatal */
    }
  }, [moduleGroups, productLine])

  useEffect(() => {
    refreshExerciseCounts()
  }, [refreshExerciseCounts])

  useEffect(() => {
    writeAdminUiDraft(uiKey, {
      showAddForm,
      editingLessonId: editingRow?.lessonId || null,
      editingModuleId: editingModule?.moduleDbId || null,
    })
  }, [showAddForm, editingRow, editingModule, uiKey])

  const closeEditor = () => {
    writeAdminUiDraft(uiKey, {
      showAddForm,
      editingLessonId: null,
      editingModuleId: editingModule?.moduleDbId || null,
    })
    setEditingRow(null)
  }

  const closeModuleEditor = () => {
    writeAdminUiDraft(uiKey, {
      showAddForm,
      editingLessonId: editingRow?.lessonId || null,
      editingModuleId: null,
    })
    setEditingModule(null)
  }

  const closeLevelEditor = () => {
    setEditingLevel(null)
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
    if ((editingRow || editingModule || editingLevel) && editorRef.current) {
      editorRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [editingRow?.lessonId, editingModule?.moduleDbId, editingLevel?.id])

  if (!isCurriculumLine(lineParam)) {
    return <Navigate to={`/admin/curriculum/${DEFAULT_ADMIN_PRODUCT_LINE}`} replace />
  }

  const handleSave = async (form) => {
    if (!editingRow) return
    setSaving(true)
    setError(null)
    try {
      await saveProgramLessonConfig(productLine, editingRow.lessonId, form)
      invalidateFreeTrialLessonCache()
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

  const handleSaveLevel = async (form) => {
    if (!editingLevel) return
    setSaving(true)
    setError(null)
    try {
      await saveProgramLevelConfig(productLine, editingLevel.id, form)
      setSuccess(labels.stageSaved)
      closeLevelEditor()
      await load()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteLevel = async (level) => {
    const target = level || editingLevel
    if (!target) return
    const title = target.title || target.slug || target.id
    if (!confirm(labels.confirmDeleteStage(title))) return
    setDeletingLevelId(target.id)
    setError(null)
    try {
      await deleteProgramLevel(productLine, { levelId: target.id })
      setSuccess(labels.stageDeleted)
      if (editingLevel?.id === target.id) closeLevelEditor()
      if (editingModule && editingModule.levelDbId === target.id) closeModuleEditor()
      await load()
    } catch (e) {
      setError(e.message)
    } finally {
      setDeletingLevelId(null)
    }
  }

  const handleSaveModule = async (form) => {
    if (!editingModule) return
    if (!form.summary?.trim() || !form.learning_objectives?.trim() || !form.learning_outcomes?.trim()) {
      setError(labels.moduleFieldsRequired)
      return
    }
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

  const handleReorderLevels = async (orderedLevels) => {
    setError(null)
    try {
      await reorderProgramLevels(
        productLine,
        orderedLevels.map((level) => level.id)
      )
      setSuccess(labels.levelOrderSaved)
      await load()
    } catch (e) {
      setError(e.message)
    }
  }

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
    setEditingLevel(null)
    setSuccess(null)
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader titleKey={`${i18nRoot}.title`} descriptionKey={`${i18nRoot}.desc`} />

      {CURRICULUM_LINES.includes(productLine) ? (
        <AdminCoursesLineHeroEditor lineId={productLine} labels={labels} />
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3 text-sm items-center">
          <Link to={ADMIN_LABS_MATERIALS_PATH} className="text-primary hover:underline">
            ← {c.t(`${i18nRoot}.backCatalog`)}
          </Link>
          <Link to={config.frontendPath} target="_blank" rel="noreferrer" className="text-slate-600 hover:text-primary">
            {c.t(`${i18nRoot}.viewFrontend`)} ↗
          </Link>
          <button
            type="button"
            onClick={() => load({ background: true })}
            disabled={refreshing || initialLoading}
            className="text-slate-600 hover:text-primary disabled:opacity-50"
          >
            {refreshing ? labels.refreshing : labels.refreshData}
          </button>
        </div>
        {!showAddForm && !editingRow && !editingModule && !editingLevel ? (
          <button
            type="button"
            onClick={() => {
              setAddFormKey(`new-${Date.now()}`)
              setShowAddForm(true)
              setEditingRow(null)
              setEditingModule(null)
              setEditingLevel(null)
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

      <div className="card overflow-hidden">
        <div className="p-4 border-b flex flex-wrap justify-between items-start gap-3">
          <div>
            <h2 className="font-semibold text-bingo-dark">{labels.level1ListTitle}</h2>
            <p className="text-xs text-slate-500 mt-1">{labels.level1ListHint}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setAddFormKey(`new-${Date.now()}`)
              setShowAddForm(true)
              setEditingRow(null)
              setEditingModule(null)
              setEditingLevel(null)
              setSuccess(null)
            }}
            className="btn-primary text-xs px-3 py-1.5"
          >
            + {labels.addCourse}
          </button>
        </div>
        {initialLoading ? (
          <p className="p-6 text-sm text-slate-500">{labels.loading}</p>
        ) : (
          <CurriculumLevel1List
            levels={levels}
            labels={labels}
            activeId={editingLevel?.id}
            onReorder={handleReorderLevels}
            onEdit={(level) => {
              setShowAddForm(false)
              setEditingRow(null)
              setEditingModule(null)
              setEditingLevel(level)
              setSuccess(null)
            }}
            onDelete={handleDeleteLevel}
          />
        )}
      </div>

      {editingLevel ? (
        <div ref={editorRef} className="scroll-mt-24">
          <CurriculumLevel1Editor
            key={editingLevel.id}
            level={editingLevel}
            labels={labels}
            saving={saving || deletingLevelId === editingLevel.id}
            onSave={handleSaveLevel}
            onDelete={() => handleDeleteLevel(editingLevel)}
            onClose={closeLevelEditor}
          />
        </div>
      ) : null}

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
        exerciseCounts={productLine === 'ioai' ? exerciseCounts : {}}
        deletingId={deletingId}
        onEditModule={(group) => {
          setShowAddForm(false)
          setEditingRow(null)
          setEditingLevel(null)
          setEditingModule(group)
        }}
        onEditLesson={(row) => {
          setShowAddForm(false)
          setEditingModule(null)
          setEditingLevel(null)
          setEditingRow(row)
        }}
        onDeleteLesson={handleDelete}
        onOpenExercises={
          productLine === 'ioai'
            ? (row) => {
                setEditingRow(null)
                setExerciseModalLesson(row)
              }
            : undefined
        }
        onReorderLessons={handleReorderLessons}
        onAddLessonToModule={handleAddLessonToModule}
        onAddCourse={() => {
          setEditingRow(null)
          setEditingModule(null)
          setEditingLevel(null)
          setShowAddForm(true)
        }}
      />

      {productLine === 'ioai' ? (
        <IoaiQuestionBankModal
          open={Boolean(exerciseModalLesson)}
          lessonId={exerciseModalLesson?.lessonId}
          lessonTitle={exerciseModalLesson?.lessonTitle}
          onClose={() => setExerciseModalLesson(null)}
          onCountsChange={({ total, live }) => {
            if (!exerciseModalLesson?.lessonId) return
            setExerciseCounts((prev) => ({
              ...prev,
              [exerciseModalLesson.lessonId]: { total, live, draft: total - live },
            }))
            refreshExerciseCounts()
          }}
        />
      ) : null}
    </div>
  )
}

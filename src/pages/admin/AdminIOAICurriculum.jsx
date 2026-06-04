import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminAlert from '../../components/admin/AdminAlert'
import IOAICurriculumTable, { IOAILessonEditor } from '../../components/admin/IOAICurriculumTable'
import IOAIAddCourseForm from '../../components/admin/IOAIAddCourseForm'
import { useAdminCrud } from '../../hooks/useAdminCrud'
import { createIOAICourse, fetchIOAICurriculumAdmin, saveIOAILessonConfig } from '../../lib/ioaiCurriculumAdmin'

export default function AdminIOAICurriculum() {
  const c = useAdminCrud()
  const [rows, setRows] = useState([])
  const [levels, setLevels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [editingRow, setEditingRow] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [saving, setSaving] = useState(false)

  const labels = useMemo(
    () => ({
      loading: c.t('pages.ioaiCurriculum.loading'),
      empty: c.t('pages.ioaiCurriculum.empty'),
      emptyHint: c.t('pages.ioaiCurriculum.emptyHint'),
      allStages: c.t('pages.ioaiCurriculum.allStages'),
      colStage: c.t('pages.ioaiCurriculum.colStage'),
      colModule: c.t('pages.ioaiCurriculum.colModule'),
      colCategory: c.t('pages.ioaiCurriculum.colCategory'),
      colLesson: c.t('pages.ioaiCurriculum.colLesson'),
      colKnowledge: c.t('pages.ioaiCurriculum.colKnowledge'),
      colGoals: c.t('pages.ioaiCurriculum.colGoals'),
      colVideo: c.t('pages.ioaiCurriculum.colVideo'),
      notSet: c.t('pages.ioaiCurriculum.notSet'),
      noVideo: c.t('pages.ioaiCurriculum.noVideo'),
      edit: c.t('pages.ioaiCurriculum.edit'),
      editLesson: c.t('pages.ioaiCurriculum.editLesson'),
      preview: c.t('pages.ioaiCurriculum.preview'),
      close: c.t('pages.ioaiCurriculum.close'),
      cancel: c.t('pages.ioaiCurriculum.cancel'),
      save: c.t('pages.ioaiCurriculum.save'),
      saving: c.saving,
      phKnowledge: c.t('pages.ioaiCurriculum.phKnowledge'),
      phGoals: c.t('pages.ioaiCurriculum.phGoals'),
      catalogSlug: c.t('pages.ioaiCurriculum.catalogSlug'),
      cloudflareUid: c.t('pages.ioaiCurriculum.cloudflareUid'),
      addCourse: c.t('pages.ioaiCurriculum.addCourse'),
      addCourseTitle: c.t('pages.ioaiCurriculum.addCourseTitle'),
      addCourseDesc: c.t('pages.ioaiCurriculum.addCourseDesc'),
      newStage: c.t('pages.ioaiCurriculum.newStage'),
      newCategory: c.t('pages.ioaiCurriculum.newCategory'),
      newModule: c.t('pages.ioaiCurriculum.newModule'),
      newStageTitle: c.t('pages.ioaiCurriculum.newStageTitle'),
      newStageSlug: c.t('pages.ioaiCurriculum.newStageSlug'),
      newStageEmoji: c.t('pages.ioaiCurriculum.newStageEmoji'),
      newCategoryTitle: c.t('pages.ioaiCurriculum.newCategoryTitle'),
      newCategoryLabel: c.t('pages.ioaiCurriculum.newCategoryLabel'),
      newCategorySlug: c.t('pages.ioaiCurriculum.newCategorySlug'),
      newModuleTitle: c.t('pages.ioaiCurriculum.newModuleTitle'),
      newModuleSlug: c.t('pages.ioaiCurriculum.newModuleSlug'),
      lessonSlug: c.t('pages.ioaiCurriculum.lessonSlug'),
      syncCatalog: c.t('pages.ioaiCurriculum.syncCatalog'),
      phStageTitle: c.t('pages.ioaiCurriculum.phStageTitle'),
      phCategoryTitle: c.t('pages.ioaiCurriculum.phCategoryTitle'),
      phCategoryLabel: c.t('pages.ioaiCurriculum.phCategoryLabel'),
      phModuleTitle: c.t('pages.ioaiCurriculum.phModuleTitle'),
      phLessonTitle: c.t('pages.ioaiCurriculum.phLessonTitle'),
      phLessonSlug: c.t('pages.ioaiCurriculum.phLessonSlug'),
      courseAdded: c.t('pages.ioaiCurriculum.courseAdded'),
    }),
    [c]
  )

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { rows: next, levels: tree } = await fetchIOAICurriculumAdmin()
      setRows(next)
      setLevels(tree)
    } catch (e) {
      setError(e.message)
      setRows([])
      setLevels([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleSave = async (form) => {
    if (!editingRow) return
    setSaving(true)
    setError(null)
    try {
      await saveIOAILessonConfig(editingRow.lessonId, form)
      setSuccess(c.t('pages.ioaiCurriculum.saved'))
      setEditingRow(null)
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
      await createIOAICourse(form)
      setSuccess(c.t('pages.ioaiCurriculum.courseAdded'))
      setShowAddForm(false)
      await load()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader titleKey="pages.ioaiCurriculum.title" descriptionKey="pages.ioaiCurriculum.desc" />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3 text-sm">
          <Link to="/admin/courses" className="text-primary hover:underline">
            ← {c.t('pages.ioaiCurriculum.backCatalog')}
          </Link>
          <Link to="/curriculum" target="_blank" rel="noreferrer" className="text-slate-600 hover:text-primary">
            {c.t('pages.ioaiCurriculum.viewFrontend')} ↗
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
            + {c.t('pages.ioaiCurriculum.addCourse')}
          </button>
        ) : null}
      </div>

      {error ? (
        <AdminAlert variant="error">
          {error.includes('does not exist') ? c.t('pages.ioaiCurriculum.migrationHint') : error}
        </AdminAlert>
      ) : null}
      {success ? <AdminAlert variant="success">{success}</AdminAlert> : null}

      <div className="card p-4 sm:p-5 bg-amber-50/60 border-amber-200/80">
        <p className="text-xs font-bold text-amber-900 uppercase tracking-wide mb-2">
          {c.t('pages.ioaiCurriculum.structureTitle')}
        </p>
        <p className="text-sm text-amber-950/80">{c.t('pages.ioaiCurriculum.structureDesc')}</p>
      </div>

      {showAddForm ? (
        <IOAIAddCourseForm
          levels={levels}
          labels={labels}
          saving={saving}
          onSave={handleAddCourse}
          onClose={() => setShowAddForm(false)}
        />
      ) : null}

      {editingRow ? (
        <IOAILessonEditor
          row={editingRow}
          labels={labels}
          saving={saving}
          onSave={handleSave}
          onClose={() => setEditingRow(null)}
        />
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

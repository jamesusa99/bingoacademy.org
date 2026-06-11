import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { COURSE_STATUS } from '../../config/coursesCatalog'
import {
  CATALOG_FORM_EMPTY,
  catalogRowToForm,
  defaultLabMaterialsSubForLine,
  formToCatalogPayload,
  isLabMaterialsCatalogRow,
  labMaterialsSubcategoriesForLine,
} from '../../lib/catalogCourse'
import { saveCatalogCourse, deleteCatalogCourse } from '../../lib/admin/catalog'
import AdminLabPackHierarchyEditor from '../../components/admin/AdminLabPackHierarchyEditor'
import AdminLabPackLevel1List from '../../components/admin/AdminLabPackLevel1List'
import AdminLabPackLevel1Fields from '../../components/admin/AdminLabPackLevel1Fields'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminAlert from '../../components/admin/AdminAlert'
import { useAdminCrud } from '../../hooks/useAdminCrud'
import { CURRICULUM_LINES, DEFAULT_ADMIN_PRODUCT_LINE, getProgramCurriculum } from '../../config/programCurriculum'
import { fetchCurriculumAdmin, resyncModuleCatalogPrice } from '../../lib/ioaiCurriculumAdmin'
import {
  LAB_MATERIAL_TYPES,
  buildCurriculumModuleIndex,
  deliveryTypeForLabSub,
  normalizeLabMaterialSub,
} from '../../config/labMaterials'

function statusOptions(t) {
  return [
    { value: COURSE_STATUS.LIVE, label: t('pages.coursesCatalog.statusLive') },
    { value: COURSE_STATUS.COMING_SOON, label: t('pages.coursesCatalog.statusComingSoon') },
    { value: COURSE_STATUS.OFFLINE, label: t('pages.coursesCatalog.statusOffline') },
  ]
}

function statusLabel(status, t) {
  if (status === COURSE_STATUS.COMING_SOON) return t('pages.coursesCatalog.statusComingSoonShort')
  if (status === COURSE_STATUS.LIVE) return t('pages.coursesCatalog.statusLiveShort')
  if (status === COURSE_STATUS.OFFLINE) return t('pages.coursesCatalog.statusOfflineShort')
  return status || '—'
}

import AdminField from '../../components/admin/AdminField'

const inputClass = 'w-full rounded-xl border border-slate-200 px-3 py-2 text-sm'

export default function AdminCoursesCatalog() {
  const c = useAdminCrud()
  const t = c.t
  const STATUS_OPTIONS = statusOptions(t)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [editingSlug, setEditingSlug] = useState(null)
  const [editorOpen, setEditorOpen] = useState(false)
  const [form, setForm] = useState(CATALOG_FORM_EMPTY)
  const [lineFilter, setLineFilter] = useState(DEFAULT_ADMIN_PRODUCT_LINE)
  const [typeFilter, setTypeFilter] = useState('all')
  const [levelsByLine, setLevelsByLine] = useState({ ioai: [], general: [], k12: [] })
  const editorRef = useRef(null)

  const labSubs = useMemo(() => labMaterialsSubcategoriesForLine(form.line), [form.line])
  const labItems = useMemo(() => items.filter(isLabMaterialsCatalogRow), [items])
  const moduleOptions = useMemo(
    () => buildCurriculumModuleIndex(levelsByLine[form.line] || [], form.line).options,
    [levelsByLine, form.line]
  )

  const labels = useMemo(
    () => ({
      colType: t('pages.coursesCatalog.colType'),
      colSlug: t('pages.coursesCatalog.colSlug'),
      colProductLine: t('pages.coursesCatalog.colProductLine'),
      colModule: t('pages.coursesCatalog.colModule'),
      colLesson: t('pages.coursesCatalog.colLesson'),
      colStatus: t('pages.coursesCatalog.colStatus'),
      colSortOrder: t('pages.coursesCatalog.colSortOrder'),
      colName: t('pages.coursesCatalog.colName'),
      colDescription: t('pages.coursesCatalog.colDescription'),
      colPrice: t('pages.coursesCatalog.colPrice'),
      colPriceCents: t('pages.coursesCatalog.colPriceCents'),
      colPriceCentsHint: t('pages.coursesCatalog.colPriceCentsHint'),
      colCurrency: t('pages.coursesCatalog.colCurrency'),
      colPurchasable: t('pages.coursesCatalog.colPurchasable'),
      colPurchasableHint: t('pages.coursesCatalog.colPurchasableHint'),
      phSlug: t('pages.coursesCatalog.phSlug'),
      phPrice: t('pages.coursesCatalog.phPrice'),
      phPriceCents: t('pages.coursesCatalog.phPriceCents'),
      phCurrency: t('pages.coursesCatalog.phCurrency'),
      noCourses: t('pages.coursesCatalog.noCourses'),
      name: c.name,
      status: c.status,
      price: c.price,
      edit: c.edit,
      delete: c.delete,
      statusLabel: (status) => statusLabel(status, t),
      sectionLevel1: t('pages.coursesCatalog.sectionLevel1'),
      sectionLevel1Hint: t('pages.coursesCatalog.sectionLevel1Hint'),
      colPackIntro: t('pages.coursesCatalog.colPackIntro'),
      colPackIntroHint: t('pages.coursesCatalog.colPackIntroHint'),
      colOutcomes: t('pages.coursesCatalog.colOutcomes'),
      colOutcomesHint: t('pages.coursesCatalog.colOutcomesHint'),
      colAudience: t('pages.coursesCatalog.colAudience'),
      colHours: t('pages.coursesCatalog.colHours'),
      colHoursHint: t('pages.coursesCatalog.colHoursHint'),
      colPackMaterials: t('pages.coursesCatalog.colPackMaterials'),
      colPackMaterialsHint: t('pages.coursesCatalog.colPackMaterialsHint'),
      manageExperimentsInline: t('pages.coursesCatalog.manageExperimentsInline'),
      level1ListTitle: t('pages.coursesCatalog.level1ListTitle'),
      level1ListHint: t('pages.coursesCatalog.level1ListHint'),
      manageExperiments: t('pages.coursesCatalog.manageExperiments'),
      deletePack: t('pages.coursesCatalog.deletePack'),
      addCourse: t('pages.coursesCatalog.addCourse'),
      actions: c.actions,
    }),
    [t, c]
  )

  const hierarchyLabels = useMemo(() => {
    const L = (key) => t(`pages.coursesCatalog.${key}`)
    return {
      savePackFirst: L('savePackFirst'),
      level2Title: L('level2Title'),
      level2Desc: L('level2Desc'),
      level3Title: L('level3Title'),
      level3Desc: L('level3Desc'),
      experimentList: L('experimentList'),
      addExperiment: L('addExperiment'),
      noExperiments: L('noExperiments'),
      editExperiment: L('editExperiment'),
      newExperiment: L('newExperiment'),
      expSlugPh: L('expSlugPh'),
      expNamePh: L('expNamePh'),
      expContentPh: L('expContentPh'),
      expPurposePh: L('expPurposePh'),
      expMaterialsLabel: L('expMaterialsLabel'),
      saveExperiment: L('saveExperiment'),
      experimentSaved: L('experimentSaved'),
      confirmDeleteExperiment: L('confirmDeleteExperiment'),
      selectExperimentFirst: L('selectExperimentFirst'),
      stepSaved: L('stepSaved'),
      confirmDeleteStep: L('confirmDeleteStep'),
      selectExperimentHint: L('selectExperimentHint'),
      editingStepsFor: L('editingStepsFor'),
      editStep: L('editStep'),
      newStep: L('newStep'),
      stepTitlePh: L('stepTitlePh'),
      stepBodyPh: L('stepBodyPh'),
      videoUrlPh: L('videoUrlPh'),
      cloudflarePh: L('cloudflarePh'),
      pptUrlPh: L('pptUrlPh'),
      linkUrlPh: L('linkUrlPh'),
      downloadUrlPh: L('downloadUrlPh'),
      downloadLabelPh: L('downloadLabelPh'),
      programmingLabPh: L('programmingLabPh'),
      saveStep: L('saveStep'),
      stepCount: (n) => L('stepCount').replace('{{count}}', String(n)),
      materialsJsonInvalid: L('materialsJsonInvalid'),
      tabSteps: L('tabSteps'),
      tabRuntime: L('tabRuntime'),
      runtimeConfigured: L('runtimeConfigured'),
      runtimeTitle: L('runtimeTitle'),
      runtimeDesc: L('runtimeDesc'),
      runtimeTypeLabel: L('runtimeTypeLabel'),
      runtimeUrlLabel: L('runtimeUrlLabel'),
      runtimeUrlPh: L('runtimeUrlPh'),
      runtimeUploadHint: L('runtimeUploadHint'),
      uploadAsset: L('uploadAsset'),
      uploadPackage: L('uploadPackage'),
      uploading: L('uploading'),
      runtimeInternalPathLabel: L('runtimeInternalPathLabel'),
      runtimeUrlOptional: L('runtimeUrlOptional'),
      embedHeightLabel: L('embedHeightLabel'),
      openInNewTab: L('openInNewTab'),
      runtimeStepsOnlyHint: L('runtimeStepsOnlyHint'),
      saveRuntime: L('saveRuntime'),
      saveExperimentBeforeRuntime: L('saveExperimentBeforeRuntime'),
      loading: 'Loading…',
      saving: c.saving,
      delete: c.delete,
    }
  }, [t, c])

  const fetchItems = async () => {
    setLoading(true)
    const [{ data, error: e }, ...curriculumResults] = await Promise.all([
      supabase.from('courses_catalog').select('*').order('sort_order'),
      ...CURRICULUM_LINES.map((line) => fetchCurriculumAdmin(line).catch(() => ({ levels: [] }))),
    ])
    setError(e?.message || null)
    setItems(data || [])
    setLevelsByLine(
      Object.fromEntries(CURRICULUM_LINES.map((line, i) => [line, curriculumResults[i]?.levels || []]))
    )
    setLoading(false)
  }

  useEffect(() => {
    fetchItems()
  }, [])

  useEffect(() => {
    if (editorOpen && editorRef.current) {
      editorRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [editorOpen, editingSlug])

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const startAdd = () => {
    setEditingSlug(null)
    setEditorOpen(true)
    setForm({
      ...CATALOG_FORM_EMPTY,
      line: DEFAULT_ADMIN_PRODUCT_LINE,
      sub: defaultLabMaterialsSubForLine(DEFAULT_ADMIN_PRODUCT_LINE),
    })
    setSuccess(null)
    setError(null)
  }

  const startEdit = (row) => {
    setEditingSlug(row.slug)
    setEditorOpen(true)
    setForm(catalogRowToForm(row))
    setSuccess(null)
    setError(null)
  }

  const closeEditor = () => {
    setEditorOpen(false)
    setEditingSlug(null)
    setForm(CATALOG_FORM_EMPTY)
    setSuccess(null)
    setError(null)
  }

  const handleLineChange = (lineId) => {
    const sub = defaultLabMaterialsSubForLine(lineId)
    setForm((f) => ({
      ...f,
      line: lineId,
      sub,
      lesson_id: '',
      module_id: '',
      delivery_type: deliveryTypeForLabSub(sub, lineId),
    }))
  }

  const handleSubChange = (sub) => {
    setForm((f) => ({
      ...f,
      sub,
      delivery_type: deliveryTypeForLabSub(sub, f.line),
    }))
  }

  const outcomesLines = (() => {
    try {
      const arr = JSON.parse(form.outcomes || '[]')
      return Array.isArray(arr) ? arr.join('\n') : ''
    } catch {
      return ''
    }
  })()

  const setOutcomesLines = (text) => {
    const arr = text.split('\n').map((s) => s.trim()).filter(Boolean)
    set('outcomes', JSON.stringify(arr, null, 2))
  }

  const isLabRow = isLabMaterialsCatalogRow({ line: form.line, sub: form.sub })

  const handleSave = async () => {
    setError(null)
    setSuccess(null)
    setSaving(true)
    try {
      const payload = formToCatalogPayload(form)
      if (!payload.slug) throw new Error(t('pages.coursesCatalog.slugRequired'))
      if (!payload.module_id) throw new Error(t('pages.coursesCatalog.moduleRequired'))
      payload.lesson_id = null
      if (editingSlug) payload.previousSlug = editingSlug
      const { previousSlug, ...rowPayload } = payload

      let savedRow = null
      try {
        const result = await saveCatalogCourse(payload)
        savedRow = result?.row ?? null
      } catch (apiErr) {
        const rename = editingSlug && editingSlug !== rowPayload.slug
        const { data, error: dbErr } = rename
          ? await supabase
              .from('courses_catalog')
              .update(rowPayload)
              .eq('slug', editingSlug)
              .select()
              .maybeSingle()
          : await supabase
              .from('courses_catalog')
              .upsert(rowPayload, { onConflict: 'slug' })
              .select()
              .maybeSingle()
        if (dbErr) throw apiErr
        savedRow = data
      }

      if (rowPayload.module_id && savedRow?.module_id !== rowPayload.module_id) {
        throw new Error(t('pages.coursesCatalog.moduleBindingNotSaved'))
      }

      if (savedRow) {
        setForm(catalogRowToForm(savedRow))
      }

      setSuccess(editingSlug ? t('pages.coursesCatalog.courseUpdated') : t('pages.coursesCatalog.courseSaved'))
      setEditingSlug(rowPayload.slug)
      if (rowPayload.module_id) {
        await resyncModuleCatalogPrice(rowPayload.line, rowPayload.module_id).catch(() => {})
      }
      await fetchItems()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (slug) => {
    if (!confirm(t('pages.coursesCatalog.confirmDelete', { slug }))) return
    setError(null)
    setSuccess(null)
    try {
      await deleteCatalogCourse(slug)
      setSuccess(t('pages.coursesCatalog.courseDeleted'))
      if (editingSlug === slug) {
        closeEditor()
      }
      await fetchItems()
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div>
      <AdminPageHeader titleKey="pages.coursesCatalog.title" descriptionKey="pages.coursesCatalog.desc" />

      {error ? (
        <AdminAlert type="error" onDismiss={() => setError(null)}>
          {error.includes('does not exist') ? t('pages.coursesCatalog.migrationHint') : error}
        </AdminAlert>
      ) : null}
      {success ? (
        <AdminAlert type="success" onDismiss={() => setSuccess(null)}>
          {success}
        </AdminAlert>
      ) : null}

      <div className="card overflow-hidden mb-6">
        <div className="p-4 border-b flex flex-wrap justify-between items-start gap-3">
          <div>
            <h2 className="font-semibold text-bingo-dark">{labels.level1ListTitle}</h2>
            <p className="text-xs text-slate-500 mt-1">{labels.level1ListHint}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={lineFilter}
              onChange={(e) => setLineFilter(e.target.value)}
              className="text-xs rounded-lg border border-slate-200 px-2 py-1.5"
            >
              <option value="all">{t('pages.coursesCatalog.filterAllLines')}</option>
              {CURRICULUM_LINES.map((lineId) => {
                const config = getProgramCurriculum(lineId)
                return (
                  <option key={lineId} value={lineId}>
                    {config.adminTitle}
                  </option>
                )
              })}
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="text-xs rounded-lg border border-slate-200 px-2 py-1.5"
            >
              <option value="all">{t('pages.coursesCatalog.filterAllTypes')}</option>
              {LAB_MATERIAL_TYPES.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
            <button type="button" onClick={startAdd} className="btn-primary text-xs px-3 py-1.5">
              {labels.addCourse}
            </button>
          </div>
        </div>
        {loading ? (
          <p className="p-6 text-sm text-slate-500">{c.loading}</p>
        ) : (
          <AdminLabPackLevel1List
            items={
              lineFilter === 'all' && typeFilter === 'all'
                ? labItems
                : labItems.filter((r) => {
                    if (lineFilter !== 'all' && r.line !== lineFilter) return false
                    if (typeFilter !== 'all' && normalizeLabMaterialSub(r.sub, r.line) !== typeFilter) return false
                    return true
                  })
            }
            labels={labels}
            onEdit={startEdit}
            onDelete={handleDelete}
            onAdd={startAdd}
            activeSlug={editorOpen ? editingSlug : null}
          />
        )}
      </div>

      {editorOpen ? (
      <div ref={editorRef} className="card p-6 mb-6 scroll-mt-4">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="font-semibold text-bingo-dark">
            {editingSlug ? t('pages.coursesCatalog.editCourse', { slug: editingSlug }) : t('pages.coursesCatalog.addCourse')}
          </h2>
          <button type="button" onClick={startAdd} className="text-sm text-primary hover:underline">
            {labels.addCourse}
          </button>
          <button type="button" onClick={closeEditor} className="text-sm text-slate-500 hover:underline">
            {c.cancel}
          </button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AdminField label={labels.colSlug} required>
            <input
              value={form.slug}
              onChange={(e) => set('slug', e.target.value)}
              placeholder={labels.phSlug}
              className={`${inputClass} font-mono`}
            />
            {editingSlug && editingSlug !== form.slug?.trim() ? (
              <p className="text-[10px] text-amber-700 mt-1">{t('pages.coursesCatalog.slugRenameHint')}</p>
            ) : null}
          </AdminField>
          <AdminField label={labels.colProductLine} required>
            <select value={form.line} onChange={(e) => handleLineChange(e.target.value)} className={inputClass}>
              {CURRICULUM_LINES.map((lineId) => {
                const config = getProgramCurriculum(lineId)
                return (
                  <option key={lineId} value={lineId}>
                    {config.icon} {config.adminTitle}
                  </option>
                )
              })}
            </select>
          </AdminField>
          <AdminField label={labels.colType} required>
            <select value={form.sub} onChange={(e) => handleSubChange(e.target.value)} className={inputClass}>
              {labSubs.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.icon} {s.name}
                </option>
              ))}
            </select>
          </AdminField>
          <AdminField label={labels.colModule} required className="sm:col-span-2 lg:col-span-3">
            <select
              value={form.module_id}
              onChange={(e) => set('module_id', e.target.value)}
              className={inputClass}
            >
              <option value="">{t('pages.coursesCatalog.selectModule')}</option>
              {moduleOptions.map((mod) => (
                <option key={mod.moduleId} value={mod.moduleId}>
                  {mod.label}
                </option>
              ))}
            </select>
            {!moduleOptions.length ? (
              <p className="text-[10px] text-amber-600 mt-1">{t('pages.coursesCatalog.noModulesForLine')}</p>
            ) : null}
          </AdminField>
          <AdminField label={labels.colStatus}>
            <select value={form.status} onChange={(e) => set('status', e.target.value)} className={inputClass}>
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
              value={form.sort_order}
              onChange={(e) => set('sort_order', e.target.value)}
              className={inputClass}
            />
          </AdminField>
          <AdminField label={labels.colName} required className="sm:col-span-2 lg:col-span-3">
            <input value={form.name} onChange={(e) => set('name', e.target.value)} className={inputClass} />
          </AdminField>
          <AdminField label={labels.colPrice}>
            <input
              value={form.price}
              onChange={(e) => set('price', e.target.value)}
              placeholder={labels.phPrice}
              className={inputClass}
            />
          </AdminField>
          <AdminField label={labels.colPriceCents}>
            <input
              type="number"
              value={form.price_cents}
              onChange={(e) => set('price_cents', e.target.value)}
              placeholder={labels.phPriceCents}
              className={inputClass}
            />
            <p className="text-[10px] text-slate-500 mt-1">{labels.colPriceCentsHint}</p>
          </AdminField>
          <AdminField label={labels.colCurrency}>
            <input
              value={form.currency}
              onChange={(e) => set('currency', e.target.value)}
              placeholder={labels.phCurrency}
              className={inputClass}
            />
          </AdminField>
          <AdminField label={labels.colPurchasable}>
            <select
              value={form.purchasable === false || form.purchasable === 'false' ? 'false' : 'true'}
              onChange={(e) => set('purchasable', e.target.value === 'true')}
              className={inputClass}
            >
              <option value="true">{t('pages.coursesCatalog.purchasableYes')}</option>
              <option value="false">{t('pages.coursesCatalog.purchasableNo')}</option>
            </select>
            <p className="text-[10px] text-slate-500 mt-1">{labels.colPurchasableHint}</p>
          </AdminField>
        </div>

        {isLabRow ? (
          <>
            <div className="mt-8 pt-6 border-t border-slate-200">
              <h3 className="font-semibold text-bingo-dark">{labels.sectionLevel1}</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">{labels.sectionLevel1Hint}</p>
              <AdminLabPackLevel1Fields
                form={form}
                set={set}
                labels={labels}
                outcomesLines={outcomesLines}
                setOutcomesLines={setOutcomesLines}
                showMaterials={isLabRow}
              />
            </div>

            {editingSlug ? (
              <AdminLabPackHierarchyEditor packSlug={editingSlug} labels={hierarchyLabels} />
            ) : (
              <p className="mt-6 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                {labels.manageExperimentsInline}
              </p>
            )}
          </>
        ) : (
          <AdminField label={labels.colDescription} className="sm:col-span-2 lg:col-span-3 mt-4">
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={3}
              className={inputClass}
            />
          </AdminField>
        )}

        <div className="flex gap-2 mt-6 flex-wrap items-center">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="btn-primary px-5 py-2 rounded-xl text-sm disabled:opacity-60"
          >
            {saving ? c.saving : t('pages.coursesCatalog.saveCourse')}
          </button>
          {editingSlug && isLabRow ? (
            <>
              <Link
                to={`/admin/labs-materials/${encodeURIComponent(editingSlug)}/experiments`}
                className="px-5 py-2 rounded-xl border text-sm text-slate-600 hover:bg-slate-50"
              >
                {labels.manageExperiments} →
              </Link>
              <Link
                to={`/labs/pack/${encodeURIComponent(editingSlug)}`}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2 rounded-xl border text-sm text-slate-600 hover:bg-slate-50"
              >
                Preview →
              </Link>
            </>
          ) : null}
          {editingSlug ? (
            <button
              type="button"
              onClick={() => handleDelete(editingSlug)}
              className="px-5 py-2 rounded-xl border border-red-200 text-sm text-red-600 hover:bg-red-50"
            >
              {labels.deletePack}
            </button>
          ) : null}
          <button type="button" onClick={closeEditor} className="px-5 py-2 rounded-xl border text-sm">
            {c.cancel}
          </button>
        </div>
      </div>
      ) : null}
    </div>
  )
}

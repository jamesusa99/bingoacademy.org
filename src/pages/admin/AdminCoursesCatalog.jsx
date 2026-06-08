import { useEffect, useMemo, useState } from 'react'
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
import { saveCatalogCourse, deleteCatalogCourse, reorderScopedCatalogItems } from '../../lib/admin/catalog'
import AdminLabMaterialsGroupedList from '../../components/admin/AdminLabMaterialsGroupedList'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminAlert from '../../components/admin/AdminAlert'
import { useAdminCrud } from '../../hooks/useAdminCrud'
import { CURRICULUM_LINES, DEFAULT_ADMIN_PRODUCT_LINE, getProgramCurriculum } from '../../config/programCurriculum'
import { fetchCurriculumAdmin, resyncModuleCatalogPrice } from '../../lib/ioaiCurriculumAdmin'
import {
  LAB_MATERIAL_TYPES,
  buildCurriculumModuleIndex,
  deliveryTypeForLabSub,
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

function Field({ label, children, className = '' }) {
  return (
    <div className={className}>
      <label className="text-xs font-medium text-slate-600 block mb-1">{label}</label>
      {children}
    </div>
  )
}

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
  const [form, setForm] = useState(CATALOG_FORM_EMPTY)
  const [lineFilter, setLineFilter] = useState(DEFAULT_ADMIN_PRODUCT_LINE)
  const [typeFilter, setTypeFilter] = useState('all')
  const [levelsByLine, setLevelsByLine] = useState({ ioai: [], general: [], k12: [] })

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
      colStage: t('pages.ioaiCurriculum.colStage'),
      colCategory: t('pages.ioaiCurriculum.colCategory'),
      lessonItemCount: t('pages.coursesCatalog.lessonItemCount'),
      moduleItemCount: t('pages.coursesCatalog.moduleItemCount'),
      moduleExtrasPrice: t('pages.coursesCatalog.moduleExtrasPrice'),
      unassignedHeading: t('pages.coursesCatalog.unassignedHeading'),
      unassignedHint: t('pages.coursesCatalog.unassignedHint'),
      noCourses: t('pages.coursesCatalog.noCourses'),
      name: c.name,
      status: c.status,
      price: c.price,
      edit: c.edit,
      delete: c.delete,
      statusLabel: (status) => statusLabel(status, t),
      dragHint: t('pages.coursesCatalog.dragHint'),
      savingOrder: t('pages.coursesCatalog.savingOrder'),
      dragReorderHint: t('pages.coursesCatalog.dragReorderHint'),
      sectionLabs: t('pages.coursesCatalog.sectionLabs'),
      sectionMaterials: t('pages.coursesCatalog.sectionMaterials'),
    }),
    [t, c]
  )

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

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const startAdd = () => {
    setEditingSlug(null)
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
    setForm(catalogRowToForm(row))
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
        setEditingSlug(null)
        setForm(CATALOG_FORM_EMPTY)
      }
      await fetchItems()
    } catch (e) {
      setError(e.message)
    }
  }

  const handleReorderModuleItems = async (reorderedItems) => {
    setError(null)
    try {
      await reorderScopedCatalogItems(items, reorderedItems)
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

      <div className="card p-6 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="font-semibold text-bingo-dark">
            {editingSlug ? t('pages.coursesCatalog.editCourse', { slug: editingSlug }) : t('pages.coursesCatalog.addCourse')}
          </h2>
          <button type="button" onClick={startAdd} className="text-sm text-primary hover:underline">
            {t('pages.coursesCatalog.newCourse')}
          </button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label={`${labels.colSlug} *`}>
            <input
              value={form.slug}
              onChange={(e) => set('slug', e.target.value)}
              placeholder={labels.phSlug}
              className={`${inputClass} font-mono`}
            />
            {editingSlug && editingSlug !== form.slug?.trim() ? (
              <p className="text-[10px] text-amber-700 mt-1">{t('pages.coursesCatalog.slugRenameHint')}</p>
            ) : null}
          </Field>
          <Field label={`${labels.colProductLine} *`}>
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
          </Field>
          <Field label={`${labels.colType} *`}>
            <select value={form.sub} onChange={(e) => handleSubChange(e.target.value)} className={inputClass}>
              {labSubs.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.icon} {s.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label={`${labels.colModule} *`} className="sm:col-span-2 lg:col-span-3">
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
          </Field>
          <Field label={labels.colStatus}>
            <select value={form.status} onChange={(e) => set('status', e.target.value)} className={inputClass}>
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label={labels.colSortOrder}>
            <input
              type="number"
              value={form.sort_order}
              onChange={(e) => set('sort_order', e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label={`${labels.colName} *`} className="sm:col-span-2 lg:col-span-3">
            <input value={form.name} onChange={(e) => set('name', e.target.value)} className={inputClass} />
          </Field>
          <Field label={labels.colPrice}>
            <input
              value={form.price}
              onChange={(e) => set('price', e.target.value)}
              placeholder={labels.phPrice}
              className={inputClass}
            />
          </Field>
          <Field label={labels.colPriceCents}>
            <input
              type="number"
              value={form.price_cents}
              onChange={(e) => set('price_cents', e.target.value)}
              placeholder={labels.phPriceCents}
              className={inputClass}
            />
            <p className="text-[10px] text-slate-500 mt-1">{labels.colPriceCentsHint}</p>
          </Field>
          <Field label={labels.colCurrency}>
            <input
              value={form.currency}
              onChange={(e) => set('currency', e.target.value)}
              placeholder={labels.phCurrency}
              className={inputClass}
            />
          </Field>
          <Field label={labels.colPurchasable}>
            <select
              value={form.purchasable === false || form.purchasable === 'false' ? 'false' : 'true'}
              onChange={(e) => set('purchasable', e.target.value === 'true')}
              className={inputClass}
            >
              <option value="true">{t('pages.coursesCatalog.purchasableYes')}</option>
              <option value="false">{t('pages.coursesCatalog.purchasableNo')}</option>
            </select>
            <p className="text-[10px] text-slate-500 mt-1">{labels.colPurchasableHint}</p>
          </Field>
          <Field label={labels.colDescription} className="sm:col-span-2 lg:col-span-3">
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={3}
              className={inputClass}
            />
          </Field>
        </div>

        <div className="flex gap-2 mt-6">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="btn-primary px-5 py-2 rounded-xl text-sm disabled:opacity-60"
          >
            {saving ? c.saving : t('pages.coursesCatalog.saveCourse')}
          </button>
          {editingSlug ? (
            <button
              type="button"
              onClick={() => {
                setEditingSlug(null)
                setForm(CATALOG_FORM_EMPTY)
              }}
              className="px-5 py-2 rounded-xl border text-sm"
            >
              {c.cancel}
            </button>
          ) : null}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 border-b flex flex-wrap justify-between items-center gap-3">
          <span className="font-semibold">{t('pages.coursesCatalog.allCourses', { count: String(labItems.length) })}</span>
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
            <a
              href="/courses?line=ioai"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-primary hover:underline"
            >
              {c.previewOnSite}
            </a>
          </div>
        </div>
        {loading ? (
          <p className="p-6 text-sm text-slate-500">{c.loading}</p>
        ) : labItems.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">{t('pages.coursesCatalog.noCourses')}</p>
        ) : (
          <AdminLabMaterialsGroupedList
            items={labItems}
            levelsByLine={levelsByLine}
            lineFilter={lineFilter}
            typeFilter={typeFilter}
            onEdit={startEdit}
            onDelete={handleDelete}
            onReorderModuleItems={handleReorderModuleItems}
            labels={labels}
          />
        )}
      </div>
    </div>
  )
}

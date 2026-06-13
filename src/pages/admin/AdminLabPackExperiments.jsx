import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminLabPackHierarchyEditor from '../../components/admin/AdminLabPackHierarchyEditor'
import AdminPackLibraryRefs from '../../components/admin/AdminPackLibraryRefs'
import AdminLabPackLevel1Fields from '../../components/admin/AdminLabPackLevel1Fields'
import AdminField from '../../components/admin/AdminField'
import AdminAlert from '../../components/admin/AdminAlert'
import { COURSE_STATUS } from '../../config/coursesCatalog'
import { catalogRowToForm, formToCatalogPayload, isLabMaterialsCatalogRow } from '../../lib/catalogCourse'
import { saveCatalogCourse, deleteCatalogCourse } from '../../lib/admin/catalog'
import { useAdminCrud } from '../../hooks/useAdminCrud'

const inputClass = 'w-full rounded-xl border border-slate-200 px-3 py-2 text-sm'

function statusOptions(t) {
  return [
    { value: COURSE_STATUS.LIVE, label: t('pages.coursesCatalog.statusLive') },
    { value: COURSE_STATUS.COMING_SOON, label: t('pages.coursesCatalog.statusComingSoon') },
    { value: COURSE_STATUS.OFFLINE, label: t('pages.coursesCatalog.statusOffline') },
  ]
}

export default function AdminLabPackExperiments() {
  const { packSlug } = useParams()
  const navigate = useNavigate()
  const c = useAdminCrud()
  const t = c.t
  const L = (key) => t(`pages.coursesCatalog.${key}`)
  const STATUS_OPTIONS = statusOptions(t)

  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [level1Open, setLevel1Open] = useState(false)

  const hierarchyLabels = useMemo(
    () => ({
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
      experimentSlugDuplicate: L('experimentSlugDuplicate'),
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
      saveStepAndAnother: L('saveStepAndAnother'),
      addStep: L('addStep'),
      stepsInExperiment: L('stepsInExperiment'),
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
      packSlugLabel: L('packSlugLabel'),
      loading: 'Loading…',
      saving: c.saving,
      delete: c.delete,
    }),
    [t, c]
  )

  const level1Labels = useMemo(
    () => ({
      sectionLevel1: L('sectionLevel1'),
      sectionLevel1Hint: L('sectionLevel1Hint'),
      colPackIntro: L('colPackIntro'),
      colPackIntroHint: L('colPackIntroHint'),
      colOutcomes: L('colOutcomes'),
      colOutcomesHint: L('colOutcomesHint'),
      colAudience: L('colAudience'),
      colHours: L('colHours'),
      colHoursHint: L('colHoursHint'),
      colPackMaterials: L('colPackMaterials'),
      colPackMaterialsHint: L('colPackMaterialsHint'),
      colName: L('colName'),
      colStatus: L('colStatus'),
      colPrice: L('colPrice'),
    }),
    [L]
  )

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    supabase
      .from('courses_catalog')
      .select('*')
      .eq('slug', packSlug)
      .maybeSingle()
      .then(({ data, error: e }) => {
        if (cancelled) return
        if (e) {
          setError(e.message)
          setForm(null)
          return
        }
        if (!data) {
          setError(t('pages.coursesCatalog.packNotFound'))
          setForm(null)
          return
        }
        setForm(catalogRowToForm(data))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [packSlug, t])

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const outcomesLines = (() => {
    if (!form) return ''
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

  const isLabRow = form ? isLabMaterialsCatalogRow({ line: form.line, sub: form.sub }) : false

  const handleSaveL1 = async () => {
    if (!form) return
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const payload = formToCatalogPayload(form)
      payload.previousSlug = packSlug
      payload.lesson_id = null
      if (!payload.name?.trim()) throw new Error(t('pages.coursesCatalog.nameRequired'))
      await saveCatalogCourse(payload)
      setSuccess(L('courseUpdated'))
      if (payload.slug !== packSlug) {
        navigate(`/admin/labs-materials/${encodeURIComponent(payload.slug)}/experiments`, { replace: true })
      } else {
        const { data } = await supabase.from('courses_catalog').select('*').eq('slug', packSlug).maybeSingle()
        if (data) setForm(catalogRowToForm(data))
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteL1 = async () => {
    if (!confirm(L('confirmDelete', { slug: packSlug }))) return
    setError(null)
    try {
      await deleteCatalogCourse(packSlug)
      navigate('/admin/labs-materials')
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div>
      <AdminPageHeader titleKey="pages.coursesCatalog.sectionLevel23" descriptionKey="pages.coursesCatalog.level1ListHint" />

      <div className="mb-4 flex flex-wrap gap-3 text-sm items-center justify-between">
        <div className="flex flex-wrap gap-3">
        <Link to="/admin/labs-materials" className="text-primary hover:underline">
          ← {L('title')}
        </Link>
        <Link to={`/labs/pack/${encodeURIComponent(packSlug)}`} className="text-slate-600 hover:underline" target="_blank" rel="noreferrer">
          Preview on site →
        </Link>
        </div>
        {form?.name ? (
          <p className="text-sm font-semibold text-bingo-dark">
            {form.name} <span className="text-slate-400 font-mono font-normal text-xs">({packSlug})</span>
          </p>
        ) : null}
      </div>

      {error ? (
        <AdminAlert type="error" onDismiss={() => setError(null)}>
          {error}
        </AdminAlert>
      ) : null}
      {success ? (
        <AdminAlert type="success" onDismiss={() => setSuccess(null)}>
          {success}
        </AdminAlert>
      ) : null}

      {loading ? (
        <p className="text-sm text-slate-500">{c.loading}</p>
      ) : !form ? null : (
        <>
          <div className="card p-6 mb-6">
            <button
              type="button"
              onClick={() => setLevel1Open((v) => !v)}
              className="w-full flex items-center justify-between gap-3 text-left"
            >
              <div>
                <h2 className="font-semibold text-bingo-dark">{level1Labels.sectionLevel1}</h2>
                <p className="text-xs text-slate-500 mt-1 font-mono">{packSlug}</p>
              </div>
              <span className="text-xs text-primary font-semibold">
                {level1Open ? L('collapseLevel1') : L('expandLevel1')}
              </span>
            </button>

            {level1Open ? (
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
                <p className="text-xs text-slate-500">{level1Labels.sectionLevel1Hint}</p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <AdminField label={level1Labels.colName} required className="sm:col-span-2">
                    <input value={form.name} onChange={(e) => set('name', e.target.value)} className={inputClass} />
                  </AdminField>
                  <AdminField label={level1Labels.colStatus}>
                    <select value={form.status} onChange={(e) => set('status', e.target.value)} className={inputClass}>
                      {STATUS_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </AdminField>
                  <AdminField label={level1Labels.colPrice}>
                    <input value={form.price} onChange={(e) => set('price', e.target.value)} className={inputClass} />
                  </AdminField>
                </div>
                <AdminLabPackLevel1Fields
                  form={form}
                  set={set}
                  labels={level1Labels}
                  outcomesLines={outcomesLines}
                  setOutcomesLines={setOutcomesLines}
                  showMaterials={isLabRow}
                />
                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={handleSaveL1}
                    className="btn-primary text-sm px-4 py-2 disabled:opacity-60"
                  >
                    {saving ? c.saving : L('saveCourse')}
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteL1}
                    className="text-sm px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50"
                  >
                    {L('deletePack')}
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          <AdminPackLibraryRefs packSlug={packSlug} labels={hierarchyLabels} />

          <div className="card p-6">
            <AdminLabPackHierarchyEditor packSlug={packSlug} labels={hierarchyLabels} />
          </div>
        </>
      )}
    </div>
  )
}

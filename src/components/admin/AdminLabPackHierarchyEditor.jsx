import { useCallback, useEffect, useRef, useState } from 'react'
import AdminAlert from './AdminAlert'
import AdminLabExperimentRuntimeEditor from './AdminLabExperimentRuntimeEditor'
import { LAB_STEP_TYPES } from '../../config/labExperiments'
import { emptyRuntimeConfig, hasExperimentRuntime, normalizeRuntimeConfig } from '../../config/labExperimentRuntime'
import {
  deleteLabExperiment,
  deleteLabStep,
  fetchAdminLabPackExperiments,
  saveLabExperiment,
  saveLabStep,
} from '../../lib/labPackApi'

const inputClass = 'w-full rounded-xl border border-slate-200 px-3 py-2 text-sm'

const emptyExperiment = () => ({
  slug: '',
  title: '',
  content: '',
  purpose: '',
  materials_list: [],
  sort_order: 0,
  status: 'live',
  runtime_config: emptyRuntimeConfig(),
})

const emptyStep = () => ({
  title: '',
  step_type: 'text',
  body: '',
  video_url: '',
  cloudflare_video_id: '',
  ppt_url: '',
  external_url: '',
  download_url: '',
  download_label: '',
  programming_config: { labId: '' },
  sort_order: 0,
})

function parseMaterialsJson(text) {
  try {
    const parsed = JSON.parse(text || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return null
  }
}

function resolveExperimentId(editingExpId, slug, experiments) {
  if (editingExpId) return editingExpId
  const normalized = String(slug || '').trim()
  if (!normalized) return null
  return experiments.find((exp) => exp.slug === normalized)?.id ?? null
}

function formatExperimentSaveError(err, slug, labels) {
  const msg = err?.message || ''
  if (msg.includes('lab_experiments_pack_slug_slug_key') || /already exists in this pack/i.test(msg)) {
    return labels.experimentSlugDuplicate?.replace('{{slug}}', slug) || msg
  }
  return msg
}

/**
 * L2 experiments + L3 steps editor for a saved lab pack slug.
 * @param {{ packSlug: string, labels: object }} props
 */
export default function AdminLabPackHierarchyEditor({ packSlug, labels }) {
  const [experiments, setExperiments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [expForm, setExpForm] = useState(emptyExperiment())
  const [editingExpId, setEditingExpId] = useState(null)
  const [stepForm, setStepForm] = useState(emptyStep())
  const [editingStepId, setEditingStepId] = useState(null)
  const [activeExperimentId, setActiveExperimentId] = useState(null)
  const [level3Tab, setLevel3Tab] = useState('steps')
  const [expMaterialsJson, setExpMaterialsJson] = useState('[]')
  const [saving, setSaving] = useState(false)
  const saveExperimentLock = useRef(false)

  const reload = useCallback(async () => {
    if (!packSlug) return
    setLoading(true)
    setError(null)
    try {
      const data = await fetchAdminLabPackExperiments(packSlug)
      setExperiments(data.experiments || [])
    } catch (err) {
      setError(err.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [packSlug])

  useEffect(() => {
    reload()
  }, [reload])

  useEffect(() => {
    if (!activeExperimentId || !experiments.length) return
    const fresh = experiments.find((e) => e.id === activeExperimentId)
    if (!fresh) return
    if (editingExpId === activeExperimentId) {
      setExpForm((prev) => ({
        ...prev,
        runtime_config: normalizeRuntimeConfig(fresh.runtimeConfig || fresh.runtime_config),
      }))
    }
  }, [experiments, activeExperimentId, editingExpId])

  const activeExperiment = experiments.find((e) => e.id === activeExperimentId) || null

  const startEditExperiment = (exp) => {
    setEditingExpId(exp.id)
    setExpForm({
      slug: exp.slug,
      title: exp.title,
      content: exp.content || '',
      purpose: exp.purpose || '',
      materials_list: exp.materialsList || [],
      sort_order: exp.sortOrder || 0,
      status: exp.status || 'live',
      runtime_config: normalizeRuntimeConfig(exp.runtimeConfig || exp.runtime_config),
    })
    setExpMaterialsJson(JSON.stringify(exp.materialsList || [], null, 2))
    setActiveExperimentId(exp.id)
    setEditingStepId(null)
    setStepForm(emptyStep())
  }

  const startNewExperiment = () => {
    setEditingExpId(null)
    setExpForm(emptyExperiment())
    setExpMaterialsJson('[]')
    setActiveExperimentId(null)
    setEditingStepId(null)
    setStepForm(emptyStep())
  }

  const saveExperiment = async (e) => {
    e?.preventDefault?.()
    if (saveExperimentLock.current) return
    const materials = parseMaterialsJson(expMaterialsJson)
    if (materials === null) {
      setError(labels.materialsJsonInvalid)
      return
    }
    const slug = String(expForm.slug || '').trim()
    const targetId = resolveExperimentId(editingExpId, slug, experiments)
    saveExperimentLock.current = true
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const { experiment } = await saveLabExperiment(
        packSlug,
        {
          ...expForm,
          slug,
          materials_list: materials,
          runtime_config: normalizeRuntimeConfig(expForm.runtime_config),
        },
        { id: targetId }
      )
      setSuccess(labels.experimentSaved)
      if (experiment?.id) {
        setActiveExperimentId(experiment.id)
        setEditingExpId(experiment.id)
        setExpForm((prev) => ({
          ...prev,
          slug: experiment.slug || slug,
          runtime_config: normalizeRuntimeConfig(experiment.runtimeConfig || experiment.runtime_config),
        }))
      }
      await reload()
    } catch (err) {
      setError(formatExperimentSaveError(err, slug, labels))
    } finally {
      saveExperimentLock.current = false
      setSaving(false)
    }
  }

  const removeExperiment = async (id) => {
    if (!window.confirm(labels.confirmDeleteExperiment)) return
    setSaving(true)
    try {
      await deleteLabExperiment(id)
      if (activeExperimentId === id) startNewExperiment()
      await reload()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const startEditStep = (step) => {
    setEditingStepId(step.id)
    setStepForm({
      title: step.title || '',
      step_type: step.stepType,
      body: step.body || '',
      video_url: step.videoUrl || '',
      cloudflare_video_id: step.cloudflareVideoId || '',
      ppt_url: step.pptUrl || '',
      external_url: step.externalUrl || '',
      download_url: step.downloadUrl || '',
      download_label: step.downloadLabel || '',
      programming_config: step.programmingConfig || { labId: '' },
      sort_order: step.sortOrder || 0,
    })
  }

  const saveStep = async (e) => {
    e.preventDefault()
    if (!activeExperimentId) {
      setError(labels.selectExperimentFirst)
      return
    }
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      await saveLabStep(
        activeExperimentId,
        {
          ...stepForm,
          programming_config: { labId: stepForm.programming_config?.labId || '' },
        },
        { id: editingStepId }
      )
      setSuccess(labels.stepSaved)
      setEditingStepId(null)
      setStepForm(emptyStep())
      await reload()
      setActiveExperimentId(activeExperimentId)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const removeStep = async (id) => {
    if (!window.confirm(labels.confirmDeleteStep)) return
    setSaving(true)
    try {
      await deleteLabStep(id)
      if (editingStepId === id) {
        setEditingStepId(null)
        setStepForm(emptyStep())
      }
      await reload()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (!packSlug) {
    return (
      <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
        {labels.savePackFirst}
      </p>
    )
  }

  return (
    <div className="mt-8 pt-8 border-t border-slate-200 space-y-6">
      <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3">
        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{labels.level2Title}</p>
        <p className="text-xs text-slate-600 mt-1">{labels.level2Desc}</p>
        <p className="text-[10px] font-mono text-slate-400 mt-2">
          {labels.packSlugLabel || 'Pack'}: {packSlug}
        </p>
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
      {loading ? <p className="text-sm text-slate-500">{labels.loading}</p> : null}

      {!loading ? (
        <div className="grid xl:grid-cols-2 gap-6">
          <section className="rounded-xl border border-slate-200 p-4 space-y-4 bg-white">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-sm font-semibold text-bingo-dark">{labels.experimentList}</h4>
              <button type="button" onClick={startNewExperiment} className="text-xs text-primary font-semibold">
                {labels.addExperiment}
              </button>
            </div>

            {experiments.length === 0 ? (
              <p className="text-xs text-slate-500">{labels.noExperiments}</p>
            ) : (
              <ul className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {experiments.map((exp, index) => (
                  <li key={exp.id} className="p-3 flex items-start justify-between gap-2 bg-white">
                    <button type="button" onClick={() => startEditExperiment(exp)} className="text-left flex-1 min-w-0">
                      <p className="font-medium text-sm text-bingo-dark truncate">
                        {index + 1}. {exp.title}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {exp.slug} · {labels.stepCount(exp.stepCount ?? 0)}
                        {hasExperimentRuntime(exp.runtimeConfig) ? ` · ${labels.runtimeConfigured}` : ''}
                      </p>
                    </button>
                    <button type="button" onClick={() => removeExperiment(exp.id)} className="text-[10px] text-red-600 shrink-0">
                      {labels.delete}
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <form onSubmit={saveExperiment} className="space-y-3 border-t border-slate-100 pt-4">
              <h4 className="text-sm font-semibold">{editingExpId ? labels.editExperiment : labels.newExperiment}</h4>
              <input
                className={inputClass}
                placeholder={labels.expSlugPh}
                value={expForm.slug}
                onChange={(e) => setExpForm((f) => ({ ...f, slug: e.target.value }))}
                required
              />
              <input
                className={inputClass}
                placeholder={labels.expNamePh}
                value={expForm.title}
                onChange={(e) => setExpForm((f) => ({ ...f, title: e.target.value }))}
                required
              />
              <textarea
                className={`${inputClass} min-h-[72px]`}
                placeholder={labels.expContentPh}
                value={expForm.content}
                onChange={(e) => setExpForm((f) => ({ ...f, content: e.target.value }))}
              />
              <textarea
                className={`${inputClass} min-h-[60px]`}
                placeholder={labels.expPurposePh}
                value={expForm.purpose}
                onChange={(e) => setExpForm((f) => ({ ...f, purpose: e.target.value }))}
              />
              <label className="block text-xs text-slate-500">
                {labels.expMaterialsLabel}
                <textarea
                  className={`${inputClass} mt-1 font-mono text-xs min-h-[64px]`}
                  value={expMaterialsJson}
                  onChange={(e) => setExpMaterialsJson(e.target.value)}
                />
              </label>
              <button type="submit" disabled={saving} className="btn-primary text-sm px-4 py-2 disabled:opacity-60">
                {saving ? labels.saving : labels.saveExperiment}
              </button>
            </form>
          </section>

          <section className="rounded-xl border border-slate-200 p-4 space-y-4 bg-white">
            <div>
              <h4 className="text-sm font-semibold text-bingo-dark">{labels.level3Title}</h4>
              <p className="text-xs text-slate-500 mt-1">{labels.level3Desc}</p>
            </div>

            {!activeExperiment ? (
              <p className="text-sm text-slate-500">{labels.selectExperimentHint}</p>
            ) : (
              <>
                <p className="text-xs text-slate-600">
                  {labels.editingStepsFor}: <strong>{activeExperiment.title}</strong>
                </p>

                <div className="flex gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setLevel3Tab('steps')}
                    className={`flex-1 text-xs font-semibold py-2 rounded-lg transition ${
                      level3Tab === 'steps' ? 'bg-white text-bingo-dark shadow-sm' : 'text-slate-500'
                    }`}
                  >
                    {labels.tabSteps}
                  </button>
                  <button
                    type="button"
                    onClick={() => setLevel3Tab('runtime')}
                    className={`flex-1 text-xs font-semibold py-2 rounded-lg transition ${
                      level3Tab === 'runtime' ? 'bg-white text-bingo-dark shadow-sm' : 'text-slate-500'
                    }`}
                  >
                    {labels.tabRuntime}
                  </button>
                </div>

                {level3Tab === 'runtime' ? (
                  <div className="space-y-4 border border-slate-100 rounded-xl p-4 bg-slate-50/50">
                    <AdminLabExperimentRuntimeEditor
                      value={expForm.runtime_config}
                      onChange={(runtime_config) => setExpForm((f) => ({ ...f, runtime_config }))}
                      labels={labels}
                      packSlug={packSlug}
                      experimentSlug={expForm.slug}
                      disabled={!editingExpId}
                    />
                    {!editingExpId ? (
                      <p className="text-xs text-amber-700">{labels.saveExperimentBeforeRuntime}</p>
                    ) : (
                      <button
                        type="button"
                        disabled={saving}
                        onClick={saveExperiment}
                        className="btn-primary text-sm px-4 py-2 disabled:opacity-60"
                      >
                        {saving ? labels.saving : labels.saveRuntime}
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                <ul className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {(activeExperiment.steps || []).map((step, index) => (
                    <li key={step.id} className="p-3 flex items-start justify-between gap-2 bg-white">
                      <button type="button" onClick={() => startEditStep(step)} className="text-left flex-1">
                        <p className="text-sm font-medium">
                          {index + 1}. {step.title || step.stepType}
                        </p>
                        <p className="text-[10px] text-slate-500">{step.stepType}</p>
                      </button>
                      <button type="button" onClick={() => removeStep(step.id)} className="text-[10px] text-red-600">
                        {labels.delete}
                      </button>
                    </li>
                  ))}
                </ul>

                <form onSubmit={saveStep} className="space-y-3 border-t border-slate-100 pt-4">
                  <h4 className="text-sm font-semibold">{editingStepId ? labels.editStep : labels.newStep}</h4>
                  <select
                    className={inputClass}
                    value={stepForm.step_type}
                    onChange={(e) => setStepForm((f) => ({ ...f, step_type: e.target.value }))}
                  >
                    {LAB_STEP_TYPES.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.icon} {t.label}
                      </option>
                    ))}
                  </select>
                  <input
                    className={inputClass}
                    placeholder={labels.stepTitlePh}
                    value={stepForm.title}
                    onChange={(e) => setStepForm((f) => ({ ...f, title: e.target.value }))}
                  />
                  <textarea
                    className={`${inputClass} min-h-[72px]`}
                    placeholder={labels.stepBodyPh}
                    value={stepForm.body}
                    onChange={(e) => setStepForm((f) => ({ ...f, body: e.target.value }))}
                  />
                  {stepForm.step_type === 'video' ? (
                    <>
                      <input
                        className={inputClass}
                        placeholder={labels.videoUrlPh}
                        value={stepForm.video_url}
                        onChange={(e) => setStepForm((f) => ({ ...f, video_url: e.target.value }))}
                      />
                      <input
                        className={inputClass}
                        placeholder={labels.cloudflarePh}
                        value={stepForm.cloudflare_video_id}
                        onChange={(e) => setStepForm((f) => ({ ...f, cloudflare_video_id: e.target.value }))}
                      />
                    </>
                  ) : null}
                  {stepForm.step_type === 'ppt' ? (
                    <input
                      className={inputClass}
                      placeholder={labels.pptUrlPh}
                      value={stepForm.ppt_url}
                      onChange={(e) => setStepForm((f) => ({ ...f, ppt_url: e.target.value }))}
                    />
                  ) : null}
                  {stepForm.step_type === 'link' ? (
                    <input
                      className={inputClass}
                      placeholder={labels.linkUrlPh}
                      value={stepForm.external_url}
                      onChange={(e) => setStepForm((f) => ({ ...f, external_url: e.target.value }))}
                    />
                  ) : null}
                  {stepForm.step_type === 'download' ? (
                    <>
                      <input
                        className={inputClass}
                        placeholder={labels.downloadUrlPh}
                        value={stepForm.download_url}
                        onChange={(e) => setStepForm((f) => ({ ...f, download_url: e.target.value }))}
                      />
                      <input
                        className={inputClass}
                        placeholder={labels.downloadLabelPh}
                        value={stepForm.download_label}
                        onChange={(e) => setStepForm((f) => ({ ...f, download_label: e.target.value }))}
                      />
                    </>
                  ) : null}
                  {stepForm.step_type === 'programming' ? (
                    <input
                      className={inputClass}
                      placeholder={labels.programmingLabPh}
                      value={stepForm.programming_config?.labId || ''}
                      onChange={(e) =>
                        setStepForm((f) => ({
                          ...f,
                          programming_config: { ...f.programming_config, labId: e.target.value },
                        }))
                      }
                    />
                  ) : null}
                  <button type="submit" disabled={saving} className="btn-primary text-sm px-4 py-2 disabled:opacity-60">
                    {saving ? labels.saving : labels.saveStep}
                  </button>
                </form>
                  </>
                )}
              </>
            )}
          </section>
        </div>
      ) : null}
    </div>
  )
}

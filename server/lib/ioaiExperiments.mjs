import {
  mapExperimentRow as mapPackExperimentRow,
  mapStepRow,
  normalizeMaterialsList,
  pickStepPayload,
} from './labExperiments.mjs'

const STEP_TYPES = new Set(['text', 'video', 'ppt', 'link', 'programming', 'download'])

function sortByOrder(a, b) {
  return (a.sort_order ?? 0) - (b.sort_order ?? 0)
}

function normalizeRuntimeConfig(raw) {
  const base = {
    type: 'steps_only',
    url: '',
    internalPath: '',
    labId: '',
    downloadLabel: '',
    embedHeight: 520,
    openInNewTab: false,
  }
  if (!raw || typeof raw !== 'object') return base
  const allowed = new Set([
    'steps_only',
    'external_link',
    'iframe',
    'html_page',
    'programming',
    'interactive',
    'install_package',
  ])
  return {
    type: allowed.has(raw.type) ? raw.type : base.type,
    url: String(raw.url || '').trim(),
    internalPath: String(raw.internalPath || raw.internal_path || '').trim(),
    labId: String(raw.labId || raw.lab_id || '').trim(),
    downloadLabel: String(raw.downloadLabel || raw.download_label || '').trim(),
    embedHeight: Math.max(280, parseInt(raw.embedHeight ?? raw.embed_height, 10) || 520),
    openInNewTab: Boolean(raw.openInNewTab ?? raw.open_in_new_tab),
  }
}

export function mapPublicMaterialRow(row) {
  if (!row) return null
  return {
    id: row.id,
    title: row.title || '',
    fileUrl: row.file_url,
    fileName: row.file_name || '',
    sortOrder: row.sort_order ?? 0,
  }
}

export function mapPublicExperimentRow(row, { includeSteps = false } = {}) {
  if (!row) return null
  const stepRows = includeSteps ? row.steps || row.step_rows || [] : []
  const steps = includeSteps
    ? [...stepRows].sort(sortByOrder).map(mapStepRow).filter(Boolean)
    : undefined
  let stepCount = null
  if (includeSteps) {
    stepCount = steps.length
  } else if (Array.isArray(row.steps) && row.steps[0]?.count != null) {
    stepCount = row.steps[0].count
  }
  const materials = [...(row.material_files || row.ioai_experiment_materials || [])]
    .sort(sortByOrder)
    .map(mapPublicMaterialRow)
    .filter(Boolean)

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    content: row.content || '',
    purpose: row.purpose || '',
    materialsList: normalizeMaterialsList(row.materials_list),
    materialFiles: materials,
    runtimeConfig: normalizeRuntimeConfig(row.runtime_config),
    sortOrder: row.sort_order ?? 0,
    status: row.status || 'live',
    stepCount,
    ...(includeSteps ? { steps } : {}),
  }
}

export function pickPublicExperimentPayload(body = {}) {
  const slug = String(body.slug || '').trim()
  const title = String(body.title || '').trim()
  if (!slug) return { error: 'slug is required' }
  if (!title) return { error: 'title is required' }
  return {
    row: {
      slug,
      title,
      content: String(body.content || '').trim(),
      purpose: String(body.purpose || '').trim(),
      materials_list: normalizeMaterialsList(body.materials_list || body.materialsList),
      runtime_config: normalizeRuntimeConfig(body.runtime_config || body.runtimeConfig),
      sort_order: parseInt(body.sort_order ?? body.sortOrder, 10) || 0,
      status: body.status || 'live',
      updated_at: new Date().toISOString(),
    },
  }
}

export function pickMaterialFilePayload(body = {}) {
  const fileUrl = String(body.file_url || body.fileUrl || '').trim()
  if (!fileUrl) return { error: 'file_url is required' }
  return {
    row: {
      title: String(body.title || body.file_name || body.fileName || 'Download').trim(),
      file_url: fileUrl,
      file_name: String(body.file_name || body.fileName || '').trim() || null,
      sort_order: parseInt(body.sort_order ?? body.sortOrder, 10) || 0,
    },
  }
}

export function pickLessonMaterialPayload(body = {}) {
  const picked = pickMaterialFilePayload(body)
  if (picked.error) return picked
  return picked
}

const EXPERIMENT_SELECT = `
  id, slug, title, content, purpose, materials_list, runtime_config, sort_order, status,
  material_files:ioai_experiment_materials ( id, title, file_url, file_name, sort_order )
`

const EXPERIMENT_SELECT_WITH_STEPS = `
  id, slug, title, content, purpose, materials_list, runtime_config, sort_order, status,
  material_files:ioai_experiment_materials ( id, title, file_url, file_name, sort_order ),
  steps:ioai_experiment_steps (
    id, title, step_type, body, video_url, cloudflare_video_id, ppt_url,
    external_url, download_url, download_label, programming_config, sort_order
  )
`

export async function fetchPublicExperimentBySlug(admin, slug, { includeSteps = false } = {}) {
  const select = includeSteps
    ? EXPERIMENT_SELECT_WITH_STEPS
    : `${EXPERIMENT_SELECT}, steps:ioai_experiment_steps(count)`

  const { data, error } = await admin.from('ioai_experiments').select(select).eq('slug', slug).maybeSingle()

  if (error) return { error: error.message }
  if (!data || data.status === 'hidden') return { error: 'Experiment not found' }
  return { experiment: mapPublicExperimentRow(data, { includeSteps }) }
}

export async function fetchPublicExperimentById(admin, id, { includeSteps = false } = {}) {
  const select = includeSteps ? EXPERIMENT_SELECT_WITH_STEPS : `${EXPERIMENT_SELECT}, steps:ioai_experiment_steps(count)`

  const { data, error } = await admin
    .from('ioai_experiments')
    .select(select)
    .eq('id', id)
    .maybeSingle()

  if (error) return { error: error.message }
  if (!data) return { error: 'Experiment not found' }
  return { experiment: mapPublicExperimentRow(data, { includeSteps }) }
}

export async function listPublicExperiments(admin, { status = null, includeDraft = true } = {}) {
  let query = admin
    .from('ioai_experiments')
    .select(`${EXPERIMENT_SELECT}, steps:ioai_experiment_steps(count)`)
    .order('sort_order')

  if (status) query = query.eq('status', status)
  else if (!includeDraft) query = query.neq('status', 'hidden').neq('status', 'draft')

  const { data, error } = await query
  if (error) return { error: error.message }
  return {
    experiments: (data || [])
      .sort(sortByOrder)
      .map((row) => mapPublicExperimentRow(row, { includeSteps: false })),
  }
}

export async function resolvePackExperiments(admin, packSlug, { includeSteps = false } = {}) {
  const { data: refs, error: refErr } = await admin
    .from('lab_pack_experiment_refs')
    .select('experiment_id, sort_order')
    .eq('pack_slug', packSlug)
    .order('sort_order')

  if (refErr) return { error: refErr.message }

  if (refs?.length) {
    const ids = refs.map((r) => r.experiment_id)
    const select = includeSteps ? EXPERIMENT_SELECT_WITH_STEPS : `${EXPERIMENT_SELECT}, steps:ioai_experiment_steps(count)`
    const { data, error } = await admin.from('ioai_experiments').select(select).in('id', ids)
    if (error) return { error: error.message }

    const byId = new Map((data || []).map((row) => [row.id, row]))
    const ordered = refs
      .map((ref) => byId.get(ref.experiment_id))
      .filter((row) => row && row.status !== 'hidden' && (includeSteps || row.status === 'live'))
      .map((row) => mapPublicExperimentRow(row, { includeSteps }))

    return { experiments: ordered, source: 'library' }
  }

  const selectBody = includeSteps
    ? `steps:lab_experiment_steps (
        id, title, step_type, body, video_url, cloudflare_video_id, ppt_url,
        external_url, download_url, download_label, programming_config, sort_order
      )`
    : `steps:lab_experiment_steps(count)`

  const { data: legacy, error: legErr } = await admin
    .from('lab_experiments')
    .select(`id, pack_slug, slug, title, content, purpose, materials_list, runtime_config, sort_order, status, ioai_experiment_id, ${selectBody}`)
    .eq('pack_slug', packSlug)
    .order('sort_order')

  if (legErr) return { error: legErr.message }

  const experiments = (legacy || [])
    .filter((e) => includeSteps || e.status === 'live')
    .sort(sortByOrder)
    .map((e) => mapPackExperimentRow(e, { includeSteps }))

  return { experiments, source: 'legacy' }
}

export async function fetchLessonResources(admin, lessonId) {
  const { data: bindings, error: bindErr } = await admin
    .from('lesson_experiment_bindings')
    .select(
      `
      id, enabled, sort_order,
      experiment:ioai_experiments (
        id, slug, title, content, purpose, materials_list, runtime_config, status, sort_order,
        material_files:ioai_experiment_materials ( id, title, file_url, file_name, sort_order ),
        steps:ioai_experiment_steps(count)
      )
    `
    )
    .eq('lesson_id', lessonId)
    .eq('enabled', true)
    .order('sort_order')

  if (bindErr) return { error: bindErr.message }

  const { data: lessonMaterials, error: matErr } = await admin
    .from('lesson_materials')
    .select('id, title, file_url, file_name, sort_order')
    .eq('lesson_id', lessonId)
    .order('sort_order')

  if (matErr) return { error: matErr.message }

  const experiments = (bindings || [])
    .map((b) => b.experiment)
    .filter((exp) => exp && exp.status === 'live')
    .sort(sortByOrder)
    .map((row) => mapPublicExperimentRow(row, { includeSteps: false }))

  return {
    experiments,
    lessonMaterials: (lessonMaterials || []).sort(sortByOrder).map(mapPublicMaterialRow).filter(Boolean),
    hasExperiments: experiments.length > 0,
    hasLessonMaterials: (lessonMaterials || []).length > 0,
  }
}

export async function fetchLessonResourcesByCatalogSlug(admin, catalogSlug) {
  const { data: lesson, error } = await admin
    .from('lessons')
    .select('id')
    .or(`catalog_slug.eq.${catalogSlug},slug.eq.${catalogSlug}`)
    .maybeSingle()

  if (error) return { error: error.message }
  if (!lesson) return { experiments: [], lessonMaterials: [], hasExperiments: false, hasLessonMaterials: false }
  return fetchLessonResources(admin, lesson.id)
}

export async function saveLessonExperimentBindings(admin, lessonId, bindings = []) {
  await admin.from('lesson_experiment_bindings').delete().eq('lesson_id', lessonId)
  if (!bindings.length) return []

  const rows = bindings.map((b, index) => ({
    lesson_id: lessonId,
    experiment_id: b.experimentId || b.experiment_id,
    enabled: b.enabled !== false,
    sort_order: b.sort_order ?? b.sortOrder ?? index,
  }))

  const { data, error } = await admin.from('lesson_experiment_bindings').insert(rows).select()
  if (error) throw new Error(error.message)
  return data
}

export async function saveLessonMaterials(admin, lessonId, materials = []) {
  await admin.from('lesson_materials').delete().eq('lesson_id', lessonId)
  if (!materials.length) return []

  const rows = materials.map((m, index) => ({
    lesson_id: lessonId,
    title: String(m.title || 'Download').trim(),
    file_url: String(m.fileUrl || m.file_url || '').trim(),
    file_name: String(m.fileName || m.file_name || '').trim() || null,
    sort_order: m.sort_order ?? m.sortOrder ?? index,
  })).filter((m) => m.file_url)

  if (!rows.length) return []
  const { data, error } = await admin.from('lesson_materials').insert(rows).select()
  if (error) throw new Error(error.message)
  return data
}

export async function savePackExperimentRefs(admin, packSlug, experimentIds = []) {
  await admin.from('lab_pack_experiment_refs').delete().eq('pack_slug', packSlug)
  if (!experimentIds.length) return []

  const rows = experimentIds.map((experimentId, index) => ({
    pack_slug: packSlug,
    experiment_id: experimentId,
    sort_order: index,
  }))

  const { data, error } = await admin.from('lab_pack_experiment_refs').insert(rows).select()
  if (error) throw new Error(error.message)
  return data
}

export async function copyPublicExperiment(admin, sourceId) {
  const { experiment, error } = await fetchPublicExperimentById(admin, sourceId, { includeSteps: true })
  if (error) throw new Error(error)

  let slug = `${experiment.slug}-copy`
  let n = 2
  while (true) {
    const { data: existing } = await admin.from('ioai_experiments').select('id').eq('slug', slug).maybeSingle()
    if (!existing) break
    slug = `${experiment.slug}-copy-${n}`
    n += 1
  }

  const { data: created, error: createErr } = await admin
    .from('ioai_experiments')
    .insert({
      slug,
      title: `${experiment.title} (copy)`,
      content: experiment.content,
      purpose: experiment.purpose,
      materials_list: experiment.materialsList,
      runtime_config: experiment.runtimeConfig,
      status: 'draft',
      sort_order: experiment.sortOrder,
    })
    .select('id')
    .single()

  if (createErr) throw new Error(createErr.message)

  if (experiment.steps?.length) {
    const stepRows = experiment.steps.map((step, index) => ({
      experiment_id: created.id,
      title: step.title,
      step_type: step.stepType,
      body: step.body,
      video_url: step.videoUrl,
      cloudflare_video_id: step.cloudflareVideoId,
      ppt_url: step.pptUrl,
      external_url: step.externalUrl,
      download_url: step.downloadUrl,
      download_label: step.downloadLabel,
      programming_config: step.programmingConfig || {},
      sort_order: step.sortOrder ?? index,
    }))
    const { error: stepErr } = await admin.from('ioai_experiment_steps').insert(stepRows)
    if (stepErr) throw new Error(stepErr.message)
  }

  if (experiment.materialFiles?.length) {
    const matRows = experiment.materialFiles.map((m, index) => ({
      experiment_id: created.id,
      title: m.title,
      file_url: m.fileUrl,
      file_name: m.fileName,
      sort_order: m.sortOrder ?? index,
    }))
    const { error: matErr } = await admin.from('ioai_experiment_materials').insert(matRows)
    if (matErr) throw new Error(matErr.message)
  }

  return fetchPublicExperimentById(admin, created.id, { includeSteps: true })
}

export async function enrichLessonsWithResourceFlags(admin, lessonIds) {
  if (!lessonIds?.length) return new Map()

  const [{ data: bindings }, { data: materials }] = await Promise.all([
    admin.from('lesson_experiment_bindings').select('lesson_id').eq('enabled', true).in('lesson_id', lessonIds),
    admin.from('lesson_materials').select('lesson_id').in('lesson_id', lessonIds),
  ])

  const expSet = new Set((bindings || []).map((b) => b.lesson_id))
  const matSet = new Set((materials || []).map((m) => m.lesson_id))
  const map = new Map()
  for (const id of lessonIds) {
    map.set(id, { hasExperiments: expSet.has(id), hasLessonMaterials: matSet.has(id) })
  }
  return map
}

export { pickStepPayload, mapStepRow } from './labExperiments.mjs'

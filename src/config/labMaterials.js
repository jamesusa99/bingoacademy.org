/** Lab & materials types — bind to curriculum modules (L3); legacy rows may use lesson_id */

export const LAB_MATERIAL_TYPES = [
  { id: 'training-lab', name: '集训 Lab', nameEn: 'Training Lab', icon: '🏕️' },
  { id: 'online-lab', name: '在线 Lab', nameEn: 'Online Lab', icon: '🧪' },
  { id: 'online-lab-kit', name: '在线材料包', nameEn: 'Online Lab Kit', icon: '📦' },
  { id: 'offline-lab', name: '线下 Lab', nameEn: 'Offline Lab', icon: '🔬' },
  { id: 'offline-lab-kit', name: '线下材料包', nameEn: 'Offline Lab Kit', icon: '🛠️' },
]

export const LAB_MATERIAL_TYPE_IDS = LAB_MATERIAL_TYPES.map((t) => t.id)

const LEGACY_SUB_MAP = {
  'materials-pack': 'online-lab-kit',
  'school-kit': 'offline-lab-kit',
}

/** Normalize legacy sub ids → unified lab/material type ids */
export function normalizeLabMaterialSub(sub, line) {
  if (!sub) return 'online-lab'
  if (LEGACY_SUB_MAP[sub]) return LEGACY_SUB_MAP[sub]
  if (sub === 'online-lab' && line === 'ioai') return 'training-lab'
  if (LAB_MATERIAL_TYPE_IDS.includes(sub)) return sub
  return sub
}

export function labMaterialTypeLabel(sub, line, { locale = 'en' } = {}) {
  const id = normalizeLabMaterialSub(sub, line)
  const row = LAB_MATERIAL_TYPES.find((t) => t.id === id)
  if (!row) return id
  return locale === 'zh' ? row.name : row.nameEn || row.name
}

export function deliveryTypeForLabSub(sub, line) {
  const id = normalizeLabMaterialSub(sub, line)
  if (id === 'online-lab-kit' || id === 'offline-lab-kit') return 'materials'
  return 'lab'
}

function sortRows(rows) {
  return [...(rows || [])].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
}

/** Flatten curriculum tree into lesson index + picker options for one product line */
export function buildCurriculumLessonIndex(levels, productLine) {
  /** @type {Map<string, object>} */
  const byId = new Map()
  /** @type {Array<object>} */
  const options = []

  for (const level of sortRows(levels)) {
    for (const theme of sortRows(level.themes)) {
      const categoryLabel = theme.category_label || theme.title
      for (const mod of sortRows(theme.modules)) {
        for (const lesson of sortRows(mod.lessons)) {
          const entry = {
            lessonId: lesson.id,
            moduleId: mod.id,
            productLine,
            stage: level.title,
            stageSlug: level.slug,
            category: categoryLabel,
            categorySlug: theme.slug,
            module: mod.title,
            moduleSlug: mod.slug,
            lessonTitle: lesson.title,
            lessonSlug: lesson.slug,
            catalogSlug: lesson.catalog_slug || lesson.slug,
            label: `${level.title} · ${categoryLabel} · ${mod.title} · ${lesson.title}`,
          }
          byId.set(lesson.id, entry)
          options.push(entry)
        }
      }
    }
  }

  return { byId, options }
}

/** Flatten curriculum tree into L3 module index + picker options for one product line */
export function buildCurriculumModuleIndex(levels, productLine) {
  /** @type {Map<string, object>} */
  const byId = new Map()
  /** @type {Array<object>} */
  const options = []

  for (const level of sortRows(levels)) {
    for (const theme of sortRows(level.themes)) {
      const categoryLabel = theme.category_label || theme.title
      for (const mod of sortRows(theme.modules)) {
        const entry = {
          moduleId: mod.id,
          productLine,
          stage: level.title,
          stageSlug: level.slug,
          category: categoryLabel,
          categorySlug: theme.slug,
          module: mod.title,
          moduleSlug: mod.slug,
          catalogSlug: mod.catalog_slug || mod.slug,
          label: `${level.title} · ${categoryLabel} · ${mod.title}`,
        }
        byId.set(mod.id, entry)
        options.push(entry)
      }
    }
  }

  return { byId, options }
}

function resolveRowModuleId(row, lessonById) {
  if (row.module_id) return row.module_id
  if (row.lesson_id && lessonById.has(row.lesson_id)) {
    return lessonById.get(row.lesson_id).moduleId
  }
  return null
}

/** Lab/material catalog rows bound to one L3 module (module_id or legacy lesson_id). */
export function filterLabMaterialsForModule(items, moduleDbId, productLine, lessonIds = []) {
  if (!moduleDbId || !productLine) return []
  const lessonSet = new Set(lessonIds)
  return sortRows(
    (items || []).filter((row) => {
      if (row.line !== productLine) return false
      if (row.module_id === moduleDbId) return true
      if (row.module_id) return false
      return row.lesson_id && lessonSet.has(row.lesson_id)
    })
  )
}

export function partitionLabAndMaterialItems(items, productLine) {
  const labs = []
  const materials = []
  for (const row of sortRows(items)) {
    if (deliveryTypeForLabSub(row.sub, productLine) === 'materials') {
      materials.push(row)
    } else {
      labs.push(row)
    }
  }
  return { labs, materials }
}

/** Group lab/material catalog rows under curriculum modules (L3) */
export function groupLabMaterialsByModule(items, levelsByLine, lineFilter = 'all') {
  const lines = lineFilter === 'all' ? ['ioai', 'general', 'k12'] : [lineFilter]
  /** @type {Array<object>} */
  const groups = []
  /** @type {object[]} */
  const unassigned = []

  const assignedIds = new Set()

  for (const line of lines) {
    const levels = levelsByLine[line] || []
    const { byId: moduleById } = buildCurriculumModuleIndex(levels, line)
    const { byId: lessonById } = buildCurriculumLessonIndex(levels, line)
    const lineItems = items.filter((row) => row.line === line)

    for (const [, modEntry] of moduleById) {
      const bound = sortRows(lineItems.filter((row) => resolveRowModuleId(row, lessonById) === modEntry.moduleId))
      if (!bound.length) continue
      bound.forEach((row) => assignedIds.add(row.slug))
      groups.push({ line, module: modEntry, items: bound })
    }
  }

  for (const row of items) {
    if (lineFilter !== 'all' && row.line !== lineFilter) continue
    const lines = lineFilter === 'all' ? ['ioai', 'general', 'k12'] : [lineFilter]
    let moduleId = null
    for (const line of lines) {
      if (row.line !== line) continue
      const { byId: lessonById } = buildCurriculumLessonIndex(levelsByLine[line] || [], line)
      moduleId = resolveRowModuleId(row, lessonById)
      if (moduleId) break
    }
    if (!moduleId && !assignedIds.has(row.slug)) {
      unassigned.push(row)
    }
  }

  return { groups, unassigned }
}

/** @deprecated use groupLabMaterialsByModule */
export function groupLabMaterialsByLesson(items, levelsByLine, lineFilter = 'all') {
  return groupLabMaterialsByModule(items, levelsByLine, lineFilter)
}

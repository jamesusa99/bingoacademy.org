/** Lab & materials types — all bind to curriculum lessons (1 lesson → N items) */

export const LAB_MATERIAL_TYPES = [
  { id: 'training-lab', name: '集训 Lab', icon: '🏕️' },
  { id: 'online-lab', name: '在线 Lab', icon: '🧪' },
  { id: 'online-lab-kit', name: '在线材料包', icon: '📦' },
  { id: 'offline-lab', name: '线下 Lab', icon: '🔬' },
  { id: 'offline-lab-kit', name: '线下材料包', icon: '🛠️' },
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

export function labMaterialTypeLabel(sub, line) {
  const id = normalizeLabMaterialSub(sub, line)
  return LAB_MATERIAL_TYPES.find((t) => t.id === id)?.name || id
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

/** Group lab/material catalog rows under curriculum lessons */
export function groupLabMaterialsByLesson(items, levelsByLine, lineFilter = 'all') {
  const lines = lineFilter === 'all' ? ['ioai', 'general', 'k12'] : [lineFilter]
  /** @type {Array<object>} */
  const groups = []
  /** @type {object[]} */
  const unassigned = []

  const assignedIds = new Set()

  for (const line of lines) {
    const levels = levelsByLine[line] || []
    const { byId } = buildCurriculumLessonIndex(levels, line)
    const lineItems = items.filter((row) => row.line === line)

    for (const [, lesson] of byId) {
      const bound = lineItems.filter((row) => row.lesson_id === lesson.lessonId)
      if (!bound.length) continue
      bound.forEach((row) => assignedIds.add(row.slug))
      groups.push({ line, lesson, items: bound })
    }
  }

  for (const row of items) {
    if (lineFilter !== 'all' && row.line !== lineFilter) continue
    if (!row.lesson_id || !assignedIds.has(row.slug)) {
      if (!assignedIds.has(row.slug)) unassigned.push(row)
    }
  }

  return { groups, unassigned }
}

/** Admin sidebar: curriculum lines with course + bundle management */

function buildCurriculumCollapsible(line, hubKey, curriculumKey, bundlesKey, icon) {
  const base = `/admin/curriculum/${line}`
  return {
    type: 'collapsible',
    id: `${line}-curriculum`,
    labelKey: hubKey,
    icon,
    basePath: base,
    children: [
      { path: base, labelKey: curriculumKey, icon: '📚', end: true },
      { path: `${base}/bundles`, labelKey: bundlesKey, icon: '📦' },
    ],
  }
}

export const IOAI_ADMIN_COLLAPSIBLE = buildCurriculumCollapsible(
  'ioai',
  'nav.ioaiHub',
  'nav.ioaiCurriculum',
  'nav.ioaiCourseBundles',
  '🏆'
)

export const GENERAL_ADMIN_COLLAPSIBLE = buildCurriculumCollapsible(
  'general',
  'nav.generalHub',
  'nav.generalCurriculum',
  'nav.generalCourseBundles',
  '🌐'
)

export const K12_ADMIN_COLLAPSIBLE = buildCurriculumCollapsible(
  'k12',
  'nav.k12Hub',
  'nav.k12Curriculum',
  'nav.k12CourseBundles',
  '🏫'
)

/** Shared curriculum config for IOAI, Foundations, and K12 video course lines */

export const CURRICULUM_LINES = ['ioai', 'general', 'k12']

/** Default product line in admin forms, filters, and empty states */
export const DEFAULT_ADMIN_PRODUCT_LINE = 'ioai'

export const PROGRAM_CURRICULUM = {
  ioai: {
    line: 'ioai',
    catalogSub: 'video',
    trackSlug: 'ioai-competition-system',
    slugPrefix: 'ioai',
    summaryTitle: 'IOAI Competition Course System',
    adminTitle: 'IOAI · 课程管理',
    adminTitleEn: 'IOAI · Course Management',
    adminPath: '/admin/curriculum/ioai',
    frontendPath: '/courses/ioai',
    catalogPrice: 'Included in IOAI Track',
    catalogAudience: 'IOAI competition trainees',
    i18nKey: 'ioaiCurriculum',
    bannerClass: 'bg-amber-50/60 border-amber-200/80',
    bannerTextClass: 'text-amber-900',
    bannerBodyClass: 'text-amber-950/80',
    icon: '🏆',
  },
  general: {
    line: 'general',
    catalogSub: 'course',
    trackSlug: 'foundations-full-track',
    slugPrefix: 'general',
    summaryTitle: 'Foundations of AI Program',
    adminTitle: 'Foundations · 课程管理',
    adminTitleEn: 'Foundations · Course Management',
    adminPath: '/admin/curriculum/general',
    frontendPath: '/courses/foundations',
    catalogPrice: 'Included in Foundations Track',
    catalogAudience: 'Self-paced AI learners',
    i18nKey: 'generalCurriculum',
    bannerClass: 'bg-cyan-50/60 border-cyan-200/80',
    bannerTextClass: 'text-cyan-900',
    bannerBodyClass: 'text-cyan-950/80',
    icon: '🌐',
  },
  k12: {
    line: 'k12',
    catalogSub: 'course',
    trackSlug: 'k12-classroom-track',
    slugPrefix: 'k12',
    summaryTitle: 'K12 Classroom AI Courses',
    adminTitle: 'K12 · 课程管理',
    adminTitleEn: 'K12 · Course Management',
    adminPath: '/admin/curriculum/k12',
    frontendPath: '/courses/k12',
    catalogPrice: 'School license',
    catalogAudience: 'K12 classroom teachers and students',
    i18nKey: 'k12Curriculum',
    bannerClass: 'bg-violet-50/60 border-violet-200/80',
    bannerTextClass: 'text-violet-900',
    bannerBodyClass: 'text-violet-950/80',
    icon: '🏫',
  },
}

export function getProgramCurriculum(line) {
  return PROGRAM_CURRICULUM[line] ?? PROGRAM_CURRICULUM.ioai
}

export function isCurriculumLine(line) {
  return line != null && line in PROGRAM_CURRICULUM
}

export function curriculumI18nKey(line) {
  return getProgramCurriculum(line).i18nKey
}

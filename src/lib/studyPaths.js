export const STUDY_HOME = '/profile/study'

export function studyModulePath(moduleSlug) {
  return `${STUDY_HOME}/module/${encodeURIComponent(moduleSlug)}`
}

export function studyLessonPath(lessonId, { play = false } = {}) {
  if (!lessonId) return STUDY_HOME
  const path = `${STUDY_HOME}/lesson/${encodeURIComponent(lessonId)}`
  return play ? `${path}?play=1` : path
}

export function isStudyCenterPath(pathname = '') {
  return pathname === STUDY_HOME || pathname.startsWith(`${STUDY_HOME}/`)
}

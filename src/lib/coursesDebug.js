/** Show Profile course-reset UI when ?debug=1 (production testing) */
export function isCoursesDebugEnabled(searchParams) {
  if (import.meta.env.DEV) return true
  return searchParams?.get('debug') === '1'
}

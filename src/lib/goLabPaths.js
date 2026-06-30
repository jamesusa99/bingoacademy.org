export function goLabPath(lessonId, { from, studyCenter = false } = {}) {
  if (!lessonId) return '/courses'
  const base = studyCenter
    ? `/profile/study/lesson/${encodeURIComponent(lessonId)}/golab`
    : `/courses/detail/${encodeURIComponent(lessonId)}/golab`
  const params = new URLSearchParams()
  if (from) params.set('from', from)
  const query = params.toString()
  return query ? `${base}?${query}` : base
}

export function lessonPathFromGoLab(lessonId, { from, studyCenter = false, play = true } = {}) {
  if (!lessonId) return studyCenter ? '/profile/study' : '/courses'
  if (studyCenter) {
    return play
      ? `/profile/study/lesson/${encodeURIComponent(lessonId)}?play=1`
      : `/profile/study/lesson/${encodeURIComponent(lessonId)}`
  }
  const params = new URLSearchParams()
  if (from) params.set('from', from)
  if (play) params.set('play', '1')
  const query = params.toString()
  const path = `/courses/detail/${encodeURIComponent(lessonId)}`
  return query ? `${path}?${query}` : path
}

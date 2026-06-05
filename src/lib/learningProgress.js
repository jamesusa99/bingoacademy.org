/** Client-side lesson progress (demo until Supabase enrollments ship) */

export const LEARNING_PROGRESS_KEY = 'bingo-learning-progress'

const SEGMENT_IDS = ['intro', 'video', 'checkpoint', 'summary']

function readStore() {
  try {
    const raw = localStorage.getItem(LEARNING_PROGRESS_KEY)
    const parsed = raw ? JSON.parse(raw) : {}
    return {
      lessons: parsed.lessons && typeof parsed.lessons === 'object' ? parsed.lessons : {},
      lastLessonId: parsed.lastLessonId ?? null,
    }
  } catch {
    return { lessons: {}, lastLessonId: null }
  }
}

function writeStore(store) {
  localStorage.setItem(LEARNING_PROGRESS_KEY, JSON.stringify(store))
}

export function defaultLessonProgress() {
  return {
    currentSegment: 0,
    segmentsDone: {},
    videoPosition: 0,
    completed: false,
    completedAt: null,
    lastVisitedAt: null,
  }
}

export function getLessonProgress(lessonId) {
  if (!lessonId) return defaultLessonProgress()
  const store = readStore()
  return { ...defaultLessonProgress(), ...store.lessons[lessonId] }
}

export function saveLessonProgress(lessonId, patch) {
  if (!lessonId) return defaultLessonProgress()
  const store = readStore()
  const prev = { ...defaultLessonProgress(), ...store.lessons[lessonId] }
  const next = {
    ...prev,
    ...patch,
    lastVisitedAt: Date.now(),
  }
  store.lessons[lessonId] = next
  store.lastLessonId = lessonId
  writeStore(store)
  return next
}

export function markSegmentDone(lessonId, segmentId) {
  const progress = getLessonProgress(lessonId)
  const segmentsDone = { ...progress.segmentsDone, [segmentId]: true }
  const segmentIndex = SEGMENT_IDS.indexOf(segmentId)
  const nextSegment = Math.min(SEGMENT_IDS.length - 1, segmentIndex + 1)
  return saveLessonProgress(lessonId, {
    segmentsDone,
    currentSegment: Math.max(progress.currentSegment, nextSegment),
  })
}

export function setVideoPosition(lessonId, seconds) {
  return saveLessonProgress(lessonId, { videoPosition: Math.max(0, seconds) })
}

export function setCurrentSegment(lessonId, index) {
  return saveLessonProgress(lessonId, {
    currentSegment: Math.max(0, Math.min(SEGMENT_IDS.length - 1, index)),
  })
}

export function markLessonComplete(lessonId) {
  const segmentsDone = Object.fromEntries(SEGMENT_IDS.map((id) => [id, true]))
  return saveLessonProgress(lessonId, {
    segmentsDone,
    currentSegment: SEGMENT_IDS.length - 1,
    completed: true,
    completedAt: Date.now(),
  })
}

export function isSegmentDone(lessonId, segmentId) {
  return Boolean(getLessonProgress(lessonId).segmentsDone[segmentId])
}

export function getTrackProgressStats(lessonIds) {
  const ids = lessonIds.filter(Boolean)
  if (!ids.length) return { completed: 0, total: 0, percent: 0, inProgress: 0 }
  let completed = 0
  let inProgress = 0
  for (const id of ids) {
    const p = getLessonProgress(id)
    if (p.completed) completed += 1
    else if (p.lastVisitedAt) inProgress += 1
  }
  return {
    completed,
    total: ids.length,
    inProgress,
    percent: Math.round((completed / ids.length) * 100),
  }
}

/** Resume the last visited incomplete lesson, else first incomplete, else first lesson */
export function getContinueLessonId(lessonIds) {
  const ids = lessonIds.filter(Boolean)
  if (!ids.length) return null

  const store = readStore()
  if (store.lastLessonId && ids.includes(store.lastLessonId)) {
    const last = getLessonProgress(store.lastLessonId)
    if (!last.completed) return store.lastLessonId
  }

  const firstIncomplete = ids.find((id) => !getLessonProgress(id).completed)
  return firstIncomplete ?? ids[0]
}

export function getAllLessonProgress() {
  return readStore().lessons
}

export function clearLearningProgress() {
  localStorage.removeItem(LEARNING_PROGRESS_KEY)
}

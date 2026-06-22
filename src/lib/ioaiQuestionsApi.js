import { authFetch } from './checkout'

const API = '/api/ioai'

export async function fetchLessonExercises(lessonRef) {
  const res = await fetch(`${API}/lessons/${encodeURIComponent(lessonRef)}/exercises`)
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || res.statusText)
  return res.json()
}

/** @deprecated Use submitLessonExercises for batch grading */
export async function gradeLessonExercise(lessonRef, questionId, answer) {
  return authFetch(`${API}/lessons/${encodeURIComponent(lessonRef)}/exercises/grade`, {
    method: 'POST',
    body: JSON.stringify({ questionId, answer }),
  })
}

export async function submitLessonExercises(lessonRef, answers) {
  return authFetch(`${API}/lessons/${encodeURIComponent(lessonRef)}/exercises/submit`, {
    method: 'POST',
    body: JSON.stringify({ answers }),
  })
}

export async function fetchModuleTest(moduleRef) {
  const res = await fetch(`${API}/modules/${encodeURIComponent(moduleRef)}/test`)
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || res.statusText)
  return res.json()
}

export async function submitModuleTest(moduleRef, answers) {
  return authFetch(`${API}/modules/${encodeURIComponent(moduleRef)}/test/submit`, {
    method: 'POST',
    body: JSON.stringify({ answers }),
  })
}

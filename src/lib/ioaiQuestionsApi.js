const API = '/api/ioai'

export async function fetchLessonExercises(lessonRef) {
  const res = await fetch(`${API}/lessons/${encodeURIComponent(lessonRef)}/exercises`)
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || res.statusText)
  return res.json()
}

export async function gradeLessonExercise(lessonRef, questionId, answer) {
  const res = await fetch(`${API}/lessons/${encodeURIComponent(lessonRef)}/exercises/grade`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ questionId, answer }),
  })
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || res.statusText)
  return res.json()
}

export async function fetchModuleTest(moduleRef) {
  const res = await fetch(`${API}/modules/${encodeURIComponent(moduleRef)}/test`)
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || res.statusText)
  return res.json()
}

export async function submitModuleTest(moduleRef, answers) {
  const res = await fetch(`${API}/modules/${encodeURIComponent(moduleRef)}/test/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ answers }),
  })
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || res.statusText)
  return res.json()
}

/** Client-side lab experiment notes and visit progress */

export const LAB_EXPERIMENT_NOTES_KEY = 'bingo-lab-experiment-notes'

function noteKey(packSlug, experimentSlug) {
  return `${packSlug}::${experimentSlug}`
}

function readStore() {
  try {
    const raw = localStorage.getItem(LAB_EXPERIMENT_NOTES_KEY)
    const parsed = raw ? JSON.parse(raw) : {}
    return {
      notes: parsed.notes && typeof parsed.notes === 'object' ? parsed.notes : {},
      visited: parsed.visited && typeof parsed.visited === 'object' ? parsed.visited : {},
      completed: parsed.completed && typeof parsed.completed === 'object' ? parsed.completed : {},
    }
  } catch {
    return { notes: {}, visited: {}, completed: {} }
  }
}

function writeStore(store) {
  localStorage.setItem(LAB_EXPERIMENT_NOTES_KEY, JSON.stringify(store))
}

export function getExperimentNote(packSlug, experimentSlug) {
  const store = readStore()
  const entry = store.notes[noteKey(packSlug, experimentSlug)]
  return {
    body: entry?.body || '',
    savedAt: entry?.savedAt ?? null,
  }
}

export function saveExperimentNote(packSlug, experimentSlug, body) {
  const store = readStore()
  const key = noteKey(packSlug, experimentSlug)
  const savedAt = Date.now()
  store.notes[key] = { body: String(body || ''), savedAt }
  store.visited[key] = savedAt
  writeStore(store)
  return { body: store.notes[key].body, savedAt }
}

export function markExperimentVisited(packSlug, experimentSlug) {
  const store = readStore()
  const key = noteKey(packSlug, experimentSlug)
  if (!store.visited[key]) {
    store.visited[key] = Date.now()
    writeStore(store)
  }
}

export function markExperimentCompleted(packSlug, experimentSlug) {
  const store = readStore()
  const key = noteKey(packSlug, experimentSlug)
  store.completed[key] = Date.now()
  store.visited[key] = store.visited[key] || Date.now()
  writeStore(store)
}

export function getPackExperimentProgress(packSlug, experimentSlugs = []) {
  const store = readStore()
  const prefix = `${packSlug}::`
  let visited = 0
  let completed = 0
  for (const slug of experimentSlugs) {
    const key = `${prefix}${slug}`
    if (store.visited[key]) visited += 1
    if (store.completed[key]) completed += 1
  }
  return { visited, completed, total: experimentSlugs.length }
}

export function isExperimentVisited(packSlug, experimentSlug) {
  const store = readStore()
  return Boolean(store.visited[noteKey(packSlug, experimentSlug)])
}

export function isExperimentCompleted(packSlug, experimentSlug) {
  const store = readStore()
  return Boolean(store.completed[noteKey(packSlug, experimentSlug)])
}

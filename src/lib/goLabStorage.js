const STORAGE_KEY = 'bingo-golab-code'

export const GOLAB_STARTER_CODE = `# GoLab — follow along with the video lesson
# Python runs in your browser (no install needed)

print("Ready to code!")
`

function readStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : {}
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

export function loadGoLabCode(lessonId) {
  if (!lessonId) return GOLAB_STARTER_CODE
  const stored = readStore()[lessonId]
  return typeof stored === 'string' ? stored : GOLAB_STARTER_CODE
}

export function saveGoLabCode(lessonId, code) {
  if (!lessonId) return
  const store = readStore()
  store[lessonId] = code
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

export function clearGoLabCode(lessonId) {
  if (!lessonId) return
  const store = readStore()
  delete store[lessonId]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

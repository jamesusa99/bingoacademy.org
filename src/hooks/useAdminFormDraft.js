import { useCallback, useState } from 'react'

const DEFAULT_PATH_NESTED = {
  newStage: { title: '', slug: '', emoji: '🟢' },
  newTheme: { title: '', slug: '', category_label: '' },
  newModule: { title: '', slug: '' },
}

function mergePathDraft(storedPath, fallbackPath) {
  if (!storedPath || typeof storedPath !== 'object') return fallbackPath
  return {
    ...fallbackPath,
    ...storedPath,
    newStage: { ...DEFAULT_PATH_NESTED.newStage, ...fallbackPath?.newStage, ...storedPath.newStage },
    newTheme: { ...DEFAULT_PATH_NESTED.newTheme, ...fallbackPath?.newTheme, ...storedPath.newTheme },
    newModule: { ...DEFAULT_PATH_NESTED.newModule, ...fallbackPath?.newModule, ...storedPath.newModule },
  }
}

function readDraft(key, fallback, { mergePathKey } = {}) {
  try {
    const raw = sessionStorage.getItem(key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    const merged = { ...fallback, ...parsed }
    if (mergePathKey && parsed[mergePathKey]) {
      merged[mergePathKey] = mergePathDraft(parsed[mergePathKey], fallback[mergePathKey])
    }
    return merged
  } catch {
    return fallback
  }
}

function writeDraft(key, value) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* quota / private mode */
  }
}

/** Persist admin form state across page navigation within the same tab */
export function useAdminFormDraft(key, initialState, options = {}) {
  const [state, setStateInternal] = useState(() => readDraft(key, initialState, options))

  const setState = useCallback(
    (updater) => {
      setStateInternal((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater
        writeDraft(key, next)
        return next
      })
    },
    [key]
  )

  const clearDraft = useCallback(() => {
    sessionStorage.removeItem(key)
    setStateInternal(initialState)
  }, [key, initialState])

  return [state, setState, clearDraft]
}

export function readAdminUiDraft(key) {
  return readDraft(key, null)
}

export function writeAdminUiDraft(key, value) {
  writeDraft(key, value)
}

export function clearAdminUiDraft(key) {
  sessionStorage.removeItem(key)
}

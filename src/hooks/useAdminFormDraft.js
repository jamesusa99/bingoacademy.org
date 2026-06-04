import { useCallback, useState } from 'react'

function readDraft(key, fallback) {
  try {
    const raw = sessionStorage.getItem(key)
    if (!raw) return fallback
    return { ...fallback, ...JSON.parse(raw) }
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
export function useAdminFormDraft(key, initialState) {
  const [state, setStateInternal] = useState(() => readDraft(key, initialState))

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

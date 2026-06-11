import { useCallback, useEffect, useState } from 'react'
import {
  getExperimentNote,
  markExperimentCompleted,
  markExperimentVisited,
  saveExperimentNote,
} from '../lib/labExperimentNotes'

export function useLabExperimentNotes(packSlug, experimentSlug) {
  const [noteBody, setNoteBody] = useState('')
  const [savedAt, setSavedAt] = useState(null)
  const [saveStatus, setSaveStatus] = useState('idle')

  useEffect(() => {
    if (!packSlug || !experimentSlug) return
    markExperimentVisited(packSlug, experimentSlug)
    const note = getExperimentNote(packSlug, experimentSlug)
    setNoteBody(note.body)
    setSavedAt(note.savedAt)
    setSaveStatus('idle')
  }, [packSlug, experimentSlug])

  const save = useCallback(() => {
    if (!packSlug || !experimentSlug) return
    setSaveStatus('saving')
    const result = saveExperimentNote(packSlug, experimentSlug, noteBody)
    setSavedAt(result.savedAt)
    setSaveStatus('saved')
    window.setTimeout(() => setSaveStatus('idle'), 2000)
  }, [packSlug, experimentSlug, noteBody])

  const complete = useCallback(() => {
    if (!packSlug || !experimentSlug) return
    markExperimentCompleted(packSlug, experimentSlug)
    save()
  }, [packSlug, experimentSlug, save])

  return {
    noteBody,
    setNoteBody,
    savedAt,
    saveStatus,
    save,
    complete,
  }
}

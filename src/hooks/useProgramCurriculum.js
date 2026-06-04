import { useCallback, useEffect, useState } from 'react'
import { fetchCurriculumFromDb, buildCurriculumSummary } from '../lib/ioaiCurriculumDb'
import { getProgramCurriculum, isCurriculumLine } from '../config/programCurriculum'

/** Load curriculum tree for a product line (ioai | general | k12) */
export function useProgramCurriculum(productLine) {
  const line = isCurriculumLine(productLine) ? productLine : null
  const [tree, setTree] = useState([])
  const [summary, setSummary] = useState(buildCurriculumSummary([], 'ioai'))
  const [loading, setLoading] = useState(Boolean(line))
  const [error, setError] = useState(null)
  const [source, setSource] = useState('loading')

  const reload = useCallback(async () => {
    if (!line) {
      setTree([])
      setSummary(buildCurriculumSummary([], productLine || 'ioai'))
      setError(null)
      setSource('none')
      setLoading(false)
      return
    }

    setLoading(true)
    const result = await fetchCurriculumFromDb(line)
    setTree(result.tree)
    setSummary(
      result.summary || buildCurriculumSummary(result.tree, line, getProgramCurriculum(line).summaryTitle)
    )
    setError(result.error || null)
    setSource(result.source)
    setLoading(false)
  }, [line, productLine])

  useEffect(() => {
    reload()
  }, [reload])

  return { tree, summary, loading, error, source, reload, line }
}

/** @deprecated use useProgramCurriculum('ioai') */
export function useIOAICurriculum() {
  return useProgramCurriculum('ioai')
}

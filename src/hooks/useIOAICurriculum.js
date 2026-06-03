import { useCallback, useEffect, useState } from 'react'
import { fetchIOAICurriculumFromDb, buildCurriculumSummary } from '../lib/ioaiCurriculumDb'

export function useIOAICurriculum() {
  const [tree, setTree] = useState([])
  const [summary, setSummary] = useState(buildCurriculumSummary([]))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [source, setSource] = useState('loading')

  const reload = useCallback(async () => {
    setLoading(true)
    const result = await fetchIOAICurriculumFromDb()
    setTree(result.tree)
    setSummary(result.summary || buildCurriculumSummary(result.tree))
    setError(result.error || null)
    setSource(result.source)
    setLoading(false)
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  return { tree, summary, loading, error, source, reload }
}

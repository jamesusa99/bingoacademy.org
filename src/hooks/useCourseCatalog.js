import { useCallback, useEffect, useState } from 'react'
import { fetchCourseCatalog } from '../lib/catalogCourse'

export function useCourseCatalog() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [source, setSource] = useState('static')
  const [error, setError] = useState(null)

  const reload = useCallback(async ({ background = false } = {}) => {
    if (!background) setLoading(true)
    const result = await fetchCourseCatalog()
    setCourses(result.courses)
    setSource(result.source)
    setError(result.error || null)
    setLoading(false)
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  useEffect(() => {
    let last = Date.now()
    const refreshIfVisible = () => {
      if (document.visibilityState !== 'visible') return
      if (Date.now() - last < 30000) return
      last = Date.now()
      reload({ background: true })
    }
    document.addEventListener('visibilitychange', refreshIfVisible)
    return () => {
      document.removeEventListener('visibilitychange', refreshIfVisible)
    }
  }, [reload])

  return { courses, loading, source, error, reload }
}

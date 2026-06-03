import { useCallback, useEffect, useState } from 'react'
import { fetchCourseCatalog } from '../lib/catalogCourse'

export function useCourseCatalog() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [source, setSource] = useState('static')
  const [error, setError] = useState(null)

  const reload = useCallback(async () => {
    setLoading(true)
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
    const refreshIfVisible = () => {
      if (document.visibilityState === 'visible') reload()
    }
    window.addEventListener('focus', refreshIfVisible)
    document.addEventListener('visibilitychange', refreshIfVisible)
    return () => {
      window.removeEventListener('focus', refreshIfVisible)
      document.removeEventListener('visibilitychange', refreshIfVisible)
    }
  }, [reload])

  return { courses, loading, source, error, reload }
}

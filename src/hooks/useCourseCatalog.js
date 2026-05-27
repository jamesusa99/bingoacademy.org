import { useEffect, useState } from 'react'
import { fetchCourseCatalog } from '../lib/catalogCourse'

export function useCourseCatalog() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [source, setSource] = useState('static')
  const [error, setError] = useState(null)

  const reload = async () => {
    setLoading(true)
    const result = await fetchCourseCatalog()
    setCourses(result.courses)
    setSource(result.source)
    setError(result.error || null)
    setLoading(false)
  }

  useEffect(() => {
    reload()
  }, [])

  return { courses, loading, source, error, reload }
}

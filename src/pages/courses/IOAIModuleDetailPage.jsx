import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import IOAIModuleDetail from '../../components/courses/IOAIModuleDetail'
import { coursePathForLineId } from '../../config/coursePaths'
import { COURSES_PORTAL } from '../../config/coursesPortal'
import { fetchIoaiModule } from '../../lib/ioaiStore'

export default function IOAIModuleDetailPage() {
  const { moduleSlug } = useParams()
  const catalogSlug = decodeURIComponent(moduleSlug || '')
  const [backHref, setBackHref] = useState('/courses/ioai')

  useEffect(() => {
    let cancelled = false
    fetchIoaiModule(catalogSlug)
      .then((mod) => {
        if (cancelled) return
        const line = mod?.theme?.level?.product_line || 'ioai'
        setBackHref(coursePathForLineId(line))
      })
      .catch(() => {
        if (!cancelled) setBackHref('/courses/ioai')
      })
    return () => {
      cancelled = true
    }
  }, [catalogSlug])

  return (
    <IOAIModuleDetail
      catalogSlug={catalogSlug}
      backHref={backHref}
      backLabel={COURSES_PORTAL.backToCourses}
    />
  )
}

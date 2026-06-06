import { useParams } from 'react-router-dom'
import IOAIModuleDetail from '../../components/courses/IOAIModuleDetail'
import { COURSES_PORTAL } from '../../config/coursesPortal'

export default function IOAIModuleDetailPage() {
  const { moduleSlug } = useParams()
  const catalogSlug = decodeURIComponent(moduleSlug || '')

  return (
    <IOAIModuleDetail
      catalogSlug={catalogSlug}
      backHref="/courses?line=ioai"
      backLabel={COURSES_PORTAL.backToCourses}
    />
  )
}

import { useParams } from 'react-router-dom'
import IOAIModuleDetail from '../../components/courses/IOAIModuleDetail'
import { COURSES_PORTAL } from '../../config/coursesPortal'

/** @deprecated Prefer /courses/module/:slug — kept for /ioai/l3/:slug compatibility */
export default function IOAIModulePage() {
  const { moduleSlug } = useParams()
  const catalogSlug = decodeURIComponent(moduleSlug || '')

  return (
    <IOAIModuleDetail
      catalogSlug={catalogSlug}
      backHref="/courses/ioai"
      backLabel={COURSES_PORTAL.backToCourses}
    />
  )
}

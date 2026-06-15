import { useParams } from 'react-router-dom'
import IOAIModuleDetail from '../../components/courses/IOAIModuleDetail'
import { STUDY_HOME } from '../../lib/studyPaths'

export default function StudyModulePage() {
  const { moduleSlug } = useParams()
  const catalogSlug = decodeURIComponent(moduleSlug || '')

  return (
    <IOAIModuleDetail
      catalogSlug={catalogSlug}
      backHref={STUDY_HOME}
      backLabel="Study Center"
      studyMode
    />
  )
}

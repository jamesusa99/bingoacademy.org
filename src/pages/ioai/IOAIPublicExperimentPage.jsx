import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import PageMeta from '../../components/PageMeta'
import LabExperimentWorkspace from '../../components/labs/LabExperimentWorkspace'
import { fetchPublicExperiment } from '../../lib/ioaiExperimentsApi'
import { LAB_EXPERIMENTS_PORTAL } from '../../config/labExperiments'

export default function IOAIPublicExperimentPage() {
  const { slug } = useParams()
  const [searchParams] = useSearchParams()
  const lessonCatalogSlug = searchParams.get('lesson') || ''

  const [experiment, setExperiment] = useState(null)
  const [owned, setOwned] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchPublicExperiment(slug, { lesson: lessonCatalogSlug, context: 'lesson' })
      .then((res) => {
        if (cancelled) return
        setExperiment(res.experiment)
        setOwned(Boolean(res.owned))
      })
      .catch((e) => {
        if (!cancelled) setError(e.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [slug, lessonCatalogSlug])

  if (loading) {
    return (
      <div className="lab-workspace-page flex items-center justify-center min-h-[60vh]">
        <p className="text-sm text-slate-500">{LAB_EXPERIMENTS_PORTAL.loading}</p>
      </div>
    )
  }

  if (!experiment || error) {
    return (
      <div className="lab-workspace-page py-12 max-w-3xl mx-auto px-4">
        <p className="text-sm text-slate-400">{error || LAB_EXPERIMENTS_PORTAL.experimentNotFound}</p>
        {lessonCatalogSlug ? (
          <Link to={`/courses/detail/${encodeURIComponent(lessonCatalogSlug)}`} className="text-emerald-400 text-sm mt-2 inline-block hover:underline">
            ← Back to lesson
          </Link>
        ) : null}
      </div>
    )
  }

  return (
    <div className="lab-workspace-page">
      <PageMeta title={`${experiment.title} · IOAI Experiment`} />
      <LabExperimentWorkspace
        packSlug={lessonCatalogSlug || 'lesson'}
        pack={{ nameEn: 'IOAI Lesson Experiment', name: 'IOAI Lesson Experiment' }}
        experiment={experiment}
        experiments={[experiment]}
        owned={owned}
        canAccessSteps={owned}
        experimentIndex={0}
      />
    </div>
  )
}

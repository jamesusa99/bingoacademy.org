import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import PageMeta from '../../components/PageMeta'
import LabExperimentWorkspace from '../../components/labs/LabExperimentWorkspace'
import { LAB_EXPERIMENTS_PORTAL } from '../../config/labExperiments'
import { fetchLabExperiment, fetchLabPack } from '../../lib/labPackApi'
import { usePurchasedCourses } from '../../hooks/usePurchasedCourses'

export default function LabExperimentPage() {
  const { slug: packSlug, experimentSlug } = useParams()
  const { hasAccess: checkAccess } = usePurchasedCourses()
  const owned = checkAccess(packSlug)

  const [pack, setPack] = useState(null)
  const [experiment, setExperiment] = useState(null)
  const [apiOwned, setApiOwned] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    Promise.all([fetchLabPack(packSlug), fetchLabExperiment(packSlug, experimentSlug)])
      .then(([packData, expData]) => {
        if (cancelled) return
        setPack(packData)
        setExperiment(expData.experiment)
        setApiOwned(Boolean(expData.owned))
      })
      .catch((err) => {
        if (!cancelled) {
          setPack(null)
          setExperiment(null)
          setError(err.message)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [packSlug, experimentSlug])

  const experiments = pack?.experiments || []
  const experimentIndex = experiments.findIndex((e) => e.slug === experimentSlug)

  const packHref = `/labs/pack/${encodeURIComponent(packSlug)}`

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
        <Link to={packHref} className="text-emerald-400 text-sm mt-2 inline-block hover:underline">
          ← {LAB_EXPERIMENTS_PORTAL.backToPack}
        </Link>
      </div>
    )
  }

  return (
    <div className="lab-workspace-page">
      <PageMeta title={`${experiment.title} · Lab`} />
      <LabExperimentWorkspace
        packSlug={packSlug}
        pack={pack}
        experiment={experiment}
        experiments={experiments}
        owned={owned}
        apiOwned={apiOwned}
        experimentIndex={experimentIndex >= 0 ? experimentIndex : 0}
      />
    </div>
  )
}

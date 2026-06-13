import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import PageMeta from '../../components/PageMeta'
import LabExperimentWorkspace from '../../components/labs/LabExperimentWorkspace'
import { LAB_EXPERIMENTS_PORTAL, isLabExperimentUnlocked } from '../../config/labExperiments'
import { fetchLabExperiment, fetchLabPack, fetchLabPackExperimentsPublic } from '../../lib/labPackApi'
import { usePurchasedCourses } from '../../hooks/usePurchasedCourses'

export default function LabExperimentPage() {
  const { slug: packSlug, experimentSlug } = useParams()
  const { hasAccess: checkAccess } = usePurchasedCourses()
  const owned = checkAccess(packSlug)

  const [pack, setPack] = useState(null)
  const [experiment, setExperiment] = useState(null)
  const [apiOwned, setApiOwned] = useState(false)
  const [previewUnlocked, setPreviewUnlocked] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    Promise.all([fetchLabPack(packSlug), fetchLabExperiment(packSlug, experimentSlug)])
      .then(async ([packData, expData]) => {
        if (cancelled) return
        let nextPack = packData
        if (!packData?.experiments?.length) {
          try {
            const fallback = await fetchLabPackExperimentsPublic(packSlug)
            if (fallback.length) {
              nextPack = { ...packData, experiments: fallback, experimentCount: fallback.length }
            }
          } catch {
            /* keep API payload */
          }
        }
        setPack(nextPack)
        setExperiment(expData.experiment)
        setApiOwned(Boolean(expData.owned))
        setPreviewUnlocked(Boolean(expData.previewUnlocked))
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

  const experiments = useMemo(
    () => [...(pack?.experiments || [])].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    [pack?.experiments]
  )

  const experimentIndex = useMemo(() => {
    const idx = experiments.findIndex((e) => e.slug === experimentSlug)
    return idx >= 0 ? idx : 0
  }, [experiments, experimentSlug])

  const previewAccess = isLabExperimentUnlocked({
    owned,
    index: experimentIndex,
    total: experiments.length,
  })

  const canAccessSteps = owned || apiOwned || previewUnlocked || previewAccess

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
        canAccessSteps={canAccessSteps}
        experimentIndex={experimentIndex}
      />
    </div>
  )
}

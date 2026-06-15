import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import PageMeta from '../../components/PageMeta'
import LabExperimentWorkspace from '../../components/labs/LabExperimentWorkspace'
import { LAB_EXPERIMENTS_PORTAL, isLabExperimentUnlocked } from '../../config/labExperiments'
import {
  fetchLabExperiment,
  fetchLabExperimentPublic,
  fetchLabPack,
  fetchLabPackExperimentsPublic,
} from '../../lib/labPackApi'
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

    async function loadPack() {
      try {
        const packData = await fetchLabPack(packSlug)
        if (!packData?.experiments?.length) {
          const fallback = await fetchLabPackExperimentsPublic(packSlug)
          if (fallback.length) {
            return { ...packData, experiments: fallback, experimentCount: fallback.length }
          }
        }
        return packData
      } catch {
        const fallback = await fetchLabPackExperimentsPublic(packSlug)
        if (fallback.length) {
          return { slug: packSlug, experiments: fallback, experimentCount: fallback.length }
        }
        throw new Error(LAB_EXPERIMENTS_PORTAL.notFound)
      }
    }

    async function loadExperiment(nextPack) {
      const experiments = [...(nextPack?.experiments || [])].sort(
        (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
      )
      const experimentIndex = Math.max(
        0,
        experiments.findIndex((e) => e.slug === experimentSlug)
      )
      const previewAccess = isLabExperimentUnlocked({
        owned,
        index: experimentIndex,
        total: experiments.length,
      })
      const includeSteps = owned || previewAccess

      let expData
      try {
        expData = await fetchLabExperiment(packSlug, experimentSlug)
      } catch (err) {
        const fallbackExp = await fetchLabExperimentPublic(packSlug, experimentSlug, { includeSteps })
        if (!fallbackExp) throw err
        expData = { experiment: fallbackExp, owned: false, previewUnlocked: previewAccess, fallback: true }
      }

      let nextExperiment = expData.experiment
      if (includeSteps && !nextExperiment?.steps?.length) {
        const withSteps = await fetchLabExperimentPublic(packSlug, experimentSlug, { includeSteps: true })
        if (withSteps) nextExperiment = withSteps
      }

      return {
        pack: nextPack,
        experiment: nextExperiment,
        apiOwned: Boolean(expData.owned),
        previewUnlocked: Boolean(expData.previewUnlocked) || previewAccess,
      }
    }

    loadPack()
      .then((packData) => {
        if (cancelled) return null
        return loadExperiment(packData)
      })
      .then((result) => {
        if (cancelled || !result) return
        setPack(result.pack)
        setExperiment(result.experiment)
        setApiOwned(result.apiOwned)
        setPreviewUnlocked(result.previewUnlocked)
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
  }, [packSlug, experimentSlug, owned])

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

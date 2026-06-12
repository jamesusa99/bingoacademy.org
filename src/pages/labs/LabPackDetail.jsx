import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import PageMeta from '../../components/PageMeta'
import LabPackHero from '../../components/labs/LabPackHero'
import LabExperimentListDark from '../../components/labs/LabExperimentListDark'
import LabMaterialsList from '../../components/labs/LabMaterialsList'
import { LAB_EXPERIMENTS_PORTAL, isKitSub } from '../../config/labExperiments'
import { labsPath } from '../../config/productLabs'
import { getProgramCurriculum } from '../../config/programCurriculum'
import { fetchLabPack, fetchLabPackCatalogPublic, fetchLabPackExperimentsPublic } from '../../lib/labPackApi'
import { findCourseInList, mergeLabPackDisplayItem } from '../../lib/catalogCourse'
import { useCourseCatalog } from '../../hooks/useCourseCatalog'
import { usePurchasedCourses } from '../../hooks/usePurchasedCourses'
import { getCourseDisplayPrice } from '../../lib/coursePricing'
import { isCourseComingSoon } from '../../config/products'
import { confirmCheckoutSession } from '../../lib/checkout'

export default function LabPackDetail() {
  const { slug } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const { courses, loading: catalogLoading } = useCourseCatalog()
  const catalogItem = findCourseInList(courses, slug)
  const { hasAccess: checkAccess, refresh } = usePurchasedCourses()
  const owned = checkAccess(slug)
  const [pack, setPack] = useState(null)
  const [catalogMeta, setCatalogMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchLabPack(slug)
      .then(async (data) => {
        if (cancelled) return
        let nextPack = data
        if (!data?.experiments?.length) {
          try {
            const fallbackExperiments = await fetchLabPackExperimentsPublic(slug)
            if (fallbackExperiments.length) {
              nextPack = {
                ...data,
                experiments: fallbackExperiments,
                experimentCount: fallbackExperiments.length,
              }
            }
          } catch {
            /* keep API payload */
          }
        }
        setPack(nextPack)
      })
      .catch(async (err) => {
        if (cancelled) return
        try {
          const fallbackExperiments = await fetchLabPackExperimentsPublic(slug)
          if (fallbackExperiments.length) {
            setPack({ slug, experiments: fallbackExperiments, experimentCount: fallbackExperiments.length })
            setError(null)
            return
          }
        } catch {
          /* fall through */
        }
        setPack(null)
        setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [slug])

  useEffect(() => {
    let cancelled = false
    fetchLabPackCatalogPublic(slug)
      .then((meta) => {
        if (!cancelled && meta) setCatalogMeta(meta)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [slug])

  useEffect(() => {
    const checkout = searchParams.get('checkout')
    const sessionId = searchParams.get('session_id')
    if (checkout !== 'success' || !sessionId) return

    confirmCheckoutSession(sessionId)
      .then(() => refresh())
      .catch(() => {})
      .finally(() => {
        setSearchParams(
          (prev) => {
            const next = new URLSearchParams(prev)
            next.delete('checkout')
            next.delete('session_id')
            return next
          },
          { replace: true }
        )
      })
  }, [searchParams, setSearchParams, refresh])

  const experiments = useMemo(
    () => [...(pack?.experiments || [])].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    [pack?.experiments]
  )
  const totalSteps = useMemo(
    () => experiments.reduce((sum, exp) => sum + (exp.stepCount ?? 0), 0),
    [experiments]
  )

  const catalogSource = catalogItem || catalogMeta
  const displayItem = useMemo(
    () => mergeLabPackDisplayItem(pack, catalogSource),
    [pack, catalogItem, catalogMeta]
  )
  const heroPack = useMemo(
    () => ({
      ...(catalogMeta || {}),
      ...(pack || {}),
      materialsList:
        pack?.materialsList?.length
          ? pack.materialsList
          : catalogMeta?.materialsList?.length
            ? catalogMeta.materialsList
            : catalogItem?.materialsList || [],
      experiments: pack?.experiments,
      experimentCount: pack?.experimentCount ?? experiments.length,
    }),
    [pack, catalogMeta, catalogItem, experiments.length]
  )

  const item = displayItem.line ? displayItem : pack || catalogItem || catalogMeta
  const backHref = item ? labsPath(item.line, item.sub) : '/labs'
  const lineLabel = item
    ? getProgramCurriculum(item.line)?.adminTitleEn?.split('·')[0]?.trim() || item.line.toUpperCase()
    : ''
  const materialsList = heroPack.materialsList || []
  const showMaterials = item && (isKitSub(item.sub) || materialsList.length > 0)
  const priceLabel = catalogItem
    ? getCourseDisplayPrice(catalogItem)
    : catalogMeta?.price || pack?.price || null
  const comingSoon = catalogItem ? isCourseComingSoon(catalogItem) : false

  if (catalogLoading || loading) {
    return (
      <div className="lab-pack-page min-h-[50vh] flex items-center justify-center">
        <p className="text-sm text-slate-500">{LAB_EXPERIMENTS_PORTAL.loading}</p>
      </div>
    )
  }

  if (!item && error) {
    return (
      <div className="lab-pack-page py-12 max-w-3xl mx-auto px-4">
        <p className="text-sm text-slate-400">{LAB_EXPERIMENTS_PORTAL.notFound}</p>
        <Link to="/labs" className="text-emerald-400 text-sm mt-2 inline-block hover:underline">
          ← {LAB_EXPERIMENTS_PORTAL.backToLabs}
        </Link>
      </div>
    )
  }

  return (
    <div className="lab-pack-page">
      <PageMeta title={`${displayItem.nameEn || displayItem.name || slug} · Labs`} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <LabPackHero
          item={displayItem}
          pack={heroPack}
          catalogItem={catalogItem || catalogMeta}
          owned={owned}
          comingSoon={comingSoon}
          priceLabel={priceLabel}
          backHref={backHref}
          lineLabel={lineLabel}
          totalSteps={totalSteps}
        />

        {showMaterials && materialsList.length ? (
          <div className="mt-12 max-w-3xl lab-pack-materials-dark">
            <LabMaterialsList items={materialsList} className="mb-0" dark />
          </div>
        ) : null}

        <div className="mt-12 pt-10 border-t border-slate-800/80">
          <LabExperimentListDark packSlug={slug} experiments={experiments} owned={owned} />
        </div>
      </div>
    </div>
  )
}

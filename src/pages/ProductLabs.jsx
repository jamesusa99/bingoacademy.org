import { useMemo, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import PageBanner from '../components/PageBanner'
import PageContent from '../components/PageContent'
import PageMeta from '../components/PageMeta'
import { LabMaterialCardActions } from '../components/labs/LabMaterialPurchaseButton'
import { getProductLine, subcategoryLabel, isCourseComingSoon, isCourseListedOnStorefront } from '../config/products'
import { getProductLabTracks, PRODUCT_LABS_INTRO, labsPath } from '../config/productLabs'
import { PRODUCT_LABS_PORTAL } from '../config/productLabsPortal'
import { normalizeLabMaterialSub } from '../config/labMaterials'
import { isLabMaterialsCatalogRow } from '../lib/catalogCourse'
import { useCourseCatalog } from '../hooks/useCourseCatalog'

export default function ProductLabs() {
  const [params, setParams] = useSearchParams()
  const lineParam = params.get('line') || 'ioai'
  const subParam = params.get('sub') || ''

  const tracks = useMemo(() => getProductLabTracks(), [])
  const activeLine = tracks.some((t) => t.lineId === lineParam) ? lineParam : tracks[0]?.lineId ?? 'ioai'
  const { courses, loading } = useCourseCatalog()

  const activeTrack = tracks.find((t) => t.lineId === activeLine) ?? tracks[0]

  const countFor = (lineId, subId) =>
    courses.filter(
      (c) =>
        isCourseListedOnStorefront(c) &&
        c.line === lineId &&
        isLabMaterialsCatalogRow({ line: c.line, sub: c.sub }) &&
        normalizeLabMaterialSub(c.sub, c.line) === normalizeLabMaterialSub(subId, lineId)
    ).length

  const activeModule = activeTrack?.modules.find((m) => m.id === subParam)
  const moduleItems = useMemo(() => {
    if (!subParam || !activeTrack) return []
    const normalizedSub = normalizeLabMaterialSub(subParam, activeTrack.lineId)
    return courses.filter(
      (c) =>
        isCourseListedOnStorefront(c) &&
        c.line === activeTrack.lineId &&
        isLabMaterialsCatalogRow({ line: c.line, sub: c.sub }) &&
        normalizeLabMaterialSub(c.sub, c.line) === normalizedSub
    )
  }, [courses, subParam, activeTrack])

  const setLine = (lineId) => {
    setParams(subParam ? { line: lineId, sub: subParam } : { line: lineId })
  }

  useEffect(() => {
    if (subParam && activeModule) {
      document.getElementById('labs-catalogue')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [subParam, activeModule?.id])

  return (
    <div className="w-full">
      <PageMeta
        title="AI Labs & Kits by Program | Bingo Academy"
        description="Online labs, training labs, and lab kits for Foundations of AI, IOAI competition training, and K12 classroom programs."
      />

      <PageBanner
        slides={[
          {
            id: 'product-labs',
            gradient: 'from-cyan-500/15 via-sky-50 to-emerald-50',
            icon: '🧪',
            eyebrow: 'Labs & kits',
            title: 'Hands-On Labs Across Three Programs',
            subtitle:
              'Cloud labs, training labs, and physical kits — organized by Foundations, IOAI, and K12. Separate from the free AI Exploration game zone.',
            ctaLabel: 'Browse Foundations labs',
            href: labsPath('general', 'online-lab'),
            secondaryLabel: 'Free AI Exploration games',
            secondaryHref: '/exploration',
          },
        ]}
        autoPlayMs={0}
      />

      <PageContent className="py-6 sm:py-10">
        <nav className="flex flex-wrap gap-2 mb-4 text-xs text-slate-500">
          <Link to="/courses" className="hover:text-primary">
            Courses
          </Link>
          <span>/</span>
          <span className="text-bingo-dark font-medium">Labs & kits</span>
          {activeTrack && subParam && activeModule ? (
            <>
              <span>/</span>
              <span className="text-primary font-medium">{activeModule.name}</span>
            </>
          ) : null}
        </nav>

        <section className="mb-8 card p-5 sm:p-6 border-cyan-200/60 bg-cyan-50/30">
          <h2 className="font-bold text-bingo-dark text-lg mb-2">{PRODUCT_LABS_INTRO.title}</h2>
          <p className="text-sm text-slate-600 leading-relaxed">{PRODUCT_LABS_INTRO.desc}</p>
          <p className="text-sm text-violet-700 mt-3 font-medium">
            {PRODUCT_LABS_INTRO.explorationNote}{' '}
            <Link to={PRODUCT_LABS_INTRO.explorationHref} className="text-primary hover:underline">
              {PRODUCT_LABS_PORTAL.exploreFree} →
            </Link>
          </p>
        </section>

        <div
          className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-none"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {tracks.map((t) => (
            <button
              key={t.lineId}
              type="button"
              onClick={() => setLine(t.lineId)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold shrink-0 min-h-[44px] transition ${
                activeLine === t.lineId ? 'bg-primary text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t.lineIcon}{' '}
              {t.lineName.replace(' Program', '').replace(' Training', '').replace(' School Edition', '')}
            </button>
          ))}
        </div>

        {activeTrack ? (
          <section className={`card p-5 sm:p-6 mb-8 border-2 ${activeTrack.border} bg-gradient-to-r ${activeTrack.gradient}`}>
            <Link to={activeTrack.lineHref} className="text-xs font-bold text-primary hover:underline">
              {activeTrack.lineIcon} {activeTrack.lineName} →
            </Link>
            <h2 className="font-bold text-bingo-dark text-lg mt-2">{activeTrack.lineName}</h2>
            <p className="text-sm text-slate-600 mt-1">{activeTrack.tagline}</p>
          </section>
        ) : null}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {(activeTrack?.modules ?? []).map((mod) => {
            const count = countFor(activeTrack.lineId, mod.id)
            const isActive = subParam === mod.id
            return (
              <Link
                key={mod.id}
                to={labsPath(activeTrack.lineId, mod.id)}
                className={`card p-5 hover:border-primary/40 hover:shadow-md transition group ${
                  isActive ? 'border-2 border-primary ring-2 ring-primary/20' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-3xl">{mod.icon}</span>
                  {count > 0 ? (
                    <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      {count} items
                    </span>
                  ) : (
                    <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">Coming soon</span>
                  )}
                </div>
                <h3 className="font-semibold text-bingo-dark mt-3 group-hover:text-primary transition">{mod.name}</h3>
                <p className="text-xs text-slate-500 mt-1">{mod.desc}</p>
              </Link>
            )
          })}
        </div>

        {subParam && activeModule ? (
          <section id="labs-catalogue" className="scroll-mt-24 mb-10">
            <h2 className="section-title mb-1">
              {activeModule.icon} {activeModule.name}
            </h2>
            <p className="text-sm text-slate-500 mb-4">
              {getProductLine(activeTrack.lineId).name} · {subcategoryLabel(activeTrack.lineId, subParam)}
            </p>
            {loading ? (
              <div className="card p-10 text-center text-slate-500 text-sm">Loading…</div>
            ) : moduleItems.length === 0 ? (
              <div className="card p-10 text-center text-slate-500 text-sm">{PRODUCT_LABS_PORTAL.emptyModule}</div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {moduleItems.map((item) => {
                  const soon = isCourseComingSoon(item)
                  return (
                    <div key={item.id} className="card p-5 flex flex-col h-full hover:shadow-md transition">
                      <h3 className="font-semibold text-bingo-dark text-sm">{item.name}</h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 flex-1">{item.desc}</p>
                      <LabMaterialCardActions item={item} soon={soon} />
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        ) : null}

        <section className="card p-6 bg-slate-50 border-dashed border-slate-300 text-center">
          <p className="text-sm text-slate-600 mb-3">
            AI Exploration is <strong>not</strong> part of these product labs — it is a free, standalone game zone.
          </p>
          <Link to="/exploration" className="btn-primary px-5 py-2.5 text-sm inline-flex min-h-[44px] items-center">
            🧭 {PRODUCT_LABS_PORTAL.exploreFree} →
          </Link>
        </section>
      </PageContent>
    </div>
  )
}

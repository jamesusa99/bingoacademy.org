import { lazy, Suspense } from 'react'
import { HOME_SECTION_IDS } from '../../config/homePage'
import { useProductLineVisibility } from '../../contexts/ProductLineVisibilityContext'
import { HomeTuitionSectionHeader } from './HomePageSections'

const HomeIoaiStagePackages = lazy(() => import('./HomeIoaiStagePackages'))

export default function HomeTuitionSection() {
  const { isLineVisible } = useProductLineVisibility()

  if (!isLineVisible('ioai')) return null

  return (
    <section
      id={HOME_SECTION_IDS.tuition}
      className="scroll-mt-24 w-full border-b border-slate-200 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white"
    >
      <div className="page-content py-12 sm:py-16">
        <HomeTuitionSectionHeader />
        <Suspense fallback={null}>
          <HomeIoaiStagePackages />
        </Suspense>
      </div>
    </section>
  )
}

import { useCallback, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { GraduationCap, ArrowRight } from 'lucide-react'
import PageMeta from '../components/PageMeta'
import { PAGE_SEO } from '../config/programs'
import { getProductLine } from '../config/products'
import { getProgramCurriculum, isCurriculumLine } from '../config/programCurriculum'
import { useProgramCurriculum } from '../hooks/useProgramCurriculum'
import { useIOAIAccess } from '../hooks/useIOAIAccess'
import { useCourseCatalog } from '../hooks/useCourseCatalog'
import CurriculumNavigator from '../components/curriculum/CurriculumNavigator'
import ModuleDetailsPanel from '../components/curriculum/ModuleDetailsPanel'
import ProUpgradeModal from '../components/curriculum/ProUpgradeModal'
import LessonVideoModal from '../components/curriculum/LessonVideoModal'
import { getDefaultSelectedModule } from '../components/curriculum/curriculumUtils'
import { confirmCheckoutSession } from '../lib/checkout'
import { useAuth } from '../contexts/AuthContext'

function progressKey(line) {
  return `${line}-curriculum-completed`
}

function loadCompletedLessons(line) {
  try {
    const raw = localStorage.getItem(progressKey(line))
    const list = raw ? JSON.parse(raw) : []
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

export default function Curriculum() {
  const [searchParams, setSearchParams] = useSearchParams()
  const lineParam = searchParams.get('line') || 'ioai'
  const productLine = isCurriculumLine(lineParam) ? lineParam : 'ioai'
  const config = getProgramCurriculum(productLine)
  const product = getProductLine(productLine)

  const { tree, summary, loading, error, reload } = useProgramCurriculum(productLine)
  const { courses } = useCourseCatalog()
  const { hasAccess, refresh: refreshAccess } = useIOAIAccess()
  const { isAuthenticated } = useAuth()

  const [selectedModule, setSelectedModule] = useState(null)
  const [completedLessons, setCompletedLessons] = useState(() => loadCompletedLessons(productLine))
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [videoLesson, setVideoLesson] = useState(null)
  const [checkoutNotice, setCheckoutNotice] = useState(null)

  useEffect(() => {
    setCompletedLessons(loadCompletedLessons(productLine))
    setSelectedModule(null)
  }, [productLine])

  useEffect(() => {
    if (tree.length && !selectedModule) {
      setSelectedModule(getDefaultSelectedModule(tree))
    }
  }, [tree, selectedModule])

  useEffect(() => {
    localStorage.setItem(progressKey(productLine), JSON.stringify(completedLessons))
  }, [completedLessons, productLine])

  useEffect(() => {
    const status = searchParams.get('checkout')
    const sessionId = searchParams.get('session_id')
    if (status === 'success' && sessionId && isAuthenticated && productLine === 'ioai') {
      confirmCheckoutSession(sessionId)
        .then(() => {
          setCheckoutNotice('Payment successful — IOAI Masterclass unlocked!')
          refreshAccess()
        })
        .catch(() => setCheckoutNotice('Payment received — refreshing access…'))
        .finally(() => {
          searchParams.delete('checkout')
          searchParams.delete('session_id')
          setSearchParams(searchParams, { replace: true })
        })
    } else if (status === 'canceled') {
      setCheckoutNotice('Checkout canceled.')
      searchParams.delete('checkout')
      setSearchParams(searchParams, { replace: true })
    }
  }, [searchParams, setSearchParams, isAuthenticated, refreshAccess, productLine])

  const toggleLessonComplete = useCallback((lessonId) => {
    setCompletedLessons((prev) =>
      prev.includes(lessonId) ? prev.filter((id) => id !== lessonId) : [...prev, lessonId]
    )
  }, [])

  const handleOpenLesson = useCallback((lesson) => {
    if (lesson.cloudflareVideoId) {
      setVideoLesson(lesson)
    } else {
      window.location.href = `/courses/detail/${lesson.id}`
    }
  }, [])

  const lineAccess = productLine === 'ioai' ? hasAccess : true

  return (
    <div className="curriculum-page courses-page-dark min-h-[calc(100vh-4rem)]">
      <PageMeta title={`${config.summaryTitle} · Bingo AI Academy`} description={PAGE_SEO.courses.description} />

      <div className="page-content py-8 sm:py-10 lg:py-12">
        <header className="mb-8 sm:mb-10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400 mb-2">
                <GraduationCap className="w-4 h-4" aria-hidden />
                {product.name}
              </p>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                Curriculum Explorer
              </h1>
              <p className="text-sm sm:text-base text-slate-400 mt-2 max-w-2xl">
                {summary.summary || config.summaryTitle} — loaded from Supabase. Browse levels, themes, and modules.
              </p>
            </div>
            <Link
              to={`/courses/detail/${config.trackSlug}`}
              className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-4 py-2.5 text-sm font-semibold text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400/60 transition-all shrink-0"
            >
              Full track overview
              <ArrowRight className="w-4 h-4" aria-hidden />
            </Link>
          </div>
        </header>

        {checkoutNotice ? (
          <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            {checkoutNotice}
          </div>
        ) : null}

        {error ? (
          <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            {error.includes('does not exist')
              ? 'Curriculum tables missing — run migrations 014–016, then add courses in admin.'
              : error}
            <button type="button" onClick={reload} className="ml-3 underline">
              Retry
            </button>
          </div>
        ) : null}

        {loading ? (
          <div className="text-center py-20 text-slate-400 text-sm">Loading curriculum from database…</div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-5 lg:gap-6 min-h-[560px]">
            <div className="w-full lg:w-[30%] lg:min-w-[260px] lg:max-w-[360px] shrink-0">
              <CurriculumNavigator
                curriculum={tree}
                summary={summary}
                selected={selectedModule}
                onSelectModule={setSelectedModule}
                completedLessons={completedLessons}
              />
            </div>
            <div className="w-full lg:w-[70%] lg:flex-1 min-w-0">
              <ModuleDetailsPanel
                selected={selectedModule}
                catalogCourses={courses}
                completedLessons={completedLessons}
                onToggleLessonComplete={toggleLessonComplete}
                hasAccess={lineAccess}
                onOpenLesson={handleOpenLesson}
                onLockedLesson={() => setUpgradeOpen(true)}
              />
            </div>
          </div>
        )}
      </div>

      <ProUpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
      <LessonVideoModal
        open={Boolean(videoLesson)}
        lesson={videoLesson}
        onClose={() => setVideoLesson(null)}
      />
    </div>
  )
}

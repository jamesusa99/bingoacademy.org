import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import PageMeta from '../../components/PageMeta'
import PageContent from '../../components/PageContent'
import IoaiAssessmentLanding from '../../components/assessment/ioai/IoaiAssessmentLanding'
import IoaiAssessmentProfile from '../../components/assessment/ioai/IoaiAssessmentProfile'
import IoaiAssessmentQuiz from '../../components/assessment/ioai/IoaiAssessmentQuiz'
import IoaiAssessmentResults from '../../components/assessment/ioai/IoaiAssessmentResults'
import { IOAI_ASSESSMENT_COPY, IOAI_ASSESSMENT_ID } from '../../config/ioaiAssessment'
import { IOAI_ASSESSMENT_QUESTIONS } from '../../data/ioaiAssessmentQuestions'
import { scoreIoaiAssessment } from '../../lib/ioaiAssessmentScore'
import { resolveRecommendedModules } from '../../lib/ioaiAssessmentRecommend'
import {
  clearIoaiAssessmentProgress,
  loadIoaiAssessmentProgress,
  saveIoaiAssessmentProgress,
} from '../../lib/ioaiAssessmentProgress'
import { trackConversion, trackEvent } from '../../lib/analytics'
import { useIOAIStore } from '../../hooks/useIOAIStore'
import { useIoaiCourseBundles, findCourseBundleForStage } from '../../hooks/useIoaiCourseBundles'

export default function IoaiReadinessAssessmentPage() {
  const questions = IOAI_ASSESSMENT_QUESTIONS
  const { levels } = useIOAIStore()
  const { bundles } = useIoaiCourseBundles()
  const [state, setState] = useState(() =>
    typeof window === 'undefined' ? { step: 'landing', profile: {}, answers: {}, startedAt: null, currentIndex: 0 } : loadIoaiAssessmentProgress()
  )

  useEffect(() => {
    trackEvent('ioai_assessment_view', { assessment_id: IOAI_ASSESSMENT_ID })
  }, [])

  useEffect(() => {
    saveIoaiAssessmentProgress(state)
  }, [state])

  const update = useCallback((patch) => {
    setState((prev) => ({ ...prev, ...patch }))
  }, [])

  const begin = (step) => {
    trackEvent('ioai_assessment_start', { assessment_id: IOAI_ASSESSMENT_ID })
    trackConversion('assessment_start', { assessment_id: IOAI_ASSESSMENT_ID })
    update({
      step,
      startedAt: state.startedAt || Date.now(),
      currentIndex: step === 'quiz' ? state.currentIndex || 0 : 0,
    })
  }

  const answers = state.answers || {}
  const result = useMemo(() => {
    if (state.step !== 'results') return null
    return scoreIoaiAssessment(questions, state.answers || {}, { elapsedSeconds: state.elapsedSeconds || 0 })
  }, [state.step, state.elapsedSeconds, state.answers, questions])

  const completeTracked = useRef(false)

  useEffect(() => {
    if (state.step !== 'results' || !result || completeTracked.current) return
    completeTracked.current = true
    trackEvent('ioai_assessment_complete', {
      assessment_id: IOAI_ASSESSMENT_ID,
      correct_count: result.correctCount,
      recommended_stage: result.recommendedStage,
    })
    trackEvent('ioai_result_stage', { stage: result.recommendedStage })
    trackEvent('ioai_result_weak_tags', { tags: result.skuSafeWeakTags })
    trackConversion('assessment_complete', {
      assessment_id: IOAI_ASSESSMENT_ID,
      recommended_stage: result.recommendedStage,
    })
  }, [state.step, result])

  const modules = useMemo(() => {
    if (!result) return []
    return resolveRecommendedModules({
      weakTags: result.weakTags,
      recommendedStage: result.recommendedStage,
      levels,
    })
  }, [result, levels])

  const bundle = result ? findCourseBundleForStage(bundles, result.recommendedStage) : null

  const finishQuiz = () => {
    const unanswered = questions.filter((q) => answers[q.id] == null)
    if (unanswered.length) return
    const elapsedSeconds = state.startedAt ? Math.max(1, Math.round((Date.now() - state.startedAt) / 1000)) : 0
    update({ step: 'results', elapsedSeconds })
  }

  return (
    <div className="w-full">
      <PageMeta title={IOAI_ASSESSMENT_COPY.seoTitle} description={IOAI_ASSESSMENT_COPY.seoDescription} />

      <header className="bg-gradient-to-br from-[#2081a2]/12 via-cyan-50/80 to-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <p className="text-xs text-slate-500 mb-1">Bingo Academy · IOAI training</p>
          <h1 className="text-xl sm:text-2xl font-bold text-bingo-dark">IOAI Readiness Assessment</h1>
        </div>
      </header>

      <PageContent className="py-8 max-w-7xl mx-auto">
        {state.step === 'landing' ? (
          <IoaiAssessmentLanding
            hasProgress={Boolean(state.answers && Object.keys(state.answers).length)}
            onStart={() => begin(state.answers && Object.keys(state.answers).length ? 'quiz' : 'profile')}
            onSkipProfile={() => begin('quiz')}
          />
        ) : null}

        {state.step === 'profile' ? (
          <IoaiAssessmentProfile
            profile={state.profile || {}}
            onChange={(profile) => update({ profile })}
            onContinue={() => update({ step: 'quiz', currentIndex: 0 })}
          />
        ) : null}

        {state.step === 'quiz' ? (
          <IoaiAssessmentQuiz
            questions={questions}
            currentIndex={state.currentIndex || 0}
            answers={answers}
            onAnswer={(id, value) => {
              update({ answers: { ...answers, [id]: value } })
            }}
            onNext={() => {
              const index = state.currentIndex || 0
              const question = questions[index]
              trackEvent('ioai_question_answered', { question_id: question.id, index: index + 1 })
              if (index + 1 >= questions.length) finishQuiz()
              else update({ currentIndex: index + 1 })
            }}
            onBack={() => {
              const index = state.currentIndex || 0
              if (index === 0) update({ step: 'landing' })
              else update({ currentIndex: index - 1 })
            }}
          />
        ) : null}

        {state.step === 'results' && result ? (
          <IoaiAssessmentResults
            result={result}
            modules={modules}
            bundle={bundle}
            onRetake={() => {
              clearIoaiAssessmentProgress()
              completeTracked.current = false
              setState({ step: 'landing', profile: {}, answers: {}, startedAt: null, currentIndex: 0, elapsedSeconds: 0 })
            }}
            onRecommendClick={() => trackEvent('ioai_course_recommendation_click', { stage: result.recommendedStage })}
            onFullTrackClick={() => trackEvent('ioai_full_track_click', { from_stage: result.recommendedStage })}
            onEmailSubmit={() => trackEvent('ioai_report_email_submit', { stage: result.recommendedStage })}
          />
        ) : null}
      </PageContent>
    </div>
  )
}

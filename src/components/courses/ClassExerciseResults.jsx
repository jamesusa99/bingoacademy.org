import { useMemo, useState } from 'react'
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  XCircle,
} from 'lucide-react'
import { COURSES_PORTAL } from '../../config/coursesPortal'
import RichHtmlContent from '../shared/RichHtmlContent'
import { OptionList } from './IoaiQuestionPlayer'

const FILTERS = ['all', 'correct', 'incorrect']

function formatAnswerKeys(answer) {
  if (answer == null || answer === '') return '—'
  if (Array.isArray(answer)) return answer.join(', ')
  return String(answer)
}

function optionText(question, key) {
  const opt = question.options?.find((o) => o.key === key)
  if (!opt?.html) return key
  return opt.html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() || key
}

function formatAnswerDisplay(question, answer) {
  if (answer == null || answer === '') return '—'
  if (Array.isArray(answer)) {
    return answer.map((k) => `${k}. ${optionText(question, k)}`).join(' · ')
  }
  return `${answer}. ${optionText(question, answer)}`
}

function resultsHeadline(accuracy, passed) {
  if (passed) return COURSES_PORTAL.classExercisesResultsAwesome
  if (accuracy >= 70) return COURSES_PORTAL.classExercisesResultsNiceWork
  return COURSES_PORTAL.classExercisesResultsKeepPracticing
}

function resultsSubtitle(accuracy, passed) {
  if (passed) return COURSES_PORTAL.classExercisesResultsSubtitlePass
  if (accuracy >= 70) return COURSES_PORTAL.classExercisesResultsSubtitleGood
  return COURSES_PORTAL.classExercisesResultsSubtitleRetry
}

export default function ClassExerciseResults({
  questions,
  answers,
  result,
  lessonTitle = '',
  onRetry,
  onFinish,
  onBackToLesson,
}) {
  const [filter, setFilter] = useState('all')
  const [expanded, setExpanded] = useState(() => new Set())

  const resultByQuestionId = useMemo(() => {
    const map = new Map()
    for (const row of result?.results || []) {
      map.set(row.questionId, row)
    }
    return map
  }, [result])

  const correctCount = useMemo(
    () => (result?.results || []).filter((r) => r.correct).length,
    [result]
  )
  const incorrectCount = questions.length - correctCount
  const accuracy =
    questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0
  const passed = accuracy >= 70

  const filteredQuestions = useMemo(() => {
    if (filter === 'correct') {
      return questions.filter((q) => resultByQuestionId.get(q.id)?.correct)
    }
    if (filter === 'incorrect') {
      return questions.filter((q) => !resultByQuestionId.get(q.id)?.correct)
    }
    return questions
  }, [filter, questions, resultByQuestionId])

  const toggleExpanded = (id) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const isExpanded = (q, graded) => {
    if (expanded.has(q.id)) return true
    if (expanded.size === 0 && !graded?.correct) return true
    return false
  }

  return (
    <div className="bg-slate-50 text-slate-800">
      {/* Summary hero */}
      <div className="px-4 sm:px-6 py-6 sm:py-8 border-b border-slate-200 bg-gradient-to-br from-white via-cyan-50/40 to-white">
        <div className="flex flex-col lg:flex-row lg:items-center gap-5">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-cyan-100 flex items-center justify-center text-3xl sm:text-4xl shrink-0 shadow-sm border border-primary/10"
              aria-hidden
            >
              {passed ? '🎉' : accuracy >= 70 ? '👍' : '📚'}
            </div>
            <div className="min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold text-bingo-dark">
                {resultsHeadline(accuracy, passed)}
              </h2>
              <p className="text-sm text-slate-600 mt-1">{resultsSubtitle(accuracy, passed)}</p>
              {lessonTitle ? (
                <p className="text-xs text-slate-500 mt-2 truncate">{lessonTitle}</p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-4 sm:gap-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-1">
                {COURSES_PORTAL.classExercisesScoreLabel}
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-primary">
                {result?.score ?? 0}{' '}
                <span className="text-lg text-slate-400 font-semibold">/ {result?.totalScore ?? 0}</span>
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-1">
                {COURSES_PORTAL.classExercisesAccuracy}
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-bingo-dark">{accuracy}%</p>
            </div>
            <div className="flex items-center gap-2 pb-1">
              <ShieldCheck className={`w-8 h-8 ${passed ? 'text-emerald-500' : 'text-amber-500'}`} aria-hidden />
              <div>
                <p className="text-sm font-semibold text-bingo-dark">
                  {passed ? COURSES_PORTAL.classExercisesResultsGreatJob : COURSES_PORTAL.classExercisesResultsAlmost}
                </p>
                <span
                  className={`inline-block text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full mt-0.5 ${
                    passed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {passed ? COURSES_PORTAL.classExercisesPassed : COURSES_PORTAL.classExercisesNotPassed}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-6 grid lg:grid-cols-3 gap-6">
        {/* Answer review */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-bold text-bingo-dark">{COURSES_PORTAL.classExercisesReviewTitle}</h3>
            <div className="flex flex-wrap gap-1.5">
              {FILTERS.map((key) => {
                const count =
                  key === 'all'
                    ? questions.length
                    : key === 'correct'
                      ? correctCount
                      : incorrectCount
                const label =
                  key === 'all'
                    ? COURSES_PORTAL.classExercisesFilterAll(count)
                    : key === 'correct'
                      ? COURSES_PORTAL.classExercisesFilterCorrect(count)
                      : COURSES_PORTAL.classExercisesFilterIncorrect(count)
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFilter(key)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full transition ${
                      filter === key
                        ? 'bg-primary text-white'
                        : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-2">
            {filteredQuestions.map((q, index) => {
              const graded = resultByQuestionId.get(q.id)
              const open = isExpanded(q, graded)
              const userAnswer = answers[q.id]

              return (
                <article
                  key={q.id}
                  className={`rounded-xl border bg-white overflow-hidden transition ${
                    graded?.correct ? 'border-emerald-200' : 'border-red-200'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleExpanded(q.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50/80 transition"
                  >
                    {graded?.correct ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" aria-hidden />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500 shrink-0" aria-hidden />
                    )}
                    <span className="flex-1 min-w-0 text-sm font-medium text-bingo-dark line-clamp-1">
                      {COURSES_PORTAL.classExercisesQuestionLabel(index + 1)} ·{' '}
                      <span
                        className="font-normal text-slate-600"
                        dangerouslySetInnerHTML={{
                          __html: (q.stemHtml || '').replace(/<[^>]+>/g, ' ').slice(0, 80),
                        }}
                      />
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
                      aria-hidden
                    />
                  </button>

                  {open ? (
                    <div className="px-4 pb-4 pt-0 space-y-4 border-t border-slate-100 min-w-0">
                      <RichHtmlContent html={q.stemHtml} theme="light" className="w-full" />
                      <OptionList
                        question={q}
                        value={userAnswer}
                        onChange={() => {}}
                        disabled
                        reveal
                        correctAnswer={graded?.correctAnswer}
                        theme="light"
                      />
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div
                          className={`rounded-lg p-3 text-sm ${
                            graded?.correct ? 'bg-emerald-50 border border-emerald-100' : 'bg-red-50 border border-red-100'
                          }`}
                        >
                          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-1">
                            {COURSES_PORTAL.classExercisesYourAnswer}
                          </p>
                          <p className={graded?.correct ? 'text-emerald-800' : 'text-red-800'}>
                            {formatAnswerDisplay(q, userAnswer)}
                          </p>
                        </div>
                        {!graded?.correct ? (
                          <div className="rounded-lg p-3 text-sm bg-emerald-50 border border-emerald-100">
                            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-1">
                              {COURSES_PORTAL.classExercisesCorrectAnswer}
                            </p>
                            <p className="text-emerald-800">{formatAnswerDisplay(q, graded?.correctAnswer)}</p>
                          </div>
                        ) : null}
                      </div>
                      {graded?.explanationHtml ? (
                        <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
                          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-2">
                            {COURSES_PORTAL.classExercisesExplanation}
                          </p>
                          <RichHtmlContent html={graded.explanationHtml} theme="light" />
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </article>
              )
            })}
          </div>
        </div>

        {/* Performance sidebar */}
        <aside className="space-y-4">
          <div className="card p-5 border border-slate-200 bg-white">
            <h3 className="font-bold text-bingo-dark text-sm mb-4">{COURSES_PORTAL.classExercisesPerformanceTitle}</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{COURSES_PORTAL.classExercisesCorrect}</span>
                <span className="font-bold text-emerald-600">{correctCount}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{COURSES_PORTAL.classExercisesIncorrect}</span>
                <span className="font-bold text-red-500">{incorrectCount}</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden mt-2">
                <div
                  className="h-full bg-gradient-to-r from-primary to-cyan-400 transition-all duration-500"
                  style={{ width: `${accuracy}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 text-center">{accuracy}% {COURSES_PORTAL.classExercisesAccuracy}</p>
            </div>
          </div>

          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex gap-3">
            <span className="text-2xl shrink-0" aria-hidden>
              {passed ? '🤖' : '💪'}
            </span>
            <p className="text-sm text-slate-700 leading-relaxed">
              {passed
                ? COURSES_PORTAL.classExercisesMotivationPass
                : COURSES_PORTAL.classExercisesMotivationRetry}
            </p>
          </div>
        </aside>
      </div>

      {/* Footer actions */}
      <div className="px-4 sm:px-6 py-4 border-t border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3">
        {onBackToLesson ? (
          <button
            type="button"
            onClick={onBackToLesson}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-primary transition"
          >
            <RotateCcw className="w-4 h-4" aria-hidden />
            {COURSES_PORTAL.classExercisesBackToLesson}
          </button>
        ) : (
          <span />
        )}
        <div className="flex flex-wrap gap-2 sm:ml-auto">
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
          >
            <RefreshCw className="w-4 h-4" aria-hidden />
            {COURSES_PORTAL.classExercisesRetry}
          </button>
          <button type="button" onClick={onFinish} className="btn-primary inline-flex items-center gap-1.5 text-sm px-5 py-2.5">
            {COURSES_PORTAL.classExercisesFinishContinue}
            <ArrowRight className="w-4 h-4" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  )
}

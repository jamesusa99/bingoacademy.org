import { useMemo } from 'react'
import {
  IOAI_QUESTION_TYPES,
  formToPreviewQuestion,
  previewCorrectAnswer,
  rowToQuestionForm,
  sanitizeQuestionForClient,
} from '../../config/ioaiQuestions'
import { COURSES_PORTAL } from '../../config/coursesPortal'
import RichHtmlContent from '../shared/RichHtmlContent'

function StaticOptionList({ question, correctAnswer, theme = 'dark' }) {
  const isMultiple = question.questionType === IOAI_QUESTION_TYPES.MULTIPLE
  const isLight = theme === 'light'

  return (
    <div className="space-y-2 pointer-events-none">
      {isMultiple ? (
        <p className={`text-xs mb-2 ${isLight ? 'text-amber-700' : 'text-amber-300'}`}>
          {COURSES_PORTAL.classExercisesMultipleHint}
        </p>
      ) : null}
      {question.options.map((opt) => {
        const isCorrect = Array.isArray(correctAnswer)
          ? correctAnswer.includes(opt.key)
          : String(correctAnswer).toUpperCase() === opt.key
        return (
          <div
            key={opt.key}
            className={`flex items-start gap-3 p-3 rounded-xl border w-full min-w-0 ${
              isCorrect
                ? 'border-emerald-500 bg-emerald-500/10'
                : isLight
                  ? 'border-slate-200 bg-white'
                  : 'border-slate-700 bg-slate-800/20'
            }`}
          >
            <span
              className={`mt-0.5 w-4 h-4 rounded-full border-2 shrink-0 ${
                isCorrect ? 'border-emerald-500 bg-emerald-500' : isLight ? 'border-slate-300' : 'border-slate-600'
              }`}
            />
            <div
              className={`min-w-0 flex-1 text-sm break-words [overflow-wrap:anywhere] ${
                isLight ? 'text-slate-700' : 'text-slate-200'
              }`}
            >
              <span className="font-semibold mr-2">{opt.key}.</span>
              <RichHtmlContent html={opt.html} theme={theme} className="inline-block w-full" />
            </div>
          </div>
        )
      })}
    </div>
  )
}

/** Read-only storefront-style preview with answers revealed */
export default function IoaiQuestionAdminPreview({ source, scopeType = 'lesson', showAnswer = true }) {
  const theme = scopeType === 'module' ? 'light' : 'dark'
  const shellClass =
    scopeType === 'module'
      ? 'rounded-xl border border-slate-200 bg-white p-5 space-y-4'
      : 'rounded-xl border border-slate-700 bg-slate-800/30 p-5 space-y-4'

  const { question, correctAnswer, explanationHtml } = useMemo(() => {
    if (!source) return { question: null, correctAnswer: null, explanationHtml: '' }
    if (source.stem_html != null && source.question_type != null && source.correct_answer != null) {
      return {
        question: sanitizeQuestionForClient(source),
        correctAnswer: source.correct_answer,
        explanationHtml: source.explanation_html || '',
      }
    }
    const form = source.question_type ? rowToQuestionForm(source) : source
    return {
      question: formToPreviewQuestion(form),
      correctAnswer: previewCorrectAnswer(form),
      explanationHtml: form.explanation_html || '',
    }
  }, [source])

  if (!question?.stemHtml) {
    return (
      <div className="flex items-center justify-center h-full min-h-[200px] text-sm text-slate-400">
        —
      </div>
    )
  }

  return (
    <div className={shellClass}>
      <div>
        <p className={`text-xs mb-1 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
          {COURSES_PORTAL.classExercisesPointsLabel(question.score)} · Storefront preview
        </p>
        <RichHtmlContent html={question.stemHtml} theme={theme} />
      </div>
      <StaticOptionList question={question} correctAnswer={showAnswer ? correctAnswer : null} theme={theme} />
      {showAnswer && explanationHtml ? (
        <div
          className={`text-sm rounded-lg p-3 ${
            theme === 'light' ? 'bg-slate-50 text-slate-700' : 'bg-slate-900/50 text-slate-300'
          }`}
        >
          <p className={`text-xs mb-1 ${theme === 'light' ? 'text-slate-500' : 'text-slate-500'}`}>
            {COURSES_PORTAL.classExercisesExplanation}
          </p>
          <RichHtmlContent html={explanationHtml} theme={theme} />
        </div>
      ) : null}
    </div>
  )
}

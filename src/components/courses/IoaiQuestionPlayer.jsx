import { useMemo, useState } from 'react'
import { Lock } from 'lucide-react'
import { IOAI_QUESTION_TYPES } from '../../config/ioaiQuestions'
import { COURSES_PORTAL } from '../../config/coursesPortal'
import RichHtmlContent from '../shared/RichHtmlContent'

function OptionList({ question, value, onChange, disabled, reveal, correctAnswer, theme = 'dark' }) {
  const isMultiple = question.questionType === IOAI_QUESTION_TYPES.MULTIPLE
  const selected = value
  const isLight = theme === 'light'

  return (
    <div className="space-y-2">
      {isMultiple ? (
        <p className={`text-xs mb-2 ${isLight ? 'text-amber-700' : 'text-amber-300'}`}>
          本题为多选题，全部选对方可得分
        </p>
      ) : null}
      {question.options.map((opt) => {
        const key = opt.key
        const isSelected = isMultiple
          ? Array.isArray(selected) && selected.includes(key)
          : selected === key
        const isCorrect =
          reveal &&
          (Array.isArray(correctAnswer)
            ? correctAnswer.includes(key)
            : String(correctAnswer).toUpperCase() === key)
        const isWrong = reveal && isSelected && !isCorrect

        return (
          <label
            key={key}
            className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
              isSelected
                ? isLight
                  ? 'border-primary bg-primary/5'
                  : 'border-primary bg-primary/10'
                : isLight
                  ? 'border-slate-200 hover:border-slate-300'
                  : 'border-slate-700 hover:border-slate-500'
            } ${isCorrect ? 'border-emerald-500 bg-emerald-500/10' : ''} ${isWrong ? 'border-red-500/60 bg-red-500/10' : ''}`}
          >
            <input
              type={isMultiple ? 'checkbox' : 'radio'}
              name={`q-${question.id}`}
              checked={isSelected}
              disabled={disabled}
              onChange={() => {
                if (disabled) return
                if (isMultiple) {
                  const arr = Array.isArray(selected) ? [...selected] : []
                  onChange(arr.includes(key) ? arr.filter((k) => k !== key) : [...arr, key])
                } else {
                  onChange(key)
                }
              }}
              className="mt-1"
            />
            <div className={`text-sm ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>
              <span className="font-semibold mr-2">{key}.</span>
              <RichHtmlContent html={opt.html} theme={theme} />
            </div>
          </label>
        )
      })}
    </div>
  )
}

function formatCorrectAnswer(correctAnswer) {
  if (correctAnswer == null) return '—'
  if (Array.isArray(correctAnswer)) return correctAnswer.join(', ')
  return String(correctAnswer)
}

function isQuestionAnswered(question, value) {
  if (question.questionType === IOAI_QUESTION_TYPES.MULTIPLE) {
    return Array.isArray(value) && value.length > 0
  }
  return value != null && value !== ''
}

/** Lesson exercises — answer all, submit once, then review */
export function IoaiLessonExerciseForm({ questions, locked = false, onSubmit, onComplete, submitting = false }) {
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const allAnswered = useMemo(
    () => questions.length > 0 && questions.every((q) => isQuestionAnswered(q, answers[q.id])),
    [answers, questions]
  )

  const resultByQuestionId = useMemo(() => {
    const map = new Map()
    for (const row of result?.results || []) {
      map.set(row.questionId, row)
    }
    return map
  }, [result])

  const handleSubmit = async () => {
    if (!allAnswered || !onSubmit) {
      setError(COURSES_PORTAL.classExercisesAnswerAll)
      return
    }
    setError('')
    try {
      const graded = await onSubmit(answers)
      setResult(graded)
      onComplete?.(graded)
    } catch (err) {
      setError(err.message || 'Submit failed')
    }
  }

  const handleRetry = () => {
    setResult(null)
    setAnswers({})
    setError('')
  }

  if (locked) {
    return (
      <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-5 text-center">
        <Lock className="w-8 h-8 text-slate-500 mx-auto mb-2" />
        <p className="text-sm text-slate-400">{COURSES_PORTAL.classExercisesLockedShort}</p>
      </div>
    )
  }

  if (result) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-4 text-center">
          <p className="text-xs font-bold uppercase tracking-wide text-emerald-400 mb-1">Results</p>
          <p className="text-2xl font-bold text-white">
            {COURSES_PORTAL.classExercisesScore(result.score, result.totalScore)}
          </p>
        </div>

        {questions.map((q, index) => {
          const graded = resultByQuestionId.get(q.id)
          const reveal = Boolean(graded)
          return (
            <article key={q.id} className="rounded-xl border border-slate-700 bg-slate-800/30 p-5 space-y-4">
              <p className="text-xs text-slate-400">
                Question {index + 1} · {q.score} pt{q.score === 1 ? '' : 's'}
              </p>
              <RichHtmlContent html={q.stemHtml} />
              <OptionList
                question={q}
                value={answers[q.id]}
                onChange={() => {}}
                disabled
                reveal={reveal}
                correctAnswer={graded?.correctAnswer}
              />
              {graded ? (
                <div className="space-y-3 pt-1">
                  <p className={`text-sm font-semibold ${graded.correct ? 'text-emerald-400' : 'text-red-400'}`}>
                    {graded.correct ? COURSES_PORTAL.classExercisesCorrect : COURSES_PORTAL.classExercisesIncorrect}
                  </p>
                  <p className="text-sm text-slate-300">
                    <span className="text-slate-500">{COURSES_PORTAL.classExercisesCorrectAnswer}: </span>
                    {formatCorrectAnswer(graded.correctAnswer)}
                  </p>
                  {graded.explanationHtml ? (
                    <div className="text-sm text-slate-300 bg-slate-900/50 rounded-lg p-3">
                      <p className="text-xs text-slate-500 mb-1">{COURSES_PORTAL.classExercisesExplanation}</p>
                      <RichHtmlContent html={graded.explanationHtml} />
                    </div>
                  ) : null}
                </div>
              ) : null}
            </article>
          )
        })}

        <button type="button" onClick={handleRetry} className="btn-primary text-sm px-5 py-2.5">
          {COURSES_PORTAL.classExercisesRetry}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {questions.map((q, index) => (
        <article key={q.id} className="rounded-xl border border-slate-700 bg-slate-800/30 p-5 space-y-4">
          <p className="text-xs text-slate-400">
            Question {index + 1} · {q.score} pt{q.score === 1 ? '' : 's'}
          </p>
          <RichHtmlContent html={q.stemHtml} />
          <OptionList
            question={q}
            value={answers[q.id]}
            onChange={(val) => setAnswers((prev) => ({ ...prev, [q.id]: val }))}
            disabled={false}
            reveal={false}
          />
        </article>
      ))}

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      <button
        type="button"
        disabled={submitting || !allAnswered}
        onClick={handleSubmit}
        className="btn-primary w-full sm:w-auto text-sm px-6 py-2.5 disabled:opacity-50"
      >
        {submitting ? COURSES_PORTAL.classExercisesSubmitting : COURSES_PORTAL.classExercisesSubmitAll}
      </button>
    </div>
  )
}

/** Single question player — immediate feedback mode */
export function IoaiQuestionCard({
  question,
  locked = false,
  onGrade,
  grading = false,
}) {
  const [answer, setAnswer] = useState(
    question.questionType === IOAI_QUESTION_TYPES.MULTIPLE ? [] : null
  )
  const [result, setResult] = useState(null)

  const canSubmit = useMemo(() => {
    if (locked || result) return false
    if (question.questionType === IOAI_QUESTION_TYPES.MULTIPLE) {
      return Array.isArray(answer) && answer.length > 0
    }
    return Boolean(answer)
  }, [answer, locked, question.questionType, result])

  const handleSubmit = async () => {
    if (!canSubmit || !onGrade) return
    const graded = await onGrade(question.id, answer)
    setResult(graded)
  }

  const handleReset = () => {
    setResult(null)
    setAnswer(question.questionType === IOAI_QUESTION_TYPES.MULTIPLE ? [] : null)
  }

  if (locked) {
    return (
      <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-5 text-center">
        <Lock className="w-8 h-8 text-slate-500 mx-auto mb-2" />
        <p className="text-sm text-slate-400">{COURSES_PORTAL.classExercisesLockedShort}</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/30 p-5 space-y-4">
      <div>
        <p className="text-xs text-slate-400 mb-1">{question.score} 分</p>
        <RichHtmlContent html={question.stemHtml} />
      </div>
      <OptionList
        question={question}
        value={answer}
        onChange={setAnswer}
        disabled={Boolean(result)}
        reveal={Boolean(result)}
        correctAnswer={result?.correctAnswer}
      />
      {result ? (
        <div className="space-y-2">
          <p className={`text-sm font-medium ${result.correct ? 'text-emerald-400' : 'text-red-400'}`}>
            {result.correct ? '回答正确' : '回答错误'}
          </p>
          {result.explanationHtml ? (
            <div className="text-sm text-slate-300 bg-slate-900/50 rounded-lg p-3">
              <p className="text-xs text-slate-500 mb-1">解析</p>
              <RichHtmlContent html={result.explanationHtml} />
            </div>
          ) : null}
          <button type="button" onClick={handleReset} className="text-sm text-primary hover:underline">
            重新作答
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={!canSubmit || grading}
          onClick={handleSubmit}
          className="btn-primary text-sm px-5 py-2 disabled:opacity-50"
        >
          {grading ? '提交中…' : '提交答案'}
        </button>
      )}
    </div>
  )
}

/** Module test — submit all at once */
export function IoaiModuleTestForm({ questions, locked, onSubmit, submitting = false }) {
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)

  if (locked) {
    return (
      <div className="card p-6 text-center">
        <Lock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <p className="text-sm text-slate-600">完成模块全部课时并购买模块后，可参加结业测试</p>
      </div>
    )
  }

  if (result) {
    return (
      <div className="card p-6 space-y-4">
        <h3 className="font-bold text-bingo-dark text-lg">测试完成</h3>
        <p className="text-primary text-2xl font-bold">
          {result.score} / {result.totalScore} 分
        </p>
        <div className="space-y-3">
          {result.results?.map((r) => (
            <div key={r.questionId} className={`rounded-lg p-3 text-sm ${r.correct ? 'bg-emerald-50' : 'bg-red-50'}`}>
              <p className={r.correct ? 'text-emerald-800' : 'text-red-800'}>
                {r.correct ? '✓ 正确' : '✗ 错误'}
              </p>
              {r.explanationHtml ? <RichHtmlContent html={r.explanationHtml} theme="light" /> : null}
            </div>
          ))}
        </div>
        <button type="button" onClick={() => { setResult(null); setAnswers({}) }} className="btn-primary text-sm px-4 py-2">
          重新测试
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {questions.map((q, index) => (
        <div key={q.id} className="card p-5 space-y-3">
          <p className="text-xs text-slate-500">第 {index + 1} 题 · {q.score} 分</p>
          <RichHtmlContent html={q.stemHtml} theme="light" />
          <OptionList
            question={q}
            value={answers[q.id]}
            onChange={(val) => setAnswers((prev) => ({ ...prev, [q.id]: val }))}
            disabled={false}
            reveal={false}
            theme="light"
          />
        </div>
      ))}
      <button
        type="button"
        disabled={submitting}
        onClick={async () => {
          const graded = await onSubmit(answers)
          setResult(graded)
        }}
        className="btn-primary w-full py-3 disabled:opacity-50"
      >
        {submitting ? '提交中…' : '提交试卷'}
      </button>
    </div>
  )
}

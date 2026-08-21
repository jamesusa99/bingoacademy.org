import IoaiQuestionStem from './IoaiQuestionStem'
import IoaiMatchingQuestion from './IoaiMatchingQuestion'
import { IOAI_ASSESSMENT_COPY } from '../../../config/ioaiAssessment'

function optionSelected(question, value, optionId) {
  if (!value) return false
  if (question.questionType === 'multiple_choice') {
    return (value.optionIds || []).includes(optionId)
  }
  return value.optionId === optionId
}

export default function IoaiQuestionCard({ question, value, onChange }) {
  const selectCount = question.selectCount || question.correctAnswer?.optionIds?.length || 2

  const handleSingle = (optionId) => {
    onChange({ type: question.questionType, optionId })
  }

  const handleMulti = (optionId) => {
    const current = new Set(value?.optionIds || [])
    if (current.has(optionId)) current.delete(optionId)
    else current.add(optionId)
    onChange({ type: 'multiple_choice', optionIds: [...current] })
  }

  return (
    <div className="card p-5 sm:p-6">
      {question.questionType === 'multiple_choice' ? (
        <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-3">
          {IOAI_ASSESSMENT_COPY.quiz.selectCount(selectCount)}
        </p>
      ) : null}
      {question.questionType === 'true_false' ? (
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">True or false</p>
      ) : null}

      <IoaiQuestionStem stem={question.stem} />

      <div className="mt-6">
        {question.questionType === 'matching' ? (
          <IoaiMatchingQuestion question={question} value={value} onChange={onChange} />
        ) : (
          <div className="space-y-3">
            {(question.options || []).map((option, index) => {
              const selected = optionSelected(question, value, option.id)
              const letter = String.fromCharCode(65 + index)
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() =>
                    question.questionType === 'multiple_choice' ? handleMulti(option.id) : handleSingle(option.id)
                  }
                  className={`w-full text-left rounded-xl px-4 py-3 text-sm min-h-[48px] transition border ${
                    selected
                      ? 'border-2 border-primary bg-primary/5 text-primary font-medium'
                      : 'border-slate-200 text-slate-700 hover:border-primary/40 hover:bg-primary/5'
                  }`}
                >
                  <span className="font-semibold mr-2 align-top">{letter}.</span>
                  {option.text.includes('```') ? (
                    <pre className="mt-2 overflow-x-auto rounded-lg bg-slate-950 text-slate-100 text-[11px] leading-relaxed p-3">
                      <code>{option.text.replace(/```(?:python)?\n?/g, '').replace(/```/g, '').trim()}</code>
                    </pre>
                  ) : (
                    <span className="whitespace-pre-wrap">{option.text}</span>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

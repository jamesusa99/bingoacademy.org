import IoaiQuestionCard from './IoaiQuestionCard'
import { isAnswerComplete } from '../../../lib/ioaiAssessmentAnswers'
import { IOAI_ASSESSMENT_COPY } from '../../../config/ioaiAssessment'

export default function IoaiAssessmentQuiz({
  questions,
  currentIndex,
  answers,
  onAnswer,
  onNext,
  onBack,
}) {
  const question = questions[currentIndex]
  const value = answers[question.id]
  const ready = isAnswerComplete(question, value)
  const isLast = currentIndex + 1 >= questions.length
  const progress = Math.round((currentIndex / questions.length) * 100)

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-2">
        <button type="button" onClick={onBack} className="text-sm text-slate-500 hover:text-primary">
          ← Back
        </button>
        <span className="text-sm text-slate-500 font-medium">
          {IOAI_ASSESSMENT_COPY.quiz.progressLabel(currentIndex + 1, questions.length)}
        </span>
      </div>
      <p className="text-xs text-slate-400 mb-3">About 8 minutes · answers are scored after you finish</p>

      <div className="w-full h-2 bg-slate-100 rounded-full mb-6 overflow-hidden">
        <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      <IoaiQuestionCard
        question={question}
        value={value}
        onChange={(next) => onAnswer(question.id, next)}
      />

      <div className="flex justify-end mt-4">
        <button
          type="button"
          onClick={onNext}
          disabled={!ready}
          className="btn-primary px-6 py-3 text-sm font-bold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed min-h-[48px]"
        >
          {isLast ? IOAI_ASSESSMENT_COPY.quiz.seeResults : IOAI_ASSESSMENT_COPY.quiz.next}
        </button>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { COURSES_PORTAL } from '../../config/coursesPortal'
import { fetchLessonExercises, submitLessonExercises } from '../../lib/ioaiQuestionsApi'
import { IoaiLessonExerciseForm } from './IoaiQuestionPlayer'
import ClassExerciseResults from './ClassExerciseResults'

export function useLessonExerciseCount(lessonRef) {
  const [count, setCount] = useState(0)
  const [questions, setQuestions] = useState([])
  const [submission, setSubmission] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!lessonRef) {
      setCount(0)
      setQuestions([])
      setSubmission(null)
      setLoading(false)
      return undefined
    }
    let cancelled = false
    setLoading(true)
    fetchLessonExercises(lessonRef)
      .then((data) => {
        if (cancelled) return
        setCount(data.count || 0)
        setQuestions(data.questions || [])
        setSubmission(data.submission || null)
      })
      .catch(() => {
        if (!cancelled) {
          setCount(0)
          setQuestions([])
          setSubmission(null)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [lessonRef])

  return { count, questions, submission, loading, hasExercises: count > 0 }
}

export default function LessonExerciseSegment({
  lessonRef,
  lessonTitle = '',
  hasAccess,
  onAllComplete,
  onBackToVideo,
}) {
  const { questions, submission, loading, hasExercises } = useLessonExerciseCount(lessonRef)
  const [submitting, setSubmitting] = useState(false)
  const [submitResult, setSubmitResult] = useState(null)
  const [userAnswers, setUserAnswers] = useState(null)
  const [retrying, setRetrying] = useState(false)

  const savedSubmission = retrying ? null : submission
  const activeResult = submitResult ?? savedSubmission?.result ?? null
  const activeAnswers = userAnswers ?? savedSubmission?.answers ?? null

  if (loading) {
    return <div className="p-8 text-center text-slate-400 text-sm">Loading exercises…</div>
  }

  if (!hasExercises) return null

  const handleSubmit = async (answers) => {
    setSubmitting(true)
    try {
      return await submitLessonExercises(lessonRef, answers)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitted = (answers, graded) => {
    setRetrying(false)
    setUserAnswers(answers)
    setSubmitResult(graded)
  }

  const handleRetry = () => {
    setRetrying(true)
    setSubmitResult(null)
    setUserAnswers(null)
  }

  if (activeResult && activeAnswers) {
    return (
      <ClassExerciseResults
        questions={questions}
        answers={activeAnswers}
        result={activeResult}
        lessonTitle={lessonTitle}
        onRetry={handleRetry}
        onFinish={() => onAllComplete?.()}
        onBackToLesson={onBackToVideo}
      />
    )
  }

  return (
    <div className="p-6 sm:p-8 space-y-6 min-w-0">
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-amber-400 mb-1">
          {COURSES_PORTAL.classExercises}
        </p>
        <p className="text-sm text-slate-400">
          {hasAccess ? COURSES_PORTAL.classExercisesDesc : COURSES_PORTAL.classExercisesLocked}
        </p>
      </div>
      <IoaiLessonExerciseForm
        questions={questions}
        locked={!hasAccess}
        submitting={submitting}
        onSubmit={handleSubmit}
        onSubmitted={handleSubmitted}
      />
    </div>
  )
}

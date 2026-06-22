import { useEffect, useState } from 'react'
import { COURSES_PORTAL } from '../../config/coursesPortal'
import { fetchLessonExercises, submitLessonExercises } from '../../lib/ioaiQuestionsApi'
import { IoaiLessonExerciseForm } from './IoaiQuestionPlayer'

export function useLessonExerciseCount(lessonRef) {
  const [count, setCount] = useState(0)
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!lessonRef) {
      setCount(0)
      setQuestions([])
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
      })
      .catch(() => {
        if (!cancelled) {
          setCount(0)
          setQuestions([])
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [lessonRef])

  return { count, questions, loading, hasExercises: count > 0 }
}

export default function LessonExerciseSegment({ lessonRef, hasAccess, onAllComplete }) {
  const { questions, loading, hasExercises } = useLessonExerciseCount(lessonRef)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

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

  const handleComplete = () => {
    if (submitted) return
    setSubmitted(true)
    onAllComplete?.()
  }

  return (
    <div className="p-6 sm:p-8 space-y-6">
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
        onComplete={handleComplete}
      />
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Lock } from 'lucide-react'
import { fetchLessonExercises, gradeLessonExercise } from '../../lib/ioaiQuestionsApi'
import { IoaiQuestionCard } from './IoaiQuestionPlayer'

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
  const [completed, setCompleted] = useState(() => new Set())

  useEffect(() => {
    if (!hasAccess || !questions.length) return
    if (completed.size >= questions.length) {
      onAllComplete?.()
    }
  }, [completed.size, hasAccess, onAllComplete, questions.length])

  if (loading) {
    return <div className="p-8 text-center text-slate-400 text-sm">Loading exercises…</div>
  }

  if (!hasExercises) return null

  const handleGrade = async (questionId, answer) => {
    const result = await gradeLessonExercise(lessonRef, questionId, answer)
    if (result.correct) {
      setCompleted((prev) => new Set([...prev, questionId]))
    }
    return result
  }

  return (
    <div className="p-6 sm:p-8 space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-amber-400 mb-1">随堂习题</p>
        <p className="text-sm text-slate-400">
          {hasAccess ? '完成全部习题后可继续学习（可重复练习）' : '购买模块后可解锁习题作答'}
        </p>
      </div>
      {!hasAccess ? (
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-5 text-center">
          <Lock className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <p className="text-sm text-slate-400">购买模块后可解锁随堂习题</p>
        </div>
      ) : (
        questions.map((q) => (
          <IoaiQuestionCard key={q.id} question={q} onGrade={handleGrade} />
        ))
      )}
    </div>
  )
}

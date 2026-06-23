import { useEffect, useMemo, useState } from 'react'
import { COURSES_PORTAL } from '../../config/coursesPortal'
import { fetchModuleTest, submitModuleTest } from '../../lib/ioaiQuestionsApi'
import { getTrackProgressStats } from '../../lib/learningProgress'
import { IoaiModuleTestForm } from './IoaiQuestionPlayer'

export default function ModuleTestSection({ moduleRef, owned, lessonIds }) {
  const [questions, setQuestions] = useState([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!moduleRef) {
      setQuestions([])
      setCount(0)
      setLoading(false)
      return undefined
    }
    let cancelled = false
    setLoading(true)
    fetchModuleTest(moduleRef)
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
  }, [moduleRef])

  const progress = useMemo(() => getTrackProgressStats(lessonIds), [lessonIds])
  const allLessonsComplete =
    progress.total > 0 && progress.completed === progress.total
  const unlocked = owned && allLessonsComplete

  if (loading) return null
  if (count === 0) return null

  const handleSubmit = async (answers) => {
    setSubmitting(true)
    try {
      return await submitModuleTest(moduleRef, answers)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="mb-8">
      <h2 className="text-lg font-bold text-bingo-dark mb-1">{COURSES_PORTAL.moduleTestTitle}</h2>
      <p className="text-sm text-slate-500 mb-4">
        {unlocked
          ? COURSES_PORTAL.moduleTestDescUnlocked
          : !owned
            ? COURSES_PORTAL.moduleTestDescLockedPurchase
            : COURSES_PORTAL.moduleTestDescLockedProgress(progress.completed, progress.total)}
      </p>
      <IoaiModuleTestForm
        questions={questions}
        locked={!unlocked}
        onSubmit={handleSubmit}
        submitting={submitting}
      />
    </section>
  )
}

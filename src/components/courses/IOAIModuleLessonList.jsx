import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, Clock, Lock, Play } from 'lucide-react'
import { COURSES_PORTAL } from '../../config/coursesPortal'
import { hasIoaiLessonAccess } from '../../lib/ioaiAccess'

const LESSON_DURATION_MINUTES = 14

function lessonCanWatch(lesson, { owned, moduleSlugs, enrolledSlugs, lessonModuleMap }) {
  return (
    owned ||
    hasIoaiLessonAccess(lesson.id, {
      moduleSlugs,
      enrolledSlugs,
      lessonModuleMap,
      trialEnabled: lesson.trialEnabled,
    })
  )
}

/**
 * Accordion lesson list with unlock progress and purchase CTA.
 */
export default function IOAIModuleLessonList({
  lessons,
  owned,
  moduleSlugs,
  enrolledSlugs,
  lessonModuleMap,
  price,
  onBuy,
  checkoutLoading,
  accessLoading,
}) {
  const unlockedCount = useMemo(
    () =>
      lessons.filter((lesson) =>
        lessonCanWatch(lesson, { owned, moduleSlugs, enrolledSlugs, lessonModuleMap })
      ).length,
    [lessons, owned, moduleSlugs, enrolledSlugs, lessonModuleMap]
  )

  const defaultExpanded = useMemo(() => {
    const firstUnlocked = lessons.find((lesson) =>
      lessonCanWatch(lesson, { owned, moduleSlugs, enrolledSlugs, lessonModuleMap })
    )
    return firstUnlocked?.id || lessons[0]?.id || null
  }, [lessons, owned, moduleSlugs, enrolledSlugs, lessonModuleMap])

  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    setExpandedId(defaultExpanded)
  }, [defaultExpanded])

  const totalMinutes = lessons.length * LESSON_DURATION_MINUTES

  return (
    <section className="mb-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-lg font-bold text-bingo-dark">{COURSES_PORTAL.moduleLessonListTitle}</h2>
        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
          {COURSES_PORTAL.moduleUnlockedProgress(unlockedCount, lessons.length)}
        </span>
      </div>

      <div className="card divide-y divide-slate-100 overflow-hidden">
        {lessons.map((lesson, index) => {
          const canWatch = lessonCanWatch(lesson, {
            owned,
            moduleSlugs,
            enrolledSlugs,
            lessonModuleMap,
          })
          const expanded = expandedId === lesson.id
          const lessonPath = `/courses/detail/${encodeURIComponent(lesson.id)}?from=ioai&play=1`

          return (
            <article key={lesson.id} className={canWatch ? '' : 'bg-slate-50/60'}>
              <button
                type="button"
                onClick={() => setExpandedId(expanded ? null : lesson.id)}
                className="w-full flex items-center gap-3 px-4 sm:px-5 py-4 text-left hover:bg-slate-50/80 transition"
              >
                <span
                  className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${
                    canWatch ? 'bg-primary/10 text-primary' : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p
                    className={`font-semibold text-sm truncate ${
                      canWatch ? 'text-bingo-dark' : 'text-slate-500'
                    }`}
                  >
                    {lesson.title}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs text-slate-400 shrink-0">
                  <Clock className="w-3.5 h-3.5" aria-hidden />
                  {COURSES_PORTAL.moduleLessonDuration(LESSON_DURATION_MINUTES)}
                </span>
                {!canWatch ? (
                  <Lock className="w-4 h-4 text-slate-400 shrink-0" aria-hidden />
                ) : null}
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
                    expanded ? 'rotate-180' : ''
                  }`}
                  aria-hidden
                />
              </button>

              {expanded ? (
                <div className="px-4 sm:px-5 pb-4 pl-[3.25rem] sm:pl-[3.75rem]">
                  {lesson.intro ? (
                    <p className="text-sm text-slate-600 mb-3 leading-relaxed">{lesson.intro}</p>
                  ) : lesson.contentGoals ? (
                    <p className="text-sm text-slate-600 mb-3 leading-relaxed">{lesson.contentGoals}</p>
                  ) : null}

                  <div className="flex flex-wrap items-center gap-2">
                    {canWatch ? (
                      <Link
                        to={lessonPath}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary px-3 py-1.5 rounded-lg border border-primary/30 hover:bg-primary/5 transition"
                      >
                        <Play className="w-3.5 h-3.5" aria-hidden />
                        {COURSES_PORTAL.watchLesson}
                      </Link>
                    ) : lesson.trialEnabled && lesson.cloudflareVideoId ? (
                      <Link
                        to={lessonPath}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary px-3 py-1.5 rounded-lg border border-primary/30 hover:bg-primary/5 transition"
                      >
                        {COURSES_PORTAL.moduleWatchPreview}
                      </Link>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                        <Lock className="w-3.5 h-3.5" aria-hidden />
                        {COURSES_PORTAL.moduleLocked}
                      </span>
                    )}
                    {lesson.trialEnabled ? (
                      <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                        {COURSES_PORTAL.freeTrialLesson}
                      </span>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </article>
          )
        })}

        {!owned ? (
          <div className="px-4 sm:px-5 py-5 bg-slate-50 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <span className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5 text-slate-500" aria-hidden />
              </span>
              <div>
                <p className="font-semibold text-sm text-bingo-dark">{COURSES_PORTAL.moduleUnlockAllTitle}</p>
                <p className="text-xs text-slate-500 mt-0.5">{COURSES_PORTAL.moduleUnlockAllDesc}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onBuy}
              disabled={checkoutLoading || accessLoading}
              className="btn-primary text-sm px-5 py-2.5 shrink-0 disabled:opacity-60"
            >
              {checkoutLoading ? COURSES_PORTAL.redirecting : COURSES_PORTAL.buyModule(price)}
            </button>
          </div>
        ) : null}
      </div>

      {lessons.length > 0 ? (
        <p className="text-xs text-slate-400 mt-2 text-right">
          {COURSES_PORTAL.moduleTotalDuration(totalMinutes)}
        </p>
      ) : null}
    </section>
  )
}

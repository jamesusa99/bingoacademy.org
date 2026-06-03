import { useState } from 'react'
import {
  PlayCircle,
  FlaskConical,
  Clock,
  Sparkles,
  CheckCircle2,
  Circle,
  Lock,
} from 'lucide-react'
import { findCourseInList } from '../../lib/catalogCourse'

/**
 * @param {{
 *   selected: import('./curriculumUtils.js').SelectedModule | null,
 *   catalogCourses?: object[],
 *   completedLessons?: string[],
 *   onToggleLessonComplete?: (lessonId: string) => void,
 *   hasAccess?: boolean,
 *   onOpenLesson?: (lesson: import('./curriculumUtils.js').CurriculumLesson & { displayTitle?: string, cloudflareVideoId?: string | null }) => void,
 *   onLockedLesson?: () => void,
 * }} props
 */
export default function ModuleDetailsPanel({
  selected,
  catalogCourses = [],
  completedLessons = [],
  onToggleLessonComplete,
  hasAccess = false,
  onOpenLesson,
  onLockedLesson,
}) {
  if (!selected) {
    return (
      <div className="curriculum-details h-full min-h-[420px] rounded-2xl border border-slate-700/80 bg-slate-900/40 flex items-center justify-center p-8">
        <p className="text-slate-400 text-sm text-center">Select a module from the navigator to view lessons.</p>
      </div>
    )
  }

  const moduleCompleteCount = selected.lessons.filter((l) => completedLessons.includes(l.id)).length

  const handleCardClick = (lesson, displayTitle, videoId) => {
    if (!hasAccess) {
      onLockedLesson?.()
      return
    }
    onOpenLesson?.({
      ...lesson,
      displayTitle,
      cloudflareVideoId: videoId,
    })
  }

  return (
    <div className="curriculum-details h-full min-h-[420px] rounded-2xl border border-slate-700/80 bg-slate-900/40 backdrop-blur-sm overflow-hidden flex flex-col">
      <header className="px-6 sm:px-8 py-6 border-b border-slate-700/80 bg-gradient-to-r from-slate-900/90 via-slate-800/50 to-slate-900/90">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-400/90 mb-2">
          {selected.levelEmoji} {selected.levelTitle} · {selected.themeTitle}
        </p>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{selected.moduleTitle}</h1>
        <p className="text-sm text-slate-400 mt-2 transition-all duration-300">
          {moduleCompleteCount}/{selected.lessons.length} complete · {selected.lessons.length} video lessons & labs
          {!hasAccess ? (
            <span className="ml-2 text-amber-400/90">· Preview locked — upgrade to watch</span>
          ) : null}
        </p>
      </header>

      <div className="flex-1 overflow-y-auto p-6 sm:p-8 curriculum-details-scroll">
        <div className="grid sm:grid-cols-2 gap-4">
          {selected.lessons.map((lesson, index) => {
            const catalog = findCourseInList(catalogCourses, lesson.catalogSlug || lesson.id)
            const displayTitle = catalog?.nameEn || catalog?.name || lesson.title
            const isLab = catalog?.deliveryType === 'lab' || /lab/i.test(displayTitle)
            const completed = completedLessons.includes(lesson.id)
            const videoId = lesson.cloudflareVideoId || catalog?.cloudflareUid || null
            const locked = !hasAccess

            return (
              <article
                key={lesson.id}
                className={[
                  'group curriculum-lesson-card relative rounded-2xl border bg-slate-800/50 p-5 transition-all duration-300',
                  completed
                    ? 'opacity-75 border-emerald-500/55 bg-emerald-950/25 shadow-[0_0_16px_rgba(52,211,153,0.08)]'
                    : locked
                      ? 'border-slate-700/70 hover:border-amber-500/40 cursor-pointer'
                      : 'border-slate-700/70 hover:border-cyan-400/50 hover:shadow-[0_0_28px_rgba(34,211,238,0.12)] hover:-translate-y-0.5 cursor-pointer',
                ].join(' ')}
              >
                {hasAccess ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onToggleLessonComplete?.(lesson.id)
                    }}
                    aria-pressed={completed}
                    aria-label={completed ? `Mark ${displayTitle} incomplete` : `Mark ${displayTitle} complete`}
                    className={[
                      'absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10',
                      completed
                        ? 'border-emerald-400 bg-emerald-500/20 text-emerald-400 scale-100 shadow-[0_0_14px_rgba(52,211,153,0.35)]'
                        : 'border-slate-600 bg-slate-900/80 text-slate-500 hover:border-cyan-400/60 hover:text-cyan-400 hover:scale-105',
                    ].join(' ')}
                  >
                    {completed ? (
                      <CheckCircle2 className="w-5 h-5 transition-all duration-300 scale-110" aria-hidden />
                    ) : (
                      <Circle className="w-4 h-4 transition-all duration-300" aria-hidden />
                    )}
                  </button>
                ) : (
                  <span className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center border border-amber-500/40 bg-amber-500/10 text-amber-400 z-10">
                    <Lock className="w-4 h-4" aria-hidden />
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => handleCardClick(lesson, displayTitle, videoId)}
                  className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 rounded-xl pr-10"
                >
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div
                      className={[
                        'w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300',
                        locked
                          ? 'bg-amber-500/10 text-amber-400/80'
                          : completed
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : isLab
                              ? 'bg-violet-500/15 text-violet-300 group-hover:bg-violet-500/25'
                              : 'bg-cyan-500/15 text-cyan-300 group-hover:bg-cyan-500/25',
                      ].join(' ')}
                    >
                      {locked ? (
                        <Lock className="w-5 h-5" aria-hidden />
                      ) : completed ? (
                        <CheckCircle2 className="w-5 h-5" aria-hidden />
                      ) : isLab ? (
                        <FlaskConical className="w-5 h-5" aria-hidden />
                      ) : (
                        <PlayCircle className="w-5 h-5" aria-hidden />
                      )}
                    </div>
                    <span
                      className={[
                        'text-[10px] font-bold uppercase tracking-wider tabular-nums transition-colors duration-300',
                        completed ? 'text-emerald-500/80' : 'text-slate-500',
                      ].join(' ')}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>

                  <h3
                    className={[
                      'text-base font-bold leading-snug mb-2 transition-all duration-300',
                      completed
                        ? 'text-emerald-100/90 line-through decoration-emerald-500/40'
                        : locked
                          ? 'text-slate-300'
                          : 'text-white group-hover:text-cyan-100',
                    ].join(' ')}
                  >
                    {displayTitle}
                  </h3>

                  {catalog?.desc ? (
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">{catalog.desc}</p>
                  ) : (
                    <p className="text-xs text-slate-500 mb-4">
                      {isLab ? 'Hands-on lab session' : 'Guided video lesson with checkpoints'}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-slate-700/60">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                      <Clock className="w-3.5 h-3.5" aria-hidden />
                      {catalog?.hours || '~45 min'}
                    </span>
                    {locked ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400">
                        <Lock className="w-3.5 h-3.5" aria-hidden />
                        Upgrade to unlock
                      </span>
                    ) : completed ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 transition-all duration-300">
                        <CheckCircle2 className="w-3.5 h-3.5" aria-hidden />
                        Complete
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Sparkles className="w-3.5 h-3.5" aria-hidden />
                        Watch lesson
                      </span>
                    )}
                  </div>
                </button>
              </article>
            )
          })}
        </div>
      </div>
    </div>
  )
}

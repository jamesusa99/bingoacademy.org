import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, Circle, PlayCircle, ChevronDown, ChevronRight, Lock } from 'lucide-react'
import { buildIOAICurriculum } from '../../lib/ioaiCourseStructure'
import { getLessonProgress } from '../../lib/learningProgress'
import { hasCourseAccess } from '../../lib/courseAccess'

function LessonStatusIcon({ lessonId, activeLessonId, hasAccess }) {
  const progress = getLessonProgress(lessonId)
  if (!hasAccess) {
    return <Lock className="w-4 h-4 text-slate-400 shrink-0" aria-hidden />
  }
  if (progress.completed) {
    return <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" aria-hidden />
  }
  if (lessonId === activeLessonId || progress.lastVisitedAt) {
    return <PlayCircle className="w-4 h-4 text-primary shrink-0" aria-hidden />
  }
  return <Circle className="w-4 h-4 text-slate-300 shrink-0" aria-hidden />
}

function ModuleSection({ module, activeLessonId, purchasedSlugs, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen)
  const completedCount = module.lessons.filter((l) => getLessonProgress(l.id).completed).length

  return (
    <div className="border-b border-slate-100 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 p-3 sm:p-4 text-left hover:bg-slate-50 transition"
      >
        {open ? (
          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-primary uppercase tracking-wide">
            Module {module.number}
          </p>
          <p className="text-sm font-semibold text-bingo-dark truncate">{module.title}</p>
        </div>
        <span className="text-[10px] text-slate-500 shrink-0">
          {completedCount}/{module.lessons.length}
        </span>
      </button>

      {open ? (
        <ul className="pb-2">
          {module.lessons.map((lesson) => {
            const hasAccess = hasCourseAccess(lesson.id, purchasedSlugs)
            const isActive = lesson.id === activeLessonId
            const progress = getLessonProgress(lesson.id)

            return (
              <li key={lesson.id}>
                {hasAccess ? (
                  <Link
                    to={`/courses/detail/${lesson.id}`}
                    className={`flex items-start gap-2.5 px-3 sm:px-4 py-2.5 ml-6 mr-2 rounded-lg text-sm transition ${
                      isActive
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <LessonStatusIcon
                      lessonId={lesson.id}
                      activeLessonId={activeLessonId}
                      hasAccess={hasAccess}
                    />
                    <span className="flex-1 min-w-0">
                      <span className="text-[10px] text-slate-400 block">{lesson.lessonNum}</span>
                      <span className="line-clamp-2">{lesson.title}</span>
                      {progress.lastVisitedAt && !progress.completed ? (
                        <span className="text-[10px] text-amber-600 block mt-0.5">In progress</span>
                      ) : null}
                    </span>
                  </Link>
                ) : (
                  <div className="flex items-start gap-2.5 px-3 sm:px-4 py-2.5 ml-6 mr-2 text-sm text-slate-400">
                    <LessonStatusIcon lessonId={lesson.id} activeLessonId={activeLessonId} hasAccess={false} />
                    <span className="flex-1 min-w-0">
                      <span className="text-[10px] block">{lesson.lessonNum}</span>
                      <span className="line-clamp-2">{lesson.title}</span>
                    </span>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}

export default function CourseLessonList({
  activeLessonId = null,
  purchasedSlugs = [],
  compact = false,
}) {
  const curriculum = buildIOAICurriculum()
  const activeModule = activeLessonId
    ? curriculum.flatMap((s) => s.modules).find((m) => m.lessons.some((l) => l.id === activeLessonId))
    : null

  return (
    <div className={`course-lesson-list card overflow-hidden ${compact ? '' : 'sticky top-20'}`}>
      <div className="p-4 border-b border-slate-100 bg-slate-50/80">
        <h2 className="font-bold text-bingo-dark text-sm">Course curriculum</h2>
        <p className="text-xs text-slate-500 mt-0.5">110 lessons · 11 modules · 4 stages</p>
      </div>

      <div className={`overflow-y-auto ${compact ? 'max-h-[420px]' : 'max-h-[calc(100vh-12rem)]'}`}>
        {curriculum.map((stage) => (
          <div key={stage.id}>
            <div className="px-4 py-2 bg-slate-100/80 border-b border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-600">
                {stage.emoji} {stage.label}
              </p>
            </div>
            {stage.modules.map((mod) => (
              <ModuleSection
                key={mod.number}
                module={mod}
                activeLessonId={activeLessonId}
                purchasedSlugs={purchasedSlugs}
                defaultOpen={activeModule?.number === mod.number}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

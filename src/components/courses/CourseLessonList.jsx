import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, Circle, PlayCircle, ChevronDown, ChevronRight, Lock } from 'lucide-react'
import { COURSES_PORTAL } from '../../config/coursesPortal'
import { getLessonProgress } from '../../lib/learningProgress'
import { hasCourseAccess, hasFullIOAITrack } from '../../lib/courseAccess'
import { hasIoaiLessonAccess, hasIoaiModuleAccess } from '../../lib/ioaiAccess'
import { buildModuleCatalogSlug } from '../../lib/ioaiStore'
import { studyLessonPath } from '../../lib/studyPaths'

function resolveLessonHasAccess(lesson, purchasedSlugs, ioaiAccess) {
  if (hasCourseAccess(lesson.id, purchasedSlugs)) return true
  if (ioaiAccess?.hasFullTrack) return true
  if (!ioaiAccess?.lessonModuleMap) return hasFullIOAITrack(purchasedSlugs)
  return hasIoaiLessonAccess(lesson.id, {
    moduleSlugs: ioaiAccess.moduleSlugs,
    enrolledSlugs: ioaiAccess.enrolledSlugs,
    lessonModuleMap: ioaiAccess.lessonModuleMap,
    trialEnabled: Boolean(lesson.trialEnabled),
  })
}

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

function resolveModuleHasAccess(module, purchasedSlugs, ioaiAccess) {
  if (ioaiAccess?.hasFullTrack || hasFullIOAITrack(purchasedSlugs)) return true
  const merged = [
    ...new Set([...(ioaiAccess?.enrolledSlugs || []), ...(ioaiAccess?.moduleSlugs || []), ...(purchasedSlugs || [])]),
  ]
  if (hasFullIOAITrack(merged)) return true

  const catalogSlug =
    module.catalogSlug || buildModuleCatalogSlug(module.levelId, module.themeId, module.id)
  if (catalogSlug && ioaiAccess) {
    return hasIoaiModuleAccess(catalogSlug, {
      moduleSlugs: ioaiAccess.moduleSlugs,
      enrolledSlugs: ioaiAccess.enrolledSlugs,
      hasFullTrack: ioaiAccess.hasFullTrack,
    })
  }
  return module.lessons.some((lesson) => resolveLessonHasAccess(lesson, purchasedSlugs, ioaiAccess))
}

function UnlockedBadge() {
  return (
    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0">
      {COURSES_PORTAL.moduleUnlocked}
    </span>
  )
}

function LessonRow({ lesson, activeLessonId, purchasedSlugs, studyCenter = false, ioaiAccess = null }) {
  const hasAccess = resolveLessonHasAccess(lesson, purchasedSlugs, ioaiAccess)
  const isActive = lesson.id === activeLessonId
  const progress = getLessonProgress(lesson.id)
  const href = studyCenter ? studyLessonPath(lesson.id, { play: true }) : `/courses/detail/${lesson.id}`

  if (hasAccess) {
    return (
      <Link
        to={href}
        className={`flex items-start gap-2.5 px-3 sm:px-4 py-2.5 ml-12 mr-2 rounded-lg text-sm transition ${
          isActive ? 'bg-primary/10 text-primary font-medium' : 'text-slate-700 hover:bg-slate-50'
        }`}
      >
        <LessonStatusIcon lessonId={lesson.id} activeLessonId={activeLessonId} hasAccess={hasAccess} />
        <span className="flex-1 min-w-0">
          <span className="line-clamp-2">{lesson.title}</span>
          {progress.lastVisitedAt && !progress.completed ? (
            <span className="text-[10px] text-amber-600 block mt-0.5">In progress</span>
          ) : null}
        </span>
      </Link>
    )
  }

  return (
    <div className="flex items-start gap-2.5 px-3 sm:px-4 py-2.5 ml-12 mr-2 text-sm text-slate-400">
      <LessonStatusIcon lessonId={lesson.id} activeLessonId={activeLessonId} hasAccess={false} />
      <span className="flex-1 min-w-0 line-clamp-2">{lesson.title}</span>
    </div>
  )
}

function ModuleSection({ module, activeLessonId, purchasedSlugs, defaultOpen, studyCenter = false, ioaiAccess = null }) {
  const [open, setOpen] = useState(defaultOpen)
  const completedCount = module.lessons.filter((l) => getLessonProgress(l.id).completed).length
  const moduleUnlocked = resolveModuleHasAccess(module, purchasedSlugs, ioaiAccess)

  if (!module.lessons.length) return null

  return (
    <div className="border-b border-slate-100 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 p-3 sm:px-4 sm:py-3 text-left hover:bg-slate-50 transition"
      >
        {open ? (
          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-bingo-dark truncate">{module.title}</p>
        </div>
        {moduleUnlocked ? <UnlockedBadge /> : null}
        <span className="text-[10px] text-slate-500 shrink-0">
          {completedCount}/{module.lessons.length}
        </span>
      </button>

      {open ? (
        <ul className="pb-2">
          {module.lessons.map((lesson) => (
            <li key={lesson.id}>
              <LessonRow
                lesson={lesson}
                activeLessonId={activeLessonId}
                purchasedSlugs={purchasedSlugs}
                studyCenter={studyCenter}
                ioaiAccess={ioaiAccess}
              />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

function ThemeSection({ theme, activeLessonId, purchasedSlugs, activeModuleId, studyCenter = false, ioaiAccess = null }) {
  const [open, setOpen] = useState(
    theme.modules.some((m) => m.lessons.some((l) => l.id === activeLessonId))
  )

  const lessonCount = theme.modules.reduce((n, m) => n + m.lessons.length, 0)
  if (!lessonCount) return null

  return (
    <div className="border-b border-slate-100">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-4 py-2.5 text-left bg-white hover:bg-slate-50 transition"
      >
        {open ? (
          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
        )}
        <p className="text-xs font-semibold text-slate-700 flex-1">
          {theme.categoryLabel || theme.title}
        </p>
        <span className="text-[10px] text-slate-400">{lessonCount}</span>
      </button>
      {open
        ? theme.modules.map((mod) => (
            <ModuleSection
              key={`${theme.id}-${mod.id}`}
              module={mod}
              activeLessonId={activeLessonId}
              purchasedSlugs={purchasedSlugs}
              defaultOpen={mod.id === activeModuleId || mod.lessons.some((l) => l.id === activeLessonId)}
              studyCenter={studyCenter}
              ioaiAccess={ioaiAccess}
            />
          ))
        : null}
    </div>
  )
}

export default function CourseLessonList({
  activeLessonId = null,
  purchasedSlugs = [],
  compact = false,
  curriculum = [],
  summaryText = '',
  studyCenter = false,
  ioaiAccess = null,
  onToggleCurriculum = null,
}) {
  const activeContext = activeLessonId
    ? curriculum
        .flatMap((l) => l.themes.flatMap((t) => t.modules.map((m) => ({ level: l, theme: t, module: m }))))
        .find((ctx) => ctx.module.lessons.some((l) => l.id === activeLessonId))
    : null

  return (
    <div className={`course-lesson-list card overflow-hidden ${compact ? '' : 'sticky top-20'}`}>
      <div className="p-4 border-b border-slate-100 bg-slate-50/80">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-bold text-bingo-dark text-sm">Course curriculum</h2>
            {summaryText ? <p className="text-xs text-slate-500 mt-0.5">{summaryText}</p> : null}
          </div>
          {onToggleCurriculum ? (
            <button
              type="button"
              onClick={onToggleCurriculum}
              className="shrink-0 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:border-primary/30 hover:text-primary transition"
            >
              {COURSES_PORTAL.hideCurriculum}
            </button>
          ) : null}
        </div>
      </div>

      <div className={`overflow-y-auto ${compact ? 'max-h-[420px]' : 'max-h-[calc(100vh-12rem)]'}`}>
        {curriculum.length === 0 ? (
          <p className="p-4 text-xs text-slate-500">No curriculum published yet.</p>
        ) : (
          curriculum.map((level) => {
            const levelLessonCount = level.themes.reduce(
              (n, t) => n + t.modules.reduce((m, mod) => m + mod.lessons.length, 0),
              0
            )
            if (!levelLessonCount) return null

            return (
              <div key={level.id}>
                <div className="px-4 py-2 bg-slate-100/80 border-b border-slate-100 sticky top-0 z-10">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-600">
                    {level.emoji} {level.title}
                  </p>
                </div>
                {level.themes.map((theme) => (
                  <ThemeSection
                    key={`${level.id}-${theme.id}`}
                    theme={theme}
                    activeLessonId={activeLessonId}
                    purchasedSlugs={purchasedSlugs}
                    activeModuleId={activeContext?.module.id}
                    studyCenter={studyCenter}
                    ioaiAccess={ioaiAccess}
                  />
                ))}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

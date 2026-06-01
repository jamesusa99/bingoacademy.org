import { Link } from 'react-router-dom'
import { Play, BookOpen } from 'lucide-react'
import { IOAI_COURSE_SYSTEM } from '../../config/ioaiCourseSystem'
import { getAllIOAILessonIds } from '../../lib/ioaiCourseStructure'
import { useTrackProgress } from '../../hooks/useLearningProgress'
import CourseLessonList from './CourseLessonList'

function ProgressBar({ percent }) {
  return (
    <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-primary to-cyan-400 transition-all duration-500"
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}

export default function CourseTrackOverview({ track, purchasedSlugs, hasAccess }) {
  const lessonIds = getAllIOAILessonIds()
  const { stats, continueLessonId } = useTrackProgress(lessonIds)
  const continueCourse = continueLessonId ? `/courses/detail/${continueLessonId}` : null

  return (
    <div className="space-y-6 mb-8">
      <div className="card p-5 sm:p-6 border-primary/20 bg-gradient-to-br from-cyan-50/80 to-white">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-wide text-primary mb-1">
              {IOAI_COURSE_SYSTEM.summary}
            </p>
            <h2 className="text-lg font-bold text-bingo-dark mb-2">Your learning progress</h2>
            <div className="flex items-center gap-3 mb-2">
              <ProgressBar percent={stats.percent} />
              <span className="text-sm font-bold text-primary shrink-0">{stats.percent}%</span>
            </div>
            <p className="text-xs text-slate-600">
              {stats.completed} of {stats.total} lessons completed
              {stats.inProgress > 0 ? ` · ${stats.inProgress} in progress` : ''}
            </p>
          </div>
          {hasAccess && continueCourse ? (
            <Link to={continueCourse} className="btn-primary inline-flex items-center gap-2 text-sm px-5 py-3 shrink-0">
              <Play className="w-4 h-4" />
              {stats.completed > 0 ? 'Continue learning' : 'Start lesson 1.1'}
            </Link>
          ) : (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <BookOpen className="w-4 h-4" />
              Unlock the track to start learning
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <section className="card p-5">
            <h3 className="font-bold text-bingo-dark text-sm mb-3">Four stages</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {IOAI_COURSE_SYSTEM.stages.map((stage) => (
                <div key={stage.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-sm font-semibold text-bingo-dark">
                    {stage.emoji} {stage.label}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {stage.modules} modules · {stage.lessons} lessons
                  </p>
                </div>
              ))}
            </div>
          </section>

          <p className="text-sm text-slate-700 leading-relaxed">{track.desc}</p>

          {track.outcomes?.length > 0 ? (
            <section className="card p-5">
              <h3 className="font-bold text-bingo-dark text-sm mb-3">Learning outcomes</h3>
              <ul className="space-y-2">
                {track.outcomes.map((o) => (
                  <li key={o} className="text-sm text-slate-600 flex gap-2">
                    <span className="text-emerald-500 shrink-0">✓</span>
                    {o}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <div className="lg:col-span-2">
          <CourseLessonList purchasedSlugs={purchasedSlugs} compact />
        </div>
      </div>
    </div>
  )
}

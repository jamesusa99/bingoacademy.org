import { Link } from 'react-router-dom'
import LevelBadge from './LevelBadge'
import PriceTag from './PriceTag'
import { ProgramBadge, ModuleBadge, UseCaseTag } from './ProgramBadges'
import { COURSES_PORTAL } from '../../config/coursesPortal'

const CATEGORY_LABELS = {
  'ai-fundamentals': 'AI Fundamentals',
  'machine-learning': 'Machine Learning',
  'deep-learning': 'Deep Learning',
  nlp: 'NLP',
  'computer-vision': 'Computer Vision',
}

export default function CatalogCourseCard({ course }) {
  const categoryLabel = CATEGORY_LABELS[course.category] || course.badge

  return (
    <article className="course-card-dark group flex flex-col h-full">
      <Link to={`/courses/detail/${course.id}`} className="block relative">
        <div
          className={`course-card-dark__thumb bg-gradient-to-br ${course.thumbnailGradient} flex items-center justify-center overflow-hidden`}
          aria-hidden
        >
          {course.thumbnail ? (
            <img src={course.thumbnail} alt="" className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <span className="text-5xl opacity-90 drop-shadow-lg">
              {course.line === 'ioai' ? '🏆' : course.line === 'k12' ? '🏫' : '📘'}
            </span>
          )}
        </div>
        <LevelBadge level={course.level} />
      </Link>

      <div className="flex flex-col flex-1 p-4">
        <div className="flex flex-wrap gap-1.5 mb-2">
          <ProgramBadge lineId={course.line} />
          <ModuleBadge lineId={course.line} subId={course.sub} />
        </div>
        <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{categoryLabel}</span>
        <Link to={`/courses/detail/${course.id}`}>
          <h3 className="text-lg font-semibold text-white mt-1 mb-2 group-hover:text-cyan-300 transition line-clamp-2">
            {course.name}
          </h3>
        </Link>
        <UseCaseTag lineId={course.line} className="mb-2" />
        <p className="text-sm text-slate-400 leading-relaxed line-clamp-2 flex-1">{course.desc}</p>

        <div className="flex flex-wrap gap-3 text-xs text-slate-500 mt-3">
          <span>⏱️ {course.duration}</span>
          <span>📝 {course.lessons} lessons</span>
        </div>
        <div className="flex items-center gap-2 text-sm mt-2 text-amber-400/90">
          <span>⭐ {course.rating.toFixed(1)}</span>
          <span className="text-slate-500">({course.students.toLocaleString()} students)</span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 px-4 py-4 border-t border-slate-700/80">
        <PriceTag
          price={course.priceNumeric ?? course.price}
          isFree={course.isFree}
          comingSoon={course.comingSoon}
          priceUnknown={course.priceUnknown}
        />
        <Link
          to={course.comingSoon ? `/courses/detail/${course.id}` : `/courses/detail/${course.id}`}
          className={`shrink-0 px-4 py-2 rounded-md text-sm font-medium transition min-h-[40px] inline-flex items-center ${
            course.comingSoon
              ? 'border border-amber-500/60 text-amber-300 hover:bg-amber-500/10'
              : 'bg-blue-500 hover:bg-blue-600 text-white active:scale-[0.98]'
          }`}
        >
          {course.comingSoon ? COURSES_PORTAL.comingSoonBadge : COURSES_PORTAL.enrollNow}
        </Link>
      </div>
    </article>
  )
}

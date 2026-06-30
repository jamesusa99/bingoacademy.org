import { COURSES_PORTAL } from '../../config/coursesPortal'

export default function CoursesHero({ title, subtitle, stats }) {
  return (
    <section className="courses-hero rounded-xl overflow-hidden mb-4">
      <div className="px-4 py-3 sm:px-5 sm:py-3.5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        {subtitle || title ? (
          <div className="min-w-0 flex-1">
            {title ? (
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">{title}</h1>
            ) : null}
            {subtitle ? (
              <p
                className={`text-xs text-slate-300 leading-relaxed line-clamp-2 sm:line-clamp-1 ${title ? 'mt-1' : ''}`}
              >
                {subtitle}
              </p>
            ) : null}
          </div>
        ) : null}
        {stats?.length ? (
          <dl className="flex flex-wrap items-center gap-x-4 gap-y-2 sm:gap-x-5 shrink-0 sm:border-l sm:border-slate-600/80 sm:pl-4">
            {stats.map(({ icon, value, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className="text-sm leading-none" aria-hidden>
                  {icon}
                </span>
                <div className="flex items-baseline gap-1.5 whitespace-nowrap">
                  <dt className="sr-only">{label}</dt>
                  <dd className="text-sm font-bold text-white tabular-nums">{value}</dd>
                  <dd className="text-[10px] text-slate-400 uppercase tracking-wide">{label}</dd>
                </div>
              </div>
            ))}
          </dl>
        ) : null}
      </div>
    </section>
  )
}

export function buildHeroStats(courses) {
  const count = courses.length
  const students = courses.reduce((sum, c) => sum + (c.students || 0), 0)
  const ratings = courses.filter((c) => c.rating).map((c) => c.rating)
  const avgRating = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : '4.8'

  return [
    { icon: '📚', value: `${count}+`, label: COURSES_PORTAL.statCourses },
    {
      icon: '👨‍🎓',
      value: students >= 1000 ? `${Math.round(students / 1000)}K+` : `${students}+`,
      label: COURSES_PORTAL.statStudents,
    },
    { icon: '⭐', value: avgRating, label: COURSES_PORTAL.statRating },
  ]
}

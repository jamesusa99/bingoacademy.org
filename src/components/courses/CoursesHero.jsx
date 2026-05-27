import { COURSES_PORTAL } from '../../config/coursesPortal'

export default function CoursesHero({ title, subtitle, stats }) {
  return (
    <section className="courses-hero rounded-2xl overflow-hidden mb-6">
      <div className="px-6 py-10 sm:px-10 sm:py-12">
        <p className="text-3xl sm:text-4xl mb-2" aria-hidden>
          🎓
        </p>
        <h1 className="text-2xl sm:text-[32px] font-bold text-white tracking-tight">{title}</h1>
        <p className="text-base text-slate-300 mt-2 max-w-2xl">{subtitle}</p>
        <dl className="flex flex-wrap gap-6 sm:gap-10 mt-8">
          {stats.map(({ icon, value, label }) => (
            <div key={label}>
              <dt className="sr-only">{label}</dt>
              <dd className="flex items-center gap-2">
                <span className="text-xl" aria-hidden>
                  {icon}
                </span>
                <span>
                  <span className="block text-xl sm:text-2xl font-bold text-white">{value}</span>
                  <span className="text-xs text-slate-400">{label}</span>
                </span>
              </dd>
            </div>
          ))}
        </dl>
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

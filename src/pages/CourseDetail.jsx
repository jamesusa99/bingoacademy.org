import { Link, useParams } from 'react-router-dom'
import { COURSE_CATALOG, getProductLine, subcategoryLabel } from '../config/products'
import PageContent from '../components/PageContent'

const LESSONS_BY_ID = {
  i1: [
    { n: 1, title: 'My AI Companion', status: 'continue' },
    { n: 2, title: 'AI Idiom Story Picture Book', status: 'start' },
  ],
  g1: [
    { n: 1, title: 'What is AI?', status: 'start' },
    { n: 2, title: 'AI in daily life', status: 'start' },
  ],
}

export default function CourseDetail() {
  const { id } = useParams()
  const item = COURSE_CATALOG.find((c) => c.id === id) ?? COURSE_CATALOG[0]
  const line = getProductLine(item.line)
  const lessons = LESSONS_BY_ID[item.id] ?? [
    { n: 1, title: 'Lesson 1 — Introduction', status: 'start' },
    { n: 2, title: 'Lesson 2 — Practice', status: 'start' },
  ]
  const totalLessons = lessons.length
  const completed = 0

  return (
    <PageContent className="py-6 sm:py-8 max-w-4xl mx-auto">
      <Link to={`/courses?line=${item.line}`} className="text-primary text-sm hover:underline">← Back to {line.name}</Link>

      <div className="card p-5 mt-4 mb-6">
        <div className="flex gap-4">
          <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary/20 to-cyan-100 flex items-center justify-center text-3xl shrink-0">
            {line.icon}
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">{item.badge}</span>
            <h1 className="text-xl font-bold text-bingo-dark mt-1">{item.name}</h1>
            <p className="text-xs text-slate-500 mt-1">
              {subcategoryLabel(item.line, item.sub)} · {item.hours} · {item.price}
            </p>
            <div className="mt-3">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Learning progress {Math.round((completed / totalLessons) * 100)}% · {completed}/{totalLessons} lessons</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(completed / totalLessons) * 100}%` }} />
              </div>
              <p className="text-xs text-slate-400 mt-1">Last studied: —</p>
            </div>
          </div>
        </div>
      </div>

      <p className="text-sm text-slate-600 mb-4">{item.desc}</p>

      <section className="card overflow-hidden mb-6">
        <div className="p-4 border-b border-slate-100 font-semibold text-bingo-dark text-sm">Course content</div>
        <ul className="divide-y divide-slate-100">
          {lessons.map((lesson) => (
            <li key={lesson.n} className="p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center shrink-0">{lesson.n}</span>
                <span className="text-sm text-slate-800 truncate">{lesson.title}</span>
                {lesson.status === 'continue' && (
                  <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded shrink-0">Continue</span>
                )}
              </div>
              <button type="button" className="btn-primary text-xs px-3 py-1.5 shrink-0">
                {lesson.status === 'continue' ? 'Continue' : 'Start'}
              </button>
            </li>
          ))}
        </ul>
        <div className="p-4 bg-slate-50 text-xs text-slate-500 flex items-center gap-2 border-t border-slate-100">
          <span>📄</span>
          <span>Course summary — available after completing all {totalLessons} lessons</span>
        </div>
      </section>

      <p className="text-xs text-slate-500 mb-4 text-center">
        Complete all lessons and pass the assessment to receive your certificate.
      </p>

      <div className="flex flex-wrap gap-3 justify-center mb-8">
        <Link to="/profile/study" className="btn-primary text-sm px-5 py-2.5">Continue learning</Link>
        <Link to="/cert" className="text-sm px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50">Certification</Link>
        <Link to="/mall" className="text-sm px-5 py-2.5 rounded-xl border border-primary text-primary hover:bg-primary/5">Materials in Mall</Link>
      </div>
    </PageContent>
  )
}

import { Link } from 'react-router-dom'

/**
 * Shown when self-study / classroom course is not yet on shelf.
 */
export default function CourseComingSoon({ course, line }) {
  const isClassroom = course?.deliveryType === 'classroom'
  const isSelfStudy = course?.deliveryType === 'self-study'

  return (
    <div className="card p-8 sm:p-10 text-center border-2 border-dashed border-amber-300 bg-amber-50/50">
      <div className="text-5xl mb-4" aria-hidden>
        📦
      </div>
      <h2 className="text-xl sm:text-2xl font-black text-amber-900 mb-2">Coming soon</h2>
      <p className="text-sm text-amber-800/90 max-w-md mx-auto leading-relaxed mb-4">
        {isClassroom &&
          'Classroom packs are being aligned with schools (lesson plans and lab setup). When live, teachers get class management and in-class assessments.'}
        {isSelfStudy &&
          'Self-study tracks are getting chapters, check-ins, and auto-grading. When live, they link with AI Exploration Lab experiments.'}
        {!isClassroom &&
          !isSelfStudy &&
          'This course is being prepared. Try related Lab experiments or contact an advisor in the meantime.'}
      </p>
      <p className="text-xs text-slate-600 mb-6">
        Now enrolling: <strong>IOAI video courses & training camps</strong>
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Link to="/courses?line=ioai" className="btn-primary text-sm px-5 py-2.5">
          View live IOAI courses
        </Link>
        <Link to="/exploration" className="text-sm px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-white">
          Try AI Exploration free
        </Link>
        <Link
          to={`/courses?line=${line?.id ?? 'general'}`}
          className="text-sm px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-white"
        >
          Back to course list
        </Link>
      </div>
    </div>
  )
}

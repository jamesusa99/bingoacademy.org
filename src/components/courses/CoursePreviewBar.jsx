import { Link } from 'react-router-dom'
import { ArrowLeft, X } from 'lucide-react'
import { coursePathForLineId } from '../../config/coursePaths'
import { COURSES_PORTAL } from '../../config/coursesPortal'
import { ADMIN_LABS_MATERIALS_PATH } from '../../config/adminNav'

export default function CoursePreviewBar({ course, fromAdmin = false }) {
  const coursesHref = course
    ? coursePathForLineId(course.line, course.sub || 'course')
    : '/courses'

  return (
    <div className="sticky top-0 z-40 -mt-2 mb-4 rounded-xl border border-amber-200 bg-amber-50/95 backdrop-blur px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        {fromAdmin ? (
          <Link
            to={ADMIN_LABS_MATERIALS_PATH}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-900 hover:text-amber-950"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden />
            {COURSES_PORTAL.backToAdmin}
          </Link>
        ) : null}
        <Link
          to={coursesHref}
          className="inline-flex items-center gap-1.5 text-sm text-slate-700 hover:text-bingo-dark"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden />
          {COURSES_PORTAL.backToCourses}
        </Link>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-wide text-amber-800 bg-amber-100 px-2 py-1 rounded-full">
          {COURSES_PORTAL.previewModeBadge}
        </span>
        <button
          type="button"
          onClick={() => window.close()}
          className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 px-2 py-1 rounded-lg hover:bg-amber-100/80"
          title={COURSES_PORTAL.closePreview}
        >
          <X className="w-3.5 h-3.5" aria-hidden />
          {COURSES_PORTAL.closePreview}
        </button>
      </div>
    </div>
  )
}

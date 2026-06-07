import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FlaskConical, Download, ExternalLink } from 'lucide-react'
import { COURSES_PORTAL } from '../../config/coursesPortal'

/**
 * Lesson-bound experiments + lesson materials (shown when user has L3 access).
 */
export default function LessonExperimentsSection({ lessonSlug, hasAccess }) {
  const [content, setContent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!lessonSlug) return
    let cancelled = false
    setLoading(true)
    setError(null)
    import('../../lib/ioaiExperimentsClient')
      .then(({ fetchLessonLabContent }) => fetchLessonLabContent(lessonSlug))
      .then((data) => {
        if (!cancelled) setContent(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [lessonSlug, hasAccess])

  if (loading || error) return null

  const experiments = content?.experiments || []
  const materials = content?.materials || []
  if (!experiments.length && !materials.length) return null

  return (
    <div className="space-y-4 mb-6">
      {experiments.length > 0 ? (
        <section className="card p-5 border-violet-200/60 bg-violet-50/30">
          <div className="flex items-center gap-2 mb-2">
            <FlaskConical className="w-4 h-4 text-violet-700" />
            <h2 className="font-bold text-bingo-dark text-sm">{COURSES_PORTAL.lessonExperimentsHeading}</h2>
          </div>
          <p className="text-xs text-slate-600 mb-3">{COURSES_PORTAL.lessonExperimentsDesc}</p>
          <ul className="space-y-2">
            {experiments.map((exp) => (
              <li key={exp.slug} className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-white border border-violet-100">
                <div className="min-w-0">
                  <p className="font-medium text-sm text-bingo-dark">{exp.title}</p>
                  {exp.subtitle ? <p className="text-xs text-slate-500 mt-0.5">{exp.subtitle}</p> : null}
                  {exp.materials?.length > 0 ? (
                    <ul className="mt-2 space-y-1">
                      {exp.materials.map((m) => (
                        <li key={m.id}>
                          <a
                            href={m.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] text-violet-700 hover:underline inline-flex items-center gap-1"
                          >
                            <Download className="w-3 h-3" />
                            {m.fileName}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
                {exp.playHref ? (
                  <Link
                    to={exp.playHref}
                    className="text-xs font-semibold px-3 py-2 rounded-xl bg-violet-600 text-white hover:bg-violet-700 inline-flex items-center gap-1 shrink-0"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    {COURSES_PORTAL.openExperiment}
                  </Link>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {materials.length > 0 ? (
        <section className="card p-5">
          <h2 className="font-bold text-bingo-dark text-sm mb-2">{COURSES_PORTAL.lessonMaterialsHeading}</h2>
          <ul className="space-y-2">
            {materials.map((m) => (
              <li key={m.id}>
                <a
                  href={m.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-primary hover:underline inline-flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  {m.fileName}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}

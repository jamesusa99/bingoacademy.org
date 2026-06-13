import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Beaker, Download, ExternalLink, FlaskConical, Lock } from 'lucide-react'
import { fetchLessonResources } from '../../lib/ioaiExperimentsApi'

const COPY = {
  experimentsTitle: 'Lesson experiments',
  lessonMaterialsTitle: 'Lesson materials',
  experimentMaterialsTitle: 'Experiment materials',
  openExperiment: 'Open experiment',
  download: 'Download',
  locked: 'Purchase this module to access experiments and materials.',
  loading: 'Loading resources…',
}

export default function LessonResourcePanels({ catalogSlug, owned = false }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeExperiment, setActiveExperiment] = useState(null)

  const load = useCallback(async () => {
    if (!catalogSlug) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetchLessonResources(catalogSlug)
      setData(res)
      if (res.experiments?.length && !activeExperiment) {
        setActiveExperiment(res.experiments[0])
      }
    } catch (e) {
      setError(e.message)
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [catalogSlug])

  useEffect(() => {
    load()
  }, [load])

  if (loading) return null
  if (error || !data) return null
  if (!data.hasExperiments && !data.hasLessonMaterials) return null

  const canUse = owned || data.owned
  const active = activeExperiment || data.experiments?.[0] || null

  return (
    <div className="mt-4 space-y-4">
      {!canUse ? (
        <div className="rounded-xl border border-amber-200/60 bg-amber-50/80 px-4 py-3 text-sm text-amber-900 flex items-start gap-2">
          <Lock className="w-4 h-4 shrink-0 mt-0.5" aria-hidden />
          {COPY.locked}
        </div>
      ) : null}

      {data.hasExperiments ? (
        <section className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-emerald-600" aria-hidden />
            <h3 className="text-sm font-semibold text-slate-900">{COPY.experimentsTitle}</h3>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex flex-wrap gap-2">
              {data.experiments.map((exp) => (
                <button
                  key={exp.id}
                  type="button"
                  onClick={() => setActiveExperiment(exp)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                    active?.id === exp.id
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-emerald-300'
                  }`}
                >
                  {exp.title}
                </button>
              ))}
            </div>
            {active ? (
              <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">
                {active.content ? <p className="text-sm text-slate-600 mb-3 whitespace-pre-wrap">{active.content}</p> : null}
                {canUse ? (
                  <Link
                    to={`/ioai/experiments/${encodeURIComponent(active.slug)}?lesson=${encodeURIComponent(catalogSlug)}`}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:underline"
                  >
                    <Beaker className="w-4 h-4" aria-hidden />
                    {COPY.openExperiment}
                    <ExternalLink className="w-3.5 h-3.5" aria-hidden />
                  </Link>
                ) : null}
                {canUse && active.materialFiles?.length ? (
                  <ul className="mt-3 space-y-2 border-t border-slate-200 pt-3">
                    <li className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                      {COPY.experimentMaterialsTitle}
                    </li>
                    {active.materialFiles.map((file) => (
                      <li key={file.id}>
                        <a
                          href={file.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm text-slate-700 hover:text-emerald-700"
                        >
                          <Download className="w-3.5 h-3.5" aria-hidden />
                          {file.title || file.fileName || COPY.download}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {data.hasLessonMaterials && data.lessonMaterials?.length ? (
        <section className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
            <Download className="w-4 h-4 text-sky-600" aria-hidden />
            <h3 className="text-sm font-semibold text-slate-900">{COPY.lessonMaterialsTitle}</h3>
          </div>
          <ul className="p-4 space-y-2">
            {data.lessonMaterials.map((file) => (
              <li key={file.id}>
                {canUse ? (
                  <a
                    href={file.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 hover:text-sky-700"
                  >
                    <Download className="w-3.5 h-3.5" aria-hidden />
                    {file.title || file.fileName || COPY.download}
                  </a>
                ) : (
                  <span className="text-sm text-slate-400">{file.title}</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}

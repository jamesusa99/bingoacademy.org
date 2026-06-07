import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FlaskConical, ExternalLink, Download } from 'lucide-react'
import { fetchMyIoaiLabAccess } from '../../lib/ioaiExperimentsClient'

export default function MyLabPacksSection() {
  const [packs, setPacks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMyIoaiLabAccess()
      .then((data) => setPacks(data.labPacks || []))
      .catch(() => setPacks([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return null
  if (!packs.length) return null

  return (
    <section className="mb-10">
      <h2 className="section-title flex items-center gap-2">
        <FlaskConical className="w-5 h-5 text-violet-600" />
        My Experiment Packs
      </h2>
      <p className="text-slate-600 text-sm mb-4">
        {packs.length} lab pack{packs.length === 1 ? '' : 's'} unlocked — open experiments included in each pack.
      </p>
      <div className="grid sm:grid-cols-2 gap-4">
        {packs.map((pack) => (
          <div key={pack.slug} className="card p-5 border-violet-200/60">
            <h3 className="font-semibold text-bingo-dark text-sm">{pack.title}</h3>
            {pack.introHtml ? <p className="text-xs text-slate-500 mt-1 line-clamp-2">{pack.introHtml}</p> : null}
            <p className="text-[10px] text-slate-400 mt-2">{pack.experimentCount} experiment{pack.experimentCount === 1 ? '' : 's'}</p>
            <ul className="mt-3 space-y-2">
              {(pack.experiments || []).slice(0, 4).map((exp) => (
                <li key={exp.slug} className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-slate-700 truncate">{exp.title}</span>
                  {exp.playHref ? (
                    <Link to={exp.playHref} className="text-violet-700 hover:underline inline-flex items-center gap-0.5 shrink-0">
                      <ExternalLink className="w-3 h-3" />
                      Open
                    </Link>
                  ) : null}
                </li>
              ))}
            </ul>
            {(pack.experiments || []).some((e) => e.materials?.length) ? (
              <div className="mt-3 pt-3 border-t border-slate-100">
                <p className="text-[10px] font-semibold text-slate-500 uppercase mb-1">Materials</p>
                {(pack.experiments || []).flatMap((e) =>
                  (e.materials || []).map((m) => (
                    <a
                      key={m.id}
                      href={m.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-primary hover:underline flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      {m.fileName}
                    </a>
                  ))
                )}
              </div>
            ) : null}
            {pack.recommendedModules?.length > 0 ? (
              <div className="mt-3 pt-3 border-t border-slate-100">
                <p className="text-[10px] font-semibold text-slate-500 uppercase mb-1">Recommended modules</p>
                <div className="flex flex-wrap gap-1">
                  {pack.recommendedModules.map((mod) => (
                    <Link
                      key={mod.catalogSlug || mod.id}
                      to={`/courses/module/${encodeURIComponent(mod.catalogSlug || mod.id)}`}
                      className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full hover:bg-primary/10 hover:text-primary"
                    >
                      {mod.title}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ))}
      </div>
      <Link to="/ioai/lab-packs" className="text-xs text-primary hover:underline mt-4 inline-block">
        Browse all lab packs →
      </Link>
    </section>
  )
}

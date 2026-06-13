import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FlaskConical } from 'lucide-react'
import { fetchMyLabPacks } from '../../lib/ioaiExperimentsApi'

export default function ProfileLabPacksSection() {
  const [packs, setPacks] = useState([])
  const [bundles, setBundles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetchMyLabPacks()
      .then((res) => {
        if (cancelled) return
        setPacks(res.packs || [])
        setBundles(res.bundles || [])
      })
      .catch(() => {
        if (!cancelled) {
          setPacks([])
          setBundles([])
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) return null
  if (!packs.length && !bundles.length) return null

  return (
    <section className="mb-8">
      <h2 className="section-title mb-4 flex items-center gap-2">
        <FlaskConical className="w-5 h-5 text-emerald-600" aria-hidden />
        My lab packs
      </h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {packs.map((pack) => (
          <Link
            key={pack.slug}
            to={`/labs/pack/${encodeURIComponent(pack.slug)}`}
            className="card p-4 hover:border-emerald-300 transition block"
          >
            <p className="font-semibold text-bingo-dark text-sm">{pack.name_en || pack.name}</p>
            {pack.description ? <p className="text-xs text-slate-500 mt-1 line-clamp-2">{pack.description}</p> : null}
            <span className="text-xs text-emerald-700 font-semibold mt-2 inline-block">Continue lab →</span>
          </Link>
        ))}
        {bundles.map((bundle) => (
          <div key={bundle.slug} className="card p-4 border-dashed">
            <p className="font-semibold text-bingo-dark text-sm">{bundle.title}</p>
            {bundle.intro_html ? (
              <p className="text-xs text-slate-500 mt-1 line-clamp-2" dangerouslySetInnerHTML={{ __html: bundle.intro_html }} />
            ) : null}
            <p className="text-xs text-slate-400 mt-2">Experiment bundle · open experiments from linked packs</p>
          </div>
        ))}
      </div>
    </section>
  )
}

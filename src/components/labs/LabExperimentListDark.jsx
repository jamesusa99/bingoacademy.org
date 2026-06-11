import { ChevronRight, FlaskConical, Lock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { LAB_EXPERIMENTS_PORTAL, isLabExperimentUnlocked } from '../../config/labExperiments'

function padIndex(n) {
  return String(n).padStart(2, '0')
}

export default function LabExperimentListDark({ packSlug, experiments = [], owned = false }) {
  if (!experiments.length) {
    return (
      <section id="lab-experiment-list" className="lab-pack-experiments">
        <p className="text-sm text-slate-500 py-8 text-center">{LAB_EXPERIMENTS_PORTAL.noExperiments}</p>
      </section>
    )
  }

  const lockedNote =
    !owned && experiments.length >= 2
      ? LAB_EXPERIMENTS_PORTAL.lockedDemoNote(
          experiments.length > 2
            ? `${experiments.length - 1}、${experiments.length}`
            : experiments.map((_, i) => i + 1).join('、')
        )
      : null

  return (
    <section id="lab-experiment-list" className="lab-pack-experiments">
      <div className="flex items-center gap-2 mb-6">
        <span className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <FlaskConical className="w-4 h-4 text-emerald-400" aria-hidden />
        </span>
        <h2 className="text-lg font-bold text-white">{LAB_EXPERIMENTS_PORTAL.experimentsListTitle}</h2>
      </div>

      <div className="space-y-3">
        {experiments.map((exp, index) => {
          const unlocked = isLabExperimentUnlocked({
            owned,
            index,
            total: experiments.length,
          })
          const num = padIndex(index + 1)
          const desc = exp.content || exp.purpose || ''
          const href = `/labs/pack/${encodeURIComponent(packSlug)}/experiments/${encodeURIComponent(exp.slug)}`

          const inner = (
            <>
              <span
                className={`lab-exp-card__num ${unlocked ? 'lab-exp-card__num--open' : 'lab-exp-card__num--locked'}`}
              >
                {num}
              </span>
              <div className="flex-1 min-w-0 py-1">
                <h3 className={`font-semibold text-base leading-snug ${unlocked ? 'text-white' : 'text-slate-500'}`}>
                  {exp.title}
                </h3>
                {desc ? (
                  <p
                    className={`text-sm mt-1.5 leading-relaxed line-clamp-2 ${
                      unlocked ? 'text-slate-400' : 'text-slate-600'
                    }`}
                  >
                    {desc}
                  </p>
                ) : null}
              </div>
              <span
                className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  unlocked
                    ? 'bg-emerald-500/15 text-emerald-400 group-hover:bg-emerald-500/25 transition'
                    : 'bg-slate-800 text-slate-600'
                }`}
              >
                {unlocked ? (
                  <ChevronRight className="w-5 h-5" aria-hidden />
                ) : (
                  <Lock className="w-4 h-4" aria-hidden />
                )}
              </span>
            </>
          )

          if (unlocked) {
            return (
              <Link key={exp.slug} to={href} className="lab-exp-card lab-exp-card--open group">
                {inner}
              </Link>
            )
          }

          return (
            <div key={exp.slug} className="lab-exp-card lab-exp-card--locked" title={LAB_EXPERIMENTS_PORTAL.lockedHint}>
              {inner}
            </div>
          )
        })}
      </div>

      {lockedNote ? (
        <p className="mt-6 text-xs text-slate-500 bg-slate-800/50 border border-slate-700/60 rounded-xl px-4 py-3 leading-relaxed">
          {lockedNote}
        </p>
      ) : null}
    </section>
  )
}

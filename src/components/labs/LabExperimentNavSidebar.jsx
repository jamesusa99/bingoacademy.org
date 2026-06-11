import { CheckCircle2, Circle, Lock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { LAB_EXPERIMENTS_PORTAL, isLabExperimentUnlocked } from '../../config/labExperiments'
import { isExperimentCompleted, isExperimentVisited, getPackExperimentProgress } from '../../lib/labExperimentNotes'

function padIndex(n) {
  return String(n).padStart(2, '0')
}

export default function LabExperimentNavSidebar({
  packSlug,
  packName,
  experiments = [],
  currentSlug,
  owned,
  progressTick = 0,
}) {
  void progressTick
  const slugs = experiments.map((e) => e.slug)
  const { visited, completed, total } = getPackExperimentProgress(packSlug, slugs)

  return (
    <aside className="lab-workspace__nav">
      <div className="lab-workspace__nav-head">
        <p className="text-xs text-slate-500">{LAB_EXPERIMENTS_PORTAL.journeyTitle}</p>
        <p className="text-sm font-semibold text-white mt-1 line-clamp-2">{packName}</p>
        {total > 0 ? (
          <p className="text-xs text-emerald-400 mt-2">
            {LAB_EXPERIMENTS_PORTAL.progressLabel(completed, total)}
          </p>
        ) : null}
      </div>

      <nav className="lab-workspace__nav-list" aria-label={LAB_EXPERIMENTS_PORTAL.experimentsListTitle}>
        {experiments.map((exp, index) => {
          const unlocked = isLabExperimentUnlocked({ owned, index, total: experiments.length })
          const active = exp.slug === currentSlug
          const done = isExperimentCompleted(packSlug, exp.slug)
          const started = isExperimentVisited(packSlug, exp.slug)
          const href = `/labs/pack/${encodeURIComponent(packSlug)}/experiments/${encodeURIComponent(exp.slug)}`

          const statusLabel = done
            ? LAB_EXPERIMENTS_PORTAL.statusCompleted
            : started
              ? LAB_EXPERIMENTS_PORTAL.statusInProgress
              : LAB_EXPERIMENTS_PORTAL.statusNotStarted

          const inner = (
            <>
              <span className="lab-workspace__nav-icon">
                {unlocked ? (
                  done ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" aria-hidden />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-500" aria-hidden />
                  )
                ) : (
                  <Lock className="w-3.5 h-3.5 text-slate-600" aria-hidden />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-slate-500 font-mono">{padIndex(index + 1)}</p>
                <p className={`text-sm font-medium leading-snug ${unlocked ? 'text-slate-200' : 'text-slate-600'}`}>
                  {exp.title}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">{statusLabel}</p>
              </div>
            </>
          )

          if (!unlocked) {
            return (
              <div
                key={exp.slug}
                className="lab-workspace__nav-item lab-workspace__nav-item--locked"
                title={LAB_EXPERIMENTS_PORTAL.lockedHint}
              >
                {inner}
              </div>
            )
          }

          return (
            <Link
              key={exp.slug}
              to={href}
              className={`lab-workspace__nav-item ${active ? 'lab-workspace__nav-item--active' : ''}`}
              aria-current={active ? 'page' : undefined}
            >
              {inner}
            </Link>
          )
        })}
      </nav>

      {visited > 0 ? (
        <p className="lab-workspace__nav-foot text-[11px] text-slate-500 px-3">
          {LAB_EXPERIMENTS_PORTAL.visitedCount(visited, total)}
        </p>
      ) : null}
    </aside>
  )
}

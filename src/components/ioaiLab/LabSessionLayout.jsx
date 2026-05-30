import { Link } from 'react-router-dom'

/**
 * Full-viewport dual-pane shell (Kaggle Learn style).
 * Stacks vertically below lg; side-by-side on desktop.
 */
export default function LabSessionLayout({
  backHref,
  backLabel = '← Skill tree',
  labTitle,
  progressPercent = 0,
  progressLabel,
  progressCelebrate = false,
  children,
  footer,
}) {
  return (
    <div className="ioai-lab-dual-pane fixed inset-0 z-50 flex flex-col bg-slate-950 text-white">
      <header className="shrink-0 flex items-center justify-between gap-4 px-4 sm:px-6 h-14 border-b border-slate-800 bg-slate-900">
        <div className="flex items-center gap-3 min-w-0">
          {backHref ? (
            <Link to={backHref} className="text-xs text-slate-400 hover:text-cyan-400 shrink-0">
              {backLabel}
            </Link>
          ) : null}
          <div className="min-w-0">
            <p className="text-sm font-bold text-white truncate">
              BingoAcademy IOAI Lab
              {labTitle ? (
                <>
                  <span className="text-slate-600 font-normal mx-2">·</span>
                  <span className="font-semibold text-cyan-300">{labTitle}</span>
                </>
              ) : null}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {progressLabel ? (
            <span className="hidden sm:inline text-[11px] text-slate-400 tabular-nums">{progressLabel}</span>
          ) : null}
          <div className="w-24 sm:w-32 h-2 rounded-full bg-slate-800 overflow-hidden" title={`${progressPercent}% complete`}>
            <div
              className={`h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-700 ease-out ${progressCelebrate ? 'ioai-progress-bar--celebrate' : ''}`}
              style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
            />
          </div>
          <span
            className={`text-[11px] font-semibold tabular-nums w-8 text-right transition-all duration-500 ${progressCelebrate ? 'text-emerald-300 scale-110' : 'text-cyan-400'}`}
          >
            {progressPercent}%
          </span>
        </div>
      </header>

      <main className="flex-1 min-h-0 flex flex-col lg:flex-row">{children}</main>

      {footer ? <footer className="shrink-0">{footer}</footer> : null}
    </div>
  )
}

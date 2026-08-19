import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { HOME_PRIMARY_CTAS } from '../../config/homeCtas'

/**
 * @param {{
 *   variant?: 'hero' | 'light' | 'dark',
 *   className?: string,
 *   hint?: string,
 *   disclaimer?: string,
 *   footnotes?: string[],
 *   curriculumLabel?: string,
 *   hideCurriculum?: boolean,
 * }} props
 */
export default function HomePrimaryCtaPair({
  variant = 'light',
  className = '',
  hint,
  disclaimer,
  footnotes,
  curriculumLabel,
  hideCurriculum = false,
}) {
  const { assessment, curriculum } = HOME_PRIMARY_CTAS

  const rowClass =
    variant === 'hero'
      ? 'flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 justify-start'
      : 'flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 justify-center'

  const primaryClass =
    variant === 'hero'
      ? 'inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-900 text-base sm:text-lg font-bold shadow-lg shadow-cyan-500/30 transition min-h-[52px]'
      : variant === 'dark'
        ? 'inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-900 text-sm font-bold transition min-h-[44px]'
        : 'btn-primary px-6 py-3 text-sm min-h-[44px] inline-flex items-center justify-center gap-2'

  const secondaryClass =
    variant === 'hero'
      ? 'inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border-2 border-white/35 hover:border-cyan-400/60 hover:bg-white/5 text-white text-base sm:text-lg font-bold transition min-h-[52px]'
      : variant === 'dark'
        ? 'inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-white/35 hover:border-cyan-400/60 hover:bg-white/5 text-white text-sm font-bold transition min-h-[44px]'
        : 'inline-flex items-center justify-center gap-2 px-6 py-3 text-sm rounded-xl border border-primary text-primary hover:bg-primary/5 transition min-h-[44px] font-semibold'

  const hintClass =
    variant === 'hero'
      ? 'mt-3 text-xs sm:text-sm text-slate-400 text-left'
      : 'mt-3 text-xs text-slate-500 text-center'

  const disclaimerClass =
    variant === 'hero'
      ? 'mt-3 text-[11px] sm:text-xs text-slate-500 leading-relaxed text-left max-w-2xl'
      : 'mt-3 text-xs text-slate-500 text-center max-w-2xl mx-auto'

  return (
    <div className={className}>
      <div className={rowClass}>
        <Link to={assessment.to} className={primaryClass}>
          {assessment.label}
          <ArrowRight className="w-4 h-4 shrink-0" aria-hidden />
        </Link>
        {!hideCurriculum ? (
          <Link to={curriculum.to} className={secondaryClass}>
            {curriculumLabel || curriculum.label}
          </Link>
        ) : null}
      </div>
      {footnotes?.length ? (
        <div className={hintClass}>
          {footnotes.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      ) : null}
      {!footnotes?.length && hint ? <p className={hintClass}>{hint}</p> : null}
      {!footnotes?.length && disclaimer ? <p className={disclaimerClass}>{disclaimer}</p> : null}
    </div>
  )
}

import { ClipboardCheck, Clock3, GraduationCap } from 'lucide-react'
import { IOAI_ASSESSMENT_COPY } from '../../../config/ioaiAssessment'

export default function IoaiAssessmentLanding({ onStart, onSkipProfile, hasProgress }) {
  const copy = IOAI_ASSESSMENT_COPY.landing

  return (
    <section className="rounded-3xl border border-cyan-200/70 bg-gradient-to-br from-cyan-50 via-white to-slate-50 p-6 sm:p-10">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-700 mb-3">{copy.eyebrow}</p>
      <h1 className="text-2xl sm:text-4xl font-black text-bingo-dark tracking-tight mb-4">{copy.title}</h1>
      <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mb-6">{copy.subtitle}</p>

      <ul className="space-y-2 mb-8">
        {copy.bullets.map((line) => (
          <li key={line} className="flex items-start gap-2 text-sm text-slate-700">
            <ClipboardCheck className="w-4 h-4 text-cyan-600 mt-0.5 shrink-0" aria-hidden />
            {line}
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap gap-3 mb-6">
        <button type="button" onClick={onStart} className="btn-primary px-6 py-3 text-sm font-bold rounded-xl min-h-[48px]">
          {hasProgress ? 'Resume assessment' : copy.startCta}
        </button>
        <button
          type="button"
          onClick={onSkipProfile}
          className="px-5 py-3 text-sm font-semibold rounded-xl border border-slate-300 text-slate-700 hover:bg-white min-h-[48px]"
        >
          {copy.skipProfile}
        </button>
      </div>

      <div className="flex flex-wrap gap-4 text-xs text-slate-500 mb-6">
        <span className="inline-flex items-center gap-1.5">
          <Clock3 className="w-3.5 h-3.5" aria-hidden /> About 8 minutes
        </span>
        <span className="inline-flex items-center gap-1.5">
          <GraduationCap className="w-3.5 h-3.5" aria-hidden /> Ages 12–18
        </span>
      </div>

      <p className="text-[11px] text-slate-500 leading-relaxed max-w-3xl">{copy.disclaimer}</p>
    </section>
  )
}

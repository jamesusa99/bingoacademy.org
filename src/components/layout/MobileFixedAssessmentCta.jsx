import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { HOME_PRIMARY_CTAS } from '../../config/homeCtas'

/** Single fixed bottom CTA for guest mobile — no second button */
export default function MobileFixedAssessmentCta() {
  const { assessment } = HOME_PRIMARY_CTAS

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 lg:hidden border-t border-cyan-500/20 bg-[#0f172a]/95 backdrop-blur-md px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      aria-hidden={false}
    >
      <Link
        to={assessment.to}
        className="flex items-center justify-center gap-2 w-full min-h-[48px] rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-900 text-sm font-bold transition-colors shadow-lg shadow-cyan-500/20"
      >
        {assessment.mobileFixedLabel}
        <ArrowRight className="w-4 h-4 shrink-0" aria-hidden />
      </Link>
    </div>
  )
}

import { ShieldCheck } from 'lucide-react'
import { CHECKOUT_TRUST } from '../../config/checkoutTrust'

export default function CheckoutTrustMicrocopy({ variant = 'dark', className = '', align = 'center' }) {
  const textClass = variant === 'dark' ? 'text-slate-500' : 'text-slate-500'
  const alignClass =
    align === 'left' ? 'justify-start' : align === 'right' ? 'justify-end' : 'justify-center'

  return (
    <p
      className={`flex items-center gap-2 text-[11px] leading-snug ${textClass} ${alignClass} ${className}`}
    >
      <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-emerald-500/80" aria-hidden />
      <span>{CHECKOUT_TRUST.microcopy}</span>
    </p>
  )
}

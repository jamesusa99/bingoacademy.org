import { useNavigate } from 'react-router-dom'
import { X, Sparkles, Shield, PlayCircle, Package } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { PRICING } from '../../lib/courseAccess'
import CheckoutTrustMicrocopy from '../checkout/CheckoutTrustMicrocopy'
import { useLazyAuth } from '../../contexts/LazyAuthContext'
import { goToSecureCheckout } from '../../lib/checkoutPath'
import { IOAI_FULL_BUNDLE_SLUG } from '../../lib/ioaiAccess'
import { formatIoaiPrice } from '../../lib/ioaiStore'
import { purchaseIoaiModule } from '../../lib/ioaiPurchase'

/**
 * @param {{
 *   open: boolean,
 *   onClose?: () => void,
 *   module?: {
 *     catalogSlug?: string | null,
 *     moduleTitle?: string,
 *     priceCents?: number | null,
 *     currency?: string,
 *     lessons?: unknown[],
 *   } | null,
 * }} props
 */
export default function ProUpgradeModal({ open, onClose, module = null }) {
  const { isAuthenticated } = useAuth()
  const { gateAction } = useLazyAuth()
  const navigate = useNavigate()

  if (!open) return null

  const trackPrice = (PRICING?.ioaiTrack?.price ?? 2990).toLocaleString()
  const moduleSlug = module?.catalogSlug || null
  const modulePriceCents = module?.priceCents
  const canBuyModule = Boolean(moduleSlug && modulePriceCents != null && modulePriceCents > 0)
  const modulePriceLabel = canBuyModule
    ? formatIoaiPrice(modulePriceCents, module?.currency || 'usd')
    : null
  const lessonCount = module?.lessons?.length || 0
  const moduleTitle = module?.moduleTitle || 'This unit'

  const goTrackCheckout = () => {
    onClose?.()
    goToSecureCheckout({
      navigate,
      isAuthenticated: true,
      courseSlug: IOAI_FULL_BUNDLE_SLUG,
      purchaseType: 'ioai_track',
      returnPath: '/ioai/curriculum',
    })
  }

  const goModuleCheckout = () => {
    if (!moduleSlug) return
    onClose?.()
    purchaseIoaiModule({
      catalogSlug: moduleSlug,
      isAuthenticated: true,
      navigate,
      returnPath: '/ioai/curriculum',
    })
  }

  const handleUnlockTrack = () => {
    gateAction({
      title: 'Sign in to unlock IOAI Masterclass',
      subtitle: 'Google one-tap sign-in — then review your order and apply a promo code before paying.',
      googleLabel: 'Continue with Google to checkout',
      onAuthed: goTrackCheckout,
    })
  }

  const handleUnlockModule = () => {
    gateAction({
      title: `Sign in to unlock ${moduleTitle}`,
      subtitle: 'Google one-tap sign-in — then review your order and apply a promo code before paying.',
      googleLabel: 'Continue with Google to checkout',
      onAuthed: goModuleCheckout,
    })
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pro-upgrade-title"
    >
      <div className="relative w-full max-w-md rounded-2xl border border-cyan-500/30 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 shadow-[0_0_60px_rgba(34,211,238,0.15)] overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-400 via-violet-400 to-cyan-400" />

        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 pt-10">
          <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-cyan-400" />
          </div>

          <h2 id="pro-upgrade-title" className="text-2xl font-black text-white mb-2 text-center">
            Unlock this content
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed mb-6 text-center">
            Choose this course unit only, or unlock the full IOAI Masterclass with every lesson and lab.
          </p>

          {canBuyModule ? (
            <div className="rounded-xl border border-cyan-500/35 bg-cyan-500/10 p-4 mb-3">
              <div className="flex items-start gap-3 mb-3">
                <Package className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-cyan-400/90 mb-1">
                    This unit
                  </p>
                  <p className="text-base font-bold text-white leading-snug">{moduleTitle}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {lessonCount
                      ? `${lessonCount} lesson${lessonCount === 1 ? '' : 's'} · one-time access`
                      : 'One-time · lifetime access'}
                  </p>
                </div>
                <p className="text-lg font-black text-white shrink-0">{modulePriceLabel}</p>
              </div>
              <button
                type="button"
                onClick={handleUnlockModule}
                className="w-full btn-primary py-3 text-sm font-bold rounded-xl"
              >
                Buy this unit — {modulePriceLabel}
              </button>
            </div>
          ) : null}

          <div
            className={[
              'rounded-xl border p-4',
              canBuyModule
                ? 'border-slate-700/80 bg-slate-800/40'
                : 'border-cyan-500/35 bg-cyan-500/10',
            ].join(' ')}
          >
            <div className="flex items-start gap-3 mb-3">
              <PlayCircle
                className={`w-5 h-5 shrink-0 mt-0.5 ${canBuyModule ? 'text-slate-400' : 'text-cyan-400'}`}
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <p
                  className={`text-xs font-bold uppercase tracking-wider mb-1 ${
                    canBuyModule ? 'text-slate-500' : 'text-cyan-400/90'
                  }`}
                >
                  Full curriculum
                </p>
                <p className="text-base font-bold text-white leading-snug">IOAI Masterclass</p>
                <ul className="text-xs text-slate-400 mt-2 space-y-1">
                  <li className="flex gap-1.5">
                    <Shield className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden />
                    All video lessons & hands-on labs
                  </li>
                  <li className="flex gap-1.5">
                    <Shield className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden />
                    Secure signed streaming via Cloudflare
                  </li>
                </ul>
              </div>
              <p className="text-lg font-black text-white shrink-0">
                ${trackPrice}
                <span className="text-[10px] font-normal text-slate-500 ml-0.5">USD</span>
              </p>
            </div>
            <button
              type="button"
              onClick={handleUnlockTrack}
              className={[
                'w-full py-3 text-sm font-bold rounded-xl',
                canBuyModule
                  ? 'border border-slate-600 bg-slate-900/60 text-slate-200 hover:border-cyan-500/40 hover:text-white transition-colors'
                  : 'btn-primary',
              ].join(' ')}
            >
              Unlock IOAI Masterclass
            </button>
          </div>

          <CheckoutTrustMicrocopy variant="dark" className="mt-4" />

          {!isAuthenticated ? (
            <p className="text-xs text-slate-500 mt-4 text-center">
              One-tap Google sign-in — no lengthy registration form
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}

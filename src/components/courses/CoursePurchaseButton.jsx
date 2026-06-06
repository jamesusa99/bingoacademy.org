import { Link, useNavigate } from 'react-router-dom'
import { COURSES_PORTAL } from '../../config/coursesPortal'
import {
  getCheckoutPriceLabel,
  isIoaiLessonOnlyCatalog,
  isPurchasableCourse,
  resolvePurchaseType,
} from '../../lib/coursePricing'
import { initiateCoursePurchase } from '../../lib/coursePurchase'
import { isCourseComingSoon } from '../../config/coursesCatalog'

const VARIANTS = {
  dark: {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white',
    secondary: 'border border-slate-600 text-slate-300 hover:border-slate-400 hover:text-white',
    owned: 'border border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/10',
    contact: 'border border-amber-500/60 text-amber-300 hover:bg-amber-500/10',
    soon: 'border border-amber-500/60 text-amber-300 hover:bg-amber-500/10',
  },
  light: {
    primary: 'btn-primary',
    secondary: 'border border-slate-200 text-slate-600 hover:bg-slate-50',
    owned: 'border border-emerald-300 text-emerald-700 hover:bg-emerald-50',
    contact: 'border border-amber-300 text-amber-800 hover:bg-amber-50',
    soon: 'border border-amber-400 text-amber-800 hover:bg-amber-50',
  },
}

function btnClass(variant, kind, className = '') {
  const base = 'text-xs px-3 py-1.5 rounded-lg font-semibold min-h-[40px] inline-flex items-center justify-center transition disabled:opacity-60'
  return `${base} ${VARIANTS[variant]?.[kind] || VARIANTS.light[kind]} ${className}`.trim()
}

export default function CoursePurchaseButton({
  course,
  hasAccess,
  stripeCheckout,
  checkoutSlug,
  setCheckoutSlug,
  isAuthenticated,
  onUnlockLesson,
  onUnlockTrack,
  variant = 'light',
  className = '',
  showDetailsLink = false,
}) {
  const navigate = useNavigate()
  const courseId = course?.id
  const comingSoon = course?.comingSoon || isCourseComingSoon(course)
  const purchasable = isPurchasableCourse(course)
  const loading = checkoutSlug === courseId
  const detailPath = `/courses/detail/${courseId}`

  const handlePurchase = () => {
    initiateCoursePurchase({
      course,
      purchaseType: resolvePurchaseType(course),
      stripeCheckout,
      isAuthenticated,
      navigate,
      setCheckoutLoading: (busy) => setCheckoutSlug?.(busy ? courseId : null),
      onDemoUnlock: {
        lesson: () => onUnlockLesson?.(courseId),
        track: onUnlockTrack,
      },
    })
  }

  if (hasAccess) {
    return (
      <Link to="/profile/study" className={btnClass(variant, 'owned', className)}>
        {COURSES_PORTAL.continueLearning}
      </Link>
    )
  }

  if (comingSoon) {
    return (
      <Link to={detailPath} className={btnClass(variant, 'soon', className)}>
        {COURSES_PORTAL.comingSoonBadge}
      </Link>
    )
  }

  if (purchasable) {
    const label = stripeCheckout
      ? COURSES_PORTAL.purchaseCourse(getCheckoutPriceLabel(course, resolvePurchaseType(course)))
      : COURSES_PORTAL.enrollCta

    return (
      <div className={`flex flex-wrap gap-2 ${showDetailsLink ? '' : 'contents'}`}>
        <button
          type="button"
          onClick={handlePurchase}
          disabled={loading}
          className={btnClass(variant, 'primary', className)}
        >
          {loading ? 'Redirecting…' : label}
        </button>
        {showDetailsLink ? (
          <Link to={detailPath} className={btnClass(variant, 'secondary')}>
            {COURSES_PORTAL.viewDetails}
          </Link>
        ) : null}
      </div>
    )
  }

  if (isIoaiLessonOnlyCatalog(course)) {
    return (
      <div className={`flex flex-wrap gap-2 ${showDetailsLink ? '' : 'contents'}`}>
        <Link to="/ioai" className={btnClass(variant, 'primary', className)}>
          Browse course units
        </Link>
        {showDetailsLink ? (
          <Link to={detailPath} className={btnClass(variant, 'secondary')}>
            {COURSES_PORTAL.viewDetails}
          </Link>
        ) : null}
      </div>
    )
  }

  return (
    <div className={`flex flex-wrap gap-2 ${showDetailsLink ? '' : 'contents'}`}>
      <Link to="/contact" className={btnClass(variant, 'contact', className)}>
        {COURSES_PORTAL.contactSales}
      </Link>
      {showDetailsLink ? (
        <Link to={detailPath} className={btnClass(variant, 'secondary')}>
          {COURSES_PORTAL.viewDetails}
        </Link>
      ) : null}
    </div>
  )
}

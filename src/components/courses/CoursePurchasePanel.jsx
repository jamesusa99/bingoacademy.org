import { Link, useNavigate } from 'react-router-dom'
import { COURSES_PORTAL } from '../../config/coursesPortal'
import { PRICING, IOAI_FULL_TRACK_SLUG } from '../../lib/courseAccess'
import {
  getCheckoutPriceLabel,
  getCourseDisplayPrice,
  isIoaiCheckoutCourse,
  isPurchasableCourse,
  resolvePurchaseType,
} from '../../lib/coursePricing'
import { initiateCoursePurchase } from '../../lib/coursePurchase'
import { purchaseIoaiBundle } from '../../lib/ioaiPurchase'
import { authLink } from '../../lib/authRedirect'
import { IOAI_TRACK_ID, isIOAILessonId } from '../../lib/ioaiCourseStructure'
import { buildModuleCatalogSlug, formatIoaiPrice } from '../../lib/ioaiStore'
import CheckoutTrustMicrocopy from '../checkout/CheckoutTrustMicrocopy'

export default function CoursePurchasePanel({
  course,
  hasAccess,
  hasTrack,
  onUnlockLesson,
  onUnlockTrack,
  isAuthenticated,
  stripeCheckout = false,
  checkoutLoading = false,
  setCheckoutLoading,
  compact = false,
  moduleContext = null,
}) {
  const navigate = useNavigate()
  const purchaseType = resolvePurchaseType(course)
  const isIOAILesson = isIOAILessonId(course?.id)
  const isIOAITrackPage = course?.id === IOAI_TRACK_ID || course?.id === IOAI_FULL_TRACK_SLUG
  const isIOAIContext = isIoaiCheckoutCourse(course?.id)
  const purchasable = isPurchasableCourse(course)

  const moduleCatalogSlug =
    moduleContext?.catalogSlug ||
    (moduleContext?.levelId && moduleContext?.themeId && moduleContext?.moduleId
      ? buildModuleCatalogSlug(moduleContext.levelId, moduleContext.themeId, moduleContext.moduleId)
      : null)

  const handleCheckout = (type) => {
    initiateCoursePurchase({
      course,
      purchaseType: type,
      stripeCheckout,
      isAuthenticated,
      navigate,
      setCheckoutLoading,
      onDemoUnlock: { lesson: onUnlockLesson, track: onUnlockTrack },
    })
  }

  const handleFullTrackCheckout = () => {
    purchaseIoaiBundle({
      bundleSlug: IOAI_FULL_TRACK_SLUG,
      stripeCheckout,
      isAuthenticated,
      navigate,
      setCheckoutLoading,
      returnPath: isIOAITrackPage ? `/courses/detail/${IOAI_TRACK_ID}` : `/courses?line=ioai`,
      onDemoUnlock: { bundle: onUnlockTrack },
    })
  }

  if (hasAccess) {
    return (
      <div
        className={`rounded-xl border border-emerald-500/40 bg-emerald-500/10 ${compact ? 'p-4' : 'p-5 sm:p-6'}`}
      >
        <p className="text-sm font-semibold text-emerald-300 mb-1">{COURSES_PORTAL.accessUnlockedTitle}</p>
        <p className="text-xs text-emerald-200/80 mb-4">{COURSES_PORTAL.accessUnlockedDesc}</p>
        <div className="flex flex-wrap gap-2">
          <Link to="/profile/study" className="btn-primary text-sm px-4 py-2">
            {COURSES_PORTAL.continueLearning}
          </Link>
          {isIOAIContext ? (
            <Link to="/courses?line=ioai" className="text-sm px-4 py-2 rounded-lg border border-emerald-500/40 text-emerald-200 hover:bg-emerald-500/10">
              {COURSES_PORTAL.viewFullTrack}
            </Link>
          ) : null}
        </div>
      </div>
    )
  }

  // Phase 1: IOAI L4 lesson — no single-lesson purchase; point to L3 unit
  if (isIOAILesson && moduleCatalogSlug) {
    const unitPrice =
      moduleContext?.priceCents != null
        ? formatIoaiPrice(moduleContext.priceCents, moduleContext.currency)
        : null
    return (
      <div
        className={`rounded-xl border border-cyan-500/30 bg-gradient-to-br from-slate-900 to-cyan-950/20 ${compact ? 'p-4' : 'p-5 sm:p-6'}`}
      >
        <p className="text-sm font-bold text-white mb-1">Unlock this course unit</p>
        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
          IOAI lessons are sold as full course units (L3). Purchase the unit to unlock all lessons including this one.
        </p>
        {unitPrice ? (
          <p className="text-2xl font-black text-white mb-3">{unitPrice}</p>
        ) : null}
        <Link
          to={`/courses/module/${encodeURIComponent(moduleCatalogSlug)}`}
          className="inline-flex btn-primary text-sm px-4 py-2"
        >
          {unitPrice ? `Purchase unit · ${unitPrice}` : 'View unit & purchase'}
        </Link>
        <p className="text-[10px] text-slate-600 mt-3">
          Single-lesson purchase is not available in this release.
        </p>
      </div>
    )
  }

  if (!purchasable && !isIOAITrackPage) {
    return (
      <div
        className={`rounded-xl border border-slate-200 bg-slate-50 ${compact ? 'p-4' : 'p-5 sm:p-6'} mb-6`}
      >
        <p className="text-sm font-semibold text-bingo-dark mb-1">{COURSES_PORTAL.contactSalesTitle}</p>
        <p className="text-xs text-slate-600 mb-4">{COURSES_PORTAL.notOnlinePurchase}</p>
        <Link to="/courses?line=ioai" className="btn-primary text-sm px-4 py-2 inline-block mr-2">
          Browse IOAI courses
        </Link>
        <Link to="/contact" className="text-sm text-primary hover:underline">
          {COURSES_PORTAL.contactSales}
        </Link>
      </div>
    )
  }

  if (isIOAIContext && isIOAITrackPage) {
    return (
      <div
        className={`rounded-xl border border-amber-500/30 bg-gradient-to-br from-slate-900 to-amber-950/30 ${compact ? 'p-4' : 'p-5 sm:p-6'}`}
      >
        <p className="text-sm font-bold text-white mb-1">{COURSES_PORTAL.unlockTitle}</p>
        <p className="text-xs text-slate-400 mb-4 leading-relaxed">{COURSES_PORTAL.fullTrackDesc}</p>
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/5 p-4 mb-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400 mb-1">
            {COURSES_PORTAL.fullTrack}
          </p>
          <p className="text-2xl font-black text-white mb-1">
            {COURSES_PORTAL.fromPrice(PRICING.ioaiTrack.price)}
          </p>
          <button
            type="button"
            onClick={handleFullTrackCheckout}
            disabled={hasTrack || checkoutLoading}
            className="w-full text-sm font-semibold py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-900 disabled:opacity-50"
          >
            {checkoutLoading ? 'Redirecting…' : hasTrack ? COURSES_PORTAL.trackOwned : COURSES_PORTAL.unlockTrack}
          </button>
          <CheckoutTrustMicrocopy variant="dark" className="mt-2" align="left" />
        </div>
        <Link to="/courses?line=ioai" className="text-xs text-cyan-400 hover:underline">
          Or browse individual course units →
        </Link>
      </div>
    )
  }

  const displayPrice = getCourseDisplayPrice(course)
  const checkoutLabel = getCheckoutPriceLabel(course, purchaseType)

  return (
    <div
      className={`rounded-xl border border-primary/30 bg-gradient-to-br from-slate-900 to-primary/10 ${compact ? 'p-4' : 'p-5 sm:p-6'} mb-6`}
    >
      <p className="text-sm font-bold text-white mb-1">{COURSES_PORTAL.purchaseCourseTitle}</p>
      <p className="text-xs text-slate-400 mb-4 leading-relaxed">{COURSES_PORTAL.purchaseCourseDesc}</p>

      <div className="rounded-lg border border-primary/40 bg-primary/5 p-4 mb-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-primary mb-1">{course.name}</p>
        <p className="text-2xl font-black text-white mb-1">{displayPrice}</p>
        <p className="text-xs text-slate-500 mb-3">{COURSES_PORTAL.purchaseCourseBenefit}</p>
        <button
          type="button"
          disabled={checkoutLoading}
          onClick={() => handleCheckout(purchaseType)}
          className="w-full btn-primary text-sm py-2 disabled:opacity-60"
        >
          {checkoutLoading ? 'Redirecting…' : COURSES_PORTAL.purchaseCourse(checkoutLabel)}
        </button>
        <CheckoutTrustMicrocopy variant="dark" className="mt-2" align="left" />
      </div>

      {!isAuthenticated ? (
        <p className="text-xs text-slate-500">
          {COURSES_PORTAL.signInHint}{' '}
          <Link to={authLink('/login', `/courses/detail/${course.id}`)} className="text-cyan-400 hover:underline">
            {COURSES_PORTAL.signIn}
          </Link>
        </p>
      ) : null}

      <p className="text-[10px] text-slate-600 mt-3">
        {stripeCheckout ? COURSES_PORTAL.stripeCheckoutNote : COURSES_PORTAL.demoPurchaseNote}
      </p>
    </div>
  )
}

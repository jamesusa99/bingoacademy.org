import { Link, useNavigate } from 'react-router-dom'
import { COURSES_PORTAL } from '../../config/coursesPortal'
import { PRICING, IOAI_FULL_TRACK_SLUG } from '../../lib/courseAccess'
import { startCourseCheckout } from '../../lib/checkout'
import { authLink } from '../../lib/authRedirect'

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
}) {
  const navigate = useNavigate()

  const handleStripeCheckout = async (purchaseType) => {
    if (!isAuthenticated) {
      navigate(authLink('/login', `/courses/detail/${course.id}`))
      return
    }
    if (!stripeCheckout) {
      if (purchaseType === 'ioai_track') onUnlockTrack()
      else onUnlockLesson()
      return
    }
    setCheckoutLoading?.(true)
    try {
      const { url } = await startCourseCheckout({
        courseSlug: course.id,
        purchaseType,
      })
      if (url) window.location.href = url
    } catch (err) {
      alert(err.message || 'Checkout failed')
      setCheckoutLoading?.(false)
    }
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
          <Link
            to={`/courses/detail/${IOAI_FULL_TRACK_SLUG}`}
            className="text-sm px-4 py-2 rounded-lg border border-emerald-500/40 text-emerald-200 hover:bg-emerald-500/10"
          >
            {COURSES_PORTAL.viewFullTrack}
          </Link>
        </div>
      </div>
    )
  }

  const isIOAILesson = course?.id?.startsWith('ioai-') && course.id !== IOAI_FULL_TRACK_SLUG

  return (
    <div
      className={`rounded-xl border border-amber-500/30 bg-gradient-to-br from-slate-900 to-amber-950/30 ${compact ? 'p-4' : 'p-5 sm:p-6'}`}
    >
      <p className="text-sm font-bold text-white mb-1">{COURSES_PORTAL.unlockTitle}</p>
      <p className="text-xs text-slate-400 mb-4 leading-relaxed">{COURSES_PORTAL.unlockDesc}</p>

      <div className="grid sm:grid-cols-2 gap-3 mb-4">
        {isIOAILesson ? (
          <div className="rounded-lg border border-slate-700 bg-slate-900/80 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 mb-1">
              {COURSES_PORTAL.singleLesson}
            </p>
            <p className="text-2xl font-black text-white mb-1">${PRICING.lesson.price}</p>
            <p className="text-xs text-slate-500 mb-3">{COURSES_PORTAL.singleLessonDesc}</p>
            <button
              type="button"
              disabled={checkoutLoading}
              onClick={() => handleStripeCheckout('lesson')}
              className="w-full btn-primary text-sm py-2 disabled:opacity-60"
            >
              {checkoutLoading ? 'Redirecting…' : COURSES_PORTAL.unlockLesson(PRICING.lesson.price)}
            </button>
          </div>
        ) : null}

        <div
          className={`rounded-lg border border-amber-500/40 bg-amber-500/5 p-4 ${!isIOAILesson ? 'sm:col-span-2' : ''}`}
        >
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400 mb-1">
            {COURSES_PORTAL.fullTrack}
          </p>
          <p className="text-2xl font-black text-white mb-1">
            {COURSES_PORTAL.fromPrice(PRICING.ioaiTrack.price)}
          </p>
          <p className="text-xs text-slate-500 mb-3">{COURSES_PORTAL.fullTrackDesc}</p>
          <button
            type="button"
            onClick={() => handleStripeCheckout('ioai_track')}
            disabled={hasTrack || checkoutLoading}
            className="w-full text-sm font-semibold py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-900 disabled:opacity-50"
          >
            {checkoutLoading ? 'Redirecting…' : hasTrack ? COURSES_PORTAL.trackOwned : COURSES_PORTAL.unlockTrack}
          </button>
        </div>
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

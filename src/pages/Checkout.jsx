import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { CHECKOUT_PAGE } from '../config/checkoutPage'
import { CHECKOUT_TRUST } from '../config/checkoutTrust'
import { SITE_BRAND } from '../config/siteSeo'
import { useAuth } from '../contexts/AuthContext'
import { usePromoCode } from '../hooks/usePromoCode'
import { authLink, safeRedirectPath } from '../lib/authRedirect'
import { confirmCheckoutSession, fetchCheckoutQuote, fetchPaymentsConfig, startCourseCheckout } from '../lib/checkout'
import { checkoutLineItemHref } from '../lib/checkoutLineItemHref'
import { purchaseCourseSlug } from '../lib/courseAccess'
import { invalidateEnrollmentAccessCache } from '../lib/enrollmentAccessCache'
import PageMeta from '../components/PageMeta'
import PromoCodeInput from '../components/checkout/PromoCodeInput'

function formatMoney(cents, currency = 'usd') {
  const amount = ((cents || 0) / 100).toFixed(2)
  return String(currency).toLowerCase() === 'usd' ? `$${amount}` : `${amount} ${String(currency).toUpperCase()}`
}

function kindLabel(kind) {
  if (kind === 'unit') return CHECKOUT_PAGE.kindUnit
  if (kind === 'addon') return CHECKOUT_PAGE.kindAddon
  if (kind === 'bundle') return CHECKOUT_PAGE.kindBundle
  if (kind === 'course') return CHECKOUT_PAGE.kindCourse
  return CHECKOUT_PAGE.kindItem
}

function parseAddonParam(raw) {
  if (!raw?.trim()) return []
  return [...new Set(raw.split(',').map((s) => s.trim()).filter(Boolean))]
}

function parseCheckoutSearch(searchParams) {
  const courseSlug = searchParams.get('item')?.trim() || ''
  const purchaseType = searchParams.get('type')?.trim() || 'course'
  const addonSlugs = parseAddonParam(searchParams.get('addons'))
  const returnPath = safeRedirectPath(searchParams.get('return') || '', '/courses')
  return { courseSlug, purchaseType, addonSlugs, returnPath }
}

export default function Checkout() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const promo = usePromoCode()
  const { courseSlug, purchaseType, addonSlugs, returnPath } = useMemo(
    () => parseCheckoutSearch(searchParams),
    [searchParams]
  )

  const [quote, setQuote] = useState(null)
  const [quoteError, setQuoteError] = useState(null)
  const [quoteLoading, setQuoteLoading] = useState(true)
  const [stripeCheckout, setStripeCheckout] = useState(false)
  const [placing, setPlacing] = useState(false)
  const [placeError, setPlaceError] = useState(null)
  const [showPromo, setShowPromo] = useState(() => Boolean(promo.code))
  const [autoApplied, setAutoApplied] = useState(false)

  const paid = searchParams.get('paid') === '1' || searchParams.get('checkout') === 'success'
  const paidSessionId = searchParams.get('session_id')?.trim() || ''
  const [confirming, setConfirming] = useState(Boolean(paid && paidSessionId))
  const [confirmError, setConfirmError] = useState(null)

  const qs = searchParams.toString()
  const checkoutPath = qs ? `/checkout?${qs}` : '/checkout'

  useEffect(() => {
    if (!paid || !paidSessionId || authLoading) return
    if (!isAuthenticated) return

    let cancelled = false
    setConfirming(true)
    setConfirmError(null)
    confirmCheckoutSession(paidSessionId)
      .then(() => {
        invalidateEnrollmentAccessCache()
        if (!cancelled) navigate(returnPath || '/courses', { replace: true })
      })
      .catch((err) => {
        if (!cancelled) {
          setConfirmError(err.message || 'Could not confirm payment')
          setConfirming(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [paid, paidSessionId, authLoading, isAuthenticated, navigate, returnPath])

  useEffect(() => {
    fetchPaymentsConfig()
      .then((c) => setStripeCheckout(Boolean(c.stripeCheckout)))
      .catch(() => setStripeCheckout(false))
  }, [])

  const addonKey = addonSlugs.join(',')

  useEffect(() => {
    if (paid && paidSessionId) {
      setQuoteLoading(false)
      return
    }
    if (!courseSlug) {
      setQuote(null)
      setQuoteLoading(false)
      setQuoteError(null)
      return
    }
    let cancelled = false
    setQuoteLoading(true)
    setQuoteError(null)
    fetchCheckoutQuote({ courseSlug, purchaseType, addonSlugs })
      .then((data) => {
        if (!cancelled) setQuote(data)
      })
      .catch((err) => {
        if (!cancelled) {
          setQuote(null)
          setQuoteError(err.message || CHECKOUT_PAGE.loadError)
        }
      })
      .finally(() => {
        if (!cancelled) setQuoteLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [courseSlug, purchaseType, addonKey, paid, paidSessionId])

  useEffect(() => {
    if (!quote || autoApplied || !promo.code.trim() || promo.applied || promo.loading) return
    setAutoApplied(true)
    setShowPromo(true)
    promo.apply({
      courseSlug,
      purchaseType,
      addonSlugs,
      amountCents: quote.amountCents,
      currency: quote.currency || 'usd',
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quote])

  if (!authLoading && !isAuthenticated && (courseSlug || (paid && paidSessionId))) {
    return <Navigate to={authLink('/login', checkoutPath)} replace />
  }

  const lineItems = quote?.lineItems?.length
    ? quote.lineItems
    : quote
      ? [{ name: quote.productName, amountCents: quote.amountCents, kind: 'item' }]
      : []
  const subtotalCents = quote?.amountCents ?? 0
  const discountCents = promo.applied?.discountCents ?? 0
  const totalCents = promo.applied?.finalAmountCents ?? subtotalCents
  const currency = quote?.currency || 'usd'

  const placeOrder = async () => {
    if (!quote || placing) return
    setPlacing(true)
    setPlaceError(null)

    if (!stripeCheckout) {
      purchaseCourseSlug(courseSlug)
      for (const slug of addonSlugs) purchaseCourseSlug(slug)
      navigate(returnPath || '/courses')
      return
    }

    try {
      const { url } = await startCourseCheckout({
        courseSlug,
        purchaseType,
        addonSlugs,
        returnPath,
        promoCode: promo.applied?.code || undefined,
      })
      if (url) window.location.href = url
      else throw new Error('No checkout URL returned')
    } catch (err) {
      setPlaceError(err.message || 'Checkout failed')
      setPlacing(false)
    }
  }

  const summaryCard = (
    <aside className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5 shadow-sm">
      <button
        type="button"
        onClick={placeOrder}
        disabled={!quote || placing || quoteLoading}
        className="w-full rounded-lg bg-[#ffd814] hover:bg-[#f7ca00] text-slate-900 font-semibold text-sm py-2.5 shadow-sm disabled:opacity-60"
      >
        {placing ? CHECKOUT_PAGE.placingOrder : CHECKOUT_PAGE.placeOrder}
      </button>
      <p className="text-[11px] text-slate-500 mt-3 leading-relaxed">{CHECKOUT_PAGE.legal}</p>
      {placeError ? <p className="text-xs text-red-600 mt-2">{placeError}</p> : null}

      <div className="border-t border-slate-200 mt-4 pt-3 space-y-1.5 text-sm">
        <div className="flex justify-between text-slate-700">
          <span>{CHECKOUT_PAGE.itemsLabel(lineItems.length)}</span>
          <span>{formatMoney(subtotalCents, currency)}</span>
        </div>
        {promo.applied ? (
          <div className="flex justify-between text-emerald-700">
            <span>
              {CHECKOUT_PAGE.promoLabel} ({promo.applied.code})
            </span>
            <span>−{formatMoney(discountCents, currency)}</span>
          </div>
        ) : null}
        <div className="flex justify-between items-baseline pt-2 border-t border-slate-200 mt-2">
          <span className="font-bold text-lg text-red-700">{CHECKOUT_PAGE.orderTotal}</span>
          <span className="font-bold text-lg text-red-700">{formatMoney(totalCents, currency)}</span>
        </div>
      </div>
        {promo.applied?.minimumCheckoutApplied ? (
          <p className="text-[11px] text-sky-700 mt-2">
            {promo.applied.minimumCheckoutNotice || CHECKOUT_PAGE.promoMinCheckoutApplied}
          </p>
        ) : null}
        <p className="text-[11px] text-slate-500 mt-3">{CHECKOUT_TRUST.microcopy}</p>
    </aside>
  )

  return (
    <div className="min-h-screen bg-[#eaeded] text-slate-900">
      <PageMeta title={CHECKOUT_PAGE.documentTitle} noindex />
      <header className="bg-[#131921] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
          <Link to="/" className="shrink-0">
            <img src="/logo.png" alt={SITE_BRAND} className="h-8 w-auto" width={895} height={209} />
          </Link>
          <p className="text-lg sm:text-xl font-semibold tracking-tight flex items-center gap-2">
            <Lock className="w-4 h-4 text-slate-300" aria-hidden />
            {CHECKOUT_PAGE.title}
          </p>
          <Link
            to={returnPath || '/courses'}
            className="text-sm text-slate-200 hover:text-white hover:underline shrink-0"
          >
            {CHECKOUT_PAGE.cart}
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {paid && paidSessionId ? (
          <div className="bg-white border border-slate-200 rounded-lg p-8 text-center max-w-lg mx-auto">
            <h1 className="text-lg font-bold mb-2">
              {confirmError ? 'Payment received' : 'Confirming your order…'}
            </h1>
            <p className="text-sm text-slate-600">
              {confirmError || 'Unlocking access and applying your promo code. You’ll be redirected shortly.'}
            </p>
            {confirmError ? (
              <Link to={returnPath || '/courses'} className="text-sm text-sky-700 hover:underline mt-4 inline-block">
                Continue
              </Link>
            ) : null}
          </div>
        ) : !courseSlug ? (
          <div className="bg-white border border-slate-200 rounded-lg p-8 text-center">
            <h1 className="text-lg font-bold mb-2">{CHECKOUT_PAGE.emptyTitle}</h1>
            <p className="text-sm text-slate-600 mb-4">{CHECKOUT_PAGE.emptyDesc}</p>
            <Link to="/courses" className="text-sm text-sky-700 hover:underline">
              {CHECKOUT_PAGE.browseCourses}
            </Link>
          </div>
        ) : quoteLoading || authLoading ? (
          <p className="text-sm text-slate-600 py-16 text-center">Loading your order…</p>
        ) : quoteError ? (
          <div className="bg-white border border-red-200 rounded-lg p-6">
            <p className="text-sm text-red-700">{quoteError}</p>
            <Link to={returnPath || '/courses'} className="text-sm text-sky-700 hover:underline mt-3 inline-block">
              {CHECKOUT_PAGE.cart}
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.9fr)] gap-5 items-start">
            <div className="space-y-4">
              <section className="bg-white border border-slate-200 rounded-lg p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-bold text-base">{CHECKOUT_PAGE.accountHeading}</h2>
                    <p className="text-sm text-slate-700 mt-1">
                      {CHECKOUT_PAGE.signedInAs}{' '}
                      <span className="font-medium">{user?.email || 'your account'}</span>
                    </p>
                  </div>
                  <Link to={authLink('/login', checkoutPath)} className="text-sm text-sky-700 hover:underline">
                    {CHECKOUT_PAGE.changeAccount}
                  </Link>
                </div>
              </section>

              <section className="bg-white border border-slate-200 rounded-lg p-5">
                <h2 className="font-bold text-base mb-3">{CHECKOUT_PAGE.itemsHeading}</h2>
                <ul className="divide-y divide-slate-100">
                  {lineItems.map((item, index) => {
                    const productHref = checkoutLineItemHref(item, {
                      returnSlug: quote?.returnSlug || courseSlug,
                      purchaseType: quote?.purchaseType || purchaseType,
                      addonSlugs: quote?.addonSlugs || addonSlugs,
                      index,
                    })
                    const thumb = index === 0 && quote.coverUrl ? (
                      <img
                        src={quote.coverUrl}
                        alt=""
                        className="w-16 h-16 rounded-md object-cover bg-slate-100 shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-md bg-slate-100 shrink-0 flex items-center justify-center text-xl">
                        {item.kind === 'addon' ? '📦' : '🎓'}
                      </div>
                    )

                    return (
                      <li key={`${item.slug || item.name}-${index}`} className="py-3 flex gap-3 first:pt-0 last:pb-0">
                        {productHref ? (
                          <Link to={productHref} className="shrink-0 rounded-md hover:opacity-90 transition">
                            {thumb}
                          </Link>
                        ) : (
                          thumb
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] uppercase tracking-wide text-slate-500">{kindLabel(item.kind)}</p>
                          {productHref ? (
                            <Link
                              to={productHref}
                              className="text-sm font-medium text-sky-700 hover:text-sky-900 hover:underline leading-snug inline-block"
                            >
                              {item.name}
                            </Link>
                          ) : (
                            <p className="text-sm font-medium text-slate-900 leading-snug">{item.name}</p>
                          )}
                        </div>
                        <p className="text-sm font-semibold shrink-0">{formatMoney(item.amountCents, currency)}</p>
                      </li>
                    )
                  })}
                </ul>
                <p className="text-xs text-slate-500 mt-3">{CHECKOUT_PAGE.digitalDelivery}</p>
              </section>

              <section className="bg-white border border-slate-200 rounded-lg p-5">
                <h2 className="font-bold text-base mb-2">{CHECKOUT_PAGE.paymentHeading}</h2>
                <p className="text-sm text-slate-700 mb-3">{CHECKOUT_PAGE.payWithStripe}</p>
                {showPromo ? (
                  <>
                    <PromoCodeInput
                      theme="light"
                      compact
                      placeholder={CHECKOUT_PAGE.promoPlaceholder}
                      code={promo.code}
                      onCodeChange={promo.setCode}
                      onApply={() =>
                        promo.apply({
                          courseSlug,
                          purchaseType,
                          addonSlugs,
                          amountCents: quote?.amountCents,
                          currency: quote?.currency || 'usd',
                        })
                      }
                      onClear={promo.clear}
                      applied={promo.applied}
                      loading={promo.loading}
                      error={promo.error}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPromo(false)}
                      className="text-xs text-sky-700 hover:underline mt-2"
                    >
                      {CHECKOUT_PAGE.promoHide}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowPromo(true)}
                    className="text-sm text-sky-700 hover:underline"
                  >
                    {CHECKOUT_PAGE.promoLink}
                  </button>
                )}
              </section>

              <div className="lg:hidden">{summaryCard}</div>
            </div>

            <div className="hidden lg:block sticky top-6">{summaryCard}</div>
          </div>
        )}
      </main>
    </div>
  )
}

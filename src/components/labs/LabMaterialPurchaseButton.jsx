import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { purchaseCourseSlug } from '../../lib/courseAccess'
import { getCourseDisplayPrice, isPurchasableCourse, resolvePurchaseType } from '../../lib/coursePricing'
import { initiateCoursePurchase } from '../../lib/coursePurchase'
import { useAuth } from '../../contexts/AuthContext'
import { fetchPaymentsConfig } from '../../lib/checkout'
import { useEffect } from 'react'
import { LAB_EXPERIMENTS_PORTAL } from '../../config/labExperiments'

export default function LabMaterialPurchaseButton({ item, compact = false, sidebar = false }) {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [stripeCheckout, setStripeCheckout] = useState(false)
  const [loading, setLoading] = useState(false)
  const purchasable = isPurchasableCourse(item)
  const priceLabel = getCourseDisplayPrice(item)

  useEffect(() => {
    fetchPaymentsConfig()
      .then((c) => setStripeCheckout(Boolean(c.stripeCheckout)))
      .catch(() => setStripeCheckout(false))
  }, [])

  if (!purchasable) return null

  const buy = () => {
    initiateCoursePurchase({
      course: item,
      purchaseType: resolvePurchaseType(item),
      stripeCheckout,
      isAuthenticated,
      navigate,
      setCheckoutLoading: setLoading,
      returnPath: `/labs/pack/${encodeURIComponent(item.id)}`,
      onDemoUnlock: {
        lesson: (courseId) => {
          purchaseCourseSlug(courseId || item.id)
          window.location.reload()
        },
      },
    })
  }

  const label = loading
    ? '…'
    : sidebar
      ? priceLabel
        ? `${LAB_EXPERIMENTS_PORTAL.buyPack} · ${priceLabel}`
        : LAB_EXPERIMENTS_PORTAL.buyPack
      : priceLabel
        ? `Buy · ${priceLabel}`
        : 'Buy now'

  return (
    <button
      type="button"
      onClick={buy}
      disabled={loading}
      className={
        sidebar
          ? 'w-full rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold text-sm py-3 transition disabled:opacity-60'
          : `${compact ? 'text-xs px-3 py-2 min-h-[40px]' : 'text-sm px-4 py-2'} btn-primary inline-flex items-center disabled:opacity-60`
      }
    >
      {label}
    </button>
  )
}

export function LabMaterialCardActions({ item, soon }) {
  const purchasable = isPurchasableCourse(item)
  const priceLabel = getCourseDisplayPrice(item)

  return (
    <div className="flex gap-2 mt-4 flex-wrap items-center">
      {priceLabel ? (
        <span className="text-sm font-bold text-primary mr-auto">{priceLabel}</span>
      ) : null}
      <Link
        to={`/labs/pack/${item.id}`}
        className="text-xs px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 min-h-[40px] inline-flex items-center"
      >
        View details
      </Link>
      {!soon && purchasable ? <LabMaterialPurchaseButton item={item} compact /> : null}
    </div>
  )
}

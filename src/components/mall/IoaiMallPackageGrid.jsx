import { useEffect, useMemo, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useIOAIAccess } from '../../hooks/useIOAIStore'
import { purchaseCourseSlug } from '../../lib/courseAccess'
import { fetchPaymentsConfig } from '../../lib/checkout'
import { purchaseIoaiBundle } from '../../lib/ioaiPurchase'
import { mapCourseBundlesToDisplayItems, isBundleDisplayItemOwned } from '../../lib/ioaiMallPackages'
import { useIoaiCourseBundles } from '../../hooks/useIoaiCourseBundles'
import { IoaiCourseBundleCards } from '../ioai/IoaiCourseBundleModal'

export default function IoaiMallPackageGrid() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { hasFullTrack, hasModule, enrolledSlugs } = useIOAIAccess()
  const { bundles, loading, error } = useIoaiCourseBundles()
  const [stripeCheckout, setStripeCheckout] = useState(false)
  const [buyingSlug, setBuyingSlug] = useState(null)

  useEffect(() => {
    fetchPaymentsConfig()
      .then((cfg) => setStripeCheckout(Boolean(cfg.stripeCheckout)))
      .catch(() => setStripeCheckout(false))
  }, [])

  const items = useMemo(() => mapCourseBundlesToDisplayItems(bundles), [bundles])

  const isItemOwned = useCallback(
    (item) => isBundleDisplayItemOwned(item, { hasFullTrack, hasModule, enrolledSlugs }),
    [hasFullTrack, hasModule, enrolledSlugs]
  )

  const handleBuy = (item) => {
    setBuyingSlug(item.ioaiBundleSlug)
    purchaseIoaiBundle({
      bundleSlug: item.ioaiBundleSlug,
      stripeCheckout,
      isAuthenticated,
      navigate,
      returnPath: '/mall?tab=ioai',
      setCheckoutLoading: (active) => {
        if (!active) setBuyingSlug(null)
      },
      onDemoUnlock: {
        bundle: (slug) => {
          purchaseCourseSlug(slug)
          for (const moduleSlug of item.moduleSlugs || []) {
            purchaseCourseSlug(moduleSlug)
          }
          window.location.reload()
        },
      },
    })
  }

  if (loading) {
    return <p className="text-sm text-slate-500 py-4">Loading IOAI course bundles…</p>
  }

  if (error) {
    return <p className="text-sm text-red-600 py-4">{error}</p>
  }

  if (!items.length) return null

  return (
    <section className="space-y-4">
      <div>
        <h3 className="font-bold text-bingo-dark text-base">IOAI Course Bundles</h3>
        <p className="text-sm text-slate-500 mt-1">
          Full track or stage bundles — one checkout unlocks every course unit in that package.
        </p>
      </div>
      <IoaiCourseBundleCards
        items={items}
        theme="light"
        onBuy={handleBuy}
        buyingSlug={buyingSlug}
        isItemOwned={isItemOwned}
      />
    </section>
  )
}

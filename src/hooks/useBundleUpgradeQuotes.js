import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { fetchCheckoutQuotes } from '../lib/checkout'

function quoteKey(item) {
  return item?.ioaiBundleSlug || item?.slug || item?.courseSlug || ''
}

function purchaseTypeForItem(item) {
  if (item?.purchaseType) return item.purchaseType
  return item?.isFullTrack ? 'ioai_track' : 'bundle'
}

export function mergeBundleUpgradeQuote(item, quote) {
  if (!item || !quote || quote.error || !(quote.creditCents > 0)) return item
  return {
    ...item,
    upgradeDueCents: quote.amountCents,
    upgradeCreditCents: quote.creditCents,
    upgradeListCents: quote.listAmountCents ?? item.priceCents,
  }
}

export function useBundleUpgradeQuotes(items) {
  const { isAuthenticated } = useAuth()
  const [quotesBySlug, setQuotesBySlug] = useState({})

  const payload = useMemo(
    () =>
      (items || [])
        .map((item) => {
          const courseSlug = quoteKey(item)
          if (!courseSlug) return null
          return { courseSlug, purchaseType: purchaseTypeForItem(item) }
        })
        .filter(Boolean),
    [items]
  )

  const payloadKey = useMemo(
    () => payload.map((row) => `${row.purchaseType}:${row.courseSlug}`).join('|'),
    [payload]
  )

  useEffect(() => {
    if (!isAuthenticated || !payload.length) {
      setQuotesBySlug({})
      return undefined
    }

    let cancelled = false
    fetchCheckoutQuotes(payload)
      .then((quotes) => {
        if (cancelled) return
        const next = {}
        for (const quote of quotes) {
          if (quote?.courseSlug) next[quote.courseSlug] = quote
        }
        setQuotesBySlug(next)
      })
      .catch(() => {
        if (!cancelled) setQuotesBySlug({})
      })

    return () => {
      cancelled = true
    }
  }, [isAuthenticated, payloadKey])

  const mergedItems = useMemo(
    () => (items || []).map((item) => mergeBundleUpgradeQuote(item, quotesBySlug[quoteKey(item)])),
    [items, quotesBySlug]
  )

  return { quotesBySlug, mergedItems }
}

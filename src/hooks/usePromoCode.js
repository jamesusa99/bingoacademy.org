import { useCallback, useEffect, useState } from 'react'
import { getStoredPromoState, storePromoCode } from '../lib/lazyRegistration'
import { validatePromoCode } from '../lib/promoCode'

export function usePromoCode(checkoutKey = '') {
  const [code, setCodeState] = useState('')
  const [applied, setApplied] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const stored = getStoredPromoState()
    if (stored.checkoutKey && checkoutKey && stored.checkoutKey !== checkoutKey) {
      storePromoCode('')
      setCodeState('')
      setApplied(null)
      setError(null)
      return
    }
    setCodeState(stored.code || '')
    setApplied(null)
    setError(null)
  }, [checkoutKey])

  const setCode = useCallback((next) => {
    const value = String(next || '').toUpperCase()
    setCodeState(value)
    setError(null)
    if (!value) {
      storePromoCode('')
      setApplied(null)
    }
  }, [])

  const clear = useCallback(() => {
    storePromoCode('')
    setCodeState('')
    setApplied(null)
    setError(null)
  }, [])

  const apply = useCallback(
    async ({ courseSlug, purchaseType, amountCents, currency, addonSlugs }) => {
      const trimmed = code.trim().toUpperCase()
      if (!trimmed) {
        setError('Enter a promo code')
        return null
      }
      setLoading(true)
      setError(null)
      try {
        const result = await validatePromoCode({
          code: trimmed,
          courseSlug,
          purchaseType,
          amountCents,
          currency,
          addonSlugs,
        })
        if (!result.valid) {
          setApplied(null)
          storePromoCode('')
          setError(result.error || 'Invalid promo code')
          return null
        }
        storePromoCode(trimmed, checkoutKey)
        setCodeState(trimmed)
        setApplied(result)
        return result
      } catch (err) {
        setApplied(null)
        setError(err.message || 'Could not validate promo code')
        return null
      } finally {
        setLoading(false)
      }
    },
    [code, checkoutKey]
  )

  return { code, setCode, apply, applied, loading, error, clear }
}

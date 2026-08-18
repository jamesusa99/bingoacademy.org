import { useCallback, useEffect, useState } from 'react'
import { getStoredPromoCode, storePromoCode } from '../lib/lazyRegistration'
import { validatePromoCode } from '../lib/promoCode'

export function usePromoCode() {
  const [code, setCodeState] = useState(() => getStoredPromoCode())
  const [applied, setApplied] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

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
        storePromoCode(trimmed)
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
    [code]
  )

  useEffect(() => {
    const stored = getStoredPromoCode()
    if (stored && stored !== code) {
      setCodeState(stored)
    }
  }, [code])

  return { code, setCode, apply, applied, loading, error, clear }
}

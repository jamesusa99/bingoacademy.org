import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { PRODUCT_LINES } from '../config/products'
import { PROGRAMS } from '../config/programs'
import { MALL_STOREFRONT_TABS } from '../config/mallTabs'
import {
  DEFAULT_PRODUCT_LINE_VISIBILITY,
  PRODUCT_LINE_VISIBILITY_KEY,
  mergeProductLineVisibility,
} from '../config/productLineVisibility'
import { fetchPlatformSetting } from '../lib/platformSettings'

const ProductLineVisibilityContext = createContext(null)

const FALLBACK = {
  visibility: DEFAULT_PRODUCT_LINE_VISIBILITY,
  loading: false,
  isLineVisible: () => true,
  visibleLineIds: PRODUCT_LINES.map((l) => l.id),
  defaultLineId: 'ioai',
  visibleProductLines: PRODUCT_LINES,
  visiblePrograms: PROGRAMS,
  visibleMallLineTabs: MALL_STOREFRONT_TABS,
  reload: async () => {},
}

export function ProductLineVisibilityProvider({ children }) {
  const [visibility, setVisibility] = useState(DEFAULT_PRODUCT_LINE_VISIBILITY)
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    const value = await fetchPlatformSetting(PRODUCT_LINE_VISIBILITY_KEY)
    setVisibility(mergeProductLineVisibility(value))
  }, [])

  useEffect(() => {
    let cancelled = false
    fetchPlatformSetting(PRODUCT_LINE_VISIBILITY_KEY)
      .then((value) => {
        if (!cancelled) setVisibility(mergeProductLineVisibility(value))
      })
      .catch(() => {
        if (!cancelled) setVisibility(DEFAULT_PRODUCT_LINE_VISIBILITY)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const isLineVisible = useCallback(
    (lineId) => {
      if (!lineId) return true
      return visibility[lineId] !== false
    },
    [visibility]
  )

  const visibleLineIds = useMemo(
    () => PRODUCT_LINES.filter((l) => isLineVisible(l.id)).map((l) => l.id),
    [isLineVisible]
  )

  const defaultLineId = visibleLineIds[0] ?? 'ioai'

  const visibleProductLines = useMemo(
    () => PRODUCT_LINES.filter((l) => isLineVisible(l.id)),
    [isLineVisible]
  )

  const visiblePrograms = useMemo(
    () => PROGRAMS.filter((p) => isLineVisible(p.lineId)),
    [isLineVisible]
  )

  const visibleMallLineTabs = useMemo(
    () =>
      MALL_STOREFRONT_TABS.filter(
        (t) => !['ioai', 'general', 'k12'].includes(t.id) || isLineVisible(t.id)
      ),
    [isLineVisible]
  )

  const value = useMemo(
    () => ({
      visibility,
      loading,
      isLineVisible,
      visibleLineIds,
      defaultLineId,
      visibleProductLines,
      visiblePrograms,
      visibleMallLineTabs,
      reload,
    }),
    [
      visibility,
      loading,
      isLineVisible,
      visibleLineIds,
      defaultLineId,
      visibleProductLines,
      visiblePrograms,
      visibleMallLineTabs,
      reload,
    ]
  )

  return (
    <ProductLineVisibilityContext.Provider value={value}>
      {children}
    </ProductLineVisibilityContext.Provider>
  )
}

export function useProductLineVisibility() {
  const ctx = useContext(ProductLineVisibilityContext)
  return ctx ?? FALLBACK
}

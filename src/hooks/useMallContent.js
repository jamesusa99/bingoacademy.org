import { useEffect, useState } from 'react'
import { fetchPlatformSetting } from '../lib/platformSettings'
import { MALL_PAGE_DEFAULT, mergeMallPageContent } from '../config/mallContent'

export function useMallContent() {
  const [content, setContent] = useState(MALL_PAGE_DEFAULT)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetchPlatformSetting('mall_page')
      .then((value) => {
        if (!cancelled) setContent(mergeMallPageContent(value))
      })
      .catch(() => {
        if (!cancelled) setContent(MALL_PAGE_DEFAULT)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { content, loading }
}

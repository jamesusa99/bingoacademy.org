import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * SPA routes reuse the same document scroll position. Reset to top on pathname change
 * so /courses → /exploration does not land at the previous page's scroll depth.
 * Skip when navigating to a hash anchor — target pages handle their own scroll.
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) return
    // Direct assignment — instant even when html { scroll-behavior: smooth }
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [pathname, hash])

  return null
}

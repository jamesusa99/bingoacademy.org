import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { IOAI_STAGE_PACKAGES_ANCHOR } from '../config/ioaiStagePackages'
import { scrollToAnchor } from '../lib/scrollToAnchor'

/**
 * SPA routes reuse the same document scroll position. Reset to top on pathname change
 * so /courses → /exploration does not land at the previous page's scroll depth.
 * Hash targets retry until lazy route chunks mount the anchor node.
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0

    if (hash === `#${IOAI_STAGE_PACKAGES_ANCHOR}`) {
      scrollToAnchor(IOAI_STAGE_PACKAGES_ANCHOR, { behavior: 'auto', maxRetries: 96 })
    }
  }, [pathname, hash])

  return null
}

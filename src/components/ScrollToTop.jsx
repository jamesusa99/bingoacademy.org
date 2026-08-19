import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { IOAI_STAGE_PACKAGES_ANCHOR } from '../config/ioaiStagePackages'
import { HOME_SECTION_IDS } from '../config/homePage'
import { scrollToAnchor } from '../lib/scrollToAnchor'

const HOME_SCROLL_ANCHORS = new Set([
  IOAI_STAGE_PACKAGES_ANCHOR,
  HOME_SECTION_IDS.howItWorks,
  HOME_SECTION_IDS.tuition,
])

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

    if (hash) {
      const anchorId = hash.slice(1)
      if (HOME_SCROLL_ANCHORS.has(anchorId)) {
        scrollToAnchor(anchorId, { behavior: 'auto', maxRetries: 96 })
        return
      }
    }
  }, [pathname, hash])

  return null
}

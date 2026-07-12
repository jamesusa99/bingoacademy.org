import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { trackPageView } from '../lib/analytics'

/** Fire SPA page_view on route changes for SEO/GEO segmentation */
export default function useAnalyticsPageView() {
  const { pathname } = useLocation()

  useEffect(() => {
    trackPageView(pathname)
  }, [pathname])
}

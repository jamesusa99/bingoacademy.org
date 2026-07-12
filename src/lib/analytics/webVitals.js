/** Report Core Web Vitals to analytics — validate against CrUX, not Lighthouse alone */

export function initWebVitals(onMetric) {
  if (typeof window === 'undefined' || typeof onMetric !== 'function') return

  import('web-vitals')
    .then(({ onLCP, onINP, onCLS }) => {
      const report = (metric) => {
        onMetric('web_vital', {
          metric_name: metric.name,
          metric_value: metric.value,
          metric_rating: metric.rating,
          metric_id: metric.id,
          page: window.location.pathname,
        })
      }
      onLCP(report)
      onINP(report)
      onCLS(report)
    })
    .catch(() => {
      /* web-vitals optional at runtime */
    })
}

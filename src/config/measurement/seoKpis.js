/**
 * SEO measurement definitions — pair with Google Search Console, CrUX, and RUM.
 * Field data beats one-off Lighthouse runs.
 */

export const SEO_KPI_GROUPS = {
  indexHealth: {
    label: 'Index health',
    metrics: [
      {
        id: 'canonical_indexed',
        label: 'Indexed canonical pages',
        source: 'GSC → Pages → Indexed',
        target: 'Trend up; align with sitemap canonical count (run scripts/measurement/sitemap-index-count.mjs)',
      },
      {
        id: 'duplicate_without_user',
        label: 'Duplicate without user-selected canonical',
        source: 'GSC → Pages → Duplicate',
        target: 'Near zero',
      },
      {
        id: 'crawled_not_indexed',
        label: 'Crawled – currently not indexed',
        source: 'GSC → Pages',
        target: 'Investigate thin/duplicate/query-param URLs',
      },
      {
        id: 'soft_404',
        label: 'Soft 404',
        source: 'GSC → Pages',
        target: 'Zero on live product URLs',
      },
    ],
  },
  visibility: {
    label: 'Search visibility',
    metrics: [
      {
        id: 'nonbrand_impressions',
        label: 'Non-brand keyword impressions',
        source: 'GSC → Performance → Query (exclude brand terms)',
        target: 'MoM growth on program/course/lab/guide queries',
      },
      {
        id: 'nonbrand_clicks',
        label: 'Non-brand clicks',
        source: 'GSC → Performance',
        target: 'CTR improvement on decision + guide URLs',
      },
      {
        id: 'brand_share',
        label: 'Brand vs non-brand click share',
        source: 'GSC → brand filter vs total',
        target: 'Non-brand share rises as GEO + SEO content matures',
      },
    ],
  },
  pageTypes: {
    label: 'Performance by page type',
    metrics: [
      { id: 'program_perf', label: 'Program pages', pathPrefix: '/programs/' },
      { id: 'course_perf', label: 'Course pages', pathPrefix: '/courses/' },
      { id: 'lab_perf', label: 'Lab pages', pathPrefix: ['/labs/', '/exploration/'] },
      { id: 'article_perf', label: 'Article pages', pathPrefix: ['/news/', '/guides/'] },
    ],
    source: 'GSC → filter by URL prefix or page type dimension in analytics',
  },
  cwv: {
    label: 'Core Web Vitals',
    metrics: [
      { id: 'lcp', label: 'LCP', source: 'CrUX + web-vitals RUM', target: '≤ 2.5s (75th p)' },
      { id: 'inp', label: 'INP', source: 'CrUX + web-vitals RUM', target: '≤ 200ms (75th p)' },
      { id: 'cls', label: 'CLS', source: 'CrUX + web-vitals RUM', target: '≤ 0.1 (75th p)' },
    ],
  },
  conversions: {
    label: 'Organic → product conversions',
    metrics: [
      {
        id: 'organic_trial',
        label: 'Natural search → free trial',
        source: 'analytics_events conversion_type=trial + channel=organic_search',
      },
      {
        id: 'organic_assessment',
        label: 'Natural search → assessment',
        source: 'conversion_type=assessment_complete + channel=organic_search',
      },
      {
        id: 'organic_demo',
        label: 'Natural search → school demo intent',
        source: 'conversion_type=demo_intent + channel=organic_search',
      },
    ],
  },
}

/** Brand terms to exclude when reporting non-brand GSC queries */
export const BRAND_QUERY_TERMS = [
  'bingo academy',
  'bingoacademy',
  'bingo academy org',
  '缤果学院',
]

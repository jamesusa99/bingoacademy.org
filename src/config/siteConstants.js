/** Site constants — no imports from structuredData or programs */

export const SITE_URL = 'https://www.bingoacademy.org'

/** Primary public brand — use in headers, titles, OG, schema, logo alt, and body copy */
export const SITE_BRAND = 'Bingo Academy'

/** Domain label — use only when the URL itself needs emphasis (footer domain, contact, legal) */
export const SITE_DOMAIN = 'BingoAcademy.org'

/** Former product name — legacy references only; do not use as primary branding */
export const SITE_LEGACY_NAME = 'Bingo AI Academy'

/** Registered legal entity operating BingoAcademy.org */
export const SITE_LEGAL_ENTITY = 'Deep Ocean Data Inc.'

export const SITE_DEFAULT_SEO = {
  title: `IOAI Competition Training for Students | ${SITE_BRAND}`,
  description:
    'Structured AI Olympiad training for students ages 12–18, covering Python, machine learning, neural networks, Jupyter labs, projects, and mock assessments.',
  keywords:
    'IOAI, AI Olympiad training, IOAI competition prep, AI for teens, Python machine learning, neural networks, Jupyter labs, mock assessments, Bingo Academy',
}

export const SITE_OG = {
  title: `IOAI Competition Training for Students | ${SITE_BRAND}`,
  siteName: SITE_BRAND,
  description:
    'Structured AI Olympiad training for students ages 12–18 — Python, machine learning, neural networks, Jupyter labs, projects, and mock assessments.',
  image: `${SITE_URL}/images/og-cover.jpg`,
  type: 'website',
}

export const SITE_TWITTER = {
  card: 'summary_large_image',
}

/** Standard page title suffix — e.g. pageTitle('About Us') → "About Us | Bingo Academy" */
export function pageTitle(main) {
  return `${main} | ${SITE_BRAND}`
}

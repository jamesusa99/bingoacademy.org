/** Organization facts for /about — verifiable identity, not marketing slogans */

import { SITE_BRAND, SITE_DOMAIN, SITE_LEGACY_NAME, SITE_LEGAL_ENTITY } from '../siteConstants.js'

export const INDEPENDENT_PROVIDER_DISCLAIMER =
  `${SITE_BRAND} is an independent education provider. References to IOAI, USAAIO, IAIO, and other competitions describe curriculum alignment or preparation focus and do not imply affiliation, endorsement, or official partnership unless explicitly documented.`

/** Official Facebook Page (Meta → Page → Action button target uses FACEBOOK_PAGE_LEARN_MORE_URL) */
export const FACEBOOK_PAGE_URL = 'https://www.facebook.com/BingoAcademyAI'

/**
 * Meta Facebook Page → Action button → Learn More destination.
 * Set in Meta Business Suite / Page settings (not rendered on-site).
 */
export const FACEBOOK_PAGE_LEARN_MORE_URL =
  'https://www.bingoacademy.org/assessment/ioai?utm_source=facebook&utm_medium=organic_social&utm_campaign=ioai_page_launch&utm_content=page_cta'

export const ORG_SAME_AS = [
  'https://www.linkedin.com/company/bingo-academy',
  'https://www.youtube.com/@BingoAcademy',
  FACEBOOK_PAGE_URL,
  'https://www.instagram.com/BingoAcademy',
  'https://www.tiktok.com/@BingoAcademy',
]

export const ABOUT_ORG = {
  version: '2026.3',
  updatedAt: 'August 2026',
  displayName: SITE_BRAND,
  website: SITE_DOMAIN,
  legalEntity: SITE_LEGAL_ENTITY,
  legalName: `${SITE_BRAND} (${SITE_LEGAL_ENTITY})`,
  alsoKnownAs: SITE_LEGACY_NAME,
  focus: 'K–12 AI fundamentals, coding, projects and competition preparation',
  programs: {
    family: 'Ages 13–18',
    familyNote: 'Direct-to-family courses, live programs, and competition prep',
    school: 'Grades 4–12',
    schoolNote: 'Classroom editions, teacher resources, and school implementation',
    ageClarification:
      'Direct-to-family programs currently serve ages 13–18. School curriculum resources support grades 4–12.',
  },
  delivery: 'Online courses, browser labs, live instruction',
  region: {
    headquarters: 'United States',
    activeRegions: 'United States, Singapore, and Greater China (school pilots & R&D partnerships)',
    operations: 'United States, Singapore, and Greater China (school pilots & R&D partnerships)',
    timezoneNote: 'Support hours follow US Pacific and China Standard Time',
  },
  founded: {
    year: 2019,
    background:
      'Founded to deliver university-grade AI literacy and competition preparation for K–12 learners — bridging research-style lab documentation with age-appropriate pacing.',
  },
  mission:
    'Help students, families, and schools learn artificial intelligence through reproducible experiments, competition-ready portfolios, and evidence-based curriculum — not prompt-only demos.',
  audiences: [
    { label: 'Families', desc: 'Self-paced courses, free browser labs, and IOAI/USAAIO preparation' },
    { label: 'Competition teams', desc: 'Structured IOAI pathways, mock assessments, and defence coaching' },
    { label: 'K–12 schools', desc: 'Classroom editions, teacher training, procurement-ready privacy docs' },
  ],
  contact: {
    general: 'hello@bingoacademy.org',
    privacy: 'privacy@bingoacademy.org',
    schools: 'schools@bingoacademy.org',
    support: 'support@bingoacademy.org',
  },
  social: [
    { label: 'Website', href: 'https://www.bingoacademy.org', external: true },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/company/bingo-academy', external: true },
    { label: 'YouTube', href: 'https://www.youtube.com/@BingoAcademy', external: true },
    { label: 'Facebook', href: FACEBOOK_PAGE_URL, external: true },
    { label: 'Instagram', href: 'https://www.instagram.com/BingoAcademy', external: true },
    { label: 'TikTok', href: 'https://www.tiktok.com/@BingoAcademy', external: true },
  ],
  verifyLinks: [
    { label: 'Core instructors', href: '/instructors' },
    { label: 'Teaching methodology', href: '/methodology' },
    { label: 'Outcomes & case studies', href: '/outcomes' },
    { label: 'Child safety & data use', href: '/safety-and-privacy' },
    { label: 'First-party evidence hub', href: '/guides/evidence' },
    { label: 'Certification verification', href: '/cert' },
  ],
}

/** Visible identity block for /about — shown below hero, not collapsed */
export function aboutAtAGlanceRows(org = ABOUT_ORG) {
  return [
    { label: 'Organization', value: org.displayName },
    { label: 'Legal entity', value: org.legalEntity },
    { label: 'Website', value: org.website },
    { label: 'Focus', value: org.focus },
    { label: 'Family programs', value: `${org.programs.family} — ${org.programs.familyNote}` },
    { label: 'School curriculum', value: `${org.programs.school} — ${org.programs.schoolNote}` },
    { label: 'Delivery', value: org.delivery },
    { label: 'Headquarters', value: org.region.headquarters },
    { label: 'Active regions', value: org.region.activeRegions },
    {
      label: 'Contact',
      value: org.contact.general,
      href: `mailto:${org.contact.general}`,
    },
    {
      label: 'Facebook',
      value: 'facebook.com/BingoAcademyAI',
      href: FACEBOOK_PAGE_URL,
    },
    { label: 'Last updated', value: org.updatedAt },
  ]
}

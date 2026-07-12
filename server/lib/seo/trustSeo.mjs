/** Server SEO for trust & credibility pages */

import { ABOUT_ORG } from '../../../src/config/trust/about.js'
import { getInstructor, getAllInstructorPaths, INSTRUCTORS_HUB } from '../../../src/config/trust/instructors.js'
import { METHODOLOGY } from '../../../src/config/trust/methodology.js'
import { OUTCOMES_HUB, getAllOutcomesPaths } from '../../../src/config/trust/outcomes.js'
import { SAFETY_PRIVACY } from '../../../src/config/trust/safetyPrivacy.js'
import { SITE_BRAND } from './constants.mjs'

export function parseTrustPath(pathname) {
  if (pathname === '/about') return { about: true }
  if (pathname === '/instructors') return { instructors: true }
  if (pathname === '/methodology') return { methodology: true }
  if (pathname === '/outcomes') return { outcomes: true }
  if (pathname === '/safety-and-privacy') return { safety: true }

  const instructorMatch = pathname.match(/^\/instructors\/([^/]+)$/)
  if (instructorMatch) return { instructor: instructorMatch[1] }

  return null
}

export function trustSeoForPath(pathname) {
  const parsed = parseTrustPath(pathname)
  if (!parsed) return null

  if (parsed.about) {
    return {
      title: `About ${ABOUT_ORG.displayName} | ${SITE_BRAND}`,
      description: `${ABOUT_ORG.legalName}. ${ABOUT_ORG.mission}`,
      h1: `About ${ABOUT_ORG.displayName}`,
      body: ABOUT_ORG.mission,
      canonical: '/about',
      updatedAt: ABOUT_ORG.updatedAt,
    }
  }

  if (parsed.instructors) {
    return {
      title: `${INSTRUCTORS_HUB.title} | ${SITE_BRAND}`,
      description: INSTRUCTORS_HUB.excerpt,
      h1: INSTRUCTORS_HUB.title,
      body: INSTRUCTORS_HUB.excerpt,
      canonical: '/instructors',
      updatedAt: INSTRUCTORS_HUB.updatedAt,
    }
  }

  if (parsed.instructor) {
    const instructor = getInstructor(parsed.instructor)
    if (!instructor) return null
    return {
      title: `${instructor.name} — ${instructor.title} | ${SITE_BRAND}`,
      description: instructor.bio,
      h1: instructor.name,
      body: `${instructor.title}. ${instructor.bio}`,
      canonical: `/instructors/${instructor.slug}`,
      updatedAt: INSTRUCTORS_HUB.updatedAt,
    }
  }

  if (parsed.methodology) {
    return {
      title: `${METHODOLOGY.title} | ${SITE_BRAND}`,
      description: METHODOLOGY.excerpt,
      h1: METHODOLOGY.title,
      body: METHODOLOGY.excerpt,
      canonical: '/methodology',
      updatedAt: METHODOLOGY.updatedAt,
    }
  }

  if (parsed.outcomes) {
    return {
      title: `${OUTCOMES_HUB.title} | ${SITE_BRAND}`,
      description: OUTCOMES_HUB.excerpt,
      h1: OUTCOMES_HUB.title,
      body: OUTCOMES_HUB.excerpt,
      canonical: '/outcomes',
      updatedAt: OUTCOMES_HUB.updatedAt,
    }
  }

  if (parsed.safety) {
    return {
      title: `${SAFETY_PRIVACY.title} | ${SITE_BRAND}`,
      description: SAFETY_PRIVACY.excerpt,
      h1: SAFETY_PRIVACY.title,
      body: SAFETY_PRIVACY.excerpt,
      canonical: '/safety-and-privacy',
      updatedAt: SAFETY_PRIVACY.updatedAt,
    }
  }

  return null
}

export function trustSitemapPaths() {
  return [
    { path: '/about', changefreq: 'monthly', priority: '0.8', lastmod: ABOUT_ORG.updatedAt },
    ...getAllInstructorPaths(),
    { path: '/methodology', changefreq: 'monthly', priority: '0.75', lastmod: METHODOLOGY.updatedAt },
    ...getAllOutcomesPaths(),
    { path: '/safety-and-privacy', changefreq: 'monthly', priority: '0.8', lastmod: SAFETY_PRIVACY.updatedAt },
  ]
}

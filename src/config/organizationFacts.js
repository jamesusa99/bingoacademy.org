/** Verified organization metrics — single source for /about and SEO copy */

export const ORGANIZATION_FACTS = {
  enrolledLearners: 500,
  countriesWithActiveLearners: 4,
  handsOnLabsCompleted: 100,
  brandLaunchYear: 2022,
  legalEntityFoundedYear: 2019,
  dataThrough: '2026-08-19',
}

function formatCountPlus(n) {
  return `${Number(n).toLocaleString('en-US')}+`
}

export function formatEnrolledLearners(n) {
  if (n == null) return 'TBD'
  return formatCountPlus(n)
}

export function formatHandsOnLabsCompleted(n) {
  if (n == null) return 'TBD'
  return formatCountPlus(n)
}

export function organizationStatsItems(facts = ORGANIZATION_FACTS) {
  return [
    { value: formatEnrolledLearners(facts.enrolledLearners), label: 'Enrolled Learners' },
    { value: String(facts.countriesWithActiveLearners), label: 'Countries With Active Learners' },
    { value: formatHandsOnLabsCompleted(facts.handsOnLabsCompleted), label: 'Hands-on AI Labs Completed' },
  ]
}

export function organizationImpactHeadline(facts = ORGANIZATION_FACTS) {
  const learners = formatEnrolledLearners(facts.enrolledLearners)
  const countries = facts.countriesWithActiveLearners
  const labs = formatHandsOnLabsCompleted(facts.handsOnLabsCompleted)
  return `${learners} enrolled learners · ${countries} countries · ${labs} hands-on AI labs`
}

export function organizationCtaBody(facts = ORGANIZATION_FACTS) {
  const learners = formatEnrolledLearners(facts.enrolledLearners)
  const countries = facts.countriesWithActiveLearners
  const labs = formatHandsOnLabsCompleted(facts.handsOnLabsCompleted)
  return `Join ${learners} enrolled learners across ${countries} countries — with ${labs} hands-on AI labs completed and counting. Beginner and advanced pathways are available.`
}

export function organizationMetaDescription() {
  return 'Learn how Bingo Academy helps K–12 students understand AI fundamentals, implement models in Python, and apply them through reproducible projects, labs, and competition preparation.'
}

export function organizationStatsFootnote(facts = ORGANIZATION_FACTS) {
  const through = facts.dataThrough
    ? new Date(facts.dataThrough).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    : '2026'
  return `Numbers reflect verified data as of ${through}. Updated quarterly.`
}

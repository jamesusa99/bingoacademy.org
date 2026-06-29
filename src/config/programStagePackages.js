import { IOAI_STAGE_PACKAGES } from './ioaiStagePackages.js'
import { PROGRAM_CURRICULUM } from './programCurriculum.js'

/** Stage / full-track package tabs shown in admin and storefront (per product line). */
export function getProgramStagePackages(productLine) {
  if (productLine === 'ioai') return IOAI_STAGE_PACKAGES

  const cfg = PROGRAM_CURRICULUM[productLine]
  if (!cfg) return []

  return [
    {
      id: 'all',
      title: 'Full track',
      mallTitle: cfg.summaryTitle,
      emoji: cfg.icon,
    },
  ]
}

export function programFullBundleSlug(productLine) {
  return PROGRAM_CURRICULUM[productLine]?.trackSlug || null
}

export function programStageComboSlug(productLine, levelSlug) {
  if (productLine === 'ioai') return `ioai-stage-${levelSlug}`
  const prefix = PROGRAM_CURRICULUM[productLine]?.slugPrefix
  if (!prefix || !levelSlug || levelSlug === 'all') return null
  return `${prefix}-stage-${levelSlug}`
}

export function buildStorefrontPackageDefs(productLine) {
  const packages = getProgramStagePackages(productLine)
  const fullSlug = programFullBundleSlug(productLine)

  return packages.map((pkg, index) => ({
    packageId: pkg.id,
    productLine,
    slug: pkg.id === 'all' ? fullSlug : programStageComboSlug(productLine, pkg.id),
    bundleType: pkg.id === 'all' ? 'full' : 'combo',
    levelSlug: pkg.id,
    defaultTitle: pkg.mallTitle || pkg.title,
    emoji: pkg.emoji,
    sortOrder: index,
  }))
}

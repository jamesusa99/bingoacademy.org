import { flattenIoaiModules } from './ioaiStore.js'
import { prioritizedWeakTags } from './ioaiAssessmentScore.js'
import { WEAK_TAG_MODULE_TITLES, WEAK_TAGS_WITHOUT_SKU } from '../config/ioaiAssessment.js'

function normalizeTitle(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function titleMatches(moduleTitle, preferredTitle) {
  const haystack = normalizeTitle(moduleTitle)
  const needle = normalizeTitle(preferredTitle)
  if (!haystack || !needle) return false
  return haystack.includes(needle) || needle.includes(haystack)
}

export function matchModuleForTitles(modules, preferredTitles = []) {
  for (const preferred of preferredTitles) {
    const found = (modules || []).find((mod) => titleMatches(mod.title, preferred) && mod.catalogSlug)
    if (found) return found
  }
  return null
}

/**
 * Pick 1–3 live store modules for the recommended stage.
 * Audio tags never invent a SKU.
 */
export function resolveRecommendedModules({ weakTags = [], recommendedStage, levels = [], limit = 3 } = {}) {
  const modules = flattenIoaiModules(levels)
  const tags = prioritizedWeakTags(recommendedStage, weakTags).filter((tag) => !WEAK_TAGS_WITHOUT_SKU.has(tag))
  const picked = []
  const seen = new Set()

  for (const tag of tags) {
    const match = matchModuleForTitles(modules, WEAK_TAG_MODULE_TITLES[tag] || [])
    if (!match || seen.has(match.catalogSlug)) continue
    seen.add(match.catalogSlug)
    picked.push({
      catalogSlug: match.catalogSlug,
      title: match.title,
      tag,
      href: `/courses/module/${encodeURIComponent(match.catalogSlug)}`,
    })
    if (picked.length >= limit) break
  }

  return picked
}

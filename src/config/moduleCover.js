/** Default L3 module cover when none uploaded */
export const DEFAULT_MODULE_COVER = '/images/module-cover-default.svg'

/**
 * Resolve storefront module cover URL (custom upload or default).
 * @param {string | null | undefined} coverUrl
 * @param {{ productLine?: string, emoji?: string }} [options]
 */
export function resolveModuleCoverUrl(coverUrl, options = {}) {
  const trimmed = typeof coverUrl === 'string' ? coverUrl.trim() : ''
  if (trimmed) return trimmed
  return DEFAULT_MODULE_COVER
}

export function hasCustomModuleCover(coverUrl) {
  return Boolean(typeof coverUrl === 'string' && coverUrl.trim())
}

const NON_PURCHASABLE_PATTERN =
  /coming\s*soon|quote|contact|included|free|school\s*quote|\/yr|\/\s*session|tbd|upon\s*request|custom/i

/** Parse display price text → cents (USD assumed unless currency column set) */
export function parsePriceStringToCents(text) {
  if (!text || typeof text !== 'string') return null
  const trimmed = text.trim()
  if (!trimmed || NON_PURCHASABLE_PATTERN.test(trimmed)) return null
  const normalized = trimmed.replace(/,/g, '')
  const match = normalized.match(/(\d+(?:\.\d{1,2})?)/)
  if (!match) return null
  const dollars = parseFloat(match[1])
  if (!Number.isFinite(dollars) || dollars <= 0) return null
  return Math.round(dollars * 100)
}

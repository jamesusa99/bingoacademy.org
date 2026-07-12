/** Scroll so `id` sits below a sticky header; retries until the node exists (lazy routes). */
export function scrollToAnchor(
  anchorId,
  { offset = 96, behavior = 'auto', maxRetries = 72 } = {}
) {
  const attempt = (left) => {
    const el = document.getElementById(anchorId)
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - offset
      window.scrollTo({ top: Math.max(0, top), behavior })
      return true
    }
    if (left > 0) requestAnimationFrame(() => attempt(left - 1))
    return false
  }

  requestAnimationFrame(() => attempt(maxRetries))
}

import katex from 'katex'

/** Render inline/block math spans inside HTML containers */
export function typesetMathInElement(root) {
  if (!root) return
  root.querySelectorAll('[data-latex]').forEach((el) => {
    const latex = el.getAttribute('data-latex')
    if (!latex) return
    try {
      katex.render(latex, el, {
        throwOnError: false,
        displayMode: el.classList.contains('ioai-math-block'),
      })
    } catch {
      el.textContent = latex
    }
  })
}

export function stripHtml(html) {
  return String(html || '').replace(/<[^>]+>/g, '').trim()
}

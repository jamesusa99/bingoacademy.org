import { useEffect, useRef } from 'react'
import { typesetMathInElement } from '../../lib/richHtmlMath'
import 'katex/dist/katex.min.css'

export default function RichHtmlContent({ html, className = '', theme = 'dark' }) {
  const ref = useRef(null)

  useEffect(() => {
    typesetMathInElement(ref.current)
  }, [html])

  if (!html) return null

  const proseClass =
    theme === 'light'
      ? 'prose prose-sm max-w-none text-slate-700'
      : 'prose prose-sm prose-invert max-w-none'

  return (
    <div
      ref={ref}
      className={`${proseClass} ${className}`.trim()}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

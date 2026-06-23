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

  const wrapClass =
    'min-w-0 max-w-full break-words [overflow-wrap:anywhere] ' +
    '[&_*]:max-w-full [&_p]:break-words [&_li]:break-words [&_span]:break-words [&_div]:break-words ' +
    '[&_pre]:whitespace-pre-wrap [&_pre]:break-words [&_code]:break-words [&_code]:whitespace-pre-wrap'

  return (
    <div
      ref={ref}
      className={`${proseClass} ${wrapClass} ${className}`.trim()}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Copy, Check } from 'lucide-react'
import lab1PythonListsMd from '../../content/ioai-lab1-python-lists.md?raw'

export const DEFAULT_PYTHON_LISTS_MD = lab1PythonListsMd

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* ignore */
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="absolute top-2 right-2 flex items-center gap-1 text-[10px] px-2 py-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
      aria-label="Copy code"
    >
      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

export default function TutorialPane({ markdown, sections }) {
  const body = markdown || sectionsToMarkdown(sections)

  return (
    <div className="ioai-tutorial-pane flex-1 min-h-0 lg:w-1/2 lg:flex-none overflow-y-auto border-b lg:border-b-0 lg:border-r border-slate-800 bg-slate-900/40">
      <div className="p-5 sm:p-6 lg:p-8">
        <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 mb-4">Tutorial</p>
        <article className="ioai-lab-prose prose prose-sm sm:prose-base prose-invert max-w-none prose-headings:text-white prose-p:text-slate-300 prose-strong:text-white prose-code:text-emerald-300 prose-code:bg-slate-950 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-slate-950 prose-pre:border prose-pre:border-slate-700 prose-li:text-slate-300 prose-a:text-cyan-400">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ className, children, ...props }) {
                const text = String(children).replace(/\n$/, '')
                const isBlock = /language-/.test(className || '') || text.includes('\n')
                if (!isBlock) {
                  return (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  )
                }
                return (
                  <div className="relative not-prose my-4 group">
                    <pre className="text-xs font-mono bg-slate-950 border border-slate-700 rounded-lg p-4 overflow-x-auto text-emerald-300/95">
                      <code className={className} {...props}>
                        {children}
                      </code>
                    </pre>
                    <CopyButton text={text} />
                  </div>
                )
              },
            }}
          >
            {body}
          </ReactMarkdown>
        </article>
      </div>
    </div>
  )
}

function sectionsToMarkdown(sections) {
  if (!sections?.length) return DEFAULT_PYTHON_LISTS_MD
  return sections
    .map((sec) => {
      let md = `## ${sec.title}\n\n${sec.body}`
      if (sec.code) md += `\n\n\`\`\`python\n${sec.code}\n\`\`\``
      return md
    })
    .join('\n\n')
}

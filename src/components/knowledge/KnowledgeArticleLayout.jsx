import { Link } from 'react-router-dom'

function ReferenceList({ references }) {
  if (!references?.length) return null
  return (
    <section className="mt-8 pt-6 border-t border-slate-200">
      <h2 className="text-sm font-bold text-bingo-dark mb-3">References & official sources</h2>
      <ul className="space-y-2 text-sm">
        {references.map((ref) => (
          <li key={ref.href + ref.label}>
            {ref.external ? (
              <a href={ref.href} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                {ref.label} ↗
              </a>
            ) : (
              <Link to={ref.href} className="text-primary hover:underline">
                {ref.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

function ContentMeta({ article }) {
  return (
    <footer className="mt-8 text-xs text-slate-500 border-t border-slate-100 pt-4 space-y-1">
      <p>
        <span className="font-semibold text-slate-600">Version:</span> {article.version} ·{' '}
        <span className="font-semibold text-slate-600">Updated:</span> {article.updatedAt}
      </p>
      <p>
        <span className="font-semibold text-slate-600">Author:</span> {article.author}
      </p>
      <p>
        <span className="font-semibold text-slate-600">Reviewed by:</span> {article.reviewer}
      </p>
      <p className="text-slate-400 mt-2 leading-relaxed">
        Cite this page as: {article.title} (v{article.version}, {article.updatedAt}), Bingo Academy.
      </p>
    </footer>
  )
}

/** Renders markdown-ish body (simple paragraphs + tables as pre) */
function GuideBody({ body }) {
  const blocks = body.split(/\n\n+/)
  return (
    <div className="prose prose-slate prose-sm max-w-none mt-6">
      {blocks.map((block, i) => {
        const trimmed = block.trim()
        if (trimmed.startsWith('|')) {
          return (
            <pre key={i} className="text-xs overflow-x-auto bg-slate-50 p-4 rounded-xl border border-slate-200 not-prose">
              {trimmed}
            </pre>
          )
        }
        if (trimmed.startsWith('**') || trimmed.includes('**')) {
          return (
            <p key={i} className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
              {trimmed.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*/g, '')}
            </p>
          )
        }
        return (
          <p key={i} className="text-sm text-slate-700 leading-relaxed">
            {trimmed}
          </p>
        )
      })}
    </div>
  )
}

export default function KnowledgeArticleLayout({ article, cluster, children }) {
  return (
    <article className="max-w-3xl" itemScope itemType="https://schema.org/Article">
      <meta itemProp="dateModified" content={article.updatedAt} />
      <p className="text-xs font-semibold text-primary uppercase tracking-wide">
        {cluster?.title || article.cluster} · v{article.version}
      </p>
      <h1 className="text-2xl sm:text-3xl font-black text-bingo-dark mt-2" itemProp="headline">
        {article.title}
      </h1>
      <p className="text-sm text-slate-600 mt-3 leading-relaxed" itemProp="description">
        {article.excerpt}
      </p>
      <GuideBody body={article.body} />
      {article.relatedCourses?.length ? (
        <section className="mt-8">
          <h2 className="text-sm font-bold text-bingo-dark mb-2">Related courses</h2>
          <div className="flex flex-wrap gap-2">
            {article.relatedCourses.map((c) => (
              <Link
                key={c.href}
                to={c.href}
                className="text-xs font-semibold px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20"
              >
                {c.label}
              </Link>
            ))}
          </div>
        </section>
      ) : null}
      <ReferenceList references={article.references} />
      <ContentMeta article={article} />
      {children}
    </article>
  )
}

export function GeoDisclaimer({ text }) {
  return (
    <p className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-xl p-4 mt-8 leading-relaxed">
      {text}
    </p>
  )
}

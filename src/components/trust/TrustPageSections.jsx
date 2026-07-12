import { Link } from 'react-router-dom'
import PageContent from '../PageContent'

export function TrustMetaFooter({ version, updatedAt, extra }) {
  return (
    <footer className="mt-10 pt-6 border-t border-slate-200 text-xs text-slate-500 space-y-1">
      <p>
        <span className="font-semibold text-slate-600">Version:</span> {version} ·{' '}
        <span className="font-semibold text-slate-600">Updated:</span> {updatedAt}
      </p>
      {extra}
    </footer>
  )
}

export function TrustDisclaimer({ children }) {
  return (
    <p className="text-xs text-slate-500 leading-relaxed border-l-4 border-amber-300 pl-4 mt-6">{children}</p>
  )
}

export function TrustVerifyNav({ links, title = 'Verify our claims' }) {
  if (!links?.length) return null
  return (
    <nav className="mt-8 card p-5 bg-slate-50" aria-label={title}>
      <h2 className="text-sm font-bold text-bingo-dark mb-3">{title}</h2>
      <ul className="grid sm:grid-cols-2 gap-2 text-sm">
        {links.map((link) => (
          <li key={link.href}>
            {link.external ? (
              <a href={link.href} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                {link.label} ↗
              </a>
            ) : (
              <Link to={link.href} className="text-primary hover:underline">
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  )
}

export function TrustPageHero({ eyebrow, title, excerpt, children }) {
  return (
    <section className="border-b border-slate-200 bg-gradient-to-br from-slate-50 to-cyan-50/40 py-10 sm:py-14">
      <PageContent className="max-w-3xl">
        {eyebrow ? (
          <p className="text-xs font-bold tracking-widest text-slate-500 uppercase">{eyebrow}</p>
        ) : null}
        <h1 className="text-2xl sm:text-3xl font-black text-bingo-dark mt-2">{title}</h1>
        {excerpt ? <p className="text-sm text-slate-600 mt-3 leading-relaxed">{excerpt}</p> : null}
        {children}
      </PageContent>
    </section>
  )
}

export function ExternalLink({ href, children }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
      {children} ↗
    </a>
  )
}

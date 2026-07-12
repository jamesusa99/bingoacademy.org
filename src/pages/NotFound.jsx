import { Link } from 'react-router-dom'
import PageMeta from '../components/PageMeta'
import PageContent from '../components/PageContent'
import { SITE_BRAND } from '../config/siteSeo'

export default function NotFound({ status = 404 }) {
  const isGone = status === 410
  const title = isGone ? `Page Removed | ${SITE_BRAND}` : `Page Not Found | ${SITE_BRAND}`
  const heading = isGone ? 'This page has been removed' : 'Page not found'
  const message = isGone
    ? `This content is no longer available on ${SITE_BRAND}.`
    : 'The page you are looking for does not exist or may have been moved.'

  return (
    <PageContent className="py-16 sm:py-20 max-w-2xl mx-auto text-center">
      <PageMeta title={title} description={message} noindex />
      <p className="text-6xl font-black text-slate-200 mb-4" aria-hidden>
        {status}
      </p>
      <h1 className="text-2xl sm:text-3xl font-black text-bingo-dark mb-3">{heading}</h1>
      <p className="text-slate-600 mb-8">{message}</p>
      <nav className="flex flex-wrap justify-center gap-3 text-sm">
        <Link to="/" className="btn-primary px-5 py-2.5 min-h-[44px] inline-flex items-center">
          Home
        </Link>
        <Link to="/courses/ioai" className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 min-h-[44px] inline-flex items-center">
          AI Courses
        </Link>
        <Link to="/labs" className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 min-h-[44px] inline-flex items-center">
          AI Labs
        </Link>
        <Link to="/news" className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 min-h-[44px] inline-flex items-center">
          News
        </Link>
      </nav>
    </PageContent>
  )
}

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PORTFOLIO_CATEGORIES, STUDENT_PORTFOLIO } from '../config/showcasePortfolio'
import { SHOWCASE_PORTAL } from '../config/showcasePortal'

/**
 * Visual portfolio grid — emphasises student work over text-only cases.
 */
export default function StudentPortfolioGallery({ compact = false, limit }) {
  const [cat, setCat] = useState('all')

  const items = STUDENT_PORTFOLIO.filter((p) => cat === 'all' || p.category === cat).slice(
    0,
    limit ?? undefined
  )

  return (
    <section aria-label="Student portfolio gallery">
      {!compact && (
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4">
          <div>
            <h2 className="section-title mb-1">{SHOWCASE_PORTAL.galleryTitle}</h2>
            <p className="text-sm text-slate-600">{SHOWCASE_PORTAL.gallerySubtitle}</p>
          </div>
          <Link to="/showcase/works" className="text-sm font-semibold text-primary hover:underline shrink-0">
            {SHOWCASE_PORTAL.viewAllWorks}
          </Link>
        </div>
      )}

      <div className="flex gap-2 flex-wrap mb-4 overflow-x-auto pb-1">
        {PORTFOLIO_CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCat(c.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition ${
              cat === c.id ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div
        className={`grid gap-4 ${
          compact ? 'grid-cols-2 sm:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-3'
        }`}
      >
        {items.map((work) => (
          <Link
            key={work.id}
            to={work.link}
            className="group card overflow-hidden p-0 hover:shadow-lg hover:border-primary/30 transition"
          >
            <div
              className={`aspect-[4/3] bg-gradient-to-br ${work.gradient} flex flex-col items-center justify-center relative`}
            >
              <span className="text-5xl drop-shadow-lg group-hover:scale-110 transition-transform">
                {work.emoji}
              </span>
              <span className="absolute top-2 left-2 text-[10px] font-bold bg-white/90 text-slate-800 px-2 py-0.5 rounded-full">
                {work.track}
              </span>
              <span className="absolute bottom-2 right-2 text-[10px] text-white/90 font-medium">
                {work.year}
              </span>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-bingo-dark text-sm leading-snug group-hover:text-primary transition">
                {work.title}
              </h3>
              <p className="text-xs text-slate-500 mt-1">{work.student}</p>
              <p className="text-xs text-slate-600 mt-2 line-clamp-2">{work.blurb}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {work.tags.map((t) => (
                  <span
                    key={t}
                    className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

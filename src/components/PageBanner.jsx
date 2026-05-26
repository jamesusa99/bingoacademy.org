import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'

/**
 * Full-viewport-width page banner. Content uses fluid horizontal padding;
 * safe-area aware for notched phones.
 */
export default function PageBanner({
  slides,
  eyebrow,
  title,
  subtitle,
  children,
  gradient = 'from-primary/25 via-cyan-50 to-sky-100',
  autoPlayMs = 6000,
}) {
  const [idx, setIdx] = useState(0)
  const list = slides?.length ? slides : null
  const count = list?.length ?? 0

  const next = useCallback(() => {
    if (!count) return
    setIdx((i) => (i + 1) % count)
  }, [count])

  useEffect(() => {
    if (!autoPlayMs || count < 2) return
    const t = setInterval(next, autoPlayMs)
    return () => clearInterval(t)
  }, [autoPlayMs, count, next])

  const slide = list?.[idx]

  const slideCtas = slide ? (
    <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center lg:justify-start gap-3">
      {slide.href ? (
        <Link to={slide.href} className="btn-primary px-6 py-3 text-sm font-semibold min-h-[44px] w-full sm:w-auto">
          {slide.ctaLabel} →
        </Link>
      ) : slide.onCta ? (
        <button
          type="button"
          onClick={slide.onCta}
          className="btn-primary px-6 py-3 text-sm font-semibold min-h-[44px] w-full sm:w-auto"
        >
          {slide.ctaLabel} →
        </button>
      ) : null}
      {slide.secondaryHref ? (
        <Link
          to={slide.secondaryHref}
          className="px-6 py-3 text-sm font-semibold rounded-xl border-2 border-primary text-primary hover:bg-primary/5 transition min-h-[44px] w-full sm:w-auto text-center"
        >
          {slide.secondaryLabel}
        </Link>
      ) : slide.onCtaSecondary && slide.secondaryLabel ? (
        <button
          type="button"
          onClick={slide.onCtaSecondary}
          className="px-6 py-3 text-sm font-semibold rounded-xl border-2 border-primary text-primary hover:bg-primary/5 transition min-h-[44px] w-full sm:w-auto"
        >
          {slide.secondaryLabel}
        </button>
      ) : null}
    </div>
  ) : null

  const slideDots =
    count > 1 && slide ? (
      <div className="flex items-center justify-center lg:justify-start gap-2 mt-6" role="tablist" aria-label="Banner slides">
        {list.map((s, i) => (
          <button
            key={s.id ?? i}
            type="button"
            role="tab"
            aria-selected={i === idx}
            aria-label={`Slide ${i + 1}`}
            onClick={() => setIdx(i)}
            className={`banner-dot min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full transition ${
              i === idx ? 'opacity-100' : 'opacity-50 hover:opacity-80'
            }`}
          >
            <span
              className={`block rounded-full transition-all ${i === idx ? 'w-8 h-2.5 bg-primary' : 'w-2.5 h-2.5 bg-slate-400'}`}
            />
          </button>
        ))}
      </div>
    ) : null

  return (
    <section
      className={`page-banner w-full bg-gradient-to-br ${slide?.gradient ?? gradient} border-b border-cyan-500/10`}
      aria-label={title || slide?.title || 'Page banner'}
    >
      <div className="page-banner-inner w-full">
        {list ? (
          slide.wideSubtitle ? (
            <div className="flex w-full flex-col gap-5">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-10">
                <div className="flex-1 min-w-0 text-center lg:text-left">
                  {slide.eyebrow && (
                    <p className="text-xs sm:text-sm font-bold tracking-widest text-primary uppercase mb-2">
                      {slide.eyebrow}
                    </p>
                  )}
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.75rem] font-bold text-bingo-dark leading-tight">
                    {slide.title}
                  </h1>
                </div>
                <div className="flex shrink-0 justify-center lg:justify-end items-center">
                  <span className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl select-none" aria-hidden>
                    {slide.icon}
                  </span>
                </div>
              </div>
              {slide.subtitle && (
                <p className="w-full max-w-none text-slate-600 text-sm sm:text-base md:text-lg leading-relaxed text-center lg:text-left">
                  {slide.subtitle}
                </p>
              )}
              {slideCtas}
              {slideDots}
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-10">
              <div className="flex-1 min-w-0 text-center lg:text-left">
                {slide.eyebrow && (
                  <p className="text-xs sm:text-sm font-bold tracking-widest text-primary uppercase mb-2">
                    {slide.eyebrow}
                  </p>
                )}
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.75rem] font-bold text-bingo-dark leading-tight mb-3">
                  {slide.title}
                </h1>
                {slide.subtitle && (
                  <p className="text-slate-600 text-sm sm:text-base md:text-lg max-w-3xl mx-auto lg:mx-0 mb-5">
                    {slide.subtitle}
                  </p>
                )}
                {slideCtas}
                {slideDots}
              </div>
              <div className="flex shrink-0 justify-center lg:justify-end items-center">
                <span className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl select-none" aria-hidden>
                  {slide.icon}
                </span>
              </div>
            </div>
          )
        ) : (
          <div className="text-center lg:text-left max-w-4xl mx-auto lg:mx-0">
            {eyebrow && (
              <p className="text-xs sm:text-sm font-bold tracking-widest text-primary uppercase mb-2">{eyebrow}</p>
            )}
            {title && (
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-bingo-dark leading-tight mb-3">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-slate-600 text-sm sm:text-base md:text-lg mb-5">{subtitle}</p>
            )}
            {children}
          </div>
        )}
      </div>
    </section>
  )
}

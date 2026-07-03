import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { programPath } from '../../config/programs'
import { HOME_HERO } from '../../config/homeHero'
import { coverUrlForHomeHeroProgram, visibleHomeHeroPrograms } from '../../config/homeHeroPrograms'
import { adaptiveCountGridClass } from '../../config/productLineVisibility'
import { useHomeHeroPrograms } from '../../hooks/useHomeHeroPrograms'
import { useHomeHeroVideo } from '../../hooks/useHomeHeroVideo'
import { useProductLineVisibility } from '../../contexts/ProductLineVisibilityContext'
import HomeUserEntry from './HomeUserEntry'
import HomeIoaiStagePackages from './HomeIoaiStagePackages'
import HomeHeroVideoBackdrop from './HomeHeroVideoBackdrop'

function PathCard({ program, coverUrl = '' }) {
  const accent =
    program.lineId === 'ioai'
      ? 'border-amber-200/80 hover:border-amber-400 bg-gradient-to-br from-amber-50 to-orange-50/80'
      : program.lineId === 'k12'
        ? 'border-violet-200/80 hover:border-violet-400 bg-gradient-to-br from-violet-50 to-purple-50/80'
        : 'border-cyan-200/80 hover:border-cyan-400 bg-gradient-to-br from-cyan-50 to-sky-50/80'

  const hasCover = Boolean(coverUrl?.trim())

  return (
    <Link
      to={programPath(program.slug)}
      className={`card block overflow-hidden border-2 transition hover:shadow-lg group min-h-[44px] ${accent} ${
        hasCover ? 'p-0' : 'p-5 sm:p-6'
      }`}
    >
      {hasCover ? (
        <div className="aspect-[5/3] w-full bg-slate-100 overflow-hidden">
          <img
            src={coverUrl.trim()}
            alt=""
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </div>
      ) : (
        <span className="text-3xl sm:text-4xl" aria-hidden>
          {program.icon}
        </span>
      )}
      <div className={hasCover ? 'p-5 sm:p-6 pt-4' : ''}>
        <h3 className="font-bold text-bingo-dark text-lg group-hover:text-primary transition">
          {program.title}
        </h3>
        <p className="text-sm text-slate-600 mt-1">{program.audience}</p>
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary mt-4">
          {program.cta} <span aria-hidden>→</span>
        </span>
      </div>
    </Link>
  )
}

export default function HomeHero() {
  const { visiblePrograms } = useProductLineVisibility()
  const { programs: heroPrograms } = useHomeHeroPrograms()
  const { video } = useHomeHeroVideo()
  const heroPathPrograms = useMemo(
    () => visibleHomeHeroPrograms(visiblePrograms, heroPrograms),
    [visiblePrograms, heroPrograms]
  )
  const programCount = heroPathPrograms.length
  const gridClass = adaptiveCountGridClass(programCount)

  return (
    <section id="get-started" className="relative w-full overflow-hidden border-b border-cyan-500/10 text-white">
      {/* ── Golden first screen ───────────────────────────────────── */}
      <div className="relative min-h-[min(88vh,820px)] flex items-center">
        <HomeHeroVideoBackdrop videoUrl={video.videoUrl} posterUrl={video.posterUrl} />
        <div className="absolute inset-0 opacity-40 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-500/15 via-transparent to-transparent" />

        <div className="page-content relative z-10 w-full py-16 sm:py-20 lg:py-24">
          <div className="max-w-3xl">
            <p className="text-xs font-bold tracking-[0.2em] text-cyan-400 uppercase mb-4">
              {HOME_HERO.eyebrow}
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-black tracking-tight leading-[1.08] mb-5">
              {HOME_HERO.headline}
              <span className="block mt-1 bg-gradient-to-r from-cyan-200 via-white to-emerald-200 bg-clip-text text-transparent">
                {HOME_HERO.headlineAccent}
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-200 font-medium leading-relaxed max-w-2xl">
              {HOME_HERO.subtitle}
            </p>

            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
              <Link
                to={HOME_HERO.ctaPrimary.to}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-900 text-base sm:text-lg font-bold shadow-lg shadow-cyan-500/30 transition min-h-[52px]"
              >
                {HOME_HERO.ctaPrimary.label}
                <ArrowRight className="w-5 h-5 shrink-0" aria-hidden />
              </Link>
              <Link
                to={HOME_HERO.ctaSecondary.to}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border-2 border-white/35 hover:border-cyan-400/60 hover:bg-white/5 text-white text-base sm:text-lg font-bold transition min-h-[52px]"
              >
                {HOME_HERO.ctaSecondary.label}
              </Link>
            </div>
            <p className="mt-3 text-xs sm:text-sm text-slate-400">{HOME_HERO.ctaHint}</p>
          </div>
        </div>
      </div>

      {/* ── Below the fold ────────────────────────────────────────── */}
      <div className="relative bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]">
        <div className="page-content relative pb-12 sm:pb-14 lg:pb-16 pt-10 sm:pt-12">
          {programCount > 1 ? (
            <div className={`${gridClass} mb-10 sm:mb-12`}>
              {heroPathPrograms.map((p) => (
                <PathCard
                  key={p.slug}
                  program={p}
                  coverUrl={coverUrlForHomeHeroProgram(heroPrograms, p.slug)}
                />
              ))}
            </div>
          ) : null}

          <HomeIoaiStagePackages />

          <div className="mt-8 sm:mt-10">
            <HomeUserEntry />
          </div>
        </div>
      </div>
    </section>
  )
}

import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { programPath } from '../../config/programs'
import { coverUrlForHomeHeroProgram, visibleHomeHeroPrograms } from '../../config/homeHeroPrograms'
import { adaptiveCountGridClass } from '../../config/productLineVisibility'
import { useHomeHeroPrograms } from '../../hooks/useHomeHeroPrograms'
import { useProductLineVisibility } from '../../contexts/ProductLineVisibilityContext'
import HomeUserEntry from './HomeUserEntry'
import HomeIoaiStagePackages from './HomeIoaiStagePackages'

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
  const heroPathPrograms = useMemo(
    () => visibleHomeHeroPrograms(visiblePrograms, heroPrograms),
    [visiblePrograms, heroPrograms]
  )
  const programCount = heroPathPrograms.length
  const gridClass = adaptiveCountGridClass(programCount)

  return (
    <section id="get-started" className="relative w-full overflow-hidden border-b border-cyan-500/10 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white">
      <div className="absolute inset-0 opacity-30 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-500/20 via-transparent to-transparent" />
      <div className="page-content relative pt-5 sm:pt-6 lg:pt-8 pb-12 sm:pb-14 lg:pb-16">
        <div className="max-w-3xl mx-auto text-center mb-10 sm:mb-12">
          <p className="text-xs font-bold tracking-[0.2em] text-cyan-400 uppercase mb-3">Bingo AI Academy</p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-4">Learn AI by Doing</h1>
          <p className="text-lg sm:text-xl text-slate-300 font-medium">From Curiosity to Certified Outcomes</p>
        </div>

        {programCount > 0 ? (
        <div className={gridClass}>
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

        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/exploration"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-100 hover:bg-cyan-500/30 transition text-sm font-semibold min-h-[44px]"
          >
            <span>🧪</span>
            Try AI Exploration Lab — Free, No Sign-up
          </Link>
        </div>
      </div>
    </section>
  )
}

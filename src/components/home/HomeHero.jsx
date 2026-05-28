import { Link } from 'react-router-dom'
import { PROGRAM_PATH_CARDS } from '../../config/programs'

const ACCENT = {
  cyan: 'border-cyan-200/80 hover:border-cyan-400 bg-gradient-to-br from-cyan-50 to-white',
  amber: 'border-amber-200/80 hover:border-amber-400 bg-gradient-to-br from-amber-50 to-white',
  violet: 'border-violet-200/80 hover:border-violet-400 bg-gradient-to-br from-violet-50 to-white',
}

function PathCard({ card }) {
  return (
    <Link
      to={card.href}
      className={`card p-5 sm:p-6 border-2 transition hover:shadow-lg min-h-[44px] flex flex-col ${ACCENT[card.accent]}`}
    >
      <span className="text-3xl mb-3">{card.icon}</span>
      <h3 className="font-bold text-bingo-dark text-lg">{card.title}</h3>
      <p className="text-sm text-slate-600 mt-1 flex-1">{card.desc}</p>
      <span className="mt-4 text-sm font-semibold text-primary">{card.cta} →</span>
    </Link>
  )
}

export default function HomeHero() {
  return (
    <section className="w-full border-b border-cyan-500/10 bg-gradient-to-b from-slate-50 via-white to-white">
      <div className="page-content py-12 sm:py-16 lg:py-20">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <p className="text-xs font-bold tracking-widest text-primary uppercase mb-3">Bingo AI Academy</p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-bingo-dark leading-tight mb-4">
            Learn AI by Doing
          </h1>
          <p className="text-lg sm:text-xl text-slate-600">From curiosity to certified outcomes</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 sm:gap-5 mb-8">
          {PROGRAM_PATH_CARDS.map((card) => (
            <PathCard key={card.slug} card={card} />
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-center">
          <Link
            to="/exploration"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 transition shadow-md min-h-[44px]"
          >
            <span>🧪</span>
            Try AI Exploration Lab — Free, no sign-up
          </Link>
          <Link to="/compare" className="text-sm text-slate-600 hover:text-primary font-medium">
            Compare programs →
          </Link>
        </div>
      </div>
    </section>
  )
}

import { Link } from 'react-router-dom'
import PageMeta from '../components/PageMeta'
import PageContent from '../components/PageContent'
import { PAGE_SEO } from '../config/programs'
import { LAB_CATEGORIES, EXPLORATION_EXPERIMENTS } from '../config/explorationLab'

export default function Exploration() {
  const popular = EXPLORATION_EXPERIMENTS.slice(0, 3)

  return (
    <div className="w-full">
      <PageMeta title={PAGE_SEO.lab.title} description={PAGE_SEO.lab.description} />

      <section className="bg-gradient-to-br from-violet-600 via-violet-700 to-indigo-800 text-white">
        <PageContent className="py-14 sm:py-20 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-violet-200 mb-3">Free · No sign-up</p>
          <h1 className="text-3xl sm:text-4xl font-black mb-4">🧪 AI Exploration Lab</h1>
          <p className="text-lg text-violet-100 max-w-xl mx-auto mb-8">
            Try AI hands-on in your browser — computer vision, NLP, games, and generative experiments.
          </p>
          <Link
            to="/lab#experiments"
            className="inline-flex px-8 py-3 rounded-xl bg-white text-violet-800 font-semibold hover:bg-violet-50 transition min-h-[44px] items-center"
          >
            Start experimenting →
          </Link>
        </PageContent>
      </section>

      <PageContent className="py-10 sm:py-12">
        <section className="mb-12">
          <h2 className="section-title mb-4">Experiment categories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {LAB_CATEGORIES.map((cat) => {
              const count = EXPLORATION_EXPERIMENTS.filter((e) => e.category === cat.id).length
              return (
                <Link
                  key={cat.id}
                  to={`/lab#experiments`}
                  className="card p-4 text-center hover:border-violet-300 transition"
                >
                  <span className="text-2xl">{cat.icon}</span>
                  <p className="font-semibold text-sm text-bingo-dark mt-2">{cat.label}</p>
                  <p className="text-xs text-slate-500">{count} experiments</p>
                </Link>
              )
            })}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="section-title mb-4">Popular experiments</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {popular.map((exp) => (
              <Link
                key={exp.id}
                to={exp.playPath}
                className="card p-5 hover:shadow-md hover:border-primary/30 transition"
              >
                <span className="text-2xl">{exp.emoji}</span>
                <h3 className="font-semibold text-bingo-dark mt-2">{exp.title}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{exp.subtitle}</p>
                <span className="text-xs text-slate-400">{exp.duration} · {exp.difficulty}</span>
                <span className="text-xs text-primary font-medium mt-2 inline-block">Try now →</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="card p-8 sm:p-10 bg-gradient-to-r from-cyan-50 to-violet-50 text-center">
          <h2 className="text-xl font-bold text-bingo-dark mb-2">Enjoyed the lab?</h2>
          <p className="text-slate-600 mb-6">Unlock 50+ labs and course-aligned projects with a free account.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/register" className="btn-primary px-6 py-3 text-sm min-h-[44px]">
              Create free account →
            </Link>
            <Link to="/courses" className="px-6 py-3 rounded-xl border border-slate-300 text-sm font-medium min-h-[44px] inline-flex items-center">
              Browse courses
            </Link>
          </div>
        </section>
      </PageContent>
    </div>
  )
}

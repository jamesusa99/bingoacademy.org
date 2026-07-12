import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import PageBanner from '../components/PageBanner'
import PageContent from '../components/PageContent'
import PageMeta from '../components/PageMeta'
import ExperimentCard from '../components/lab/ExperimentCard'
import ExplorationLeadMagnet from '../components/plg/ExplorationLeadMagnet'
import {
  LAB_VALUE_PROPS,
  LAB_UX_PRINCIPLES,
  LAB_TECH_STACK,
  LAB_CATEGORIES,
  EXPLORATION_EXPERIMENTS,
  BADGE_STORAGE_KEY,
  getExperimentsByCategory,
} from '../config/explorationLab'
import { PAGE_SEO } from '../config/programs'

function scrollToExperiments() {
  document.getElementById('experiments')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function loadBadges() {
  try {
    const raw = localStorage.getItem(BADGE_STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export default function AIExploration() {
  const [badges, setBadges] = useState(loadBadges)
  const [activeCategory, setActiveCategory] = useState('all')

  const filteredExperiments = useMemo(() => {
    if (activeCategory === 'all') return EXPLORATION_EXPERIMENTS
    return getExperimentsByCategory(activeCategory)
  }, [activeCategory])

  const unlockedBadgeDetails = useMemo(
    () => EXPLORATION_EXPERIMENTS.filter((e) => badges.includes(e.badge.id)).map((e) => e.badge),
    [badges]
  )

  return (
    <div className="w-full">
      <PageMeta title={PAGE_SEO.exploration.title} description={PAGE_SEO.exploration.description} />

      <PageBanner
        slides={[
          {
            id: 'exploration',
            gradient: 'from-violet-500/20 via-cyan-50 to-sky-100',
            icon: '🧭',
            eyebrow: 'AI Exploration',
            title: 'Free Browser Games — Play to Understand AI',
            subtitle:
              `${EXPLORATION_EXPERIMENTS.length} gamified experiments in computer vision, NLP, and machine learning. No sign-up, no course enrollment — completely separate from product labs and kits.`,
            wideSubtitle: true,
            ctaLabel: 'Play AI Cyber Tennis',
            href: '/exploration/cyber-tennis',
            secondaryLabel: 'Browse all experiments',
            onCtaSecondary: scrollToExperiments,
          },
        ]}
        autoPlayMs={0}
      />

      <PageContent className="py-6 sm:py-10">
        {unlockedBadgeDetails.length > 0 && (
          <section className="mb-8 card p-5 border-amber-200/60 bg-amber-50/30">
            <h3 className="text-sm font-bold text-bingo-dark mb-3">Your explorer badges</h3>
            <div className="flex flex-wrap gap-3">
              {unlockedBadgeDetails.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center gap-2 bg-white rounded-xl px-4 py-2 border border-amber-200/60 shadow-sm"
                >
                  <span className="text-2xl">{b.icon}</span>
                  <span className="text-sm font-semibold text-bingo-dark">{b.name}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <ExplorationLeadMagnet />

        <section id="experiments" className="scroll-mt-24 mb-12">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="section-title mb-1">Experiments</h2>
              <p className="text-sm text-slate-600 max-w-xl">
                Open any game below — camera, canvas, or chat — and play in-tab.
              </p>
            </div>
          </div>

          <div
            className="flex gap-2 mb-6 overflow-x-auto pb-1 -mx-1 px-1"
            style={{ WebkitOverflowScrolling: 'touch' }}
            role="tablist"
            aria-label="Experiment categories"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeCategory === 'all'}
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold shrink-0 min-h-[44px] transition ${
                activeCategory === 'all' ? 'bg-primary text-white shadow' : 'bg-slate-100 text-slate-600'
              }`}
            >
              All · {EXPLORATION_EXPERIMENTS.length}
            </button>
            {LAB_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={activeCategory === cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold shrink-0 min-h-[44px] transition ${
                  activeCategory === cat.id ? 'bg-primary text-white shadow' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>

          {activeCategory === 'all' ? (
            LAB_CATEGORIES.map((cat) => {
              const items = getExperimentsByCategory(cat.id)
              return (
                <div key={cat.id} className="mb-10">
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4 flex items-center gap-2">
                    <span>{cat.icon}</span> {cat.label}
                  </h3>
                  <div className="grid md:grid-cols-2 gap-5">
                    {items.map((exp) => (
                      <ExperimentCard
                        key={exp.id}
                        experiment={exp}
                        onBadgeUnlock={() => setBadges(loadBadges())}
                      />
                    ))}
                  </div>
                </div>
              )
            })
          ) : (
            <div className="grid md:grid-cols-2 gap-5">
              {filteredExperiments.map((exp) => (
                <ExperimentCard
                  key={exp.id}
                  experiment={exp}
                  onBadgeUnlock={() => setBadges(loadBadges())}
                />
              ))}
            </div>
          )}
        </section>

        <section className="mb-12 card p-6 border-primary/20 bg-primary/5">
          <h2 className="font-bold text-bingo-dark mb-2">Lab knowledge base</h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            Each experiment includes learning goals, steps, expected results, common errors, and safety notes — crawlable
            content for students and generative search, not just a play button.
          </p>
          <Link to="/guides" className="text-sm font-semibold text-primary hover:underline">
            See all knowledge guides (parents, IOAI, schools) →
          </Link>
        </section>

        <section
          id="learning-loop"
          className="scroll-mt-24 mb-6 card p-6 border-dashed border-primary/30 bg-primary/5"
        >
          <h3 className="font-bold text-bingo-dark mb-4">The learning loop</h3>
          <ol className="grid sm:grid-cols-3 gap-4 text-sm mb-6">
            {[
              { step: '1', title: 'Play', desc: 'Camera, canvas, or chat — no install step.' },
              { step: '2', title: 'Watch', desc: 'Dashboard shows weights, confidence, reward live.' },
              { step: '3', title: 'Unlock', desc: 'Beat the level → digital badge.' },
            ].map((s) => (
              <li key={s.step} className="flex gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-white text-xs font-bold">
                  {s.step}
                </span>
                <div>
                  <p className="font-semibold text-bingo-dark">{s.title}</p>
                  <p className="text-xs text-slate-600 mt-0.5">{s.desc}</p>
                </div>
              </li>
            ))}
          </ol>
          <button type="button" onClick={scrollToExperiments} className="btn-primary px-6 py-2.5 text-sm min-h-[44px]">
            Jump to experiments →
          </button>
        </section>

        <section className="mt-10 pt-10 border-t border-slate-200/80">
          <div className="grid sm:grid-cols-3 gap-4 mb-4">
            {LAB_VALUE_PROPS.map((p) => (
              <div
                key={p.id}
                className="card p-5 text-center bg-gradient-to-b from-white to-cyan-50/30 border-cyan-200/40"
              >
                <div className="text-3xl mb-2">{p.icon}</div>
                <h2 className="font-bold text-bingo-dark text-sm">{p.title}</h2>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
          <div className="mb-10 flex flex-wrap gap-2 justify-center">
            {LAB_TECH_STACK.map((t) => (
              <span key={t} className="text-[10px] font-mono bg-slate-900 text-cyan-300 px-2.5 py-1 rounded-full">
                {t}
              </span>
            ))}
          </div>
          <section className="card p-6 sm:p-8 bg-gradient-to-r from-bingo-dark to-slate-800 text-white border-0">
            <h2 className="text-lg font-bold mb-1">Cross-platform game design</h2>
            <p className="text-sm text-slate-300 mb-6 max-w-2xl">
              Touch-first on iPad, precise on desktop, with live science dashboards under every move.
            </p>
            <div className="grid sm:grid-cols-3 gap-4">
              {LAB_UX_PRINCIPLES.map((u) => (
                <div key={u.title} className="rounded-xl bg-white/5 border border-white/10 p-4">
                  <div className="text-2xl mb-2">{u.icon}</div>
                  <p className="font-semibold text-sm">{u.title}</p>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{u.desc}</p>
                </div>
              ))}
            </div>
          </section>
        </section>
      </PageContent>
    </div>
  )
}

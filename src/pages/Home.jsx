import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import HomeHero from '../components/home/HomeHero'
import HomeTrustAuthority from '../components/home/HomeTrustAuthority'
import HomeSeoSection from '../components/home/HomeSeoSection'
import PageMeta from '../components/PageMeta'
import PageContent from '../components/PageContent'
import { ORG_JSON_LD, PAGE_SEO } from '../config/programs'
import {
  PORTAL_MISSION,
  PORTAL_CORE_ENTRIES,
  PORTAL_LEARNING_PATH,
  PORTAL_COMPETITIONS,
} from '../config/homePortal'
import { lineIdFromHref, adaptiveCountGridClass } from '../config/productLineVisibility'
import { isLabsStorefrontLink } from '../config/labsStorefront'
import { useProductLineVisibility } from '../contexts/ProductLineVisibilityContext'

const ACCENT_RING = {
  cyan: 'hover:border-cyan-300 ring-cyan-100',
  amber: 'hover:border-amber-300 ring-amber-100',
  violet: 'hover:border-violet-300 ring-violet-100',
  slate: 'hover:border-slate-300 ring-slate-100',
  rose: 'hover:border-rose-300 ring-rose-100',
  emerald: 'hover:border-emerald-300 ring-emerald-100',
}

export default function Home() {
  const { isLineVisible } = useProductLineVisibility()

  const coreEntries = useMemo(
    () =>
      PORTAL_CORE_ENTRIES.filter(
        (item) => isLineVisible(lineIdFromHref(item.to)) && isLabsStorefrontLink(item.to)
      ),
    [isLineVisible]
  )

  const competitions = useMemo(
    () => PORTAL_COMPETITIONS.filter((item) => isLineVisible(lineIdFromHref(item.to))),
    [isLineVisible]
  )

  return (
    <div className="w-full">
      <PageMeta
        title={PAGE_SEO.home.title}
        description={PAGE_SEO.home.description}
        keywords={PAGE_SEO.home.keywords}
        jsonLd={ORG_JSON_LD}
      />
      <HomeHero />

      <HomeTrustAuthority showIoaiLink={isLineVisible('ioai')} />

      {/* Mission — brand positioning (bingoacademy.cn hero follow-up) */}
      <section className="w-full border-b border-cyan-500/10 bg-white/80 backdrop-blur-sm">
        <div className="page-content py-10 sm:py-12">
          <div className="max-w-3xl mx-auto text-center mb-8">
            <p className="text-xs font-bold tracking-widest text-primary uppercase mb-2">Our Mission</p>
            <h2 className="text-xl sm:text-2xl font-bold text-bingo-dark mb-3">{PORTAL_MISSION.title}</h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">{PORTAL_MISSION.body}</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {PORTAL_MISSION.pillars.map((p) => (
              <div key={p.label} className="card p-4 sm:p-5 text-center">
                <div className="text-2xl mb-2">{p.icon}</div>
                <div className="font-semibold text-bingo-dark text-sm">{p.label}</div>
                <p className="text-xs text-slate-500 mt-1">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PageContent className="py-8 sm:py-12 lg:py-14">
        {/* Core business entries — classic homepage tile grid */}
        <section className="mb-14">
          <h2 className="section-title mb-1">Explore the Academy</h2>
          <p className="text-slate-500 text-sm mb-6">Courses, competitions, school solutions, mall, achievements, and certification</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            {coreEntries.map((item) => (
              <Link
                key={item.to + item.title}
                to={item.to}
                className={`card p-4 sm:p-5 hover:shadow-md transition ring-1 ring-transparent ${ACCENT_RING[item.accent] ?? ''} min-h-[44px]`}
              >
                <div className="text-2xl mb-2">{item.icon}</div>
                <div className="font-semibold text-bingo-dark text-sm">{item.title}</div>
                <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Authoritative competitions highlight */}
        {competitions.length > 0 ? (
        <section className="mb-14 section-tech rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
            <div>
              <h2 className="section-title mb-1">Authoritative Competitions</h2>
              <p className="text-slate-500 text-sm">IOAI whitelist training and competition-ready outcomes</p>
            </div>
            {isLineVisible('ioai') ? (
            <Link to="/courses?line=ioai" className="text-sm text-primary font-medium hover:underline shrink-0">
              All competition courses →
            </Link>
            ) : null}
          </div>
          <div className={adaptiveCountGridClass(competitions.length)}>
            {competitions.map((c) => (
              <Link key={c.name} to={c.to} className="card p-5 hover:shadow-md hover:border-amber-200/80 transition group">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="text-3xl">{c.icon}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    {c.tag}
                  </span>
                </div>
                <h3 className="font-semibold text-bingo-dark group-hover:text-primary transition">{c.name}</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">{c.desc}</p>
              </Link>
            ))}
          </div>
        </section>
        ) : null}
        <section className="mb-14">
          <h2 className="section-title mb-4">Your Learning Path</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PORTAL_LEARNING_PATH.map((step) => (
              <div key={step.step} className="card p-5 relative overflow-hidden">
                <span className="absolute top-3 right-4 text-3xl font-black text-primary/10">{step.step}</span>
                <div className="text-2xl mb-2">{step.icon}</div>
                <h3 className="font-semibold text-bingo-dark">{step.title}</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="card p-6 sm:p-8 text-center bg-gradient-to-r from-cyan-50 to-sky-50 border-primary/20">
          <h2 className="text-xl font-bold text-bingo-dark mb-2">Start learning today</h2>
          <p className="text-slate-600 text-sm mb-5">
            AI courses and IOAI competition training — complete labs, earn your certificate.
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center">
            <Link to="/courses" className="btn-primary px-6 py-3 text-sm min-h-[44px]">AI Courses</Link>
            <Link to="/cert" className="px-6 py-3 text-sm rounded-xl border border-primary text-primary hover:bg-primary/5 transition min-h-[44px]">
              Certification
            </Link>
            <Link to="/profile" className="px-6 py-3 text-sm rounded-xl border border-slate-300 text-slate-700 hover:bg-white transition min-h-[44px]">
              My Profile
            </Link>
          </div>
        </section>
      </PageContent>

      <HomeSeoSection />
    </div>
  )
}

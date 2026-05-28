import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import ProductLineCard from '../components/ProductLineCard'
import HomeHero from '../components/home/HomeHero'
import PageMeta from '../components/PageMeta'
import PageBanner from '../components/PageBanner'
import PageContent from '../components/PageContent'
import { PAGE_SEO } from '../config/programs'
import {
  PORTAL_BANNER_SLIDES,
  PORTAL_MISSION,
  PORTAL_CORE_ENTRIES,
  PORTAL_LEARNING_PATH,
  PORTAL_COMPETITIONS,
  PORTAL_FEATURED_COURSES,
  PORTAL_TRUST_STATS_FALLBACK,
  PORTAL_TESTIMONIALS_FALLBACK,
  PRODUCT_LINES,
} from '../config/homePortal'

const ACCENT_RING = {
  cyan: 'hover:border-cyan-300 ring-cyan-100',
  amber: 'hover:border-amber-300 ring-amber-100',
  violet: 'hover:border-violet-300 ring-violet-100',
  slate: 'hover:border-slate-300 ring-slate-100',
  rose: 'hover:border-rose-300 ring-rose-100',
  emerald: 'hover:border-emerald-300 ring-emerald-100',
}

export default function Home() {
  const [trustStats, setTrustStats] = useState(PORTAL_TRUST_STATS_FALLBACK)
  const [testimonials, setTestimonials] = useState(PORTAL_TESTIMONIALS_FALLBACK)

  useEffect(() => {
    supabase.from('home_stats').select('*').order('sort_order').then(({ data }) => {
      if (data?.length) setTrustStats(data.map((r) => ({ icon: r.icon, value: r.value, label: r.label })))
    })
    supabase.from('home_testimonials').select('*').order('sort_order').then(({ data }) => {
      if (data?.length) setTestimonials(data.map((r) => ({ quote: r.quote, name: r.name, role: r.role, stars: r.stars ?? 5 })))
    })
  }, [])

  return (
    <div className="w-full">
      <PageMeta title={PAGE_SEO.home.title} description={PAGE_SEO.home.description} />
      <HomeHero />
      <PageBanner slides={PORTAL_BANNER_SLIDES} autoPlayMs={6500} />

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
            {PORTAL_CORE_ENTRIES.map((item) => (
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

        {/* Three product lines */}
        <section className="mb-14">
          <h2 className="section-title mb-1">Three Product Lines</h2>
          <p className="text-slate-500 text-sm mb-6">Choose the path that fits your learning goal</p>
          <div className="hidden md:grid md:grid-cols-3 gap-5">
            {PRODUCT_LINES.map((line) => (
              <ProductLineCard key={line.id} line={line} />
            ))}
          </div>
          <div className="md:hidden scroll-strip">
            {PRODUCT_LINES.map((line) => (
              <div key={line.id} className="w-[min(85vw,320px)]">
                <ProductLineCard line={line} compact />
              </div>
            ))}
          </div>
        </section>

        {/* Authoritative competitions highlight */}
        <section className="mb-14 section-tech rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
            <div>
              <h2 className="section-title mb-1">Authoritative Competitions</h2>
              <p className="text-slate-500 text-sm">IOAI whitelist training and competition-ready outcomes</p>
            </div>
            <Link to="/courses?line=ioai" className="text-sm text-primary font-medium hover:underline shrink-0">
              All competition courses →
            </Link>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {PORTAL_COMPETITIONS.map((c) => (
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

        {/* Learning pathway */}
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

        {/* Featured courses */}
        <section className="mb-14">
          <div className="flex items-center justify-between mb-4 gap-2">
            <div>
              <h2 className="section-title mb-0">Featured Courses</h2>
              <p className="text-slate-500 text-sm mt-1">Popular picks across all product lines</p>
            </div>
            <Link to="/courses" className="text-sm text-primary hover:underline shrink-0">View catalogue →</Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PORTAL_FEATURED_COURSES.map((course) => (
              <Link
                key={course.id}
                to={`/courses/detail/${course.id}`}
                className="card p-5 hover:shadow-md hover:border-primary/30 transition flex flex-col"
              >
                <span className="text-[10px] font-bold uppercase tracking-wide text-primary mb-2">{course.badge}</span>
                <h3 className="font-semibold text-bingo-dark text-sm flex-1">{course.name}</h3>
                <p className="text-xs text-slate-500 mt-2 line-clamp-2">{course.desc}</p>
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-semibold text-primary">{course.price}</span>
                  <span className="text-slate-400">{course.hours}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Quick nav */}
        <section className="mb-14">
          <h2 className="section-title mb-4">Quick Access</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[
              { icon: '📚', title: 'AI Courses', desc: 'Browse all product lines', to: '/courses' },
              { icon: '🏅', title: 'Achievements', desc: 'Student work & awards', to: '/showcase' },
              { icon: '📜', title: 'Certification', desc: 'Ability certificates', to: '/cert' },
              { icon: '🛒', title: 'AI Mall', desc: 'Books, kits & materials', to: '/mall' },
            ].map((item) => (
              <Link key={item.to} to={item.to} className="card p-4 sm:p-5 hover:shadow-md hover:border-primary/30 transition text-center min-h-[44px]">
                <div className="text-2xl mb-2">{item.icon}</div>
                <div className="font-semibold text-bingo-dark text-sm">{item.title}</div>
                <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Trust + testimonials */}
        <section className="mb-14">
          <h2 className="section-title mb-4">Why Bingo AI Academy</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-8">
            {trustStats.map((s, i) => (
              <div key={i} className="card p-4 sm:p-5 text-center">
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="text-lg sm:text-xl font-bold text-primary">{s.value}</div>
                <div className="text-xs text-slate-600 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {testimonials.map((t, i) => (
              <div key={i} className="card p-5 flex flex-col">
                <div className="text-yellow-400 text-sm mb-2">{'★'.repeat(t.stars)}</div>
                <p className="text-slate-600 text-sm leading-relaxed flex-1">&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
                  <span className="font-medium text-slate-700">{t.name}</span> · {t.role}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Achievements preview */}
        <section className="mb-14">
          <div className="flex items-center justify-between mb-4 gap-2">
            <h2 className="section-title mb-0">Student Achievements</h2>
            <Link to="/showcase" className="text-sm text-primary hover:underline shrink-0">View all →</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {['IOAI Competition', 'AI Literacy Project', 'K12 Lab Work', 'Certified Learner'].map((label, i) => (
              <Link key={i} to="/showcase" className="card p-4 text-center hover:shadow-md hover:border-primary/30 transition">
                <div className="rounded-xl bg-gradient-to-br from-primary/10 to-cyan-50 h-14 sm:h-16 flex items-center justify-center text-2xl mb-2">
                  {['🏆', '🤖', '🔬', '📜'][i]}
                </div>
                <p className="text-xs font-medium text-slate-700">{label}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="card p-6 sm:p-8 text-center bg-gradient-to-r from-cyan-50 to-sky-50 border-primary/20">
          <h2 className="text-xl font-bold text-bingo-dark mb-2">Start learning today</h2>
          <p className="text-slate-600 text-sm mb-5">
            AI courses and authoritative competitions — pick a product line, complete labs, earn your certificate.
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
    </div>
  )
}

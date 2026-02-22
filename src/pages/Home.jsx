import { useState } from 'react'
import { Link } from 'react-router-dom'

// ─── Data ──────────────────────────────────────────────────────────

const HERO_BADGES = [
  { icon: '🎓', text: 'Official Competition Partner' },
  { icon: '🏫', text: 'STEM Admissions Guidance Base' },
  { icon: '👥', text: '10,000+ Students Served' },
  { icon: '🏆', text: '92% Competition Award Rate' },
]

const PAIN_POINTS = [
  {
    icon: '📚',
    tag: 'No Structured Path',
    problem: 'No AI curriculum at school — students don\'t know where to start or how to progress systematically.',
    solutionTitle: 'A complete tiered curriculum from literacy to college-track achievement',
    solutions: [
      { label: 'Advanced Track · Ages 14–18', desc: 'STEM specialty admissions, college-level AI research', to: '/courses?type=exam' },
      { label: 'Intermediate Track · Ages 11–14', desc: 'Applied AI tools, project building, competition prep', to: '/courses?type=contest' },
      { label: 'Foundations Track · Ages 8–11', desc: 'AI literacy, computational thinking, creativity', to: '/courses?type=literacy' },
    ],
    note: 'Students across 20+ countries · 95% course completion rate',
    cta: 'Free Trial Lesson',
    ctaStyle: 'btn-primary',
    to: '/courses',
  },
  {
    icon: '🏆',
    tag: 'Skills Without Proof',
    problem: 'Students learn AI but have no credentials, awards, or portfolio items to show colleges or employers.',
    solutionTitle: 'Competitions + certificates that make ability visible and college-ready',
    solutions: [
      { label: 'AI Skill Level Certificate', desc: 'Authoritative credential · college admissions boost', to: '/cert' },
      { label: 'International AI Competitions', desc: 'Guided prep · global stage · award rate 92%', to: '/events' },
      { label: 'AI Camp Research Track', desc: 'Publishable projects with certified mentors', to: '/research' },
    ],
    note: '2,000+ students have earned awards and competitive college distinctions',
    cta: 'View Events',
    ctaStyle: 'btn-primary',
    to: '/events',
  },
  {
    icon: '🎨',
    tag: 'Using AI vs. Creating with It',
    problem: 'Students rely on AI tools passively — they lack the depth to build, innovate, and think critically.',
    solutionTitle: '"Learn → Practice → Compete → Create" — turning students into AI makers',
    solutions: [
      { label: 'AI Camp · Maker Studio', desc: 'Offline + online · build your own AI project', to: '/research' },
      { label: 'AI Creative Courses', desc: 'Art / coding / writing combined with AI creation', to: '/courses' },
    ],
    note: '100,000+ original AI student works · 300+ science innovation awards',
    cta: 'View Student Work',
    ctaStyle: 'btn-primary',
    to: '/showcase',
  },
]

const CORE_PRODUCTS_C = [
  { icon: '🌱', title: 'AI Literacy Course', desc: 'Ages 8–11 · Literacy & meta-cognition', to: '/courses?type=literacy' },
  { icon: '🚀', title: 'Advanced Track', desc: 'Ages 14–18 · STEM admissions', to: '/courses?type=exam' },
  { icon: '⛺', title: 'AI Camp', desc: 'Research · Projects · Awards', to: '/research' },
  { icon: '🛒', title: 'AI Mall', desc: 'Tools · Materials · Resources', to: '/mall' },
  { icon: '🏅', title: 'Events Center', desc: 'Competitions · Bootcamps · Certs', to: '/events' },
  { icon: '📜', title: 'Certification', desc: 'Ability certification · Admissions credential', to: '/cert' },
]

const CORE_PRODUCTS_B = [
  { icon: '🎯', title: 'Industry-Education', desc: 'Internships · Employment · School partnerships', to: '/career', internal: true },
  { icon: '🏫', title: 'Institution Empowerment', desc: 'Teacher training · Operations · Brand accreditation', to: '/#/join', internal: false },
  { icon: '⚙️', title: 'OEM Partnership', desc: 'Custom courses · Co-branding · Tech transfer', to: '/#/oem', internal: false },
]

const FLAGSHIP_COURSES = [
  { tag: 'Flagship', title: 'AI Literacy Foundations · Your First Step Toward the Future', desc: 'Ages 8–11 · 8 core AI cognition modules', to: '/courses?type=literacy' },
  { tag: 'AI Camp', title: 'AI AI Camp · Research Track', desc: 'Immersive research experience · real project outcomes', to: '/research' },
  { tag: 'Admissions', title: 'STEM Specialty Track · College Admissions Course', desc: 'Ages 14–18 · aligned with admissions policy', to: '/courses?type=exam' },
]

const FLASH_DEALS = [
  { icon: '⚡', title: 'Flash Sale', desc: 'Limited-time special', to: '/mall?tag=flash' },
  { icon: '👥', title: 'Group Buy', desc: '2+ people · save 50%', to: '/mall?tag=group' },
  { icon: '🎫', title: 'Coupon Center', desc: 'Claim your coupon', to: '/profile' },
  { icon: '💰', title: 'Double Commission', desc: 'Share & earn event', to: '/profile#promo' },
]

const TRUST_STATS = [
  { icon: '🎨', value: '100,000+', label: 'Original AI Student Works', sub: 'Art / coding / writing projects' },
  { icon: '🏅', value: '300+', label: 'Competition Awards', sub: 'Science innovation prizes' },
  { icon: '🎓', value: '2,000+', label: 'College Admissions Results', sub: '100+ students entered top schools in 2024' },
]

const TESTIMONIALS = [
  { quote: 'My son competed in an international AI competition and won first place nationally. The curriculum is genuinely rigorous and the mentors are world-class.', name: 'Parent · New York', role: 'STEM student parent', stars: 5 },
  { quote: 'From knowing nothing about AI to winning a science innovation award — six months of progress that completely changed my college application.', name: 'Student · Grade 11', role: 'AI Camp alumnus', stars: 5 },
  { quote: 'After partnering with Bingo Academy, our school\'s STEM enrolment grew 60%. The curriculum and teacher training support are excellent.', name: 'Ms. Wang · Shenzhen', role: 'Partner institution director', stars: 5 },
]

const TRUST_BADGES = [
  '✓ Official international competition partner',
  '✓ University-affiliated research mentors',
  '✓ STEM college admissions guidance base',
  '✓ Strategic partnerships with leading AI companies',
]

const FREE_RESOURCES = [
  { icon: '📘', title: 'AI Learning Pathway Guide for Students Ages 8–18', type: 'Resource Pack' },
  { icon: '📋', title: 'International AI Competition Strategy + Sample Questions', type: 'Resource Pack' },
  { icon: '📗', title: '10 Practical Methods for Guiding Students in AI Learning', type: 'Resource Pack' },
  { icon: '🎥', title: 'Free Live Class · STEM Admissions Policy Explained', type: 'Live Preview' },
]

// ─── Component ─────────────────────────────────────────────────────

export default function Home() {
  const [email, setEmail] = useState('')
  const [resourceSubmitted, setResourceSubmitted] = useState(false)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* ── Hero ── */}
      <section className="mb-12 rounded-2xl section-tech px-6 py-12 text-center">
        <p className="text-xs font-semibold tracking-widest text-primary uppercase mb-3">AI + Competitions + Full-Chain Education Ecosystem</p>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-bingo-dark leading-tight mb-5">
          Future-Ready AI Education<br className="hidden sm:block" /> for High-Performing Students
        </h1>
        <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto mb-3">
          Bingo AI Academy builds dedicated AI growth paths for students ages 8–18 — so they learn to <strong>use</strong> AI, <strong>think</strong> with AI, and <strong>create</strong> with AI.
        </p>

        {/* CTA rows */}
        <div className="mb-4">
          <p className="text-xs text-slate-400 font-medium mb-2 uppercase tracking-wide">For Students & Families</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/ai-test" className="btn-primary px-5 py-2.5 text-sm">🧠 Free AI Assessment — 3 min →</Link>
            <Link to="/courses" className="px-5 py-2.5 text-sm rounded-xl border border-primary text-primary font-medium hover:bg-primary/5 transition">🎓 Explore Courses →</Link>
          </div>
        </div>
        <div className="mb-8">
          <p className="text-xs text-slate-400 font-medium mb-2 uppercase tracking-wide">For Institutions</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a href="/#/join" className="px-5 py-2.5 text-sm rounded-xl border border-slate-300 text-slate-600 font-medium hover:bg-slate-50 transition">🏫 Institution Partnership — Free Proposal →</a>
          </div>
        </div>

        {/* Badge bar */}
        <div className="flex flex-wrap justify-center gap-3">
          {HERO_BADGES.map((b, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 text-xs font-medium bg-white/80 border border-primary/20 rounded-full px-3 py-1.5 shadow-sm text-slate-700">
              <span>{b.icon}</span>{b.text}
            </span>
          ))}
        </div>
      </section>

      {/* ── Pain Points → Solutions ── */}
      <section className="mb-12">
        <h2 className="section-title mb-1">Every Challenge, Solved</h2>
        <p className="text-slate-500 text-sm mb-6">Each concern has a dedicated solution, proven outcome, and clear action step</p>
        <div className="space-y-6">
          {PAIN_POINTS.map((p, i) => (
            <div key={i} className="card p-6 border-primary/15 hover:shadow-md transition">
              <div className="flex flex-wrap items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl shrink-0">{p.icon}</div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded mb-1.5 inline-block">「{p.tag}」</span>
                  <p className="text-slate-600 text-sm">{p.problem}</p>
                </div>
              </div>
              <h3 className="font-semibold text-bingo-dark mb-3 text-base">{p.solutionTitle}</h3>
              <ul className="space-y-2 mb-4">
                {p.solutions.map((s, j) => (
                  <li key={j}>
                    <Link to={s.to} className="flex items-start gap-2 text-sm hover:text-primary transition group">
                      <span className="text-primary shrink-0 mt-0.5">✓</span>
                      <span>
                        <span className="font-medium">{s.label}</span>
                        <span className="text-slate-400 mx-1">·</span>
                        <span className="text-slate-500 group-hover:text-primary transition">{s.desc} →</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <span className="text-xs text-slate-400">✓ {p.note}</span>
                <Link to={p.to} className={`text-sm px-4 py-1.5 rounded-lg font-medium transition ${p.ctaStyle}`}>{p.cta}</Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── B2B Banner ── */}
      <section className="mb-12 card p-6 bg-gradient-to-r from-slate-700 to-slate-800 text-white border-0">
        <h2 className="text-lg font-bold mb-1">Missing AI curriculum, faculty, or competition resources for your institution?</h2>
        <p className="text-slate-300 text-sm mb-5">Bingo AI Academy's full-chain industry-education partnership — brand, curriculum, faculty, and competitions, all in one.</p>
        <p className="text-xs text-slate-400 mb-4">500+ partner institutions · 100+ franchise partners · Average 60% revenue growth</p>
        <div className="grid sm:grid-cols-3 gap-3">
          <a href="/#/join" className="bg-white/10 hover:bg-white/20 transition rounded-xl p-4 flex flex-col">
            <span className="text-lg mb-1">🏫</span>
            <span className="font-semibold text-sm">Institution Partnership</span>
            <span className="text-xs text-slate-300 mt-1">Accreditation + curriculum + faculty training + operations →</span>
          </a>
          <a href="/#/join" className="bg-white/10 hover:bg-white/20 transition rounded-xl p-4 flex flex-col">
            <span className="text-lg mb-1">🤝</span>
            <span className="font-semibold text-sm">Franchise Partner</span>
            <span className="text-xs text-slate-300 mt-1">Brand licensing + full system support, co-build AI education →</span>
          </a>
          <a href="/#/oem" className="bg-white/10 hover:bg-white/20 transition rounded-xl p-4 flex flex-col">
            <span className="text-lg mb-1">⚙️</span>
            <span className="font-semibold text-sm">OEM Partnership</span>
            <span className="text-xs text-slate-300 mt-1">Custom courses, tools, co-branding, tech transfer →</span>
          </a>
        </div>
        <a href="/#/join" className="mt-4 inline-block text-xs text-slate-300 underline hover:text-white transition">Free consultation — get your partnership proposal →</a>
      </section>

      {/* ── Core Products ── */}
      <section className="mb-12">
        <h2 className="section-title mb-1">Core Programs & Services</h2>
        <p className="text-slate-500 text-sm mb-5">Each program has a clear audience, core value, and action entry</p>

        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">For Students & Families</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {CORE_PRODUCTS_C.map((c, i) => (
            <Link key={i} to={c.to} className="card p-4 text-center hover:shadow-md hover:border-primary/30 transition group">
              <div className="text-2xl mb-2">{c.icon}</div>
              <div className="font-semibold text-primary text-xs group-hover:underline leading-tight">{c.title}</div>
              <div className="text-xs text-slate-500 mt-1">{c.desc}</div>
            </Link>
          ))}
        </div>

        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">For Institutions & Partners</p>
        <div className="grid sm:grid-cols-3 gap-3">
          {CORE_PRODUCTS_B.map((c, i) => (
            c.internal
              ? <Link key={i} to={c.to} className="card p-4 text-center hover:shadow-md hover:border-primary/30 transition group">
                  <div className="text-2xl mb-2">{c.icon}</div>
                  <div className="font-semibold text-primary text-sm group-hover:underline">{c.title}</div>
                  <div className="text-xs text-slate-500 mt-1">{c.desc}</div>
                </Link>
              : <a key={i} href={c.to} className="card p-4 text-center hover:shadow-md hover:border-primary/30 transition group">
                  <div className="text-2xl mb-2">{c.icon}</div>
                  <div className="font-semibold text-primary text-sm group-hover:underline">{c.title}</div>
                  <div className="text-xs text-slate-500 mt-1">{c.desc}</div>
                </a>
          ))}
        </div>
      </section>

      {/* ── Flagship Courses + Flash Deals ── */}
      <section className="mb-12">
        <h2 className="section-title mb-1">Flagship Courses</h2>
        <p className="text-slate-500 text-sm mb-5">Exclusive courses — literacy, research, and admissions, all in one place</p>
        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          {FLAGSHIP_COURSES.map((c, i) => (
            <Link key={i} to={c.to} className="card p-5 hover:shadow-md transition border-primary/20 flex flex-col">
              <span className="text-xs px-2 py-0.5 rounded bg-primary/15 text-primary self-start mb-2">{c.tag}</span>
              <div className="font-semibold text-primary text-sm mb-1">{c.title}</div>
              <p className="text-xs text-slate-500">{c.desc}</p>
            </Link>
          ))}
        </div>

        {/* Flash deals */}
        <div className="card p-5 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200/60">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-base">🔥</span>
            <h3 className="font-semibold text-bingo-dark">Limited-Time Offers</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {FLASH_DEALS.map((d, i) => (
              <Link key={i} to={d.to} className="bg-white rounded-xl p-3 text-center hover:shadow-sm hover:border-amber-300 border border-transparent transition">
                <div className="text-xl mb-1">{d.icon}</div>
                <div className="font-semibold text-sm text-bingo-dark">{d.title}</div>
                <p className="text-xs text-slate-500 mt-0.5">{d.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust & Social Proof ── */}
      <section className="mb-12">
        <h2 className="section-title mb-1">Results You Can Trust</h2>
        <p className="text-slate-500 text-sm mb-6">Data + outcomes + partnerships — every claim backed by evidence</p>

        {/* Big stats */}
        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          {TRUST_STATS.map((s, i) => (
            <div key={i} className="card p-6 text-center hover:shadow-md transition">
              <div className="text-3xl mb-2">{s.icon}</div>
              <div className="text-3xl font-bold text-primary">{s.value}</div>
              <div className="font-semibold text-bingo-dark mt-1">{s.label}</div>
              <p className="text-xs text-slate-500 mt-1">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-3 gap-4 mb-5">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="card p-5 flex flex-col">
              <div className="text-yellow-400 text-sm mb-2">{'★'.repeat(t.stars)}</div>
              <p className="text-slate-600 text-sm leading-relaxed flex-1">"{t.quote}"</p>
              <div className="mt-3 pt-3 border-t border-slate-100">
                <div className="text-sm font-medium text-slate-700">{t.name}</div>
                <div className="text-xs text-slate-400">{t.role}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div className="card p-5 bg-slate-50 border-slate-200">
          <div className="flex flex-wrap justify-center gap-5 text-sm text-slate-600">
            {TRUST_BADGES.map((b, i) => (
              <span key={i} className="flex items-center gap-1.5 text-primary font-medium">{b}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Free Resources ── */}
      <section className="mb-12">
        <h2 className="section-title mb-1">Free Resources — Claim Your Exclusive Materials</h2>
        <p className="text-slate-500 text-sm mb-6">Enter your email to receive high-value AI education guides instantly</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {FREE_RESOURCES.map((r, i) => (
            <div key={i} className="card p-5 hover:shadow-md hover:border-primary/30 transition">
              <div className="text-2xl mb-2">{r.icon}</div>
              <div className="font-medium text-bingo-dark text-sm leading-snug mb-1">{r.title}</div>
              <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded">{r.type}</span>
            </div>
          ))}
        </div>
        {resourceSubmitted ? (
          <div className="card p-6 text-center border-primary/30 max-w-md mx-auto">
            <div className="text-3xl mb-2">✅</div>
            <p className="font-semibold text-bingo-dark">Resources on their way!</p>
            <p className="text-sm text-slate-500 mt-1">Check your inbox — we'll send all four resource packs shortly.</p>
          </div>
        ) : (
          <form
            onSubmit={(e) => { e.preventDefault(); setResourceSubmitted(true) }}
            className="flex flex-wrap gap-3 max-w-md"
          >
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 min-w-0 rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />
            <button type="submit" className="btn-primary px-5 py-2.5 text-sm shrink-0">
              Claim All Resources →
            </button>
          </form>
        )}
      </section>

      {/* ── Contact CTA ── */}
      <section className="py-8 border-t">
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="card p-6 border-primary/20">
            <h3 className="font-semibold text-bingo-dark mb-1">Contact Us — Student & Family Enquiries</h3>
            <p className="text-slate-500 text-sm mb-4">Get a personalised AI learning plan for your student</p>
            <div className="space-y-2 text-sm">
              <a href="mailto:family@bingoacademy.org" className="flex items-center gap-2 text-primary hover:underline">
                <span>✉️</span> family@bingoacademy.org
              </a>
              <Link to="/ai-test" className="flex items-center gap-2 text-primary hover:underline">
                <span>🧠</span> Take the free AI assessment first →
              </Link>
            </div>
          </div>
          <div className="card p-6 border-slate-200 bg-slate-50">
            <h3 className="font-semibold text-bingo-dark mb-1">Institution & Partnership Enquiries</h3>
            <p className="text-slate-500 text-sm mb-4">Get a free partnership proposal tailored to your institution</p>
            <div className="space-y-2 text-sm">
              <a href="mailto:contact@bingoacademy.org" className="flex items-center gap-2 text-primary hover:underline">
                <span>✉️</span> contact@bingoacademy.org
              </a>
              <a href="/#/join" className="flex items-center gap-2 text-primary hover:underline">
                <span>🏫</span> Free institution consultation →
              </a>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}

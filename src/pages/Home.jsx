import { useState } from 'react'
import { Link } from 'react-router-dom'

// ─── Data ────────────────────────────────────────────────────────────

const PAIN_ROLLING = [
  'No AI course at school — not sure where to start?',
  'Child uses AI tools but can\'t create or innovate?',
  'Learn AI but can\'t prove it in admissions?',
  'Don\'t understand AI yourself — can\'t guide your child?',
]

const PAIN_POINTS = [
  {
    icon: '📚', tag: 'No Structured Path',
    problem: 'School provides no AI curriculum. Students don\'t know how to start, progress, or reach competition-readiness.',
    solutionTitle: 'A complete tiered AI curriculum — from literacy to STEM admissions track',
    solutions: [
      { label: 'AI Literacy · Ages 6–10', desc: 'Core AI cognition, creativity, computational thinking', to: '/courses?type=literacy' },
      { label: 'Advanced Track · Ages 11–14', desc: 'Applied AI tools, project building, competition prep', to: '/courses?type=contest' },
      { label: 'STEM Admissions · Ages 15–18', desc: 'Science specialty, college-track policy alignment', to: '/courses?type=exam' },
    ],
    note: '95% course completion · Students across 300+ cities',
    cta: 'Free Trial Lesson', ctaTo: '/courses',
  },
  {
    icon: '🏆', tag: 'Skills Without Proof',
    problem: 'Students learn AI but have no credentials, awards, or portfolio to show — making their abilities invisible in admissions.',
    solutionTitle: 'Competitions + certificates that make ability visible and admissions-ready',
    solutions: [
      { label: 'Whitelist Competition Camp', desc: 'Official prep, award rate 92%, full service', to: '/events' },
      { label: 'International AI Events', desc: 'Global stage, expert coaching, background building', to: '/events' },
      { label: 'AI Ability Certificate', desc: 'Authoritative credential, college admissions recognised', to: '/cert' },
    ],
    note: '2,000+ students achieved STEM distinction and entered top schools',
    cta: 'View Events', ctaTo: '/events',
  },
  {
    icon: '🎨', tag: 'Using AI vs. Creating',
    problem: 'Students rely passively on AI tools — they lack the critical depth to build, innovate, and lead.',
    solutionTitle: '"Learn → Practice → Compete → Create" — making every student an AI maker',
    solutions: [
      { label: 'AI Creative Course', desc: 'Art + coding + writing, real AI-produced work', to: '/courses' },
      { label: 'AI Camp · Maker Studio', desc: 'Real project outcomes, certified mentors', to: '/research' },
    ],
    note: '100,000+ original AI student works · 300+ science innovation awards',
    cta: 'View Student Work', ctaTo: '/showcase',
  },
  {
    icon: '👨‍👩‍👧', tag: 'Parents Don\'t Know AI',
    problem: 'Parents feel helpless — they don\'t understand AI well enough to guide their child or choose the right course.',
    solutionTitle: 'Parent AI education system — become your child\'s AI guide',
    solutions: [
      { label: 'Parent Essentials Course', desc: '¥9.9 flash sale (original ¥99), 30 min video', to: '/mall' },
      { label: 'Free AI Education Community', desc: 'Expert Q&A + learning guide PDF', to: '/community' },
    ],
    note: '50,000+ parents supported · 98% said it helped them guide their child',
    cta: '¥9.9 Get Parent Course', ctaTo: '/mall',
  },
]

const CORE_PRODUCTS_C = [
  { icon: '🌱', title: 'AI Literacy Course', desc: 'Ages 6–10 · Foundations', to: '/courses?type=literacy' },
  { icon: '🚀', title: 'Advanced AI Track', desc: 'Ages 14–18 · Admissions', to: '/courses?type=exam' },
  { icon: '⛺', title: 'AI Camp', desc: 'Research · Projects · Awards', to: '/research' },
  { icon: '🏅', title: 'Events Center', desc: 'Competitions · Bootcamps · Certs', to: '/events' },
  { icon: '📜', title: 'Certification', desc: 'Ability cert · Admissions proof', to: '/cert' },
  { icon: '🛒', title: 'AI Mall', desc: 'Tools · Materials · Resources', to: '/mall' },
]

const C_MARKETING = [
  { icon: '⚡', bg: 'bg-red-50 border-red-200/60', title: '¥9.9 Parent Flash Sale', desc: 'Orig ¥99 · 1,000 slots only', to: '/mall', hot: true },
  { icon: '🧠', bg: 'bg-primary/5 border-primary/20', title: 'Free AI Assessment', desc: 'Personalised learning roadmap', to: '/ai-test', hot: true },
  { icon: '👥', bg: 'bg-amber-50 border-amber-200/60', title: 'Group Buy · Save 50%', desc: '2-person group · any course', to: '/mall?tag=group', hot: false },
  { icon: '🏕️', bg: 'bg-green-50 border-green-200/60', title: 'Whitelist Camp Early Bird', desc: 'Sign up now, save ¥300', to: '/events', hot: false },
  { icon: '💰', bg: 'bg-violet-50 border-violet-200/60', title: 'Share & Earn', desc: 'Double commission this month', to: '/profile#promo', hot: false },
  { icon: '🎁', bg: 'bg-slate-50 border-slate-200', title: 'Claim Coupon', desc: 'Redeem at checkout', to: '/profile', hot: false },
]

const TRUST_STATS = [
  { icon: '👥', value: '100,000+', label: 'Students Served' },
  { icon: '🏆', value: '92%', label: 'Competition Award Rate' },
  { icon: '🎓', value: '2,000+', label: 'STEM Admissions Results' },
  { icon: '🤝', value: '500+', label: 'Partner Institutions' },
]

const TESTIMONIALS = [
  { quote: 'My daughter had zero AI background. Six months of Bingo curriculum and she won a national science innovation award. The structured path makes all the difference.', name: 'Ms. Chen · Shanghai', role: 'Parent of Grade 8 student', stars: 5 },
  { quote: 'From not knowing what AI was to competing internationally and getting into my top-choice high school STEM programme. Bingo changed my trajectory.', name: 'Kevin · Grade 10', role: 'AI Camp & Events alumnus', stars: 5 },
  { quote: 'We added Bingo\'s AI curriculum and our enrolment grew 60% in one year. The teacher training and curriculum support are genuinely excellent.', name: 'Director Wang · Shenzhen', role: 'Partner institution director', stars: 5 },
]

const FREE_RESOURCES_C = [
  { icon: '📘', title: 'Ages 6–18 AI Learning Pathway Guide', type: 'PDF Guide' },
  { icon: '📋', title: 'Whitelist Competition Strategy + Sample Questions', type: 'PDF Guide' },
  { icon: '📗', title: '10 Methods for Parents to Guide AI Learning', type: 'PDF Guide' },
  { icon: '🎥', title: 'Free Live Class: STEM Admissions Policy Explained', type: 'Live Preview' },
]

const FREE_RESOURCES_B = [
  { icon: '📙', title: 'AI Education Institution Transformation Playbook', type: 'PDF Guide' },
  { icon: '📊', title: 'AI Course Operations Handbook for Training Centres', type: 'PDF Guide' },
  { icon: '🤝', title: 'Competition Partnership Empowerment Programme Overview', type: 'PDF Guide' },
  { icon: '🎤', title: 'Free Webinar: AI Education Partnership & Revenue Models', type: 'Live Preview' },
]

// ─── Small components ────────────────────────────────────────────────

function LeadForm({ audience }) {
  const [phone, setPhone] = useState('')
  const [done, setDone] = useState(false)
  if (done) return (
    <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
      <div className="text-3xl mb-1">✅</div>
      <p className="font-semibold text-bingo-dark text-sm">Resources on the way!</p>
      <p className="text-xs text-slate-500 mt-0.5">Check your phone / email — we'll reach out within 10 minutes.</p>
    </div>
  )
  return (
    <form onSubmit={e => { e.preventDefault(); setDone(true) }} className="flex gap-2 flex-wrap max-w-md">
      <input required value={phone} onChange={e => setPhone(e.target.value)} placeholder={audience === 'b' ? 'Your phone — get free proposal' : 'Your phone — claim resources'}
        className="flex-1 min-w-0 rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-primary outline-none" />
      <button type="submit" className="btn-primary px-5 py-2.5 text-sm shrink-0">
        {audience === 'b' ? 'Get Free Proposal →' : 'Claim Resources →'}
      </button>
    </form>
  )
}

// ─── Main page ───────────────────────────────────────────────────────

export default function Home() {
  const [rollingIdx, setRollingIdx] = useState(0)
  const [audience, setAudience] = useState('c')

  // Cycle pain point text every 3s
  useState(() => {
    const t = setInterval(() => setRollingIdx(i => (i + 1) % PAIN_ROLLING.length), 3000)
    return () => clearInterval(t)
  })

  return (
    <div>

      {/* ══════════════════ HERO ══════════════════ */}
      <section className="section-tech px-4 py-14 sm:py-20">
        <div className="max-w-7xl mx-auto">

          {/* Top audience switcher */}
          <div className="flex justify-center gap-2 mb-6">
            <button onClick={() => setAudience('c')}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition ${audience==='c'?'bg-primary text-white shadow':'bg-white/70 text-slate-600 border border-slate-200 hover:bg-white'}`}>
              👨‍👩‍👧 Student & Family
            </button>
            <button onClick={() => setAudience('b')}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition ${audience==='b'?'bg-bingo-dark text-white shadow':'bg-white/70 text-slate-600 border border-slate-200 hover:bg-white'}`}>
              🏫 Institutions & Partners
            </button>
          </div>

          <div className="grid lg:grid-cols-2 gap-10 items-center">
            {/* Left: pain + value */}
            <div>
              <p className="text-xs font-bold tracking-widest text-primary uppercase mb-3">AI + Competitions + Full-Chain Education Ecosystem</p>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-bingo-dark leading-tight mb-4">
                {audience === 'c' ? <>Future-Ready AI Education<br className="hidden sm:block" /> for High-Performing Students</> : <>Missing AI curriculum, teachers & competition resources for your institution?</>}
              </h1>

              {/* Rolling pain point pill */}
              <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200/60 rounded-xl px-4 py-2 mb-4">
                <span className="text-red-500 text-sm">⚠️</span>
                <span className="text-sm text-red-700 font-medium">{audience === 'c' ? PAIN_ROLLING[rollingIdx] : 'Lacking AI curriculum, faculty, and competition resources?'}</span>
              </div>

              <p className="text-slate-600 text-base sm:text-lg mb-4 leading-relaxed">
                {audience === 'c'
                  ? <>Bingo AI Academy — <strong>"AI + Competition + Full-Chain Ecosystem"</strong><br />Dedicated AI growth paths for ages 8–18. Help every child <strong>use AI, think with AI, create with AI</strong>.</>
                  : <>Bingo AI Academy's full-chain industry-education partnership — <strong>brand + curriculum + faculty training + competitions</strong>, all in one. Average partner institution revenue up 60%.</>
                }
              </p>

              {/* Trust micro-badges */}
              <div className="flex flex-wrap gap-2 mb-6">
                {['✓ Whitelist competition official partner','✓ STEM admissions guidance base','✓ 10,000+ students served','✓ 92% award rate'].map((b,i) => (
                  <span key={i} className="text-xs bg-white/80 border border-primary/20 rounded-full px-3 py-1 text-slate-700">{b}</span>
                ))}
              </div>

              {/* CTA group */}
              {audience === 'c' ? (
                <div className="flex flex-wrap gap-3">
                  <Link to="/ai-test" className="btn-primary px-6 py-3 text-sm font-semibold">🧠 Free AI Assessment →</Link>
                  <Link to="/courses" className="px-6 py-3 text-sm font-semibold rounded-xl border-2 border-primary text-primary hover:bg-primary/5 transition">🎓 Explore Courses</Link>
                </div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  <a href="/#/join" className="bg-bingo-dark text-white px-6 py-3 text-sm font-semibold rounded-xl hover:bg-bingo-dark/90 transition">🏫 Get Free Partnership Proposal →</a>
                  <a href="/#/oem" className="px-6 py-3 text-sm font-semibold rounded-xl border-2 border-bingo-dark text-bingo-dark hover:bg-slate-50 transition">⚙️ OEM / Custom</a>
                </div>
              )}
            </div>

            {/* Right: quick-action panel */}
            <div className={`rounded-2xl p-6 ${audience === 'c' ? 'bg-white/80 border border-primary/20' : 'bg-bingo-dark text-white'} shadow-lg`}>
              {audience === 'c' ? (
                <>
                  <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-4">Quick start — pick your next step</p>
                  <div className="space-y-3">
                    {[
                      { emoji: '🧠', title: 'Free AI Ability Assessment', sub: '3 min · personalised learning roadmap', to: '/ai-test', style: 'btn-primary' },
                      { emoji: '⚡', title: '¥9.9 Parent Essentials Course', sub: 'Flash sale · 1,000 slots · orig. ¥99', to: '/mall', style: 'bg-amber-500 text-white' },
                      { emoji: '🏆', title: 'Whitelist Competition Entry', sub: 'Early bird · save ¥300', to: '/events', style: '' },
                    ].map((a,i) => (
                      <Link key={i} to={a.to}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition ${a.style ? `${a.style} hover:opacity-90` : 'bg-slate-50 hover:bg-slate-100 text-bingo-dark'}`}>
                        <span className="text-xl">{a.emoji}</span>
                        <div className="flex-1 text-left">
                          <p className="font-semibold leading-tight">{a.title}</p>
                          <p className={`text-xs mt-0.5 ${a.style === 'btn-primary' ? 'text-cyan-100' : 'text-slate-500'}`}>{a.sub}</p>
                        </div>
                        <span className="text-sm opacity-70">→</span>
                      </Link>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400 mt-4 text-center">↓ Scroll down for solutions to every AI education concern</p>
                </>
              ) : (
                <>
                  <p className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-4">Partner options</p>
                  <div className="space-y-3">
                    {[
                      { emoji: '🏫', title: 'Institution Partnership', sub: 'Accreditation + curriculum + operations', href: '/#/join' },
                      { emoji: '🤝', title: 'Franchise Partner', sub: 'Brand licensing + full system support', href: '/#/join' },
                      { emoji: '⚙️', title: 'OEM Custom', sub: 'Courses / tools / co-branding / tech transfer', href: '/#/oem' },
                    ].map((a,i) => (
                      <a key={i} href={a.href}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition text-sm font-medium">
                        <span className="text-xl">{a.emoji}</span>
                        <div className="flex-1">
                          <p className="font-semibold">{a.title}</p>
                          <p className="text-xs text-slate-300 mt-0.5">{a.sub}</p>
                        </div>
                        <span className="text-sm opacity-60">→</span>
                      </a>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/10 text-xs text-slate-300 text-center">500+ partners · 100+ franchise · avg revenue +60%</div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* ══════════════════ AUDIENCE TOGGLE (STICKY HINT) ══════════════ */}
        <div className="flex gap-3 mb-10 justify-center">
          <button onClick={() => setAudience('c')}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${audience==='c'?'bg-primary text-white shadow-md':'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            👨‍👩‍👧 Student & Family Solutions
          </button>
          <button onClick={() => setAudience('b')}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${audience==='b'?'bg-bingo-dark text-white shadow-md':'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            🏫 Institution & Partner Solutions
          </button>
        </div>

        {/* ══════════════════ C-END CONTENT ══════════════════ */}
        {audience === 'c' && (
          <>
            {/* Pain points → solutions */}
            <section className="mb-12">
              <h2 className="section-title mb-1">Every AI Education Concern, Solved</h2>
              <p className="text-slate-500 text-sm mb-6">Each pain point matched to a product, a proven outcome, and a clear action</p>
              <div className="space-y-5">
                {PAIN_POINTS.map((p, i) => (
                  <div key={i} className="card p-6 border-primary/15 hover:shadow-md transition">
                    <div className="flex flex-wrap items-start gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl shrink-0">{p.icon}</div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded mb-1 inline-block">「{p.tag}」Anxiety</span>
                        <p className="text-slate-600 text-sm">{p.problem}</p>
                      </div>
                    </div>
                    <h3 className="font-semibold text-bingo-dark mb-3">{p.solutionTitle}</h3>
                    <ul className="space-y-2 mb-4">
                      {p.solutions.map((s, j) => (
                        <li key={j}>
                          <Link to={s.to} className="flex items-start gap-2 text-sm hover:text-primary transition group">
                            <span className="text-primary shrink-0 mt-0.5">✓</span>
                            <span><span className="font-medium">{s.label}</span><span className="text-slate-400 mx-1">·</span><span className="text-slate-500 group-hover:text-primary transition">{s.desc} →</span></span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                      <span className="text-xs text-slate-400">✓ {p.note}</span>
                      <Link to={p.ctaTo} className="btn-primary text-sm px-4 py-1.5">{p.cta}</Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Core C-end products */}
            <section className="mb-12">
              <h2 className="section-title mb-1">Programs & Services</h2>
              <p className="text-slate-500 text-sm mb-5">Each program targets a specific stage, skill need, and outcome</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
                {CORE_PRODUCTS_C.map((c, i) => (
                  <Link key={i} to={c.to} className="card p-4 text-center hover:shadow-md hover:border-primary/30 transition group">
                    <div className="text-2xl mb-2">{c.icon}</div>
                    <div className="font-semibold text-primary text-xs group-hover:underline leading-tight">{c.title}</div>
                    <div className="text-xs text-slate-500 mt-1">{c.desc}</div>
                  </Link>
                ))}
              </div>
            </section>

            {/* C-end marketing activities */}
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="section-title mb-0">🔥 Limited-Time Offers</h2>
                <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-bold">Live now</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {C_MARKETING.map((m, i) => (
                  <Link key={i} to={m.to} className={`card p-4 border-2 ${m.bg} hover:shadow-md transition relative`}>
                    {m.hot && <span className="absolute top-2 right-2 text-[9px] bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold">HOT</span>}
                    <div className="text-xl mb-1">{m.icon}</div>
                    <div className="font-semibold text-bingo-dark text-sm">{m.title}</div>
                    <p className="text-xs text-slate-500 mt-0.5">{m.desc}</p>
                  </Link>
                ))}
              </div>
            </section>

            {/* Student outcomes / trust */}
            <section className="mb-12">
              <h2 className="section-title mb-1">Results You Can Trust</h2>
              <p className="text-slate-500 text-sm mb-6">Data + outcomes + real cases — every claim backed by evidence</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {TRUST_STATS.map((s, i) => (
                  <div key={i} className="card p-5 text-center hover:shadow-md transition">
                    <div className="text-2xl mb-1">{s.icon}</div>
                    <div className="text-2xl font-bold text-primary">{s.value}</div>
                    <div className="text-xs text-slate-600 mt-1 font-medium">{s.label}</div>
                  </div>
                ))}
              </div>

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

              <div className="card p-5 bg-slate-50 border-slate-200">
                <div className="flex flex-wrap justify-center gap-5">
                  {['✓ Official whitelist competition partner','✓ University-affiliated research mentors','✓ STEM admissions guidance base','✓ Strategic AI company partnerships'].map((b,i) => (
                    <span key={i} className="text-primary font-medium text-sm">{b}</span>
                  ))}
                </div>
              </div>
            </section>

            {/* Student work showcase strip */}
            <section className="mb-12">
              <div className="flex items-center justify-between mb-4">
                <h2 className="section-title mb-0">Student Work Showcase</h2>
                <Link to="/showcase" className="text-xs text-primary hover:underline">View all →</Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {['🤖 AI Robotics Project', '🎨 AIGC Creative Art', '📊 Data Science Model', '🌱 Green AI Innovation'].map((w,i) => (
                  <Link key={i} to="/showcase" className="card p-4 text-center hover:shadow-md hover:border-primary/30 transition">
                    <div className="rounded-xl bg-gradient-to-br from-primary/10 to-cyan-50 h-20 flex items-center justify-center text-3xl mb-2">
                      {['🤖','🎨','📊','🌱'][i]}
                    </div>
                    <p className="text-xs text-slate-600 font-medium">{w.split(' ').slice(1).join(' ')}</p>
                    <p className="text-[10px] text-primary mt-0.5">🏆 Award Winner</p>
                  </Link>
                ))}
              </div>
            </section>

            {/* Free resources C-end */}
            <section className="mb-12">
              <h2 className="section-title mb-1">Free Resources — Claim Instantly</h2>
              <p className="text-slate-500 text-sm mb-5">Enter your phone to receive four AI education resource packs</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {FREE_RESOURCES_C.map((r, i) => (
                  <div key={i} className="card p-5 hover:shadow-md hover:border-primary/30 transition">
                    <div className="text-2xl mb-2">{r.icon}</div>
                    <div className="font-medium text-bingo-dark text-sm leading-snug mb-1">{r.title}</div>
                    <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded">{r.type}</span>
                  </div>
                ))}
              </div>
              <LeadForm audience="c" />
            </section>

            {/* Contact C-end */}
            <section className="mb-8 card p-6 border-primary/20 bg-primary/5">
              <h3 className="font-semibold text-bingo-dark mb-1">Contact Us — Student & Family Enquiries</h3>
              <p className="text-slate-500 text-sm mb-3">Get a personalised AI learning plan for your student</p>
              <div className="flex flex-wrap gap-4 text-sm">
                <a href="mailto:family@bingoacademy.org" className="flex items-center gap-2 text-primary hover:underline">✉️ family@bingoacademy.org</a>
                <Link to="/ai-test" className="flex items-center gap-2 text-primary hover:underline">🧠 Free AI Assessment first →</Link>
              </div>
            </section>
          </>
        )}

        {/* ══════════════════ B-END CONTENT ══════════════════ */}
        {audience === 'b' && (
          <>
            {/* B-end pain → solution */}
            <section className="mb-12">
              <h2 className="section-title mb-1">Solving Your Institution's AI Education Challenges</h2>
              <p className="text-slate-500 text-sm mb-6">Every institutional pain point mapped to a concrete empowerment solution</p>
              <div className="space-y-4">
                {[
                  { icon: '📚', pain: 'No AI curriculum or incomplete course offering', solution: 'Full 1–9★ Bingo curriculum, ready-to-deliver. OEM licensing available under your institution\'s brand.', cta: 'Get curriculum', ctaTo: '/cert' },
                  { icon: '👩‍🏫', pain: 'Weak AI faculty — teachers lack skills to deliver quality AI lessons', solution: 'Bingo certified teacher training programme. Basic, Advanced, and Master Trainer tracks.', cta: 'Teacher training', ctaTo: '/cert' },
                  { icon: '🏆', pain: 'No access to competitions — can\'t help students compete nationally', solution: 'Group entry management, dedicated competition coach, whitelist and Bingo Cup access.', cta: 'Events partnership', ctaTo: '/events' },
                  { icon: '📈', pain: 'Enrolment stalling — can\'t differentiate from other tutoring centres', solution: 'Bingo certification badge + platform referral + national rankings. Avg 60% enrolment growth post-partnership.', cta: 'Partnership proposal', ctaTo: '/cert' },
                ].map((p,i) => (
                  <div key={i} className="card p-5 flex gap-4 items-start hover:shadow-md hover:border-bingo-dark/20 transition">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xl shrink-0">{p.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-red-600 mb-0.5">Pain: {p.pain}</p>
                      <p className="text-sm text-slate-700 mb-2">✓ {p.solution}</p>
                    </div>
                    <a href="/#/join" className="bg-bingo-dark text-white text-xs px-3 py-1.5 rounded-xl hover:bg-bingo-dark/90 shrink-0">{p.cta} →</a>
                  </div>
                ))}
              </div>
            </section>

            {/* B-end partnership types */}
            <section className="mb-12">
              <h2 className="section-title mb-4">Partnership Options</h2>
              <div className="grid sm:grid-cols-3 gap-5">
                {[
                  { icon: '🏫', title: 'Institution Curriculum Partner', desc: 'Accreditation + full curriculum + teacher training + operational support', result: '500+ active partners', href: '/#/join' },
                  { icon: '🤝', title: 'Franchise Partner', desc: 'Full brand licensing + Bingo system support + regional territory', result: '100+ franchise partners', href: '/#/join' },
                  { icon: '⚙️', title: 'OEM Custom', desc: 'Curriculum / tools co-branded under your label. Technical transfer.', result: 'Flexible pricing', href: '/#/oem' },
                ].map((p,i) => (
                  <div key={i} className="card p-6 hover:shadow-md hover:border-bingo-dark/20 transition flex flex-col">
                    <div className="text-2xl mb-2">{p.icon}</div>
                    <h3 className="font-bold text-bingo-dark mb-1">{p.title}</h3>
                    <p className="text-sm text-slate-600 flex-1 mb-3">{p.desc}</p>
                    <p className="text-xs text-primary font-medium mb-3">{p.result}</p>
                    <a href={p.href} className="bg-bingo-dark text-white text-sm py-2 rounded-xl text-center font-medium hover:bg-bingo-dark/90 transition">Learn more →</a>
                  </div>
                ))}
              </div>
            </section>

            {/* B-end products */}
            <section className="mb-12">
              <h2 className="section-title mb-4">B-end Services</h2>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { icon: '🎯', title: 'Industry-Education Integration', desc: 'Internship placements · employment pipeline · school-enterprise partnerships', to: '/career', internal: true },
                  { icon: '🏅', title: 'Certification System', desc: '4-tier institution certification · teacher certification · learner certificates', to: '/cert', internal: true },
                  { icon: '🛒', title: 'Institution Mall', desc: 'Bulk curriculum · textbook · lab equipment · volume pricing', to: '/mall', internal: true },
                ].map((s,i) => (
                  <Link key={i} to={s.to} className="card p-5 hover:shadow-md hover:border-bingo-dark/20 transition">
                    <div className="text-2xl mb-2">{s.icon}</div>
                    <h3 className="font-semibold text-bingo-dark text-sm mb-1">{s.title}</h3>
                    <p className="text-xs text-slate-500">{s.desc}</p>
                  </Link>
                ))}
              </div>
            </section>

            {/* B-end marketing activities */}
            <section className="mb-12">
              <h2 className="section-title mb-4">🔥 Partner Exclusive Offers</h2>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { icon: '🎁', title: 'New Partner — Waived Fee', desc: 'New curriculum partners: waiver + teacher training slots + course set', bg: 'bg-amber-50 border-amber-200/60' },
                  { icon: '⚙️', title: 'OEM Bonus', desc: 'Orders ≥ ¥50k get 1-year tech maintenance free', bg: 'bg-primary/5 border-primary/20' },
                  { icon: '📢', title: 'AI Education Summit', desc: 'Free registration · limited to 500 institutions · reserve now', bg: 'bg-slate-50 border-slate-200' },
                ].map((m,i) => (
                  <div key={i} className={`card p-5 border-2 ${m.bg} hover:shadow-md transition`}>
                    <div className="text-xl mb-1">{m.icon}</div>
                    <div className="font-semibold text-bingo-dark text-sm mb-1">{m.title}</div>
                    <p className="text-xs text-slate-500 mb-3">{m.desc}</p>
                    <a href="/#/join" className="bg-bingo-dark text-white text-xs px-3 py-1.5 rounded-xl hover:bg-bingo-dark/90 transition inline-block">Claim offer →</a>
                  </div>
                ))}
              </div>
            </section>

            {/* B-end testimonials */}
            <section className="mb-12">
              <h2 className="section-title mb-4">Partner Outcomes</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { quote: 'After joining Bingo\'s curriculum programme, our STEM enrolment grew 60% in one year. The training and materials are genuinely excellent.', name: 'Director Wang · Shenzhen', role: 'Curriculum partner' },
                  { quote: 'We wanted to differentiate our centre with AI. Bingo gave us the full package — curriculum, certified teachers, and competition access.', name: 'Principal Li · Beijing', role: 'Franchise partner' },
                  { quote: 'The OEM solution let us launch an AI textbook under our school name in just 6 weeks. Our students love it.', name: 'Department Head Chen · Chengdu', role: 'OEM partner school' },
                ].map((t,i) => (
                  <div key={i} className="card p-5">
                    <div className="text-yellow-400 text-sm mb-2">★★★★★</div>
                    <p className="text-slate-600 text-sm leading-relaxed flex-1">"{t.quote}"</p>
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <div className="text-sm font-medium text-slate-700">{t.name}</div>
                      <div className="text-xs text-slate-400">{t.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* B-end free resources */}
            <section className="mb-12">
              <h2 className="section-title mb-1">Free Resources for Institutions</h2>
              <p className="text-slate-500 text-sm mb-5">Enter your phone to receive all four B-end resource packs</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {FREE_RESOURCES_B.map((r, i) => (
                  <div key={i} className="card p-5 hover:shadow-md hover:border-bingo-dark/20 transition">
                    <div className="text-2xl mb-2">{r.icon}</div>
                    <div className="font-medium text-bingo-dark text-sm leading-snug mb-1">{r.title}</div>
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{r.type}</span>
                  </div>
                ))}
              </div>
              <LeadForm audience="b" />
            </section>

            {/* Contact B-end */}
            <section className="mb-8 card p-6 bg-bingo-dark text-white border-0">
              <h3 className="font-bold text-lg mb-1">Institution & Partnership Enquiries</h3>
              <p className="text-slate-300 text-sm mb-4">Get a free, tailored partnership proposal for your organisation</p>
              <div className="flex flex-wrap gap-4 text-sm">
                <a href="mailto:contact@bingoacademy.org" className="flex items-center gap-2 text-slate-200 hover:text-white">✉️ contact@bingoacademy.org</a>
                <a href="/#/join" className="flex items-center gap-2 text-cyan-300 hover:text-white">🏫 Free consultation →</a>
              </div>
            </section>
          </>
        )}

        {/* ══════════════════ SHARED BOTTOM (both audiences) ══════════════ */}

        {/* Final CTA */}
        <section className="py-8 border-t text-center">
          <h2 className="text-xl font-bold text-bingo-dark mb-2">Ready to take the next step?</h2>
          <p className="text-slate-500 text-sm mb-6">Families: start with a free assessment. Institutions: request a free partnership proposal.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/ai-test" className="btn-primary px-6 py-2.5 text-sm">🧠 Free AI Assessment</Link>
            <Link to="/courses" className="border border-primary text-primary px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-primary/5 transition">Explore Courses</Link>
            <a href="/#/join" className="bg-bingo-dark text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-bingo-dark/90 transition">Institution Partnership</a>
          </div>
        </section>

      </div>
    </div>
  )
}

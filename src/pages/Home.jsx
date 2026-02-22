import { Link } from 'react-router-dom'

const STATS = [
  { value: '10,000+', label: 'Students Served' },
  { value: '92%', label: 'Competition Award Rate' },
  { value: '300+', label: 'International Awards' },
  { value: '20+', label: 'Years of Research Expertise' },
]

const PAIN_POINTS = [
  {
    icon: '📚',
    tag: 'No Structured Path',
    problem: 'No AI curriculum at school—students don\'t know where to start or how to progress systematically.',
    solutionTitle: 'A complete tiered curriculum from foundations to college-track achievement',
    solutions: [
      { label: 'Advanced Track · Ages 14–18', desc: 'STEM specialty admissions, college-level AI research', to: '/courses?type=exam' },
      { label: 'Intermediate Track · Ages 11–14', desc: 'Applied AI tools, project building, competition prep', to: '/courses?type=contest' },
      { label: 'Foundations Track · Ages 8–11', desc: 'AI literacy, computational thinking, creativity', to: '/courses?type=literacy' },
    ],
    note: 'Students across 20+ countries · 95% course completion rate',
    cta: 'Explore Courses',
    to: '/courses',
  },
  {
    icon: '🏆',
    tag: 'Skills Without Proof',
    problem: 'Students learn AI but have no credentials, awards, or portfolio items to show colleges or employers.',
    solutionTitle: 'International competitions + certificates that make ability visible',
    solutions: [
      { label: 'AI Skill Certification', desc: 'Recognized credentials tied to tiered levels', to: '/cert' },
      { label: 'International AI Competitions', desc: 'Guided prep for global AI and science competitions', to: '/events' },
      { label: 'Science Camp Research Track', desc: 'Publishable research projects with mentor guidance', to: '/research' },
    ],
    note: '2,000+ students have earned competitive awards and college distinctions',
    cta: 'View Events',
    to: '/events',
  },
  {
    icon: '🔬',
    tag: 'Using AI vs. Creating with It',
    problem: 'Students rely on AI tools passively—they lack the depth to build, innovate, and think critically.',
    solutionTitle: 'A Learn → Practice → Compete → Create cycle that builds real makers',
    solutions: [
      { label: 'Science Camp', desc: 'Immersive project experience with certified mentor teams', to: '/research' },
      { label: 'Student Showcase', desc: 'Publish and share AI projects with a global community', to: '/showcase' },
    ],
    note: '100,000+ original AI student works · 300+ national science innovation awards',
    cta: 'See Student Work',
    to: '/showcase',
  },
]

const CORE_PRODUCTS = [
  { icon: '🌱', title: 'AI Foundations', desc: 'Ages 8–11 · Literacy & meta-cognition', to: '/courses?type=literacy' },
  { icon: '🚀', title: 'Advanced Track', desc: 'Ages 14–18 · STEM admissions', to: '/courses?type=exam' },
  { icon: '⛺', title: 'Science Camp', desc: 'Research · Projects · Awards', to: '/research' },
  { icon: '🏅', title: 'Events Center', desc: 'Competitions · Bootcamps · Certs', to: '/events' },
  { icon: '👥', title: 'AI Community', desc: 'Mentors · Peers · Q&A', to: '/community' },
  { icon: '📈', title: 'Certification', desc: 'Assessment · Personalized path', to: '/cert' },
]

const TESTIMONIALS = [
  { quote: 'My daughter won a national AI innovation award after just one semester. The curriculum is genuinely rigorous.', name: 'Parent · New York', stars: 5 },
  { quote: 'The Science Camp gave me a real research project I could put on my college application. Completely changed my trajectory.', name: 'Student · Grade 11', stars: 5 },
  { quote: 'After partnering with Bingo Academy, our school\'s STEM program enrollment increased by 60%. The curriculum and support are excellent.', name: 'STEM Coordinator · International School', stars: 5 },
]

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* Hero */}
      <section className="mb-10 text-center py-12 section-tech rounded-2xl px-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-bingo-dark leading-tight mb-5">
          Future-Ready AI Education<br className="hidden sm:block" /> for High-Performing Students
        </h1>
        <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto mb-8">
          Bingo AI Academy gives students the skills, projects, and credentials to lead in the AI era—from foundations to international competitions and college-track research.
        </p>
        <div className="flex flex-wrap gap-3 justify-center mb-10">
          <Link to="/ai-test" className="btn-primary px-6 py-2.5 text-base">Free AI Assessment →</Link>
          <Link to="/courses" className="px-6 py-2.5 text-base rounded-xl border border-primary text-primary font-medium hover:bg-primary/5 transition">Explore Courses</Link>
          <Link to="/research" className="px-6 py-2.5 text-base rounded-xl border border-slate-300 text-slate-600 font-medium hover:bg-slate-50 transition">Science Camp</Link>
        </div>
        {/* Stats badges */}
        <div className="flex flex-wrap justify-center gap-4">
          {STATS.map((s, i) => (
            <div key={i} className="bg-white/80 border border-primary/20 rounded-xl px-5 py-2 text-center shadow-sm">
              <div className="text-xl font-bold text-primary">{s.value}</div>
              <div className="text-xs text-slate-500">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pain points → solutions */}
      <section className="mb-12">
        <h2 className="section-title mb-2">Every Challenge, Solved</h2>
        <p className="text-slate-500 text-sm mb-6">Each concern has a dedicated solution, outcome, and action step</p>
        <div className="space-y-6">
          {PAIN_POINTS.map((p, i) => (
            <div key={i} className="card p-6 border-primary/15">
              <div className="flex flex-wrap items-start gap-4 mb-4">
                <span className="text-3xl">{p.icon}</span>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded mb-2 inline-block">{p.tag}</span>
                  <p className="text-slate-600 text-sm">{p.problem}</p>
                </div>
              </div>
              <h3 className="font-semibold text-bingo-dark mb-3">{p.solutionTitle}</h3>
              <ul className="space-y-2 mb-4">
                {p.solutions.map((s, j) => (
                  <li key={j}>
                    <Link to={s.to} className="flex items-start gap-2 text-sm hover:text-primary transition group">
                      <span className="text-primary mt-0.5">✓</span>
                      <span><span className="font-medium">{s.label}</span> · <span className="text-slate-500 group-hover:text-primary transition">{s.desc} →</span></span>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-slate-400">✓ {p.note}</span>
                <Link to={p.to} className="btn-primary text-sm px-4 py-1.5">{p.cta}</Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Core products */}
      <section className="mb-12">
        <h2 className="section-title mb-2">Core Programs & Services</h2>
        <p className="text-slate-500 text-sm mb-5">Every program is designed with a clear age range, outcome, and action entry</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {CORE_PRODUCTS.map((c, i) => (
            <Link key={i} to={c.to} className="card p-5 text-center hover:shadow-md hover:border-primary/30 transition group">
              <div className="text-2xl mb-2">{c.icon}</div>
              <div className="font-semibold text-primary text-sm group-hover:underline">{c.title}</div>
              <div className="text-xs text-slate-500 mt-1">{c.desc}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* AI Assessment CTA */}
      <section className="mb-12">
        <div className="card p-6 bg-gradient-to-r from-cyan-50 to-sky-50 border-primary/20 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-bingo-dark text-lg">🧠 Free AI Capability Assessment</h3>
            <p className="text-slate-600 text-sm mt-1">Takes just 3 minutes. Get a personalized learning path and course recommendation instantly.</p>
            <Link to="/ai-test" className="text-primary font-medium mt-2 inline-block text-sm">Start Free Assessment →</Link>
          </div>
          <Link to="/courses" className="btn-primary shrink-0">View Recommended Courses</Link>
        </div>
      </section>

      {/* Trust / testimonials */}
      <section className="mb-12">
        <h2 className="section-title mb-6">Results You Can Trust</h2>
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="card p-6 flex flex-col">
              <div className="text-yellow-400 text-sm mb-2">{'★'.repeat(t.stars)}</div>
              <p className="text-slate-600 text-sm leading-relaxed flex-1">"{t.quote}"</p>
              <div className="text-xs text-slate-400 mt-3 font-medium">{t.name}</div>
            </div>
          ))}
        </div>
        {/* Trust badges */}
        <div className="card p-6 bg-slate-50 border-slate-200">
          <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-600">
            <span className="flex items-center gap-1.5"><span className="text-primary">✓</span> Official competition partner</span>
            <span className="flex items-center gap-1.5"><span className="text-primary">✓</span> University-affiliated research mentors</span>
            <span className="flex items-center gap-1.5"><span className="text-primary">✓</span> STEM college admissions guidance base</span>
            <span className="flex items-center gap-1.5"><span className="text-primary">✓</span> Strategic partnerships with leading AI companies</span>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="mb-12 py-8 border-t max-w-3xl mx-auto text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-bingo-dark mb-4">
          Mastering AI — Not Just Using It
        </h2>
        <p className="text-slate-600 leading-relaxed mb-4">
          As AI reshapes every field, the students who lead won't be those who use AI passively — they'll be the ones who understand it deeply, build with it confidently, and innovate with purpose.
        </p>
        <p className="text-slate-600 leading-relaxed">
          Bingo AI Academy is built for high-performing students ready to go beyond the basics: real projects, meaningful credentials, and the AI fluency that top universities and employers are looking for.
        </p>
      </section>

      {/* Institutional partnerships */}
      <section className="py-8 border-t">
        <h2 className="section-title mb-2">Institutional Partnerships</h2>
        <p className="text-slate-500 text-sm mb-5">500+ partner institutions · Average 60% revenue growth after partnership</p>
        <div className="grid sm:grid-cols-3 gap-4">
          <a href="/#/join" className="card p-6 border-primary/30 hover:shadow-md transition flex flex-col">
            <div className="text-xl mb-2">🏫</div>
            <div className="font-semibold text-primary">School & Institution Partnership</div>
            <p className="text-sm text-slate-600 mt-1">Curriculum licensing, teacher training, and full operations support</p>
            <span className="text-sm text-primary mt-3">Get Free Proposal →</span>
          </a>
          <a href="/#/join" className="card p-6 border-primary/30 hover:shadow-md transition flex flex-col">
            <div className="text-xl mb-2">🤝</div>
            <div className="font-semibold text-primary">Franchise Partner</div>
            <p className="text-sm text-slate-600 mt-1">Full brand support, complete curriculum system, and co-build AI education</p>
            <span className="text-sm text-primary mt-3">Learn More →</span>
          </a>
          <a href="/#/oem" className="card p-6 border-primary/30 hover:shadow-md transition flex flex-col">
            <div className="text-xl mb-2">⚙️</div>
            <div className="font-semibold text-primary">OEM Partnership</div>
            <p className="text-sm text-slate-600 mt-1">Custom courses, tools, co-branded products and technology transfer</p>
            <span className="text-sm text-primary mt-3">Learn More →</span>
          </a>
        </div>
      </section>

    </div>
  )
}

import { Link } from 'react-router-dom'

const BANNERS = [
  { title: 'Course Promo', to: '/courses', desc: 'Limited-time course offers' },
  { title: 'Event Registration', to: '/events', desc: 'Authoritative competitions now open' },
  { title: 'Honors & Charity', to: '/charity', desc: 'Honors and charity coverage' },
  { title: 'Industry-Education', to: '/career', desc: 'Enterprise internships & career placement' },
  { title: 'Earn Commission', to: '/profile#promo', desc: 'Share courses/products & earn commission' },
]

const PAIN_POINTS = [
  'Will playing with AI tools hurt my child\'s studies?',
  'What should children learn to stay relevant in the AI era?',
  'There\'s no AI course at school—where do we start?',
  'My child is interested in AI but doesn\'t know how to learn systematically?',
  'Worried my child only uses AI and doesn\'t think or create?',
  'Competitions, college admission, literacy—how do I choose in AI education?',
  'There are so many AI tools—which ones are right for teens?',
  'How do I tell if my child is suited for the AI/STEM path?',
  'Parents don\'t understand AI themselves—how do I guide my child?',
  'After completing AI courses, how do I prove ability and connect to college admission pathways?',
]

const HOT_COURSES = [
  { name: 'AI Literacy Introduction · Your First Step Toward the Future', to: '/courses?type=literacy', tag: 'Flagship' },
  { name: 'Whitelist Competition Bootcamp', to: '/courses?type=contest', tag: 'Competition' },
  { name: 'STEM Specialty Track Admissions Course', to: '/courses?type=exam', tag: 'Admissions' },
]

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Welcome & pain points */}
      <section className="mb-8 max-w-4xl mx-auto">
        <h2 className="text-xl sm:text-2xl font-bold text-bingo-dark text-center mb-4">
          Welcome to Bingo AI Academy
        </h2>
        <p className="text-slate-600 text-center mb-6">Let us guess the AI-related challenges you&apos;re facing</p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          {PAIN_POINTS.map((q, i) => (
            <li key={i} className="card px-4 py-3 text-slate-700 hover:border-primary/30 hover:shadow-sm transition">
              {q}
            </li>
          ))}
        </ul>
      </section>

      {/* Promo banners */}
      <section className="mb-8">
        <h2 className="section-title mb-4">Popular Activities</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {BANNERS.map((b, i) => (
            <Link
              key={i}
              to={b.to}
              className="rounded-xl overflow-hidden bg-gradient-to-r from-primary/85 to-cyan-600 text-white shadow-md hover:shadow-lg transition p-4 sm:p-5 min-h-[100px] flex flex-col justify-center"
            >
              <div className="text-xs opacity-90">{b.desc}</div>
              <div className="font-semibold mt-1.5 text-sm sm:text-base">{b.title}</div>
              <span className="text-xs opacity-90 mt-1">Enter →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* AI assessment + course recommendations */}
      <section className="mb-8">
        <h2 className="section-title mb-4">AI Capability Assessment · Course Recommendations</h2>
        <div className="card p-6 bg-gradient-to-r from-cyan-50 to-sky-50 border-primary/20 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-slate-600">Assess your child&apos;s AI literacy and potential, and get smart recommendations for courses and learning paths.</p>
            <Link to="/growth" className="text-primary font-medium mt-2 inline-block">Take Assessment →</Link>
          </div>
          <Link to="/courses" className="btn-primary shrink-0">View Recommended Courses</Link>
        </div>
      </section>

      {/* Mission & vision */}
      <section className="py-6 section-tech max-w-4xl mx-auto">
        <h2 className="text-xl sm:text-2xl font-bold text-bingo-dark text-center mb-6 tracking-tight">
          Master the AI Future: Bingo AI Academy, Your New Paradigm for AI Education
        </h2>
        <div className="max-w-3xl mx-auto space-y-4 text-slate-600 leading-relaxed">
          <p>
            As the AI wave sweeps across the globe, we ask: What is future-ready education? How should parents guide their children through rapidly evolving AI technology?
          </p>
          <p>
            Bingo AI Academy believes that true future education gives children the power to master tools—not be mastered by them. We strive to be the core education partner for families and schools in the AI era, helping every child explore actively, innovate through practice, and truly master AI rather than be replaced by it.
          </p>
        </div>
      </section>

      {/* Core products and services */}
      <section className="py-6">
        <h2 className="section-title mb-4">Core Products and Services</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <Link to="/courses?type=literacy" className="card p-6 text-center hover:shadow-md transition">
            <div className="text-primary font-semibold">AI Literacy</div>
            <div className="text-sm text-slate-500 mt-1">Future-ready · Literacy & Meta-cognition</div>
          </Link>
          <Link to="/courses?type=contest" className="card p-6 text-center hover:shadow-md transition">
            <div className="text-primary font-semibold">Competition Training</div>
            <div className="text-sm text-slate-500 mt-1">Whitelist · International</div>
          </Link>
          <Link to="/courses?type=exam" className="card p-6 text-center hover:shadow-md transition">
            <div className="text-primary font-semibold">Admissions Prep</div>
            <div className="text-sm text-slate-500 mt-1">STEM Specialty Track</div>
          </Link>
          <Link to="/mall" className="card p-6 text-center hover:shadow-md transition border-primary/30">
            <div className="text-primary font-semibold">AI Mall</div>
            <div className="text-sm text-slate-500 mt-1">Courses · Materials · Tools</div>
          </Link>
          <Link to="/events" className="card p-6 text-center hover:shadow-md transition border-primary/30">
            <div className="text-primary font-semibold">Events Center</div>
            <div className="text-sm text-slate-500 mt-1">Registration · Bootcamps · Certificates</div>
          </Link>
          <Link to="/career" className="card p-6 text-center hover:shadow-md transition border-primary/30">
            <div className="text-primary font-semibold">Industry-Education</div>
            <div className="text-sm text-slate-500 mt-1">Positions · Internships · Employment</div>
          </Link>
        </div>
      </section>

      {/* Flagship courses */}
      <section className="py-6">
        <h2 className="section-title mb-4">Flagship Courses</h2>
        <p className="text-slate-600 text-sm mb-4">Exclusive courses—literacy, competition, and admissions, all in one place</p>
        <div className="grid sm:grid-cols-3 gap-4">
          {HOT_COURSES.map((c, i) => (
            <Link key={i} to={c.to} className="card p-6 hover:shadow-md transition border-primary/20">
              <span className="text-xs px-2 py-0.5 rounded bg-primary/20 text-primary">{c.tag}</span>
              <div className="font-semibold text-primary mt-2">{c.name}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Limited-time benefits */}
      <section className="py-6">
        <h2 className="section-title mb-4">Limited-Time Benefits</h2>
        <div className="card p-6 bg-gradient-to-r from-cyan-50/90 to-sky-50/90 border-cyan-200/50 shadow-glow mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-sm text-slate-500">Must-read for parents</div>
              <h3 className="text-lg font-semibold text-bingo-dark mt-1">&quot;Become Your Child&apos;s Guide and Partner on the Path to Mastering AI&quot;</h3>
              <p className="text-sm text-slate-600 mt-2">Original $99 · Now <span className="text-primary font-semibold">$9.9</span></p>
            </div>
            <Link to="/courses?deal=9.9" className="btn-primary shrink-0">Claim Now</Link>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link to="/mall?tag=flash" className="card p-5 text-center hover:shadow-md transition">
            <div className="font-semibold text-primary">Flash Sale</div>
            <p className="text-sm text-slate-600 mt-1">Limited-time special</p>
          </Link>
          <Link to="/mall?tag=group" className="card p-5 text-center hover:shadow-md transition">
            <div className="font-semibold text-primary">Group Buy</div>
            <p className="text-sm text-slate-600 mt-1">Better value with more</p>
          </Link>
          <Link to="/profile" className="card p-5 text-center hover:shadow-md transition">
            <div className="font-semibold text-primary">Coupons</div>
            <p className="text-sm text-slate-600 mt-1">Coupon center</p>
          </Link>
          <Link to="/profile#promo" className="card p-5 text-center hover:shadow-md transition">
            <div className="font-semibold text-primary">Double Commission</div>
            <p className="text-sm text-slate-600 mt-1">Promo event</p>
          </Link>
        </div>
      </section>

      {/* Recommendations */}
      <section className="py-8 border-t">
        <h2 className="section-title mb-4">Recommended for You</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/courses" className="card p-5 hover:shadow-md transition">
            <div className="text-sm text-slate-500">Popular Courses</div>
            <div className="font-semibold text-primary mt-1">AI Literacy & Training</div>
            <p className="text-sm text-slate-600 mt-1">Share to earn commission</p>
          </Link>
          <Link to="/events" className="card p-5 hover:shadow-md transition">
            <div className="text-sm text-slate-500">Latest Events</div>
            <div className="font-semibold text-primary mt-1">Registration & Bootcamps</div>
            <p className="text-sm text-slate-600 mt-1">Enter</p>
          </Link>
          <Link to="/showcase" className="card p-5 hover:shadow-md transition">
            <div className="text-sm text-slate-500">Student Work</div>
            <div className="font-semibold text-primary mt-1">Projects & Awards</div>
            <p className="text-sm text-slate-600 mt-1">Share to earn commission</p>
          </Link>
          <Link to="/charity" className="card p-5 hover:shadow-md transition">
            <div className="text-sm text-slate-500">Charity Cases</div>
            <div className="font-semibold text-primary mt-1">Honors & Charity</div>
            <p className="text-sm text-slate-600 mt-1">Participate to earn points</p>
          </Link>
        </div>
        <div className="mt-4 card p-5 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200/50">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-sm text-slate-500">High-Commission Promotion</div>
              <h3 className="font-semibold text-bingo-dark mt-1">Platform-selected high-commission courses/products, one-click share</h3>
            </div>
            <Link to="/profile#promo" className="btn-primary shrink-0">Promotion Center</Link>
          </div>
        </div>
      </section>

      {/* Institutional partnerships */}
      <section className="py-8 border-t">
        <h2 className="section-title mb-4">Institutional Partnerships</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <a href="/#/join" className="card p-6 border-primary/30 hover:shadow-md transition flex flex-col">
            <div className="font-semibold text-primary">Offline Institution Partnership</div>
            <p className="text-sm text-slate-600 mt-1">Adopt Bingo AI courses and competitions—licensing, teacher training, and operations support</p>
            <span className="text-sm text-primary mt-3">Learn more →</span>
          </a>
          <a href="/#/oem" className="card p-6 border-primary/30 hover:shadow-md transition flex flex-col">
            <div className="font-semibold text-primary">OEM Partnership</div>
            <p className="text-sm text-slate-600 mt-1">Custom courses, tools, products; co-branding; technology transfer; co-build AI education</p>
            <span className="text-sm text-primary mt-3">Learn more →</span>
          </a>
        </div>
      </section>
    </div>
  )
}

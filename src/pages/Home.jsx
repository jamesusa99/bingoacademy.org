import { Link } from 'react-router-dom'

const HIGHLIGHTS = [
  { icon: '🎓', title: 'Expert Mentors', desc: 'University professors & AI researchers from top institutions' },
  { icon: '🏆', title: 'Competition Ready', desc: 'International AI competitions, awards & recognition' },
  { icon: '🔬', title: 'Hands-On Projects', desc: 'Real AI projects that build portfolios and research skills' },
  { icon: '📈', title: 'College Advantage', desc: 'STEM specialty track admissions and transcript-level achievement' },
]

const PAIN_POINTS = [
  'What should students learn to stay competitive in the AI era?',
  'How do I build a strong AI portfolio for college admissions?',
  'Which AI skills matter most for top universities?',
  'My student is curious about AI—how do they learn systematically?',
  'How do I go beyond using AI tools to actually building with them?',
  'How can AI projects lead to real competition awards and recognition?',
  'Which AI courses are designed for high-achieving students?',
  'How do I connect AI skills to college essays and recommendations?',
]

const HOT_COURSES = [
  { name: 'AI Literacy & Foundations', to: '/courses?type=literacy', tag: 'Flagship', desc: 'Build deep understanding of AI systems, not just tool usage' },
  { name: 'Science Camp · AI Research Track', to: '/research', tag: 'Camp', desc: 'Immersive research experience with real project outcomes' },
  { name: 'STEM Specialty Track Admissions', to: '/courses?type=exam', tag: 'Admissions', desc: 'Targeted prep for STEM-focused college pathways' },
]

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* Hero */}
      <section className="mb-12 text-center py-10 section-tech rounded-2xl">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-bingo-dark leading-tight mb-4">
          Future-Ready AI Education<br className="hidden sm:block" /> for High-Performing Students
        </h1>
        <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto mb-8">
          Bingo AI Academy equips students with the skills, projects, and credentials to stand out in the AI era—from foundations to international competitions.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link to="/courses" className="btn-primary px-6 py-2.5 text-base">Explore Courses</Link>
          <Link to="/research" className="px-6 py-2.5 text-base rounded-xl border border-primary text-primary font-medium hover:bg-primary/5 transition">Science Camp</Link>
        </div>
      </section>

      {/* Why Bingo */}
      <section className="mb-12">
        <h2 className="section-title mb-6">Why Bingo AI Academy</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {HIGHLIGHTS.map((h, i) => (
            <div key={i} className="card p-5 text-center hover:shadow-md hover:border-primary/30 transition">
              <div className="text-3xl mb-2">{h.icon}</div>
              <div className="font-semibold text-bingo-dark">{h.title}</div>
              <p className="text-sm text-slate-500 mt-1">{h.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Common questions */}
      <section className="mb-12 max-w-4xl mx-auto">
        <h2 className="section-title mb-2">Questions We Hear</h2>
        <p className="text-slate-500 text-sm mb-5">Sound familiar? We have answers.</p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          {PAIN_POINTS.map((q, i) => (
            <li key={i} className="card px-4 py-3 text-slate-700 hover:border-primary/30 hover:shadow-sm transition">
              {q}
            </li>
          ))}
        </ul>
      </section>

      {/* Flagship courses */}
      <section className="mb-12">
        <h2 className="section-title mb-2">Flagship Programs</h2>
        <p className="text-slate-500 text-sm mb-5">Rigorous, research-backed courses for students who want more than basics</p>
        <div className="grid sm:grid-cols-3 gap-4">
          {HOT_COURSES.map((c, i) => (
            <Link key={i} to={c.to} className="card p-6 hover:shadow-md transition border-primary/20 flex flex-col">
              <span className="text-xs px-2 py-0.5 rounded bg-primary/20 text-primary self-start">{c.tag}</span>
              <div className="font-semibold text-primary mt-3">{c.name}</div>
              <p className="text-sm text-slate-500 mt-1">{c.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* AI Assessment */}
      <section className="mb-12">
        <div className="card p-6 bg-gradient-to-r from-cyan-50 to-sky-50 border-primary/20 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-bingo-dark text-lg">AI Capability Assessment</h3>
            <p className="text-slate-600 text-sm mt-1">Discover your student's strengths and get a personalized learning path recommendation.</p>
            <Link to="/growth" className="text-primary font-medium mt-2 inline-block text-sm">Take Free Assessment →</Link>
          </div>
          <Link to="/courses" className="btn-primary shrink-0">View Recommended Courses</Link>
        </div>
      </section>

      {/* Core products */}
      <section className="mb-12">
        <h2 className="section-title mb-6">Core Programs & Services</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <Link to="/courses?type=literacy" className="card p-6 text-center hover:shadow-md transition">
            <div className="text-primary font-semibold">AI Literacy</div>
            <div className="text-sm text-slate-500 mt-1">Foundations & Meta-cognition</div>
          </Link>
          <Link to="/courses?type=exam" className="card p-6 text-center hover:shadow-md transition">
            <div className="text-primary font-semibold">Admissions Prep</div>
            <div className="text-sm text-slate-500 mt-1">STEM Specialty Track</div>
          </Link>
          <Link to="/research" className="card p-6 text-center hover:shadow-md transition">
            <div className="text-primary font-semibold">Science Camp</div>
            <div className="text-sm text-slate-500 mt-1">Research · Projects · Awards</div>
          </Link>
          <Link to="/events" className="card p-6 text-center hover:shadow-md transition border-primary/30">
            <div className="text-primary font-semibold">Events Center</div>
            <div className="text-sm text-slate-500 mt-1">Competitions · Bootcamps</div>
          </Link>
          <Link to="/community" className="card p-6 text-center hover:shadow-md transition border-primary/30">
            <div className="text-primary font-semibold">AI Community</div>
            <div className="text-sm text-slate-500 mt-1">Mentors · Peers · Q&A</div>
          </Link>
        </div>
      </section>

      {/* Mission */}
      <section className="py-8 border-t max-w-3xl mx-auto text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-bingo-dark mb-4">
          Mastering AI—Not Just Using It
        </h2>
        <p className="text-slate-600 leading-relaxed mb-4">
          As AI reshapes every industry, the students who thrive won't be those who use AI passively—they'll be the ones who understand it, build with it, and lead with it.
        </p>
        <p className="text-slate-600 leading-relaxed">
          Bingo AI Academy is designed for high-performing students who want to go beyond the basics: building real projects, earning meaningful credentials, and developing the AI fluency that top universities and employers are looking for.
        </p>
      </section>

      {/* Institutional partnerships */}
      <section className="py-8 border-t">
        <h2 className="section-title mb-4">Institutional Partnerships</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <a href="/#/join" className="card p-6 border-primary/30 hover:shadow-md transition flex flex-col">
            <div className="font-semibold text-primary">School & Institution Partnership</div>
            <p className="text-sm text-slate-600 mt-1">Bring Bingo AI courses to your school—curriculum licensing, teacher training, and full operations support</p>
            <span className="text-sm text-primary mt-3">Learn more →</span>
          </a>
          <a href="/#/oem" className="card p-6 border-primary/30 hover:shadow-md transition flex flex-col">
            <div className="font-semibold text-primary">OEM Partnership</div>
            <p className="text-sm text-slate-600 mt-1">Custom courses, tools, and co-branded AI education programs built to your needs</p>
            <span className="text-sm text-primary mt-3">Learn more →</span>
          </a>
        </div>
      </section>

    </div>
  )
}

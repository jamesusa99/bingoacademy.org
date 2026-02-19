import { Link } from 'react-router-dom'

export default function Growth() {
  const learnerItems = [
    { title: 'Learner Certification', desc: 'AI skill and literacy certification for students' },
    { title: 'AI Skill Level Certification', desc: 'Tiered assessment with materials and prep courses' },
    { title: 'Certification registration, prep materials, mock tests', desc: '' },
    { title: 'Certificate lookup and showcase', desc: 'Build confidence, drive sharing' },
  ]
  const items = [
    { title: 'Growth packages by stage', desc: 'Intro → Intermediate → Advanced; materials, courses, tools' },
    { title: 'Personalized growth plan', desc: 'AI assessment + custom learning path' },
    { title: 'Daily challenges, points and rewards', desc: 'Points for materials/tools, course coupons' },
    { title: 'Long-term mentor follow-up', desc: '1-on-1 guidance, retention' },
  ]
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-bingo-dark mb-2">Growth Plan</h1>
      <p className="text-slate-600 mb-6">AI assessment → Learning plan → Stage packages → Progress tracking. Intro/intermediate/advanced assessment; personalized path; packages (commission + share); learning calendar, challenges, points; 1-on-1 mentor follow-up</p>

      <section className="mb-8">
        <h2 className="section-title mb-4">AI Capability Assessment · Course Recommendations</h2>
        <div className="card p-6 bg-gradient-to-r from-cyan-50 to-sky-50 border-primary/20 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-slate-600">Assess your child&apos;s AI literacy and potential; get course and learning path recommendations.</p>
            <p className="text-sm text-slate-500 mt-2">After the assessment, view stage packages and learning plans on this page.</p>
          </div>
          <Link to="/growth#assess" className="btn-primary shrink-0">Take Assessment</Link>
        </div>
      </section>

      <div id="assess" className="card p-6 bg-cyan-50/50 border-primary/20 mb-8">
        <h3 className="font-semibold text-primary mb-2">AI Portfolio · Capability Profile</h3>
        <p className="text-slate-600 text-sm">Build an AI portfolio as you learn; system generates capability profile; linked to certification center for level and certificate; useful for admissions and employment.</p>
      </div>

      <section className="mb-10">
        <h2 className="section-title">Learner Certification</h2>
        <p className="text-slate-600 text-sm mb-4">AI skill and literacy certification; links to growth path, portfolio, and capability profile</p>
        <div className="grid md:grid-cols-2 gap-4">
          {learnerItems.map((item, i) => (
            <div key={i} className="card p-6">
              <h3 className="font-semibold text-primary">{item.title}</h3>
              {item.desc && <p className="text-sm text-slate-600 mt-1">{item.desc}</p>}
            </div>
          ))}
        </div>
      </section>

      <div className="grid md:grid-cols-2 gap-4">
        {items.map((item, i) => (
          <div key={i} className="card p-6">
            <h3 className="font-semibold text-primary">{item.title}</h3>
            <p className="text-sm text-slate-600 mt-1">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

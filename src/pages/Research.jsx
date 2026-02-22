import { Link } from 'react-router-dom'

const AGE_GROUPS = [
  { key: 'enlighten', name: 'Intro', range: '6-9 yrs', desc: 'Fun science intro, unplugged activities' },
  { key: 'advance', name: 'Intermediate', range: '10-14 yrs', desc: 'AI literacy, robotics intro' },
  { key: 'contest', name: 'Competition', range: '14-18 yrs', desc: 'Competition-focused, research projects' },
]

const SAMPLE_CAMPS = [
  { title: 'AI Literacy AI Camp', outline: 'AI literacy, unplugged activities, robotics', age: '8-12 yrs', to: '/research' },
  { title: 'Data Science Research Camp', outline: 'Data collection, visualization, report writing', age: '12-16 yrs', to: '/research' },
  { title: 'Machine Learning Intro Camp', outline: 'Model intro, hands-on training, outcomes', age: '14-18 yrs', to: '/research' },
]

const TRAINING_PROJECTS = [
  { title: 'Machine Learning Project', desc: 'Partner with universities, complete ML project & report' },
  { title: 'Data Visualization', desc: 'Real datasets, visualization reports' },
]

export default function Research() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-bingo-dark mb-2">AI Camp</h1>
      <p className="text-slate-600 mb-8">Camp Program, research projects, application, and admissions outcomes</p>

      {/* Camp Program */}
      <section className="mb-10">
        <h2 className="section-title">Camp Program</h2>
        <div className="card p-6 border-primary/20 bg-cyan-50/30 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-bingo-dark text-lg">Camp Program</h3>
              <p className="text-slate-600 text-sm mt-1">Comprehensive research camps covering AI literacy, data science, and machine learning</p>
            </div>
            <div className="text-primary font-semibold text-xl">$1590</div>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {AGE_GROUPS.map((g) => (
            <Link key={g.key} to={`/research?age=${g.key}`} className="card p-6 hover:shadow-md transition block">
              <div className="font-semibold text-primary">{g.name}</div>
              <div className="text-sm text-slate-500 mt-1">{g.range}</div>
              <p className="text-sm text-slate-600 mt-2">{g.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="section-title">Camp Program · Camp Details</h2>
        <p className="text-slate-600 text-sm mb-4">AI literacy, unplugged activities, robotics; instructor info; age range</p>
        <div className="grid md:grid-cols-3 gap-4">
          {SAMPLE_CAMPS.map((c, i) => (
            <Link key={i} to={c.to} className="card p-6 hover:shadow-md transition block">
              <h3 className="font-semibold text-primary">{c.title}</h3>
              <p className="text-sm text-slate-600 mt-1">{c.outline}</p>
              <span className="inline-block mt-2 text-xs text-slate-500">Age: {c.age}</span>
              <p className="text-primary font-semibold mt-3">$1590</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="section-title">Application</h2>
        <div className="card p-6 bg-cyan-50/50 border-primary/20">
          <p className="text-slate-600 mb-4">Parents or institutions submit a short form online.</p>
          <div className="flex flex-wrap gap-3">
            <label className="flex-1 min-w-[140px]">
              <span className="block text-sm text-slate-600 mb-1">Child name / Institution</span>
              <input type="text" placeholder="Optional" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </label>
            <label className="flex-1 min-w-[140px]">
              <span className="block text-sm text-slate-600 mb-1">Phone</span>
              <input type="tel" placeholder="Required" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </label>
            <label className="flex-1 min-w-[140px]">
              <span className="block text-sm text-slate-600 mb-1">Camp / Age group</span>
              <select className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                <option>Intro 6-9 yrs</option>
                <option>Intermediate 10-14 yrs</option>
                <option>Competition 14-18 yrs</option>
              </select>
            </label>
          </div>
          <button type="button" className="btn-primary mt-4">Submit</button>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="section-title">Research Projects</h2>
        <p className="text-slate-600 text-sm mb-4">Deep AI research with universities and labs (e.g. ML, data visualization)</p>
        <div className="grid md:grid-cols-2 gap-4">
          {TRAINING_PROJECTS.map((p, i) => (
            <div key={i} className="card p-6">
              <h3 className="font-semibold text-primary">{p.title}</h3>
              <p className="text-sm text-slate-600 mt-1">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="section-title">Admissions Outcomes</h2>
        <p className="text-slate-600 text-sm mb-4">Past student certificates, work, and admissions results</p>
        <div className="card p-6 bg-slate-50">
          <ul className="text-sm text-slate-700 space-y-2">
            <li>· STEM competition winners admissions outcomes</li>
            <li>· Data science / AI project work and evaluation materials</li>
            <li>· STEM specialty track and admissions pathway cases</li>
          </ul>
        </div>
      </section>
    </div>
  )
}

const REPORT_ITEMS = [
  { type: 'Trending', text: 'Ministry pushes K-12 AI education, literacy and ethics', date: '2025-02' },
  { type: 'Industry', text: 'Youth AI prestigious competitions expand, STEM literacy boosts admissions', date: '2025-02' },
  { type: 'Honor', text: 'Bingo AI Academy named "Annual AI Education Innovation Institution"', date: '2025-01' },
  { type: 'Trending', text: 'Multiple regions add AI literacy to comprehensive evaluation', date: '2025-01' },
  { type: 'Honor', text: 'Bingo students win first prize in National Youth AI Challenge', date: '2025-01' },
  { type: 'Industry', text: 'Industry-education policy support, enterprise-institution AI training partnerships', date: '2024-12' },
]

const items = [
  { title: 'Charity Education', desc: 'Donate materials/tools, free charity courses for youth/underserved groups' },
  { title: 'Charity Events', desc: 'AI charity events to raise brand impact' },
  { title: 'Charity Challenges', desc: 'User participation, platform donates to charity fund' },
  { title: 'Charity Showcase', desc: 'Build trust, drive C-end engagement' },
]

export default function Charity() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-bingo-dark mb-2">Honors & Charity</h1>
      <p className="text-slate-600 mb-6">Honors coverage; charity projects → Details → Participate → Results. Charity courses, charity events, materials donation (share earns charity points); registration/challenge donations; beneficiary cases; institutional/enterprise partnership applications</p>

      <section className="mb-8">
        <h2 className="section-title mb-4">Recent Coverage</h2>
        <div className="card overflow-hidden">
          <ul className="divide-y divide-slate-100">
            {REPORT_ITEMS.map((r, i) => (
              <li key={i} className="px-4 py-3 flex flex-wrap items-center gap-2 hover:bg-slate-50 transition">
                <span className={`text-xs px-2 py-0.5 rounded ${
                  r.type === 'Honor' ? 'bg-amber-100 text-amber-800' : r.type === 'Trending' ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {r.type}
                </span>
                <span className="text-slate-700 text-sm flex-1">{r.text}</span>
                <span className="text-slate-400 text-xs">{r.date}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section>
        <h2 className="section-title">Charity Projects</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {items.map((item, i) => (
            <div key={i} className="card p-6">
              <h3 className="font-semibold text-primary">{item.title}</h3>
              <p className="text-sm text-slate-600 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

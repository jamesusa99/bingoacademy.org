import { Link } from 'react-router-dom'

const categories = [
  { key: 'white', name: 'Ministry Whitelist Events' },
  { key: 'international', name: 'International Events' },
  { key: 'provincial', name: 'Provincial Events' },
  { key: 'bingo', name: 'Bingo Cup (Own IP)' },
]
const services = [
  'AI event registration (online + offline)',
  'Event bootcamps (paid training, materials/tools)',
  'Event livestreams, replays, results announcements',
  'Custom event services (individuals/institutions)',
]
export default function Events() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-bingo-dark mb-2">Events Center</h1>
      <p className="text-slate-600 mb-6">Event list → Details → Registration → Bootcamp → Event → Results. Time/groups/requirements/awards; bootcamp commission rates; payment & qualification review; pre-event coaching & live Q&A; results & certificate download; custom event services</p>

      <section className="mb-10">
        <h2 className="section-title">Event Categories</h2>
        <div className="flex flex-wrap gap-3">
          {categories.map((c) => (
            <Link key={c.key} to={`/events?cat=${c.key}`} className="card px-5 py-3 hover:shadow-md">
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="section-title">Event Services</h2>
        <ul className="space-y-2">
          {services.map((s, i) => (
            <li key={i} className="card p-4 flex items-center">
              <span className="text-primary font-medium">{s}</span>
              <span className="text-xs text-slate-500 ml-2">Share registration/materials for commission</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="section-title">Cases & Results</h2>
        <p className="text-slate-600 text-sm mb-4">Past winners, bootcamp outcomes, partner school/institution case studies</p>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="card p-6">
            <h3 className="font-semibold text-primary">Award Cases</h3>
            <p className="text-sm text-slate-600 mt-1">Whitelist events, Bingo Cup winners and work showcase; links to student work and certification</p>
          </div>
          <div className="card p-6">
            <h3 className="font-semibold text-primary">Bootcamps & Outcomes</h3>
            <p className="text-sm text-slate-600 mt-1">Pre-event bootcamp results, partner school/institution event data</p>
          </div>
        </div>
      </section>
    </div>
  )
}

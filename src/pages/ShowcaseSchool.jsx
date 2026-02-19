import { Link } from 'react-router-dom'

export default function ShowcaseSchool() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/showcase" className="text-primary text-sm hover:underline">← Back to Showcase</Link>
      </div>
      <h1 className="text-2xl font-bold text-bingo-dark mb-2">School-Enterprise Partnerships</h1>
      <p className="text-slate-600 mb-8">School-enterprise partnership results; industry-education cases, project outcomes</p>
      <div className="card p-6">
        <p className="text-slate-600">Partnership list (sample); click for details</p>
      </div>
    </div>
  )
}

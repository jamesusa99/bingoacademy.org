import { Link } from 'react-router-dom'

export default function ShowcaseMaterials() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/showcase" className="text-primary text-sm hover:underline">← Back to Showcase</Link>
      </div>
      <h1 className="text-2xl font-bold text-bingo-dark mb-2">Materials & Tools</h1>
      <p className="text-slate-600 mb-8">Teaching tools results, materials learning cases; images/video</p>
      <div className="card p-6">
        <p className="text-slate-600">Materials results list (sample); click for details; link to Mall purchase</p>
      </div>
    </div>
  )
}

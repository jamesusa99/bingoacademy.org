import { Link } from 'react-router-dom'

export default function ShowcaseAwards() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/showcase" className="text-primary text-sm hover:underline">← Back to Showcase</Link>
      </div>
      <h1 className="text-2xl font-bold text-bingo-dark mb-2">Event Awards</h1>
      <p className="text-slate-600 mb-8">Award cases, vocational & employment cases; images/video; like/comment/share</p>
      <div className="card p-6">
        <p className="text-slate-600">Award list (sample); filter by event/year; click for details</p>
      </div>
    </div>
  )
}

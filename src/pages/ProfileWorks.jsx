import { Link } from 'react-router-dom'

export default function ProfileWorks() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/profile" className="text-primary text-sm hover:underline">← Profile</Link>
      </div>
      <h1 className="text-2xl font-bold text-bingo-dark mb-2">My Works</h1>
      <p className="text-slate-600 mb-8">My projects, learning outcomes, and portfolio; share to Showcase</p>
      <div className="card p-6">
        <p className="text-slate-600">No works yet. Go to <Link to="/courses" className="text-primary hover:underline">AI Courses</Link> to learn and submit work</p>
      </div>
    </div>
  )
}

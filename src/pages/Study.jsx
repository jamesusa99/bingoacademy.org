import { Link } from 'react-router-dom'

export default function Study() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/profile" className="text-slate-500 hover:text-primary text-sm">← Profile</Link>
      </div>
      <h1 className="text-2xl font-bold text-bingo-dark mb-2">Study Center</h1>
      <p className="text-slate-600 mb-8">Add courses to your study center; learn, take notes, submit work, track progress and certificates</p>

      <section className="mb-10">
        <h2 className="section-title">My Courses</h2>
        <p className="text-slate-600 text-sm mb-4">Purchased or added courses appear here; click to start learning</p>
        <div className="card p-6 border-primary/20">
          <p className="text-slate-500 text-sm">No courses yet. Go to <Link to="/courses" className="text-primary hover:underline">AI Courses</Link> to enroll</p>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="section-title">Features</h2>
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <li className="card p-5">
            <span className="font-semibold text-primary">Playback</span>
            <p className="text-sm text-slate-600 mt-1">Video/live replay, resume from last position</p>
          </li>
          <li className="card p-5">
            <span className="font-semibold text-primary">Speed</span>
            <p className="text-sm text-slate-600 mt-1">0.75x–2x playback</p>
          </li>
          <li className="card p-5">
            <span className="font-semibold text-primary">Notes</span>
            <p className="text-sm text-slate-600 mt-1">Take notes during lessons; export and review</p>
          </li>
          <li className="card p-5">
            <span className="font-semibold text-primary">Q&A</span>
            <p className="text-sm text-slate-600 mt-1">Ask questions; mentor/TA answers</p>
          </li>
          <li className="card p-5">
            <span className="font-semibold text-primary">Assignments</span>
            <p className="text-sm text-slate-600 mt-1">Submit online; grading and feedback</p>
          </li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="section-title">Progress</h2>
        <div className="card p-6 bg-cyan-50/50 border-primary/20">
          <ul className="text-sm text-slate-700 space-y-2">
            <li><strong>Completed/Pending</strong>: Mark lessons/chapters as done; filter by status</li>
            <li><strong>Completion rate</strong>: Auto-calculated by chapter and lesson; view in reports</li>
            <li><strong>Certificate</strong>: Complete all lessons and pass assessment to earn certificate; view in Certification Center</li>
          </ul>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link to="/courses" className="btn-primary">Browse Courses</Link>
        <Link to="/profile" className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Back to Profile</Link>
      </div>
    </div>
  )
}

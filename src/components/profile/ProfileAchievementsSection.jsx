import { Link } from 'react-router-dom'
import { formatAccomplishmentDate } from '../../lib/userAccomplishments'

const CATEGORY_LABELS = {
  assessment: 'Assessment',
  course: 'Course',
  lab: 'Lab',
  competition: 'Competition',
  community: 'Community',
}

export default function ProfileAchievementsSection({ achievements, loading, error }) {
  return (
    <section id="achievements" className="mb-8 scroll-mt-28">
      <div className="mb-4">
        <h2 className="section-title mb-1">My Achievements</h2>
        <p className="text-sm text-slate-500">Milestones from assessments, courses, labs, and competitions</p>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <p className="p-6 text-sm text-slate-500">Loading achievements…</p>
        ) : error ? (
          <div className="p-6">
            <p className="text-sm text-red-600">{error}</p>
            <p className="text-xs text-slate-500 mt-2">
              Run migration <code className="text-[11px]">033_user_certs_achievements.sql</code> in Supabase if needed.
            </p>
          </div>
        ) : achievements.length === 0 ? (
          <div className="p-6">
            <p className="text-sm text-slate-600">No achievements yet.</p>
            <p className="text-xs text-slate-500 mt-2">
              Complete lessons, assessments, and labs — your milestones will appear here automatically.
            </p>
            <div className="flex flex-wrap gap-3 mt-3">
              <Link to="/profile/study" className="text-sm text-primary font-medium hover:underline">
                Go to Study Center →
              </Link>
              <Link to="/assessment" className="text-sm text-primary font-medium hover:underline">
                Take an assessment →
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {achievements.map((item) => (
              <div key={item.id} className="p-4 sm:p-5 flex gap-3 hover:bg-slate-50/60 transition">
                <span className="text-2xl shrink-0">{item.icon || '🏅'}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-0.5">
                    <h3 className="font-semibold text-bingo-dark text-sm">{item.title}</h3>
                    <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-800">
                      {CATEGORY_LABELS[item.category] || item.category}
                    </span>
                  </div>
                  {item.description ? (
                    <p className="text-xs text-slate-600 line-clamp-2">{item.description}</p>
                  ) : null}
                  <p className="text-xs text-slate-400 mt-1">{formatAccomplishmentDate(item.earned_at)}</p>
                  {item.href ? (
                    <Link to={item.href} className="text-xs text-primary font-medium hover:underline mt-2 inline-block">
                      Open →
                    </Link>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

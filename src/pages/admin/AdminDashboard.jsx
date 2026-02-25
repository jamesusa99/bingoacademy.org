import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ courses: 0, events: 0, threads: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const [c, e, t, sc, rc, cj, ct, mp, cr, cm] = await Promise.all([
          supabase.from('courses').select('id', { count: 'exact', head: true }),
          supabase.from('events').select('id', { count: 'exact', head: true }),
          supabase.from('forum_threads').select('id', { count: 'exact', head: true }),
          supabase.from('showcase_cases').select('id', { count: 'exact', head: true }),
          supabase.from('research_camps').select('id', { count: 'exact', head: true }),
          supabase.from('career_jobs').select('id', { count: 'exact', head: true }),
          supabase.from('cert_tiers').select('id', { count: 'exact', head: true }),
          supabase.from('mall_products').select('id', { count: 'exact', head: true }),
          supabase.from('charity_reports').select('id', { count: 'exact', head: true }),
          supabase.from('community_mentors').select('id', { count: 'exact', head: true }),
        ])
        setStats({
          courses: c.count ?? 0,
          events: e.count ?? 0,
          threads: t.count ?? 0,
          showcase: sc.count ?? 0,
          research: rc.count ?? 0,
          career: cj.count ?? 0,
          cert: ct.count ?? 0,
          mallProducts: mp.count ?? 0,
          charity: cr.count ?? 0,
          mentors: cm.count ?? 0,
        })
      } catch (err) {
        console.error('Failed to fetch stats:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const cards = [
    { label: 'Home Portal', value: '—', to: '/admin/home', icon: '🏠', color: 'bg-slate-100 border-slate-200' },
    { label: 'Achievements', value: stats.showcase ?? 0, to: '/admin/showcase', icon: '🏅', color: 'bg-amber-50 border-amber-200/60' },
    { label: 'AI Courses', value: stats.courses ?? 0, to: '/admin/courses', icon: '📚', color: 'bg-primary/10 border-primary/20' },
    { label: 'AI Camp', value: stats.research ?? 0, to: '/admin/research', icon: '⛺', color: 'bg-green-50 border-green-200/60' },
    { label: 'Events Center', value: stats.events ?? 0, to: '/admin/events', icon: '🏆', color: 'bg-amber-50 border-amber-200/60' },
    { label: 'AI Community', value: stats.mentors ?? 0, to: '/admin/mentors', icon: '👥', color: 'bg-violet-50 border-violet-200/60' },
    { label: 'Smart Careers', value: stats.career ?? 0, to: '/admin/career', icon: '💼', color: 'bg-sky-50 border-sky-200/60' },
    { label: 'Certification', value: stats.cert ?? 0, to: '/admin/cert', icon: '📜', color: 'bg-emerald-50 border-emerald-200/60' },
    { label: 'AI Mall Products', value: stats.mallProducts ?? 0, to: '/admin/mall-products', icon: '🛒', color: 'bg-orange-50 border-orange-200/60' },
    { label: 'Honors & Charity', value: stats.charity ?? 0, to: '/admin/charity', icon: '🎗️', color: 'bg-rose-50 border-rose-200/60' },
    { label: 'Forum', value: stats.threads ?? 0, to: '/admin/forum', icon: '💬', color: 'bg-green-50 border-green-200/60' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-bingo-dark mb-6">Operations Dashboard</h1>

      {loading ? (
        <div className="card p-8 text-center text-slate-500">Loading stats...</div>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {cards.map((c) => (
            <Link key={c.to} to={c.to} className={`card p-5 border-2 ${c.color} hover:shadow-md transition`}>
              <div className="flex items-center gap-3">
                <div className="text-2xl">{c.icon}</div>
                <div>
                  <div className="text-2xl font-bold text-bingo-dark">{c.value}</div>
                  <div className="text-sm text-slate-500">{c.label}</div>
                </div>
              </div>
              <div className="text-xs text-slate-500 mt-2">Manage →</div>
            </Link>
          ))}
        </div>
      )}

      <div className="card p-6">
        <h2 className="font-semibold text-bingo-dark mb-3">Quick Links</h2>
        <div className="flex flex-wrap gap-2">
          <Link to="/admin/home" className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-sm font-medium">Home Portal</Link>
          <Link to="/admin/showcase" className="px-4 py-2 rounded-xl bg-amber-100 text-amber-700 text-sm font-medium">Achievements</Link>
          <Link to="/admin/courses" className="px-4 py-2 rounded-xl bg-primary/10 text-primary text-sm font-medium">AI Courses</Link>
          <Link to="/admin/research" className="px-4 py-2 rounded-xl bg-green-100 text-green-700 text-sm font-medium">AI Camp</Link>
          <Link to="/admin/events" className="px-4 py-2 rounded-xl bg-amber-100 text-amber-700 text-sm font-medium">Events</Link>
          <Link to="/admin/mentors" className="px-4 py-2 rounded-xl bg-violet-100 text-violet-700 text-sm font-medium">Mentors</Link>
          <Link to="/admin/career" className="px-4 py-2 rounded-xl bg-sky-100 text-sky-700 text-sm font-medium">Careers</Link>
          <Link to="/admin/cert" className="px-4 py-2 rounded-xl bg-emerald-100 text-emerald-700 text-sm font-medium">Certification</Link>
          <Link to="/admin/mall-products" className="px-4 py-2 rounded-xl bg-orange-100 text-orange-700 text-sm font-medium">Mall Products</Link>
          <Link to="/admin/charity" className="px-4 py-2 rounded-xl bg-rose-100 text-rose-700 text-sm font-medium">Charity</Link>
          <Link to="/admin/forum" className="px-4 py-2 rounded-xl bg-green-100 text-green-700 text-sm font-medium">Forum</Link>
          <Link to="/" className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 text-sm">View Site</Link>
        </div>
      </div>
    </div>
  )
}

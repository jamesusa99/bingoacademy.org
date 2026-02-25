import { useState, useEffect } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const ADMIN_NAV = [
  { path: '/admin', label: 'Dashboard', icon: '📊' },
  { path: '/admin/home', label: 'Home Portal', icon: '🏠' },
  { path: '/admin/showcase', label: 'Achievements', icon: '🏅' },
  { path: '/admin/courses', label: 'AI Courses', icon: '📚' },
  { path: '/admin/research', label: 'AI Camp', icon: '⛺' },
  { path: '/admin/events', label: 'Events Center', icon: '🏆' },
  { path: '/admin/mentors', label: 'AI Community', icon: '👥' },
  { path: '/admin/career', label: 'Smart Careers', icon: '💼' },
  { path: '/admin/cert', label: 'Certification', icon: '📜' },
  { path: '/admin/mall-products', label: 'AI Mall Products', icon: '🛒' },
  { path: '/admin/charity', label: 'Honors & Charity', icon: '🎗️' },
  { path: '/admin/forum', label: 'Forum', icon: '💬' },
]

export default function AdminLayout() {
  const loc = useLocation()
  const navigate = useNavigate()
  const [dbConnected, setDbConnected] = useState(null)

  useEffect(() => {
    supabase.from('courses').select('id').limit(1)
      .then(({ error }) => setDbConnected(!error))
      .catch(() => setDbConnected(false))
  }, [])

  return (
    <div className="min-h-screen flex bg-slate-100">
      {/* Sidebar */}
      <aside className="w-56 bg-bingo-dark flex flex-col shrink-0">
        <div className="p-4 border-b border-cyan-500/20">
          <Link to="/admin" className="flex items-center gap-2">
            <span className="text-cyan-400 font-bold">Bingo</span>
            <span className="text-white/80 text-sm">Admin</span>
          </Link>
          <div className="mt-3 text-xs font-medium">
            {dbConnected === null ? (
              <span className="text-slate-400">检测中…</span>
            ) : dbConnected ? (
              <span className="text-green-400">✓ 连接成功</span>
            ) : (
              <span className="text-red-400">✗ 连接数据失败</span>
            )}
          </div>
        </div>
        <nav className="flex-1 p-2">
          {ADMIN_NAV.map(({ path, label, icon }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition ${
                loc.pathname === path ? 'bg-cyan-500 text-white' : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>{icon}</span>
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-cyan-500/20">
          <button
            onClick={() => navigate('/')}
            className="w-full text-left px-3 py-2 text-xs text-slate-400 hover:text-white transition"
          >
            ← Back to Site
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

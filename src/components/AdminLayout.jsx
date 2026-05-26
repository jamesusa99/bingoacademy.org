import { useState, useEffect } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useAdminAuth } from '../hooks/useAdminAuth'
import { ADMIN_NAV_GROUPS, isAdminNavActive } from '../config/adminNav'

export default function AdminLayout() {
  const loc = useLocation()
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const { user, profile } = useAdminAuth()
  const [dbConnected, setDbConnected] = useState(null)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setDbConnected(false)
      return
    }
    supabase
      .from('courses')
      .select('id')
      .limit(1)
      .then(({ error }) => setDbConnected(!error))
      .catch(() => setDbConnected(false))
  }, [])

  const handleSignOut = async () => {
    await signOut()
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen flex bg-slate-100">
      <aside className="w-60 bg-bingo-dark flex flex-col shrink-0">
        <div className="p-4 border-b border-cyan-500/20">
          <Link to="/admin" className="flex items-center gap-2 min-w-0">
            <img src="/logo-icon.png" alt="" className="h-8 w-auto shrink-0" width={340} height={209} aria-hidden />
            <span className="text-white/90 text-sm font-medium truncate">Admin</span>
          </Link>
          <div className="mt-3 text-xs font-medium">
            {dbConnected === null ? (
              <span className="text-slate-400">Checking…</span>
            ) : dbConnected ? (
              <span className="text-green-400">✓ Database</span>
            ) : (
              <span className="text-red-400">✗ Database</span>
            )}
          </div>
          {user ? (
            <p className="mt-2 text-xs text-slate-400 truncate" title={user.email}>
              {profile?.full_name || user.email}
              {profile?.role ? <span className="text-cyan-400/80"> · {profile.role}</span> : null}
            </p>
          ) : null}
        </div>

        <nav className="flex-1 p-2 overflow-y-auto">
          {ADMIN_NAV_GROUPS.map((group) => (
            <div key={group.title} className="mb-4">
              <p className="px-3 py-1 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">{group.title}</p>
              {group.items.map(({ path, label, icon, end }) => {
                const active = isAdminNavActive(loc.pathname, path, end)
                return (
                  <Link
                    key={path}
                    to={path}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${
                      active ? 'bg-cyan-500 text-white' : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span>{icon}</span>
                    {label}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-cyan-500/20 space-y-1">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full text-left px-3 py-2 text-xs text-slate-400 hover:text-white transition"
          >
            ← Back to Site
          </button>
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full text-left px-3 py-2 text-xs text-slate-400 hover:text-white transition"
          >
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

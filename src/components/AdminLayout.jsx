import { useState, useEffect } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useAdminAuth } from '../hooks/useAdminAuth'
import { useAdminLocale } from '../contexts/AdminLocaleContext'
import { ADMIN_NAV_GROUPS, isAdminNavActive } from '../config/adminNav'
import AdminLanguageSwitcher from './admin/AdminLanguageSwitcher'

export default function AdminLayout() {
  const loc = useLocation()
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const { user, profile } = useAdminAuth()
  const { t } = useAdminLocale()
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
    <div className="min-h-screen bg-slate-100">
      <aside className="fixed inset-y-0 left-0 z-40 w-60 bg-bingo-dark flex flex-col">
        <div className="p-4 border-b border-cyan-500/20">
          <div className="flex items-center justify-between gap-2 mb-2">
            <Link to="/admin" className="flex items-center gap-2 min-w-0 flex-1">
              <img src="/logo-icon.png" alt="" className="h-8 w-auto shrink-0" width={340} height={209} aria-hidden />
              <span className="text-white/90 text-sm font-medium truncate">{t('layout.title')}</span>
            </Link>
            <AdminLanguageSwitcher />
          </div>
          <div className="text-xs font-medium">
            {dbConnected === null ? (
              <span className="text-slate-400">{t('layout.checking')}</span>
            ) : dbConnected ? (
              <span className="text-green-400">{t('layout.dbConnected')}</span>
            ) : (
              <span className="text-red-400">{t('layout.dbDisconnected')}</span>
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
            <div key={group.titleKey} className="mb-4">
              <p className="px-3 py-1 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                {t(group.titleKey)}
              </p>
              {group.items.map(({ path, labelKey, icon, end }) => {
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
                    {t(labelKey)}
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
            {t('layout.backToSite')}
          </button>
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full text-left px-3 py-2 text-xs text-slate-400 hover:text-white transition"
          >
            {t('layout.signOut')}
          </button>
        </div>
      </aside>

      <main className="min-h-screen ml-60 overflow-auto">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

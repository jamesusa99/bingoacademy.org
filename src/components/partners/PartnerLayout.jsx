import { Suspense } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useAdminLocale } from '../../contexts/AdminLocaleContext'
import AdminLanguageSwitcher from '../admin/AdminLanguageSwitcher'
import RouteFallback from '../RouteFallback'

export default function PartnerLayout() {
  const { t } = useAdminLocale()
  const { signOut, user } = useAuth()

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <Link to="/partners" className="flex items-center gap-2">
            <img src="/logo.png" alt="" className="h-7 w-auto" />
            <span className="text-sm font-semibold">{t('partner.brand')}</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-300 hidden sm:inline">{user?.email}</span>
            <AdminLanguageSwitcher englishFirst />
            <button type="button" onClick={() => signOut()} className="text-xs text-slate-300 hover:text-white">
              {t('layout.signOut')}
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8">
        <Suspense fallback={<RouteFallback />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  )
}

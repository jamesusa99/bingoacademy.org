import { Navigate, useLocation } from 'react-router-dom'
import { useAdminAuth } from '../../hooks/useAdminAuth'
import { useAdminLocale } from '../../contexts/AdminLocaleContext'
import AdminLanguageSwitcher from './AdminLanguageSwitcher'

export default function AdminGuard({ children }) {
  const loc = useLocation()
  const { loading, isAdmin, user, configured } = useAdminAuth()
  const { t } = useAdminLocale()

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 text-slate-600 gap-3">
        <p>{t('guard.verifying')}</p>
      </div>
    )
  }

  if (!configured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
        <div className="card max-w-md p-6 text-center relative">
          <div className="absolute top-4 right-4">
            <AdminLanguageSwitcher className="[&_button]:text-slate-600 [&_button:hover]:bg-slate-100" />
          </div>
          <h1 className="text-lg font-semibold text-bingo-dark mb-2">{t('guard.unavailableTitle')}</h1>
          <p className="text-sm text-slate-600 mb-4">{t('guard.unavailableBody')}</p>
          <a href="/" className="text-sm text-primary hover:underline">
            {t('guard.backToSite')}
          </a>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/admin/login" replace state={{ from: loc.pathname }} />
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
        <div className="card max-w-md p-6 text-center relative">
          <div className="absolute top-4 right-4">
            <AdminLanguageSwitcher className="[&_button]:text-slate-600 [&_button:hover]:bg-slate-100" />
          </div>
          <h1 className="text-lg font-semibold text-bingo-dark mb-2">{t('guard.deniedTitle')}</h1>
          <p className="text-sm text-slate-600 mb-4">{t('guard.deniedBody', { email: user.email })}</p>
          <a href="/" className="text-sm text-primary hover:underline">
            {t('guard.backToSite')}
          </a>
        </div>
      </div>
    )
  }

  return children
}

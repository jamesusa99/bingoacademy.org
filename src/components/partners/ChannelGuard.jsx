import { Link, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useAdminLocale } from '../../contexts/AdminLocaleContext'
import { useChannelMembership } from '../../hooks/useChannelMembership'
import AdminLanguageSwitcher from '../admin/AdminLanguageSwitcher'

export default function ChannelGuard({ children }) {
  const loc = useLocation()
  const { t } = useAdminLocale()
  const { user, loading: authLoading, isAuthenticated } = useAuth()
  const { loading, memberships, configured } = useChannelMembership()

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 text-slate-600">
        {t('partner.checking')}
      </div>
    )
  }

  if (!configured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
        <div className="card max-w-md p-6 text-center">
          <h1 className="text-lg font-semibold mb-2">{t('partner.unavailableTitle')}</h1>
          <p className="text-sm text-slate-600">{t('partner.unavailableBody')}</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return <Navigate to={`/partners/login?redirect=${encodeURIComponent(loc.pathname)}`} replace />
  }

  if (!memberships.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
        <div className="card max-w-md p-6 text-center relative">
          <div className="absolute top-4 right-4">
            <AdminLanguageSwitcher englishFirst tone="light" />
          </div>
          <h1 className="text-lg font-semibold text-bingo-dark mb-2">{t('partner.deniedTitle')}</h1>
          <p className="text-sm text-slate-600 mb-4">{t('partner.deniedBody', { email: user.email })}</p>
          <Link to="/" className="text-sm text-primary hover:underline">
            {t('partner.backToSite')}
          </Link>
        </div>
      </div>
    )
  }

  return children
}

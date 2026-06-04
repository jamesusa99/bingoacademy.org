import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { signInWithEmail } from '../../lib/auth'
import { isSupabaseConfigured } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useAdminAuth } from '../../hooks/useAdminAuth'
import { useAdminLocale } from '../../contexts/AdminLocaleContext'
import { readAdminLoginNext, sanitizeAdminNextPath } from '../../lib/admin/loginRedirect'
import { getProgramCurriculum } from '../../config/programCurriculum'
import AdminLanguageSwitcher from '../../components/admin/AdminLanguageSwitcher'
import AuthAlert from '../../components/auth/AuthAlert'

export default function AdminLogin() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = readAdminLoginNext(location)
  const nextLabel = useMemo(() => {
    const path = sanitizeAdminNextPath(from)
    if (path.includes('/curriculum/ioai')) return getProgramCurriculum('ioai').adminTitle
    if (path.includes('/curriculum/general')) return getProgramCurriculum('general').adminTitle
    if (path.includes('/curriculum/k12')) return getProgramCurriculum('k12').adminTitle
    if (path !== '/admin') return path.replace(/^\/admin\/?/, '') || t('login.targetAdmin')
    return null
  }, [from, t])
  const { isAuthenticated, loading: authLoading } = useAuth()
  const { isAdmin, loading: adminLoading } = useAdminAuth()
  const { t } = useAdminLocale()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authLoading && !adminLoading && isAuthenticated && isAdmin) {
      navigate(from, { replace: true })
    }
  }, [authLoading, adminLoading, isAuthenticated, isAdmin, navigate, from])

  useEffect(() => {
    if (authLoading || adminLoading || !isAuthenticated || isAdmin) return
    setError(t('login.noAdminAccess'))
  }, [authLoading, adminLoading, isAuthenticated, isAdmin, t])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: signInError } = await signInWithEmail(email, password)
    setLoading(false)
    if (signInError) {
      setError(signInError.message)
    }
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
        <div className="card max-w-md w-full p-8 relative">
          <div className="absolute top-4 right-4">
            <AdminLanguageSwitcher className="[&_button]:text-slate-600 [&_button:hover]:bg-slate-100" />
          </div>
          <h1 className="text-xl font-bold text-bingo-dark mb-2">{t('login.notConfiguredTitle')}</h1>
          <AuthAlert type="warning">{t('login.notConfiguredBody')}</AuthAlert>
          <Link to="/" className="text-sm text-primary hover:underline mt-4 inline-block">
            {t('login.backToSite')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
      <div className="card max-w-md w-full p-8 relative">
        <div className="absolute top-4 right-4">
          <AdminLanguageSwitcher className="[&_button]:text-slate-600 [&_button:hover]:bg-slate-100 [&_button.bg-cyan-500]:text-white" />
        </div>

        <div className="flex items-center gap-2 mb-6 pr-20">
          <img src="/logo-icon.png" alt="" className="h-8 w-auto" width={340} height={209} />
          <span className="font-semibold text-bingo-dark text-sm leading-tight">{t('login.brand')}</span>
        </div>
        <h1 className="text-lg font-bold text-bingo-dark mb-1">{t('login.title')}</h1>
        <p className="text-sm text-slate-500 mb-2">{t('login.subtitle')}</p>
        {nextLabel ? (
          <p className="text-xs text-primary mb-4">
            {t('login.redirectHint', { target: nextLabel })}
          </p>
        ) : (
          <div className="mb-4" />
        )}

        {error ? <AuthAlert type="error">{error}</AuthAlert> : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="admin-email" className="block text-sm font-medium text-slate-700 mb-1">
              {t('login.email')}
            </label>
            <input
              id="admin-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="admin-password" className="block text-sm font-medium text-slate-700 mb-1">
              {t('login.password')}
            </label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading || authLoading}
            className="w-full btn-primary py-2.5 text-sm font-medium disabled:opacity-60"
          >
            {loading ? t('login.submitting') : t('login.submit')}
          </button>
        </form>

        <p className="text-xs text-slate-500 mt-6">{t('login.needAccess')}</p>
        <Link to="/" className="text-sm text-primary hover:underline mt-4 inline-block">
          {t('login.backToSite')}
        </Link>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { signInWithEmail } from '../../lib/auth'
import { isSupabaseConfigured } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useAdminLocale } from '../../contexts/AdminLocaleContext'
import { fetchChannelMe } from '../../lib/channelsApi'
import AdminLanguageSwitcher from '../../components/admin/AdminLanguageSwitcher'
import AuthAlert from '../../components/auth/AuthAlert'
import PageMeta from '../../components/PageMeta'

export default function PartnerLogin() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { t } = useAdminLocale()
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (authLoading || !isAuthenticated) return
    let cancelled = false
    fetchChannelMe()
      .then((data) => {
        if (cancelled) return
        if (data.memberships?.length) navigate('/partners', { replace: true })
        else setError(t('partner.deniedBody', { email: email || 'this account' }))
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
    return () => {
      cancelled = true
    }
  }, [authLoading, isAuthenticated, navigate, t, email])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: signInError } = await signInWithEmail(email, password)
    setLoading(false)
    if (signInError) setError(signInError.message)
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
        <div className="card max-w-md w-full p-8">
          <h1 className="text-xl font-bold mb-2">{t('partner.unavailableTitle')}</h1>
          <AuthAlert type="warning">{t('partner.unavailableBody')}</AuthAlert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
      <PageMeta title={t('partner.loginTitle')} noindex />
      <div className="card max-w-md w-full p-8 relative">
        <div className="absolute top-4 right-4">
          <AdminLanguageSwitcher englishFirst tone="light" />
        </div>
        <div className="flex items-center gap-2 mb-6 pr-16">
          <img src="/logo-icon.png" alt="" className="h-8 w-auto" />
          <div>
            <p className="text-xs text-slate-500">{t('partner.brand')}</p>
            <h1 className="text-xl font-bold text-bingo-dark">{t('partner.loginTitle')}</h1>
          </div>
        </div>
        <p className="text-sm text-slate-600 mb-5">{t('partner.loginSubtitle')}</p>
        {error ? <AuthAlert type="error">{error}</AuthAlert> : null}
        {searchParams.get('redirect') ? (
          <p className="text-xs text-slate-500 mb-3">{t('partner.redirectHint')}</p>
        ) : null}
        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block text-xs font-medium text-slate-600">
            {t('login.email')}
            <input
              type="email"
              required
              className="input w-full mt-1"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="block text-xs font-medium text-slate-600">
            {t('login.password')}
            <input
              type="password"
              required
              className="input w-full mt-1"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 disabled:opacity-60">
            {loading ? t('login.submitting') : t('partner.loginSubmit')}
          </button>
        </form>
        <Link to="/" className="text-sm text-primary hover:underline mt-4 inline-block">
          {t('partner.backToSite')}
        </Link>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { signInWithEmail, signInWithGoogle, formatAuthError } from '../lib/auth'
import { isSupabaseConfigured } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { safeRedirectPath, authLink, storePostLoginRedirect } from '../lib/authRedirect'
import GoogleSignInButton from '../components/auth/GoogleSignInButton'
import AuthAlert from '../components/auth/AuthAlert'

export default function Login() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectTo = safeRedirectPath(searchParams.get('redirect'), '/profile')
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  useEffect(() => {
    if (searchParams.get('registered') === '1') {
      setInfo('Account created. Sign in with your email and password, or check your inbox to confirm your email first.')
    }
    if (searchParams.get('reset') === 'sent') {
      setInfo('If that email is registered, we sent a password reset link. Check your inbox.')
    }
    if (searchParams.get('reset') === 'done') {
      setInfo('Password updated. Sign in with your new password.')
    }
    if (searchParams.get('confirmed') === '1') {
      setInfo('Email confirmed. You can sign in now.')
    }
  }, [searchParams])

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(redirectTo, { replace: true })
    }
  }, [authLoading, isAuthenticated, navigate, redirectTo])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setInfo('')
    setLoading(true)
    const { data, error: signInError } = await signInWithEmail(email, password)
    setLoading(false)
    if (signInError) {
      setError(signInError.message)
      return
    }
    if (data.session) {
      navigate(redirectTo, { replace: true })
      return
    }
    setError('Sign-in failed. If you just registered, confirm your email first, then try again.')
  }

  const handleGoogle = async () => {
    setError('')
    setInfo('')
    setGoogleLoading(true)
    storePostLoginRedirect(redirectTo)
    const { error: oauthError } = await signInWithGoogle()
    setGoogleLoading(false)
    if (oauthError) {
      setError(formatAuthError(oauthError))
    }
  }

  if (authLoading) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center text-slate-500 text-sm">Loading…</div>
    )
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-bingo-dark mb-2">Login</h1>
      <p className="text-slate-600 mb-6">
        Sign in with email or Google to access courses, your profile, and saved progress.
      </p>

      {!isSupabaseConfigured && (
        <div className="mb-6">
        <AuthAlert variant="info">
          <span>
            Auth requires Supabase. Add <code className="text-xs">VITE_SUPABASE_URL</code> and{' '}
            <code className="text-xs">VITE_SUPABASE_ANON_KEY</code> to <code className="text-xs">.env.local</code>,
            and enable Google under Authentication → Providers.
          </span>
        </AuthAlert>
        </div>
      )}

      {error && (
        <div className="mb-4">
          <AuthAlert>{error}</AuthAlert>
        </div>
      )}
      {info && (
        <div className="mb-4">
          <AuthAlert variant="success">{info}</AuthAlert>
        </div>
      )}

      <GoogleSignInButton onClick={handleGoogle} disabled={loading || googleLoading} />

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-[var(--page-bg,#f8fafc)] px-3 text-slate-400 font-medium">or with email</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <div>
          <label htmlFor="login-email" className="block text-sm font-medium text-slate-700 mb-1">
            Email
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary"
            required
            disabled={loading || googleLoading}
          />
        </div>
        <div>
          <label htmlFor="login-password" className="block text-sm font-medium text-slate-700 mb-1">
            Password
          </label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary"
            required
            disabled={loading || googleLoading}
          />
          <div className="flex justify-end mt-1">
            <Link to="/forgot-password" className="text-sm text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
        </div>
        <button
          type="submit"
          className="btn-primary w-full py-3 disabled:opacity-50"
          disabled={loading || googleLoading}
        >
          {loading ? 'Signing in…' : 'Sign in with email'}
        </button>
      </form>

      <p className="mt-6 text-center text-slate-600 text-sm">
        No account?{' '}
        <Link to={authLink('/register', redirectTo)} className="text-primary font-medium hover:underline">
          Register
        </Link>
      </p>
    </div>
  )
}

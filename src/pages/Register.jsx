import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { signUpWithEmail, signInWithGoogle, formatAuthError } from '../lib/auth'
import { isSupabaseConfigured } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { safeRedirectPath, authLink, storePostLoginRedirect } from '../lib/authRedirect'
import GoogleSignInButton from '../components/auth/GoogleSignInButton'
import AuthAlert from '../components/auth/AuthAlert'

export default function Register() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectTo = safeRedirectPath(searchParams.get('redirect'), '/profile')
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agree, setAgree] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(redirectTo, { replace: true })
    }
  }, [authLoading, isAuthenticated, navigate, redirectTo])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    const { data, error: signUpError } = await signUpWithEmail(email, password)
    setLoading(false)

    if (signUpError) {
      setError(signUpError.message)
      return
    }

    if (data.session) {
      navigate(redirectTo, { replace: true })
      return
    }

    setSuccess(
      'Account created. Check your email for a confirmation link if required, then sign in.'
    )
    setTimeout(() => navigate(authLink('/login', redirectTo) + '&registered=1'), 2500)
  }

  const handleGoogle = async () => {
    setError('')
    setSuccess('')
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
      <h1 className="text-2xl font-bold text-bingo-dark mb-2">Register</h1>
      <p className="text-slate-600 mb-8">
        Create an account with email or Google to save progress, enroll in courses, and join the community.
      </p>

      {!isSupabaseConfigured && (
        <div className="mb-4">
          <AuthAlert variant="info">
            Auth requires Supabase environment variables and Google provider enabled in the Supabase dashboard.
          </AuthAlert>
        </div>
      )}

      {error && (
        <div className="mb-4">
          <AuthAlert>{error}</AuthAlert>
        </div>
      )}
      {success && (
        <div className="mb-4">
          <AuthAlert variant="success">{success}</AuthAlert>
        </div>
      )}

      <GoogleSignInButton
        onClick={handleGoogle}
        disabled={loading || googleLoading}
        label="Sign up with Google"
      />

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
          <label htmlFor="register-email" className="block text-sm font-medium text-slate-700 mb-1">
            Email
          </label>
          <input
            id="register-email"
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
          <label htmlFor="register-password" className="block text-sm font-medium text-slate-700 mb-1">
            Password
          </label>
          <input
            id="register-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary"
            required
            minLength={6}
            disabled={loading || googleLoading}
          />
        </div>
        <div>
          <label htmlFor="register-confirm" className="block text-sm font-medium text-slate-700 mb-1">
            Confirm password
          </label>
          <input
            id="register-confirm"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter password"
            className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary"
            required
            minLength={6}
            disabled={loading || googleLoading}
          />
        </div>
        <label className="flex items-start gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            className="mt-1 rounded border-slate-300 text-primary focus:ring-primary"
            disabled={loading || googleLoading}
          />
          <span>
            I agree to the{' '}
            <Link to="/agreement" className="text-primary hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </span>
        </label>
        <button
          type="submit"
          className="btn-primary w-full py-3 disabled:opacity-50"
          disabled={!agree || loading || googleLoading}
        >
          {loading ? 'Creating account…' : 'Register with email'}
        </button>
      </form>

      <p className="mt-6 text-center text-slate-600 text-sm">
        Already have an account?{' '}
        <Link to={authLink('/login', redirectTo)} className="text-primary font-medium hover:underline">
          Login
        </Link>
      </p>
    </div>
  )
}

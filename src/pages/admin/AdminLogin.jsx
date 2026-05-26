import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { signInWithEmail } from '../../lib/auth'
import { isSupabaseConfigured } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useAdminAuth } from '../../hooks/useAdminAuth'
import AuthAlert from '../../components/auth/AuthAlert'

export default function AdminLogin() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/admin'
  const { isAuthenticated, loading: authLoading } = useAuth()
  const { isAdmin, loading: adminLoading } = useAdminAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authLoading && !adminLoading && isAuthenticated && isAdmin) {
      navigate(from, { replace: true })
    }
  }, [authLoading, adminLoading, isAuthenticated, isAdmin, navigate, from])

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
        <div className="card max-w-md w-full p-8">
          <h1 className="text-xl font-bold text-bingo-dark mb-2">Admin sign-in</h1>
          <AuthAlert type="warning">Supabase is not configured. Add VITE_SUPABASE_* to .env.local.</AuthAlert>
          <Link to="/" className="text-sm text-primary hover:underline mt-4 inline-block">← Back to site</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
      <div className="card max-w-md w-full p-8">
        <div className="flex items-center gap-2 mb-6">
          <img src="/logo-icon.png" alt="" className="h-8 w-auto" width={340} height={209} />
          <span className="font-semibold text-bingo-dark">Bingo Academy Admin</span>
        </div>
        <h1 className="text-lg font-bold text-bingo-dark mb-1">Sign in</h1>
        <p className="text-sm text-slate-500 mb-6">Admin or editor accounts only.</p>

        {error ? <AuthAlert type="error">{error}</AuthAlert> : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="admin-email" className="block text-sm font-medium text-slate-700 mb-1">
              Email
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
              Password
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
            {loading ? 'Signing in…' : 'Sign in to admin'}
          </button>
        </form>

        <p className="text-xs text-slate-500 mt-6">
          Need access? Set <code className="bg-slate-100 px-1 rounded">profiles.role = admin</code> in Supabase, or add your email to{' '}
          <code className="bg-slate-100 px-1 rounded">VITE_ADMIN_EMAILS</code>.
        </p>
        <Link to="/" className="text-sm text-primary hover:underline mt-4 inline-block">← Back to site</Link>
      </div>
    </div>
  )
}

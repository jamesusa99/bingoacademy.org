import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { updatePassword } from '../lib/auth'
import { isSupabaseConfigured } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import AuthAlert from '../components/auth/AuthAlert'

export default function ResetPassword() {
  const navigate = useNavigate()
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (authLoading) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center text-slate-500 text-sm">Loading…</div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login?redirect=%2Freset-password" replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    const { error: updateError } = await updatePassword(password)
    setLoading(false)
    if (updateError) {
      setError(updateError.message)
      return
    }
    navigate('/login?reset=done', { replace: true })
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-bingo-dark mb-2">Set new password</h1>
      <p className="text-slate-600 mb-6">Choose a new password for your account.</p>

      {!isSupabaseConfigured ? (
        <AuthAlert variant="info">Password reset requires Supabase to be configured.</AuthAlert>
      ) : null}

      {error ? (
        <div className="mb-4">
          <AuthAlert>{error}</AuthAlert>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <div>
          <label htmlFor="new-password" className="block text-sm font-medium text-slate-700 mb-1">
            New password
          </label>
          <input
            id="new-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-2"
            required
            minLength={6}
            disabled={loading}
          />
        </div>
        <div>
          <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-700 mb-1">
            Confirm password
          </label>
          <input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-2"
            required
            minLength={6}
            disabled={loading}
          />
        </div>
        <button type="submit" className="btn-primary w-full py-3 disabled:opacity-50" disabled={loading}>
          {loading ? 'Saving…' : 'Update password'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        <Link to="/login" className="text-primary font-medium hover:underline">
          Back to login
        </Link>
      </p>
    </div>
  )
}

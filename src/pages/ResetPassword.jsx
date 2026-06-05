import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import {
  establishRecoverySession,
  hasRecoveryParams,
  clearRecoveryParamsFromUrl,
  updatePassword,
  formatAuthError,
} from '../lib/auth'
import { isSupabaseConfigured } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import AuthAlert from '../components/auth/AuthAlert'

function pkceRecoveryHint(message) {
  if (!message || !message.toLowerCase().includes('pkce')) return null
  return (
    <>
      <p className="mt-2">{message}</p>
      <ul className="mt-3 list-disc pl-5 space-y-1 text-sm">
        <li>
          Open the link in the <strong>same browser</strong> where you requested the reset (copy the link from
          your email and paste it into that browser&apos;s address bar).
        </li>
        <li>
          Avoid in-app email browsers (Gmail/Outlook preview) — they do not share login storage with Chrome or
          Safari.
        </li>
        <li>
          Request a new reset link and click it immediately in that same browser.
        </li>
      </ul>
    </>
  )
}

export default function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [recoveryLoading, setRecoveryLoading] = useState(() => hasRecoveryParams(searchParams))
  const [recoveryError, setRecoveryError] = useState('')
  const [recoverySession, setRecoverySession] = useState(null)

  useEffect(() => {
    if (!hasRecoveryParams(searchParams)) {
      setRecoveryLoading(false)
      return
    }

    let cancelled = false

    ;(async () => {
      const { data, error: recoveryErr } = await establishRecoverySession(searchParams)
      if (cancelled) return

      if (data?.session) {
        setRecoverySession(data.session)
        clearRecoveryParamsFromUrl()
        setRecoveryError('')
      } else if (recoveryErr) {
        setRecoveryError(formatAuthError(recoveryErr))
      }

      setRecoveryLoading(false)
    })()

    return () => {
      cancelled = true
    }
  }, [searchParams])

  const canSetPassword = isAuthenticated || Boolean(recoverySession)

  if (authLoading || recoveryLoading) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center text-slate-500 text-sm">
        <div className="inline-block w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
        <p>Verifying reset link…</p>
      </div>
    )
  }

  if (!canSetPassword) {
    if (recoveryError) {
      return (
        <div className="max-w-md mx-auto px-4 py-12">
          <h1 className="text-2xl font-bold text-bingo-dark mb-2">Reset link expired</h1>
          <AuthAlert>
            {pkceRecoveryHint(recoveryError) || recoveryError}
          </AuthAlert>
          <div className="mt-6 flex flex-col gap-3 text-sm">
            <Link to="/forgot-password" className="btn-primary text-center py-2.5">
              Request a new reset link
            </Link>
            <Link to="/login" className="text-primary text-center font-medium hover:underline">
              Back to login
            </Link>
          </div>
        </div>
      )
    }

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

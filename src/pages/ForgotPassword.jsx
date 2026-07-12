import { useState } from 'react'
import { Link } from 'react-router-dom'
import PageMeta from '../components/PageMeta'
import { sendPasswordReset } from '../lib/auth'
import { isSupabaseConfigured } from '../lib/supabase'
import AuthAlert from '../components/auth/AuthAlert'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: resetError } = await sendPasswordReset(email)
    setLoading(false)
    if (resetError) {
      setError(resetError.message)
      return
    }
    setSent(true)
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <PageMeta title="Reset Password | Bingo Academy" noindex />
      <h1 className="text-2xl font-bold text-bingo-dark mb-2">Reset password</h1>
      <p className="text-slate-600 mb-8">
        Enter your registered email and we will send a link to reset your password.
      </p>

      {!isSupabaseConfigured && (
        <div className="mb-4">
          <AuthAlert variant="info">Password reset requires Supabase to be configured.</AuthAlert>
        </div>
      )}

      {error && (
        <div className="mb-4">
          <AuthAlert>{error}</AuthAlert>
        </div>
      )}

      {sent ? (
        <div className="card p-6">
          <AuthAlert variant="success">
            If an account exists for that email, a reset link has been sent. Check your inbox and spam folder.
          </AuthAlert>
          <p className="mt-4 text-sm text-slate-600">
            Open the link in the <strong>same browser</strong> where you submitted this form. If your email app
            opens its own browser, copy the link and paste it into Chrome, Safari, or Firefox instead.
          </p>
          <Link to="/login" className="mt-4 inline-block text-primary text-sm font-medium hover:underline">
            Back to login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card p-6">
          <label htmlFor="reset-email" className="block text-sm font-medium text-slate-700 mb-2">
            Email
          </label>
          <input
            id="reset-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary mb-4"
            required
            disabled={loading}
          />
          <button type="submit" className="btn-primary w-full py-2.5 disabled:opacity-50" disabled={loading}>
            {loading ? 'Sending…' : 'Send reset link'}
          </button>
          <Link to="/login" className="mt-4 inline-block text-primary text-sm font-medium hover:underline">
            Back to login
          </Link>
        </form>
      )}
    </div>
  )
}

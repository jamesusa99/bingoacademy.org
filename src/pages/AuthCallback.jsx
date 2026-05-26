import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { getSession } from '../lib/auth'
import { isSupabaseConfigured } from '../lib/supabase'
import AuthAlert from '../components/auth/AuthAlert'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setError('Authentication is not configured on this server.')
      return
    }

    const oauthError = params.get('error_description') || params.get('error')
    if (oauthError) {
      setError(decodeURIComponent(oauthError.replace(/\+/g, ' ')))
      return
    }

    let cancelled = false

    const finish = async () => {
      const { data, error: sessionError } = await getSession()
      if (cancelled) return
      if (sessionError) {
        setError(sessionError.message)
        return
      }
      if (data.session) {
        const next = params.get('next') || '/profile'
        navigate(next.startsWith('/') ? next : '/profile', { replace: true })
        return
      }
      setError('Sign-in could not be completed. Please try again.')
    }

    finish()
    const retry = setTimeout(finish, 400)

    return () => {
      cancelled = true
      clearTimeout(retry)
    }
  }, [navigate, params])

  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      {error ? (
        <>
          <AuthAlert>{error}</AuthAlert>
          <Link to="/login" className="btn-primary inline-block mt-6 px-6 py-2.5 text-sm">
            Back to login
          </Link>
        </>
      ) : (
        <>
          <div className="inline-block w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
          <p className="text-slate-600 text-sm">Completing sign-in…</p>
        </>
      )}
    </div>
  )
}

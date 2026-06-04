import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { completeAuthFromUrl, getSession } from '../lib/auth'
import { isSupabaseConfigured } from '../lib/supabase'
import { consumePostLoginRedirect, safeRedirectPath } from '../lib/authRedirect'
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

    const resolveNextPath = () =>
      safeRedirectPath(params.get('next'), '') || consumePostLoginRedirect('/profile')

    const finish = async () => {
      const { data, error: sessionError } = await completeAuthFromUrl(params)
      if (cancelled) return true
      if (sessionError) {
        setError(sessionError.message)
        return true
      }
      if (data.session) {
        navigate(resolveNextPath(), { replace: true })
        return true
      }

      const { data: retryData } = await getSession()
      if (cancelled) return true
      if (retryData.session) {
        navigate(resolveNextPath(), { replace: true })
        return true
      }
      return false
    }

    ;(async () => {
      if (await finish()) return
      await new Promise((r) => setTimeout(r, 600))
      if (cancelled) return
      if (await finish()) return
      setError('Sign-in could not be completed. Please try again.')
    })()

    return () => {
      cancelled = true
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

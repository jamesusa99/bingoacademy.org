import { useState } from 'react'
import { resetMyCourseAccess } from '../lib/courseAccessReset'

const resetEnabled =
  import.meta.env.DEV || import.meta.env.VITE_ALLOW_ENROLLMENT_RESET === 'true'

export default function CourseAccessReset({ onReset }) {
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  if (!resetEnabled) return null

  const handleReset = async () => {
    const ok = window.confirm(
      'Clear all course unlocks on this browser and remove your server enrollments?\n\nUse this to test checkout from a clean state.'
    )
    if (!ok) return

    setBusy(true)
    setMessage(null)
    setError(null)
    try {
      const result = await resetMyCourseAccess()
      const removed = result.server?.removed
      const serverNote =
        result.server?.skipped
          ? ' (server skipped — sign in to clear account enrollments)'
          : removed
            ? ` Server removed ${removed.enrollments ?? 0} enrollment(s).`
            : ''
      setMessage(`Course access cleared.${serverNote}`)
      onReset?.()
    } catch (err) {
      setError(err.message || 'Reset failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mt-8 pt-6 border-t border-slate-200">
      <h3 className="text-sm font-semibold text-slate-800 mb-1">Testing: reset course access</h3>
      <p className="text-xs text-slate-500 mb-3">
        Clears free trial, local unlocks, lesson progress, and your account enrollments so you can
        re-test Stripe checkout.
      </p>
      <button
        type="button"
        onClick={handleReset}
        disabled={busy}
        className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 hover:bg-red-100 disabled:opacity-60"
      >
        {busy ? 'Clearing…' : 'Clear all course purchases'}
      </button>
      {message ? <p className="mt-2 text-xs text-emerald-700">{message}</p> : null}
      {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
    </div>
  )
}

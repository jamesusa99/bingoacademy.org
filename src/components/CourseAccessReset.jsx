import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { resetMyCourseAccess } from '../lib/courseAccessReset'
import { isCoursesDebugEnabled } from '../lib/coursesDebug'

const resetEnabled =
  import.meta.env.DEV || import.meta.env.VITE_ALLOW_ENROLLMENT_RESET === 'true'

export default function CourseAccessReset({ onReset }) {
  const [searchParams] = useSearchParams()
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  const visible = resetEnabled || isCoursesDebugEnabled(searchParams)
  if (!visible) return null

  const runReset = async ({ includeServer, confirmText }) => {
    const ok = window.confirm(confirmText)
    if (!ok) return

    setBusy(true)
    setMessage(null)
    setError(null)
    try {
      const result = await resetMyCourseAccess({ includeServer })
      const removed = result.server?.removed
      const serverNote = !includeServer
        ? ' Browser unlocks cleared; server enrollments kept.'
        : result.server?.skipped
          ? ' (server skipped — sign in to clear account enrollments)'
          : removed
            ? ` Server removed ${removed.enrollments ?? 0} enrollment(s).`
            : ''
      setMessage(`Done.${serverNote}`)
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
        Clears free trial, local unlocks, and lesson progress. Use{' '}
        <strong>browser only</strong> to fix prod/local mismatch without removing Stripe purchases.
        {isCoursesDebugEnabled(searchParams) && !resetEnabled ? (
          <span className="block mt-1 text-amber-700">
            Visible because <code className="bg-slate-100 px-1 rounded">?debug=1</code> is set.
          </span>
        ) : null}
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() =>
            runReset({
              includeServer: false,
              confirmText:
                'Clear browser course unlocks (localStorage)?\n\nServer enrollments (Stripe purchases) will stay.',
            })
          }
          disabled={busy}
          className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900 hover:bg-amber-100 disabled:opacity-60"
        >
          {busy ? 'Clearing…' : 'Clear browser unlocks only'}
        </button>
        <button
          type="button"
          onClick={() =>
            runReset({
              includeServer: true,
              confirmText:
                'Clear all course unlocks on this browser AND remove your server enrollments?\n\nUse this to test checkout from a fully clean state.',
            })
          }
          disabled={busy}
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 hover:bg-red-100 disabled:opacity-60"
        >
          {busy ? 'Clearing…' : 'Clear all course purchases'}
        </button>
      </div>
      {message ? <p className="mt-2 text-xs text-emerald-700">{message}</p> : null}
      {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
    </div>
  )
}

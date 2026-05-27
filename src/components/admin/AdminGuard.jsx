import { Navigate, useLocation } from 'react-router-dom'
import { useAdminAuth } from '../../hooks/useAdminAuth'

export default function AdminGuard({ children }) {
  const loc = useLocation()
  const { loading, isAdmin, user, configured } = useAdminAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 text-slate-600">
        Verifying admin access…
      </div>
    )
  }

  if (!configured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
        <div className="card max-w-md p-6 text-center">
          <h1 className="text-lg font-semibold text-bingo-dark mb-2">Admin unavailable</h1>
          <p className="text-sm text-slate-600 mb-4">
            Set <code className="text-xs bg-slate-100 px-1 rounded">VITE_SUPABASE_URL</code> and{' '}
            <code className="text-xs bg-slate-100 px-1 rounded">VITE_SUPABASE_ANON_KEY</code> to enable the admin console.
          </p>
          <a href="/" className="text-sm text-primary hover:underline">← Back to site</a>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/admin/login" replace state={{ from: loc.pathname }} />
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
        <div className="card max-w-md p-6 text-center">
          <h1 className="text-lg font-semibold text-bingo-dark mb-2">Access denied</h1>
          <p className="text-sm text-slate-600 mb-4">
            Signed in as <strong>{user.email}</strong>. Admin access requires{' '}
            <code className="text-xs bg-slate-100 px-1 rounded">profiles.role</code> to be{' '}
            <code className="text-xs bg-slate-100 px-1 rounded">admin</code> or{' '}
            <code className="text-xs bg-slate-100 px-1 rounded">editor</code> (set in User management by an existing
            admin, or via Supabase SQL). Optional bootstrap: <code className="text-xs bg-slate-100 px-1 rounded">VITE_ADMIN_EMAILS</code>.
          </p>
          <a href="/" className="text-sm text-primary hover:underline">← Back to site</a>
        </div>
      </div>
    )
  }

  return children
}

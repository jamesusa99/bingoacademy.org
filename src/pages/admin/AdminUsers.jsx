import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminAlert from '../../components/admin/AdminAlert'
import AdminUserDetail from '../../components/admin/AdminUserDetail'
import AdminUserCreate from '../../components/admin/AdminUserCreate'
import { useAdminAuth } from '../../hooks/useAdminAuth'
import { fetchAdminUsers, syncAdminUsers, deleteAdminUser } from '../../lib/admin/users'
import { logAdminAction } from '../../lib/admin/auth'

const ROLES = ['', 'user', 'editor', 'admin']
const STATUSES = ['', 'active', 'suspended', 'pending']

function StatusBadge({ status }) {
  const styles = {
    active: 'bg-green-100 text-green-800',
    suspended: 'bg-red-100 text-red-800',
    pending: 'bg-amber-100 text-amber-800',
  }
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-slate-100 text-slate-700'}`}>
      {status || '—'}
    </span>
  )
}

function TierBadge({ tier }) {
  const labels = { free: 'Free', monthly: 'Monthly', quarterly: 'Quarterly', annual: 'Annual' }
  return <span className="text-xs text-slate-600">{labels[tier] || tier || '—'}</span>
}

/** Fallback when API server is offline — all profiles (admin RLS) */
async function fetchProfilesFallback({ q, role, status, page, perPage }) {
  let query = supabase.from('profiles').select('*', { count: 'exact' })
  if (q) {
    const safe = q.replace(/%/g, '')
    query = query.or(`email.ilike.%${safe}%,full_name.ilike.%${safe}%,phone.ilike.%${safe}%,school.ilike.%${safe}%`)
  }
  if (role) query = query.eq('role', role)
  if (status) query = query.eq('status', status)
  const from = (page - 1) * perPage
  const { data, error, count } = await query.order('created_at', { ascending: false }).range(from, from + perPage - 1)
  if (error) throw new Error(error.message)
  return {
    users: (data || []).map((p) => ({ ...p, order_count: 0, auth: null })),
    pagination: { page, perPage, total: count ?? 0, totalPages: Math.ceil((count ?? 0) / perPage) || 1 },
    fallback: true,
  }
}

export default function AdminUsers() {
  const { user: currentUser, profile: currentProfile } = useAdminAuth()
  const [users, setUsers] = useState([])
  const [pagination, setPagination] = useState({ page: 1, perPage: 25, total: 0, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [apiFallback, setApiFallback] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [success, setSuccess] = useState(null)

  const [q, setQ] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)

  const loadUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchAdminUsers({
        q,
        role: roleFilter,
        status: statusFilter,
        page,
        perPage: 25,
      })
      setUsers(data.users || [])
      setPagination(data.pagination || { page: 1, perPage: 25, total: 0, totalPages: 0 })
      setApiFallback(false)
    } catch (err) {
      try {
        const data = await fetchProfilesFallback({ q, role: roleFilter, status: statusFilter, page, perPage: 25 })
        setUsers(data.users)
        setPagination(data.pagination)
        setApiFallback(true)
        setError(
          err.status === 503
            ? `${err.message} Showing profiles only.`
            : err.status === 401
              ? 'Sign in to admin again (session expired). Showing profiles only.'
              : `API unavailable (${err.message}). Run npm run dev (Vite + API on :8787). Showing profiles only.`
        )
      } catch (fallbackErr) {
        setError(fallbackErr.message)
        setUsers([])
      }
    } finally {
      setLoading(false)
    }
  }, [q, roleFilter, statusFilter, page])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    loadUsers()
  }

  const handleUserSaved = async (updated) => {
    setUsers((list) => list.map((u) => (u.id === updated.id ? { ...u, ...updated } : u)))
    setSuccess('User updated.')
    await logAdminAction('update', 'profiles', updated.id)
  }

  const handleUserCreated = async (created) => {
    setSuccess(`User ${created.email} created.`)
    setPage(1)
    await loadUsers()
  }

  const handleUserDeleted = async (id) => {
    setUsers((list) => list.filter((u) => u.id !== id))
    setSuccess('User deleted.')
    await logAdminAction('delete', 'profiles', id)
  }

  const handleDeleteRow = async (row) => {
    if (row.id === currentUser?.id) {
      setError('You cannot delete your own account while signed in.')
      return
    }
    if (!confirm(`Delete user ${row.email}? This cannot be undone.`)) return
    try {
      await deleteAdminUser(row.id)
      await handleUserDeleted(row.id)
    } catch (err) {
      setError(err.status === 503 ? 'Add SUPABASE_SERVICE_ROLE_KEY and restart npm run dev to delete users.' : err.message)
    }
  }

  const handleSync = async () => {
    setSyncing(true)
    try {
      const result = await syncAdminUsers()
      await loadUsers()
      window.alert(`Synced ${result.synced} registered user(s) from Supabase Auth.`)
    } catch (err) {
      setError(
        err.status === 503
          ? 'Add SUPABASE_SERVICE_ROLE_KEY to .env.local (server-side) to sync all registered users.'
          : err.message
      )
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="User management"
        description="Users with role admin or editor can sign in to this console and edit site content. Assign roles here; run migration 009 in Supabase for staff-only CMS writes. Add user requires SUPABASE_SERVICE_ROLE_KEY and the admin API (npm run dev or Vercel api/server)."
        actions={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium"
            >
              + Add user
            </button>
            <button
              type="button"
              onClick={handleSync}
              disabled={syncing || loading}
              className="px-4 py-2 rounded-xl border border-slate-300 text-sm font-medium hover:bg-slate-50 disabled:opacity-60"
            >
              {syncing ? 'Syncing…' : 'Sync from Auth'}
            </button>
          </div>
        }
      />

      {success ? (
        <AdminAlert type="success" onDismiss={() => setSuccess(null)}>
          {success}
        </AdminAlert>
      ) : null}

      {error ? (
        <AdminAlert type={apiFallback ? 'warning' : 'error'} onDismiss={() => setError(null)}>
          {error.includes('does not exist')
            ? 'Run supabase/migrations/002_admin_platform.sql and 003_user_profiles_extend.sql, then sign in once to create profiles.'
            : error}
        </AdminAlert>
      ) : null}

      {currentProfile?.via === 'allowlist' ? (
        <AdminAlert type="info">
          Signed in via <strong>VITE_ADMIN_EMAILS</strong> (bootstrap only). Set{' '}
          <code className="text-xs bg-white/50 px-1 rounded">profiles.role</code> to{' '}
          <code className="text-xs bg-white/50 px-1 rounded">admin</code> or{' '}
          <code className="text-xs bg-white/50 px-1 rounded">editor</code> so access does not depend on env allowlist.
        </AdminAlert>
      ) : currentProfile?.role ? (
        <AdminAlert type="info">
          Signed in as staff (<strong>{currentProfile.role}</strong>). You can edit all admin modules; database writes use
          your session when the API is offline, or the service role via <code className="text-xs bg-white/50 px-1 rounded">/api/admin/cms</code>.
        </AdminAlert>
      ) : null}

      <form onSubmit={handleSearch} className="card p-4 mb-4 flex flex-wrap gap-3 items-end">
        <label className="flex-1 min-w-[200px]">
          <span className="block text-xs font-medium text-slate-600 mb-1">Search</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Email, name, phone, school…"
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        <label>
          <span className="block text-xs font-medium text-slate-600 mb-1">Role</span>
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value)
              setPage(1)
            }}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
          >
            {ROLES.map((r) => (
              <option key={r || 'all'} value={r}>
                {r || 'All roles'}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="block text-xs font-medium text-slate-600 mb-1">Status</span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setPage(1)
            }}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
            disabled={apiFallback}
            title={apiFallback ? 'Status filter requires migration 003 + API' : undefined}
          >
            {STATUSES.map((s) => (
              <option key={s || 'all'} value={s}>
                {s || 'All statuses'}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium">
          Search
        </button>
      </form>

      <div className="card overflow-hidden">
        {loading ? (
          <p className="p-6 text-slate-500 text-sm">Loading users…</p>
        ) : users.length === 0 ? (
          <p className="p-6 text-slate-500 text-sm">
            No users yet. Run migrations 002–004 in Supabase, register on the site, or click &quot;Sync from Auth&quot;.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead className="bg-slate-50 text-left text-slate-600">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Contact</th>
                  <th className="p-3">School</th>
                  <th className="p-3">Tier</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Last sign-in</th>
                  <th className="p-3 w-28" />
                </tr>
              </thead>
              <tbody>
                {users.map((row) => (
                  <tr key={row.id} className="border-t border-slate-100 hover:bg-slate-50/80">
                    <td className="p-3">
                      <div className="font-medium text-bingo-dark">{row.full_name || '—'}</div>
                      <div className="text-xs text-slate-500 truncate max-w-[180px]">{row.email}</div>
                    </td>
                    <td className="p-3 text-slate-600 text-xs">{row.phone || '—'}</td>
                    <td className="p-3 text-xs text-slate-600">
                      {row.school ? (
                        <>
                          {row.school}
                          {row.grade ? ` · ${row.grade}` : ''}
                        </>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="p-3">
                      <TierBadge tier={row.member_tier} />
                    </td>
                    <td className="p-3">
                      <span className="text-xs font-medium capitalize">{row.role}</span>
                    </td>
                    <td className="p-3">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="p-3 text-xs text-slate-500">
                      {row.auth?.last_sign_in_at
                        ? new Date(row.auth.last_sign_in_at).toLocaleDateString()
                        : '—'}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setSelectedId(row.id)}
                        className="text-primary text-xs font-medium hover:underline mr-3"
                      >
                        Edit
                      </button>
                      {row.id !== currentUser?.id ? (
                        <button
                          type="button"
                          onClick={() => handleDeleteRow(row)}
                          className="text-red-600 text-xs font-medium hover:underline"
                        >
                          Delete
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && pagination.total > 0 && pagination.totalPages <= 1 ? (
          <div className="border-t border-slate-100 px-4 py-3 text-sm text-slate-500">
            {pagination.total} registered user{pagination.total === 1 ? '' : 's'}
          </div>
        ) : null}

        {!loading && pagination.totalPages > 1 ? (
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm">
            <span className="text-slate-500">
              {pagination.total} users · page {pagination.page} of {pagination.totalPages}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 rounded-lg border border-slate-300 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 rounded-lg border border-slate-300 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {showCreate ? (
        <AdminUserCreate onClose={() => setShowCreate(false)} onCreated={handleUserCreated} />
      ) : null}

      {selectedId ? (
        <AdminUserDetail
          userId={selectedId}
          currentUserId={currentUser?.id}
          onClose={() => setSelectedId(null)}
          onSaved={handleUserSaved}
          onDeleted={handleUserDeleted}
        />
      ) : null}
    </div>
  )
}

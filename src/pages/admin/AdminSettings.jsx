import { useEffect, useState } from 'react'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminAlert from '../../components/admin/AdminAlert'
import { fetchAdminHealth } from '../../lib/admin/api'
import { isSupabaseConfigured } from '../../lib/supabase'

const CHECKLIST = [
  { key: 'supabase', label: 'Supabase (VITE_SUPABASE_*)', env: 'Frontend' },
  { key: 'adminEmails', label: 'Admin bootstrap (VITE_ADMIN_EMAILS)', env: 'Frontend' },
  { key: 'serviceRole', label: 'Supabase service role', env: 'Railway / server' },
  { key: 'stripe', label: 'Stripe (STRIPE_SECRET_KEY, webhook)', env: 'Railway / server' },
  { key: 'cloudflare', label: 'Cloudflare Stream', env: 'Railway / server' },
  { key: 'openai', label: 'OpenAI (AI Lab chat)', env: 'Railway / server' },
]

export default function AdminSettings() {
  const [health, setHealth] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await fetchAdminHealth()
        if (mounted) setHealth(data)
      } catch (err) {
        if (mounted) {
          setError(err.message)
          setHealth({
            supabase: isSupabaseConfigured,
            adminEmails: Boolean(import.meta.env.VITE_ADMIN_EMAILS),
            serviceRole: false,
            stripe: false,
            cloudflare: false,
            openai: false,
            apiReachable: false,
          })
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  return (
    <div>
      <AdminPageHeader
        title="Platform settings"
        description="Environment checklist for Supabase, Cloudflare Stream, Stripe, and the Railway API. See docs/ADMIN_ARCHITECTURE.md."
      />

      {error ? (
        <AdminAlert type="warning">
          API health check failed ({error}). Run <code className="text-xs bg-white/50 px-1 rounded">npm run dev</code> so Express is on port 8787, or deploy the server to Railway.
        </AdminAlert>
      ) : null}

      <div className="card p-6 mb-6">
        <h2 className="font-semibold text-bingo-dark mb-4">Integration status</h2>
        {loading ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : (
          <ul className="space-y-3">
            {CHECKLIST.map(({ key, label, env }) => {
              const ok = health?.[key]
              return (
                <li key={key} className="flex items-center justify-between gap-4 text-sm border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                  <div>
                    <span className="font-medium text-bingo-dark">{label}</span>
                    <span className="text-slate-400 ml-2 text-xs">{env}</span>
                  </div>
                  <span className={ok ? 'text-green-600 font-medium' : 'text-amber-600'}>{ok ? '✓ Ready' : '○ Not set'}</span>
                </li>
              )
            })}
            <li className="flex items-center justify-between gap-4 text-sm pt-1">
              <span className="font-medium text-bingo-dark">Admin API reachable</span>
              <span className={health?.apiReachable ? 'text-green-600 font-medium' : 'text-amber-600'}>
                {health?.apiReachable ? '✓ Online' : '○ Offline'}
              </span>
            </li>
          </ul>
        )}
      </div>

      <div className="card p-6">
        <h2 className="font-semibold text-bingo-dark mb-2">Bootstrap checklist</h2>
        <ol className="list-decimal list-inside text-sm text-slate-600 space-y-2">
          <li>Run <code className="text-xs bg-slate-100 px-1 rounded">supabase/migrations/002_admin_platform.sql</code> in Supabase SQL Editor.</li>
          <li>Sign in once, then set <code className="text-xs bg-slate-100 px-1 rounded">profiles.role = &apos;admin&apos;</code> for your user.</li>
          <li>Add server secrets on Railway; point Stripe webhook to <code className="text-xs bg-slate-100 px-1 rounded">/api/webhooks/stripe</code>.</li>
          <li>Tighten RLS policies before production (replace dev “allow all” policies).</li>
        </ol>
      </div>
    </div>
  )
}

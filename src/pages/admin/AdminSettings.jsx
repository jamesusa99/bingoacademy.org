import { useEffect, useState } from 'react'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminAlert from '../../components/admin/AdminAlert'
import { fetchAdminHealth, importSiteData } from '../../lib/admin/api'
import { isSupabaseConfigured } from '../../lib/supabase'
import { useAdminCrud } from '../../hooks/useAdminCrud'

const CHECKLIST_KEYS = [
  { key: 'supabase', labelKey: 'pages.settings.checklist.supabase' },
  { key: 'adminEmails', labelKey: 'pages.settings.checklist.adminEmails' },
  { key: 'serviceRole', labelKey: 'pages.settings.checklist.serviceRole' },
  { key: 'stripe', labelKey: 'pages.settings.checklist.stripe' },
  { key: 'stripeWebhook', labelKey: 'pages.settings.checklist.stripeWebhook' },
  { key: 'cloudflare', labelKey: 'pages.settings.checklist.cloudflare' },
  { key: 'openai', labelKey: 'pages.settings.checklist.openai' },
]

export default function AdminSettings() {
  const c = useAdminCrud()
  const [health, setHealth] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)
  const [seedResult, setSeedResult] = useState(null)

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
            stripeWebhook: false,
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
      <AdminPageHeader titleKey="pages.settings.title" descriptionKey="pages.settings.desc" />

      {error ? (
        <AdminAlert type="warning">
          {c.t('pages.settings.apiHealthFailed', { error })}
        </AdminAlert>
      ) : null}

      <div className="card p-6 mb-6">
        <h2 className="font-semibold text-bingo-dark mb-4">{c.t('pages.settings.integrationStatus')}</h2>
        {loading ? (
          <p className="text-sm text-slate-500">{c.loading}</p>
        ) : (
          <ul className="space-y-3">
            {CHECKLIST_KEYS.map(({ key, labelKey }) => {
              const ok = health?.[key]
              const envLabel =
                key === 'supabase' || key === 'adminEmails'
                  ? c.t('pages.settings.envFrontend')
                  : c.t('pages.settings.envServer')
              return (
                <li
                  key={key}
                  className="flex items-center justify-between gap-4 text-sm border-b border-slate-100 pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <span className="font-medium text-bingo-dark">{c.t(labelKey)}</span>
                    <span className="text-slate-400 ml-2 text-xs">{envLabel}</span>
                  </div>
                  <span className={ok ? 'text-green-600 font-medium' : 'text-amber-600'}>
                    {ok ? c.t('pages.settings.ready') : c.t('pages.settings.notSet')}
                  </span>
                </li>
              )
            })}
            <li className="flex items-center justify-between gap-4 text-sm pt-1">
              <span className="font-medium text-bingo-dark">{c.t('pages.settings.apiReachable')}</span>
              <span className={health?.apiReachable ? 'text-green-600 font-medium' : 'text-amber-600'}>
                {health?.apiReachable ? c.t('pages.settings.apiOnline') : c.t('pages.settings.apiOffline')}
              </span>
            </li>
          </ul>
        )}
      </div>

      <div className="card p-6 mb-6">
        <h2 className="font-semibold text-bingo-dark mb-2">{c.t('pages.settings.importHeading')}</h2>
        <p className="text-sm text-slate-600 mb-4">{c.t('pages.settings.importDesc')}</p>
        {seedResult ? (
          <AdminAlert type="success" onDismiss={() => setSeedResult(null)}>
            {c.t('pages.settings.importDone')}
            <pre className="mt-2 text-xs overflow-auto max-h-40 bg-white/50 p-2 rounded">
              {JSON.stringify(seedResult.summary, null, 2)}
            </pre>
          </AdminAlert>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={seeding || !health?.serviceRole}
            onClick={async () => {
              setSeeding(true)
              setSeedResult(null)
              try {
                const data = await importSiteData({ force: false })
                setSeedResult(data)
              } catch (err) {
                setError(err.message)
              } finally {
                setSeeding(false)
              }
            }}
            className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium disabled:opacity-60"
          >
            {seeding ? c.t('pages.settings.importing') : c.t('pages.settings.importBtn')}
          </button>
          <button
            type="button"
            disabled={seeding || !health?.serviceRole}
            onClick={async () => {
              if (!window.confirm(c.t('pages.settings.forceConfirm'))) return
              setSeeding(true)
              try {
                const data = await importSiteData({ force: true })
                setSeedResult(data)
              } catch (err) {
                setError(err.message)
              } finally {
                setSeeding(false)
              }
            }}
            className="px-4 py-2 rounded-xl border border-slate-300 text-sm font-medium disabled:opacity-60"
          >
            {c.t('pages.settings.forceImport')}
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-3">{c.t('pages.settings.importCli')}</p>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold text-bingo-dark mb-2">{c.t('pages.settings.bootstrap')}</h2>
        <ol className="list-decimal list-inside text-sm text-slate-600 space-y-2">
          <li>{c.t('pages.settings.boot1')}</li>
          <li>{c.t('pages.settings.boot2')}</li>
          <li>{c.t('pages.settings.boot3')}</li>
          <li>{c.t('pages.settings.boot4')}</li>
        </ol>
      </div>
    </div>
  )
}

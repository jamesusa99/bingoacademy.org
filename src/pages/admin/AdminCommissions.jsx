import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminAlert from '../../components/admin/AdminAlert'
import { useAdminCrud } from '../../hooks/useAdminCrud'
import { fetchAdminCommissionDashboard, settleAdminPayout } from '../../lib/channelsApi'

function money(cents, currency = 'usd') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: (currency || 'usd').toUpperCase() }).format(
    (cents || 0) / 100
  )
}

function Kpi({ label, value, hint }) {
  return (
    <div className="card p-4">
      <p className="text-[11px] uppercase tracking-wide text-slate-500">{label}</p>
      <p className="text-xl font-bold text-bingo-dark mt-1">{value}</p>
      {hint ? <p className="text-[11px] text-slate-400 mt-1">{hint}</p> : null}
    </div>
  )
}

export default function AdminCommissions() {
  const c = useAdminCrud()
  const p = (key, vars) => c.t(`pages.commissions.${key}`, vars)
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updatedAt, setUpdatedAt] = useState(null)

  const load = useCallback(async () => {
    try {
      const next = await fetchAdminCommissionDashboard()
      setData(next)
      setError(null)
      setUpdatedAt(new Date())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const timer = setInterval(load, 15000)
    return () => clearInterval(timer)
  }, [load])

  const settle = async (id, action) => {
    try {
      await settleAdminPayout(id, action)
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  const totals = data?.totals || {}
  const byChannel = data?.byChannel || []
  const maxSale = Math.max(1, ...byChannel.map((row) => row.saleCents || 0))
  const cohorts = data?.cohorts || {}

  return (
    <div>
      <AdminPageHeader
        titleKey="pages.commissions.title"
        descriptionKey="pages.commissions.desc"
        actions={
          <p className="text-xs text-slate-500">
            {updatedAt ? p('liveAt', { time: updatedAt.toLocaleTimeString() }) : p('loadingLive')}
          </p>
        }
      />
      {error ? <AdminAlert type="error">{error}</AdminAlert> : null}

      {loading && !data ? (
        <p className="text-sm text-slate-500">{c.loading}</p>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <Kpi label={p('kpiGmv')} value={money(totals.saleCents)} hint={p('ordersN', { n: totals.orderCount || 0 })} />
            <Kpi label={p('kpiCommission')} value={money(totals.commissionCents)} />
            <Kpi label={p('kpiAvailable')} value={money(totals.availableCents)} hint={p('kpiPendingHint', { amount: money(totals.pendingCents) })} />
            <Kpi label={p('kpiPayouts')} value={money(data?.payoutRequestedCents)} />
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            <section className="card p-5">
              <h2 className="font-semibold text-bingo-dark mb-4">{p('byChannel')}</h2>
              {byChannel.length === 0 ? (
                <p className="text-sm text-slate-500">{p('noChannelSales')}</p>
              ) : (
                <ul className="space-y-3">
                  {byChannel.map((row) => (
                    <li key={row.channel.id}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">
                          {row.channel.name}
                          <span className="ml-2 text-[11px] text-slate-400">
                            {row.channel.kind === 'official'
                              ? p('official')
                              : row.channel.kind === 'personal'
                                ? p('personal')
                                : p('partner')}
                          </span>
                        </span>
                        <span>{money(row.commissionCents)}</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-cyan-500"
                          style={{ width: `${Math.max(4, Math.round(((row.saleCents || 0) / maxSale) * 100))}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        {p('channelBarHint', { sales: money(row.saleCents), n: row.orderCount || 0 })}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
              <Link to="/admin/channels" className="text-xs text-primary hover:underline mt-4 inline-block">
                {p('manageChannels')}
              </Link>
            </section>

            <section className="card p-5">
              <h2 className="font-semibold text-bingo-dark mb-4">{p('cohorts')}</h2>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-slate-500 text-xs">{p('thisWeek')}</dt>
                  <dd className="font-semibold">{money(cohorts.thisWeek?.saleCents)} · {money(cohorts.thisWeek?.commissionCents)}</dd>
                </div>
                <div>
                  <dt className="text-slate-500 text-xs">{p('prevWeek')}</dt>
                  <dd className="font-semibold">{money(cohorts.prevWeek?.saleCents)} · {money(cohorts.prevWeek?.commissionCents)}</dd>
                </div>
                <div>
                  <dt className="text-slate-500 text-xs">{p('official')}</dt>
                  <dd className="font-semibold">{money(cohorts.official?.saleCents)}</dd>
                </div>
                <div>
                  <dt className="text-slate-500 text-xs">{p('partner')}</dt>
                  <dd className="font-semibold">{money(cohorts.partner?.saleCents)}</dd>
                </div>
                <div>
                  <dt className="text-slate-500 text-xs">{p('newBuyers')}</dt>
                  <dd className="font-semibold">{cohorts.newBuyers?.orderCount || 0}</dd>
                </div>
                <div>
                  <dt className="text-slate-500 text-xs">{p('returningBuyers')}</dt>
                  <dd className="font-semibold">{cohorts.returningBuyers?.orderCount || 0}</dd>
                </div>
              </dl>
            </section>
          </div>

          <section className="card overflow-hidden mb-6">
            <div className="p-4 border-b border-slate-100">
              <h2 className="font-semibold text-bingo-dark">{p('recent')}</h2>
            </div>
            {(data?.recent || []).length === 0 ? (
              <p className="p-6 text-sm text-slate-500">{p('noRecent')}</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-slate-600">
                  <tr>
                    <th className="p-3">{p('colTime')}</th>
                    <th className="p-3">{p('colChannel')}</th>
                    <th className="p-3">{p('colProduct')}</th>
                    <th className="p-3">{p('colSale')}</th>
                    <th className="p-3">{p('colCommission')}</th>
                    <th className="p-3">{c.status}</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.recent || []).map((row) => (
                    <tr key={row.id} className="border-t border-slate-100">
                      <td className="p-3 text-xs text-slate-500">{new Date(row.created_at).toLocaleString()}</td>
                      <td className="p-3">{row.channelName}</td>
                      <td className="p-3">{row.product_name || '—'}</td>
                      <td className="p-3">{money(row.sale_cents, row.currency)}</td>
                      <td className="p-3 font-medium">{money(row.commission_cents, row.currency)}</td>
                      <td className="p-3 text-xs">{p(`commStatus_${row.status}`)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          <section className="card overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h2 className="font-semibold text-bingo-dark">{p('payouts')}</h2>
            </div>
            {(data?.payouts || []).length === 0 ? (
              <p className="p-6 text-sm text-slate-500">{p('noPayouts')}</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-slate-600">
                  <tr>
                    <th className="p-3">{p('colTime')}</th>
                    <th className="p-3">{p('colChannel')}</th>
                    <th className="p-3">{p('colAmount')}</th>
                    <th className="p-3">{c.status}</th>
                    <th className="p-3">{c.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.payouts || []).map((row) => (
                    <tr key={row.id} className="border-t border-slate-100">
                      <td className="p-3 text-xs text-slate-500">{new Date(row.requested_at).toLocaleString()}</td>
                      <td className="p-3">{row.channelName}</td>
                      <td className="p-3 font-medium">{money(row.amount_cents, row.currency)}</td>
                      <td className="p-3 text-xs">{p(`payoutStatus_${row.status}`)}</td>
                      <td className="p-3 space-x-2 whitespace-nowrap">
                        {row.status === 'requested' ? (
                          <>
                            <button type="button" className="text-emerald-700 hover:underline" onClick={() => settle(row.id, 'approve')}>
                              {p('approve')}
                            </button>
                            <button type="button" className="text-red-600 hover:underline" onClick={() => settle(row.id, 'reject')}>
                              {p('reject')}
                            </button>
                          </>
                        ) : null}
                        {row.status === 'approved' ? (
                          <button type="button" className="text-primary hover:underline" onClick={() => settle(row.id, 'paid')}>
                            {p('markPaid')}
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </>
      )}
    </div>
  )
}

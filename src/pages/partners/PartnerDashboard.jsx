import { useCallback, useEffect, useState } from 'react'
import { useAdminLocale } from '../../contexts/AdminLocaleContext'
import { fetchChannelDashboard, requestChannelPayout } from '../../lib/channelsApi'
import { channelSharePath } from '../../lib/channelReferral'
import { useChannelMembership } from '../../hooks/useChannelMembership'
import PageMeta from '../../components/PageMeta'

function money(cents, currency = 'usd') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: (currency || 'usd').toUpperCase() }).format(
    (cents || 0) / 100
  )
}

export default function PartnerDashboard() {
  const { t } = useAdminLocale()
  const { memberships } = useChannelMembership()
  const [channelId, setChannelId] = useState(memberships[0]?.channel?.id || '')
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [withdrawing, setWithdrawing] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const ids = memberships.map((row) => row.channel?.id).filter(Boolean)
    if (!ids.length) return
    if (!channelId || !ids.includes(channelId)) setChannelId(ids[0])
  }, [memberships, channelId])

  const load = useCallback(async () => {
    if (!channelId) return
    try {
      const next = await fetchChannelDashboard(channelId)
      setData(next)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [channelId])

  useEffect(() => {
    load()
    const timer = setInterval(load, 15000)
    return () => clearInterval(timer)
  }, [load])

  const channel = data?.channel
  const stats = data?.stats || {}
  const canWithdraw = (stats.availableCents || 0) >= (channel?.minPayoutCents || 0) && (stats.availableCents || 0) > 0

  const withdraw = async () => {
    if (!channelId || withdrawing) return
    setWithdrawing(true)
    setError(null)
    try {
      await requestChannelPayout({ channelId })
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setWithdrawing(false)
    }
  }

  const shareUrl = channel ? `${window.location.origin}${channelSharePath(channel.code)}` : ''

  useEffect(() => {
    setCopied(false)
  }, [shareUrl])

  const copyShareUrl = async () => {
    if (!shareUrl) return
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div>
      <PageMeta title={t('partner.dashboardTitle')} noindex />
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-bingo-dark">{t('partner.dashboardTitle')}</h1>
          <p className="text-sm text-slate-500 mt-1">{t('partner.dashboardDesc')}</p>
        </div>
        {memberships.length > 1 ? (
          <select className="input" value={channelId} onChange={(e) => setChannelId(e.target.value)}>
            {memberships.map((row) => (
              <option key={row.channel.id} value={row.channel.id}>
                {row.channel.name}
              </option>
            ))}
          </select>
        ) : null}
      </div>

      {error ? <p className="text-sm text-red-600 mb-4">{error}</p> : null}
      {loading && !data ? <p className="text-sm text-slate-500">{t('crud.loading')}</p> : null}

      {channel ? (
        <>
          <div className="card p-5 mb-6">
            <div className="flex flex-wrap justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-slate-500">
                  {channel.kind === 'official'
                    ? t('partner.official')
                    : channel.kind === 'personal'
                      ? t('partner.personal')
                      : t('partner.partner')}
                </p>
                <h2 className="text-lg font-bold">{channel.name}</h2>
                <p className="text-sm text-slate-600 mt-1">
                  {t('partner.code')}: <span className="font-mono font-semibold">{channel.code}</span>
                  {' · '}
                  {t('partner.rate')}: {(channel.commissionBps / 100).toFixed(1)}%
                </p>
              </div>
              <div className="text-xs text-slate-500 max-w-lg">
                <p>{t('partner.shareHint')}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <a href={shareUrl} className="text-primary break-all hover:underline">
                    {shareUrl}
                  </a>
                  <button type="button" onClick={copyShareUrl} className="btn-primary px-3 py-1.5 text-xs shrink-0">
                    {copied ? t('partner.copied') : t('partner.copyLink')}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <div className="card p-4">
              <p className="text-xs text-slate-500">{t('partner.sales')}</p>
              <p className="text-xl font-bold">{money(stats.saleCents, channel.currency)}</p>
            </div>
            <div className="card p-4">
              <p className="text-xs text-slate-500">{t('partner.earned')}</p>
              <p className="text-xl font-bold">{money(stats.commissionCents, channel.currency)}</p>
            </div>
            <div className="card p-4">
              <p className="text-xs text-slate-500">{t('partner.available')}</p>
              <p className="text-xl font-bold text-emerald-700">{money(stats.availableCents, channel.currency)}</p>
            </div>
            <div className="card p-4">
              <p className="text-xs text-slate-500">{t('partner.pending')}</p>
              <p className="text-xl font-bold">{money(stats.pendingCents, channel.currency)}</p>
            </div>
          </div>

          <div className="card p-5 mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold">{t('partner.withdrawTitle')}</h3>
              <p className="text-sm text-slate-500 mt-1">
                {t('partner.withdrawHint', { min: money(channel.minPayoutCents, channel.currency) })}
              </p>
            </div>
            <button
              type="button"
              disabled={!canWithdraw || withdrawing}
              onClick={withdraw}
              className="btn-primary px-5 py-2.5 text-sm disabled:opacity-50"
            >
              {withdrawing ? t('partner.withdrawing') : t('partner.withdraw')}
            </button>
          </div>

          <section className="card overflow-hidden mb-6">
            <div className="p-4 border-b border-slate-100">
              <h3 className="font-semibold">{t('partner.recent')}</h3>
            </div>
            {(data.commissions || []).length === 0 ? (
              <p className="p-6 text-sm text-slate-500">{t('partner.noCommissions')}</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-slate-500">
                  <tr>
                    <th className="p-3">{t('partner.colTime')}</th>
                    <th className="p-3">{t('partner.colProduct')}</th>
                    <th className="p-3">{t('partner.colSale')}</th>
                    <th className="p-3">{t('partner.colCommission')}</th>
                    <th className="p-3">{t('partner.colStatus')}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.commissions.map((row) => (
                    <tr key={row.id} className="border-t border-slate-100">
                      <td className="p-3 text-xs text-slate-500">{new Date(row.created_at).toLocaleString()}</td>
                      <td className="p-3">{row.product_name || '—'}</td>
                      <td className="p-3">{money(row.sale_cents, row.currency)}</td>
                      <td className="p-3 font-medium">{money(row.commission_cents, row.currency)}</td>
                      <td className="p-3 text-xs">{t(`pages.commissions.commStatus_${row.status}`)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          <section className="card overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h3 className="font-semibold">{t('partner.payoutHistory')}</h3>
            </div>
            {(data.payouts || []).length === 0 ? (
              <p className="p-6 text-sm text-slate-500">{t('partner.noPayouts')}</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {data.payouts.map((row) => (
                  <li key={row.id} className="p-4 flex justify-between text-sm">
                    <span>
                      {money(row.amount_cents, row.currency)} · {t(`pages.commissions.payoutStatus_${row.status}`)}
                    </span>
                    <span className="text-xs text-slate-500">{new Date(row.requested_at).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      ) : null}
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useChannelMembership } from '../../hooks/useChannelMembership'
import { fetchChannelDashboard } from '../../lib/channelsApi'
import { channelSharePath } from '../../lib/channelReferral'

function money(cents, currency = 'usd') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: (currency || 'usd').toUpperCase() }).format(
    (cents || 0) / 100
  )
}

function channelKindLabel(channel) {
  if (channel?.kind === 'official') return 'Official channel'
  if (channel?.kind === 'personal' || String(channel?.slug || '').startsWith('user-')) return 'Personal channel'
  return 'Partner channel'
}

function ChannelCard({ membership }) {
  const channel = membership.channel
  const shareUrl = `${window.location.origin}${channelSharePath(channel.code)}`
  const [copied, setCopied] = useState(false)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    let cancelled = false
    fetchChannelDashboard(channel.id)
      .then((data) => {
        if (!cancelled) setStats(data.stats || null)
      })
      .catch(() => {
        if (!cancelled) setStats(null)
      })
    return () => {
      cancelled = true
    }
  }, [channel.id])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="card p-6">
      <p className="text-[11px] uppercase tracking-wide text-slate-500">{channelKindLabel(channel)}</p>
      <h3 className="font-semibold text-bingo-dark mt-1">{channel.name}</h3>
      <p className="text-sm text-slate-600 mt-1">
        Code <span className="font-mono font-semibold">{channel.code}</span>
        {' · '}
        {(channel.commissionBps / 100).toFixed(1)}% commission · {channel.holdDays} day hold
      </p>

      <p className="text-sm text-slate-600 mt-4">Share this link. Purchases after someone opens it count toward this channel:</p>
      <p className="text-sm font-medium text-bingo-dark mt-1 break-all">{shareUrl}</p>
      <div className="flex flex-wrap gap-2 mt-3">
        <button type="button" onClick={copy} className="btn-primary px-4 py-2 text-sm">
          {copied ? 'Copied' : 'Copy link'}
        </button>
        <Link to="/partners" className="rounded-lg border border-slate-300 text-slate-700 px-4 py-2 text-sm hover:bg-slate-50">
          Open channel dashboard
        </Link>
      </div>

      {stats ? (
        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 text-sm">
          <div>
            <dt className="text-xs text-slate-500">Attributed sales</dt>
            <dd className="font-semibold">{money(stats.saleCents, channel.currency)}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Earned</dt>
            <dd className="font-semibold">{money(stats.commissionCents, channel.currency)}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Available</dt>
            <dd className="font-semibold text-emerald-700">{money(stats.availableCents, channel.currency)}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">On hold</dt>
            <dd className="font-semibold">{money(stats.pendingCents, channel.currency)}</dd>
          </div>
        </dl>
      ) : null}
    </div>
  )
}

export default function ProfileChannelSection() {
  const { memberships, policy, mode, loading, error } = useChannelMembership()
  const channel = memberships[0]?.channel
  const isPartner = mode === 'partner' || (channel && channel.kind !== 'personal' && !String(channel.slug || '').startsWith('user-'))
  const rate = isPartner
    ? (channel?.commissionBps || 0) / 100
    : policy?.commissionPercent ?? (channel ? channel.commissionBps / 100 : 10)
  const hold = isPartner ? channel?.holdDays ?? 7 : policy?.holdDays ?? channel?.holdDays ?? 7
  const minPayout = isPartner
    ? (channel?.minPayoutCents || 0) / 100
    : policy?.minPayoutDollars ?? (channel ? channel.minPayoutCents / 100 : 100)

  return (
    <section id="promo" className="mb-8 space-y-4">
      <div className="card p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200/60">
        <h2 className="font-semibold text-bingo-dark text-lg">Your referral channel</h2>
        {isPartner ? (
          <>
            <p className="text-sm text-slate-700 mt-2">
              This account is a <span className="font-semibold">Partner channel</span> (institutional). Commission
              follows this institution’s rate, hold, and payout rules — not the personal-channel policy.
            </p>
            <ul className="text-sm text-slate-700 mt-3 space-y-1">
              <li>
                · Current terms: {Number(rate).toFixed(1)}% commission, {hold} day hold, ${Number(minPayout)} minimum
                payout.
              </li>
              <li>· Share the partner link below.</li>
              <li>
                · Live commissions and withdrawals are at the channel dashboard{' '}
                <Link to="/partners" className="text-primary hover:underline">
                  https://www.bingoacademy.org/partners
                </Link>
              </li>
            </ul>
          </>
        ) : (
          <>
            <p className="text-sm text-slate-700 mt-2">
              This account is a <span className="font-semibold">Personal channel</span> by default — no application.
              Share your link; when a new customer opens it and buys, the order is credited to you.
            </p>
            <ul className="text-sm text-slate-700 mt-3 space-y-1">
              <li>
                · Company policy: {Number(rate).toFixed(1)}% commission, {hold} day hold, ${Number(minPayout)} minimum
                payout.
              </li>
              <li>
                · If ops adds this account to an institutional partner, this upgrades to a Partner channel and those
                partner terms replace the personal policy.
              </li>
              <li>· Live commissions and withdrawals are at /partners.</li>
            </ul>
          </>
        )}
      </div>

      {loading ? <p className="text-sm text-slate-500">Loading your channel…</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {!loading && memberships.length === 0 && !error ? (
        <p className="text-sm text-slate-500">Your channel will appear here after the next refresh.</p>
      ) : null}

      {memberships.map((row) => (
        <ChannelCard key={row.channel.id} membership={row} />
      ))}
    </section>
  )
}

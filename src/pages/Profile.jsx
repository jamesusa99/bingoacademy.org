import { useState } from 'react'
import { Link } from 'react-router-dom'

// ─── Member tier data ──────────────────────────────────────────────

const MEMBER_TIERS = [
  { id: 'free', name: 'Free Member', chinese: '普通会员', price: 0, autoPrice: null, color: 'text-slate-600', bg: 'bg-slate-50' },
  { id: 'monthly', name: 'Monthly', chinese: '月度会员', price: 39, autoPrice: 35, autoLabel: 'Auto-renew −10%', color: 'text-sky-600', bg: 'bg-sky-50' },
  { id: 'quarterly', name: 'Quarterly', chinese: '季度会员', price: 99, autoPrice: 84, autoLabel: 'Auto-renew −15% + 1 trial class', color: 'text-violet-600', bg: 'bg-violet-50' },
  { id: 'annual', name: 'Annual', chinese: '年度会员', price: 299, autoPrice: 239, autoLabel: 'Auto-renew −20% + extra perks', color: 'text-amber-600', bg: 'bg-amber-50' },
]

const MEMBER_BENEFITS = [
  ['AI course discount', '—', '9折', '85折', '7折'],
  ['Competition prep access', 'Free only', 'Partial', 'Most', 'All'],
  ['Whitelist event support', 'Entry only', 'Entry + guide', 'Entry + materials', 'Entry + camp + 1v1'],
  ['STEM planning', '—', 'Basic docs', 'Plan template', '1v1 planning'],
  ['Mall / teaching kit discount', '—', '95折', '9折', '8折 + free ship'],
  ['Referral commission boost', 'Base', '+5%', '+10%', '+20%'],
  ['Charity points multiplier', '1×', '1.2×', '1.5×', '2×'],
  ['Member-only assessments', '—', '1/month', '1/quarter', 'Unlimited'],
  ['Customer support', '—', 'Online', 'Online', 'Dedicated 1v1'],
]

// ─── Share modal (multi-channel) ────────────────────────────────────

function ShareModal({ title, onClose }) {
  const [copied, setCopied] = useState(false)
  const channels = [
    { id: 'showcase', icon: '🏆', label: 'Share to Showcase', desc: 'Display on Bingo Achievements' },
    { id: 'wechat', icon: '💬', label: 'WeChat / Friends', desc: 'Generate image or link' },
    { id: 'moments', icon: '📱', label: 'Moments / Circle', desc: 'Friends circle post' },
    { id: 'image', icon: '🖼️', label: 'Generate Image', desc: 'HD image with brand' },
    { id: 'link', icon: '🔗', label: 'Generate Link', desc: 'Short link, set expiry' },
  ]
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-bingo-dark text-sm">Share: {title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>
        </div>
        <div className="space-y-2 mb-4">
          {channels.map(c => (
            <button key={c.id} className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-primary/30 hover:bg-primary/5 transition text-left">
              <span className="text-2xl">{c.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-bingo-dark text-sm">{c.label}</p>
                <p className="text-xs text-slate-500">{c.desc}</p>
              </div>
            </button>
          ))}
        </div>
        <button
          onClick={() => { setCopied(true); setTimeout(() => setCopied(false), 2000) }}
          className="w-full border border-primary text-primary py-2 rounded-xl text-sm font-medium hover:bg-primary/5 transition"
        >
          {copied ? '✓ Link copied' : 'Copy share link'}
        </button>
      </div>
    </div>
  )
}

// ─── Earn by Sharing (原推广中心，更名) ─────────────────────────────

function EarnBySharing() {
  return (
    <div className="space-y-4">
      <div className="card p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200/60">
        <h3 className="font-semibold text-bingo-dark mb-3">Earn by Sharing</h3>
        <ul className="text-sm text-slate-700 space-y-2 mb-4">
          <li>· Personal referral code / posters / links (generate, save, share)</li>
          <li>· Daily & monthly earnings (received / pending)</li>
          <li>· High-commission picks (platform-selected courses/products, one-click share)</li>
          <li>· Promo events (double commission, referral rewards)</li>
        </ul>
        <div className="flex flex-wrap gap-3">
          <button type="button" className="btn-primary">Generate poster / link</button>
          <span className="text-xs text-amber-700 font-medium self-center">Commission doubled this month →</span>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="font-semibold text-bingo-dark mb-3">Referral order details</h3>
        <p className="text-sm text-slate-600 mb-2">Filter: All / Pending / Settled / Void</p>
        <p className="text-sm text-slate-600">List: product, time, referred user, amount, commission rate/amount, status, settlement time</p>
        <Link to="/profile#orders-promo" className="text-primary text-sm mt-2 inline-block">View details →</Link>
      </div>

      <div className="card p-6">
        <h3 className="font-semibold text-bingo-dark mb-3">Commission settlement</h3>
        <ul className="text-sm text-slate-700 space-y-1 mb-4">
          <li>· Withdrawable balance, pending commission, settled commission</li>
          <li>· Withdraw: min ¥68, T+1 arrival</li>
          <li>· Withdrawal history: amount, request time, arrival time, status</li>
          <li>· Settlement: 7 days after order completion; refunds deduct commission</li>
        </ul>
        <div className="flex gap-3">
          <button type="button" className="btn-primary">Withdraw</button>
          <span className="text-sm text-slate-500 self-center">Withdrawable: —</span>
        </div>
      </div>

      <div className="card p-6 bg-slate-50">
        <h3 className="font-semibold text-bingo-dark mb-3">Promotion rules</h3>
        <ul className="text-sm text-slate-700 space-y-1">
          <li>· Commission varies by product/course/role — see product pages</li>
          <li>· Referral binding: 30 days after referred user clicks/scans</li>
          <li>· Refunds/void orders: deduct commission</li>
          <li>· Withdrawal: min ¥68, T+1, no fee</li>
        </ul>
      </div>

      <div className="card p-6 border-amber-200/60 bg-amber-50/50">
        <h3 className="font-semibold text-bingo-dark mb-3">Team promotion (teachers / institutions only)</h3>
        <p className="text-sm text-slate-600 mb-2">Team list, total earnings, team commission split; stats (new members, conversions, total commission); team promo materials</p>
        <button type="button" className="rounded-lg border border-primary text-primary px-4 py-2 text-sm">Team promotion</button>
      </div>

      <div id="promo-terms" className="card p-6 bg-slate-50/80">
        <h3 className="font-semibold text-bingo-dark mb-4">Key concepts</h3>
        <dl className="grid gap-3 text-sm">
          <div><dt className="font-medium text-slate-800">Referrer</dt><dd className="text-slate-600 mt-0.5">User with promotion access (Student/Parent/Teacher/Institution)</dd></div>
          <div><dt className="font-medium text-slate-800">Referred user</dt><dd className="text-slate-600 mt-0.5">User who enters via referrer’s QR/poster/link</dd></div>
          <div><dt className="font-medium text-slate-800">Referral binding</dt><dd className="text-slate-600 mt-0.5">Binding when referred user clicks/scans; valid 30 days</dd></div>
          <div><dt className="font-medium text-slate-800">Valid order</dt><dd className="text-slate-600 mt-0.5">Paid during binding period, no refund/cancel</dd></div>
          <div><dt className="font-medium text-slate-800">Pending commission</dt><dd className="text-slate-600 mt-0.5">Commission from valid orders, not yet settled</dd></div>
          <div><dt className="font-medium text-slate-800">Withdrawable commission</dt><dd className="text-slate-600 mt-0.5">Settled, in referrer balance</dd></div>
          <div><dt className="font-medium text-slate-800">Settlement period</dt><dd className="text-slate-600 mt-0.5">7 days after order completion</dd></div>
          <div><dt className="font-medium text-slate-800">Min withdrawal</dt><dd className="text-slate-600 mt-0.5">¥68 (no fee)</dd></div>
        </dl>
      </div>

      <div className="card p-6 overflow-x-auto">
        <h3 className="font-semibold text-bingo-dark mb-4">Role & promotion rights</h3>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-2 px-3 font-semibold text-slate-800">Role</th>
              <th className="text-left py-2 px-3 font-semibold text-slate-800">Benefits</th>
              <th className="text-left py-2 px-3 font-semibold text-slate-800">Commission</th>
              <th className="text-left py-2 px-3 font-semibold text-slate-800">Team</th>
            </tr>
          </thead>
          <tbody className="text-slate-600">
            <tr className="border-b border-slate-100">
              <td className="py-3 px-3 font-medium text-slate-800">Student / Parent</td>
              <td className="py-3 px-3">Personal code / poster / link</td>
              <td className="py-3 px-3">Platform base rate</td>
              <td className="py-3 px-3">No</td>
            </tr>
            <tr className="border-b border-slate-100">
              <td className="py-3 px-3 font-medium text-slate-800">Teacher / Institution</td>
              <td className="py-3 px-3">Custom materials, bonus</td>
              <td className="py-3 px-3">Base + 5%–10%</td>
              <td className="py-3 px-3">Yes (team split)</td>
            </tr>
            <tr>
              <td className="py-3 px-3 font-medium text-slate-800">Enterprise</td>
              <td className="py-3 px-3">No promotion</td>
              <td className="py-3 px-3">—</td>
              <td className="py-3 px-3">—</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="card p-6">
        <h3 className="font-semibold text-bingo-dark mb-4">Promotion flow</h3>
        <div className="space-y-2 text-sm">
          {[
            { title: 'Enable promotion', body: 'Login → Profile → Earn by Sharing; system auto-enables (non-Enterprise). Code/poster/link auto-generated (permanent, re-generate supported).' },
            { title: 'Share flow', body: 'Share button on product/course/event pages: generate poster, copy link, share. Poster includes QR, product info, commission tip. Earn by Sharing: high-commission picks → one-click share.' },
            { title: 'Referral binding', body: 'Referred user enters via link/QR → system parses referrer ID; auto-bind. Binding valid 30 days; first click wins.' },
            { title: 'Commission & settlement', body: 'Order amount × rate. Status: Paid → Pending; after settlement period → Withdrawable; refund → deduct. Notifications via app.' },
            { title: 'Withdrawal', body: 'Profile → Commission settlement; Withdraw (min ¥68) → confirm → auto review (≤10 min) → transfer.' },
            { title: 'Team promotion', body: 'Earn by Sharing → Team → Invite members; team commission split; team stats.' },
          ].map((item, i) => (
            <details key={i} className="group border border-slate-200 rounded-lg overflow-hidden">
              <summary className="px-4 py-3 bg-slate-50 font-medium text-slate-800 cursor-pointer list-none flex items-center justify-between">
                <span>{item.title}</span>
                <span className="group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="px-4 py-3 text-slate-600 border-t border-slate-200">
                <p>{item.body}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Main Profile ──────────────────────────────────────────────────

export default function Profile() {
  const [view, setView] = useState('home')
  const [showEarnBySharing, setShowEarnBySharing] = useState(false)
  const [shareModal, setShareModal] = useState(null)

  const memberTier = 'annual'
  const memberExpiryDays = 320
  const autoRenew = true
  const memberLabel = { free: 'Free Member', monthly: 'Monthly Member', quarterly: 'Quarterly Member', annual: 'Annual Member' }[memberTier]

  const coreLinks = [
    { to: '/profile/study', icon: '📚', label: 'My Courses', share: false },
    { to: '/profile#events', icon: '🏆', label: 'My Events', share: true },
    { to: '/profile/works', icon: '🎨', label: 'My Works', share: true },
    { to: '/profile#orders', icon: '📦', label: 'My Orders', share: true },
    { to: '/profile#cert', icon: '📜', label: 'My Certificates', share: true },
    { to: '/cert', icon: '📊', label: 'Capability Profile', share: true },
    { to: '/ai-test', icon: '🧠', label: 'My AI Assessment', share: false },
    { to: '/profile#tools', icon: '🔧', label: 'My Teaching Tools', share: false },
    { to: '/profile#messages', icon: '🔔', label: 'Notifications', share: false },
    { to: '/profile#settings', icon: '⚙️', label: 'Settings', share: false },
    { action: () => setView('member'), icon: '👑', label: 'Member Center', share: false },
    { action: () => setShowEarnBySharing(v => !v), icon: '💰', label: 'Earn by Sharing', share: false, highlight: true },
    { to: '/charity', icon: '❤️', label: 'Charity Points', share: false },
  ]

  const dataCards = [
    { label: 'Course hours', value: '128', unit: 'hrs', shareModule: null },
    { label: 'Events joined', value: '6', unit: '', shareModule: 'My Events' },
    { label: 'Awards / works', value: '3', unit: '', shareModule: 'My Works' },
    { label: 'Certificates', value: '2', unit: '', shareModule: 'My Certificates' },
    { label: 'Capability profile', value: 'Level 3', unit: '', shareModule: 'Capability Profile' },
    { label: 'Orders', value: '12', unit: '', shareModule: 'My Orders' },
    { label: 'Teaching kit stock', value: '2', unit: 'items', shareModule: null },
    { label: 'Charity points', value: '1,240', unit: 'pts', shareModule: null },
    { label: 'Commission balance', value: '¥86', unit: '', shareModule: null },
    { label: 'Invited', value: '12', unit: 'friends', shareModule: null },
    { label: 'Pending commission', value: '¥24', unit: '', shareModule: null },
    { label: 'Member benefits to claim', value: '2', unit: '', shareModule: null },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {shareModal && <ShareModal title={shareModal} onClose={() => setShareModal(null)} />}

      {/* ── Top bar: user + member ─────────────────────────────────── */}
      <section className="mb-8">
        <div className="card p-6 flex flex-wrap items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xl font-semibold shrink-0">A</div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-bingo-dark">Nickname · 138****8000</div>
            <div className="text-sm text-slate-500">Student ID: BINGO-2024-08412 · <Link to="/profile#settings" className="text-primary hover:underline">Security</Link></div>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${memberTier === 'annual' ? 'bg-amber-100 text-amber-700' : memberTier === 'free' ? 'bg-slate-100 text-slate-600' : 'bg-sky-100 text-sky-700'}`}>
                {memberLabel}
              </span>
              {memberTier !== 'free' && (
                <>
                  <span className="text-xs text-slate-500">{memberExpiryDays} days left</span>
                  {autoRenew && <span className="text-xs text-green-600">Auto-renew on · <button type="button" onClick={() => setView('member')} className="hover:underline">Manage</button></span>}
                </>
              )}
              {memberTier === 'free' && <span className="text-xs text-slate-500">Upgrade to unlock perks</span>}
            </div>
          </div>
          <div className="flex gap-2 flex-wrap shrink-0">
            <Link to="/login" className="rounded-lg border border-slate-300 text-slate-700 px-4 py-2 text-sm hover:bg-slate-50">Edit profile</Link>
            {memberTier !== 'free' ? (
              <button type="button" onClick={() => setView('member')} className="btn-primary px-4 py-2 text-sm">Member benefits →</button>
            ) : (
              <button type="button" onClick={() => setView('member')} className="btn-primary px-4 py-2 text-sm">Upgrade now</button>
            )}
          </div>
        </div>
      </section>

      {/* ── Core function grid (with share hints) ───────────────────── */}
      <section className="mb-8">
        <h2 className="section-title mb-4">Quick access</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {coreLinks.map((item, i) => (
            <div key={i} className="relative">
              {item.to ? (
                <Link
                  to={item.to}
                  className={`card p-4 text-center hover:shadow-md transition block ${item.highlight ? 'border-amber-300 bg-amber-50/30' : ''}`}
                >
                  {item.share && (
                    <button
                      type="button"
                      onClick={e => { e.preventDefault(); setShareModal(item.label) }}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-amber-400 text-white flex items-center justify-center text-[10px] hover:bg-amber-500"
                      title="Share"
                    >
                      ↗
                    </button>
                  )}
                  <span className="text-2xl block mb-1">{item.icon}</span>
                  <span className="text-xs font-medium text-bingo-dark">{item.label}</span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={item.action}
                  className={`w-full card p-4 text-center hover:shadow-md transition ${item.highlight ? 'border-amber-300 bg-amber-50/30' : ''}`}
                >
                  <span className="text-2xl block mb-1">{item.icon}</span>
                  <span className="text-xs font-medium text-bingo-dark">{item.label}</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Data overview + share entry ─────────────────────────────── */}
      <section className="mb-8">
        <h2 className="section-title mb-4">Overview</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {dataCards.map((card, i) => (
            <div key={i} className="card p-4 relative">
              <p className="text-xs text-slate-500 mb-0.5">{card.label}</p>
              <p className="font-bold text-bingo-dark text-lg">{card.value} <span className="text-xs font-normal text-slate-400">{card.unit}</span></p>
              {card.shareModule && (
                <button
                  type="button"
                  onClick={() => setShareModal(card.shareModule)}
                  className="mt-2 text-xs text-amber-600 hover:text-amber-700 font-medium"
                >
                  More share options →
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Marketing recommendation ────────────────────────────────── */}
      <section className="mb-8">
        <h2 className="section-title mb-4">For you</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="card p-4 border-amber-200/60 bg-amber-50/20">
            <p className="text-xs font-semibold text-amber-700 mb-1">Member only</p>
            <p className="font-semibold text-bingo-dark text-sm mb-1">Member course discount · Free competition camp trial</p>
            <p className="text-xs text-slate-500 mb-2">Unlock with your current plan</p>
            <button type="button" onClick={() => setView('member')} className="text-xs text-primary font-medium hover:underline">View benefits →</button>
          </div>
          <div className="card p-4 border-primary/20 bg-primary/5">
            <p className="text-xs font-semibold text-primary mb-1">Hot</p>
            <p className="font-semibold text-bingo-dark text-sm mb-1">Flash sale · Whitelist event early bird</p>
            <p className="text-xs text-slate-500 mb-2">Limited time</p>
            <Link to="/mall" className="text-xs text-primary font-medium hover:underline">Go to Mall →</Link>
          </div>
          <div className="card p-4 border-green-200/60 bg-green-50/20">
            <p className="text-xs font-semibold text-green-700 mb-1">Earn more</p>
            <p className="font-semibold text-bingo-dark text-sm mb-1">Double commission · Invite friends to join, earn extra</p>
            <p className="text-xs text-slate-500 mb-2">Earn by Sharing</p>
            <button type="button" onClick={() => setShowEarnBySharing(true)} className="text-xs text-primary font-medium hover:underline">Earn by Sharing →</button>
          </div>
        </div>
      </section>

      {/* ── Earn by Sharing (expandable, 原推广中心) ────────────────── */}
      <section id="promo" className="mb-8">
        <button
          type="button"
          className="w-full flex items-center justify-between card p-5 hover:shadow-md hover:border-amber-300 transition text-left"
          onClick={() => setShowEarnBySharing(v => !v)}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">💰</span>
            <div>
              <div className="font-semibold text-bingo-dark">Earn by Sharing</div>
              <div className="text-sm text-slate-500">Share & earn · Commission · Referral tracking · Double commission this month</div>
            </div>
          </div>
          <span className={`text-slate-400 transition-transform ${showEarnBySharing ? 'rotate-180' : ''}`}>▼</span>
        </button>
        {showEarnBySharing && <div className="mt-4"><EarnBySharing /></div>}
      </section>

      {/* ── Member Center (view) ───────────────────────────────────── */}
      {view === 'member' && (
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <button type="button" onClick={() => setView('home')} className="text-slate-500 hover:text-bingo-dark text-sm">← Back to profile</button>
          </div>

          <div className="card p-6 mb-6 flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200/60">
            <div>
              <h2 className="font-bold text-bingo-dark text-xl mb-1">Member Center</h2>
              <p className="text-sm text-slate-600 mb-2">Current: <strong>{memberLabel}</strong> · {memberTier !== 'free' ? `${memberExpiryDays} days left` : 'Upgrade to unlock perks'}</p>
              {autoRenew && memberTier !== 'free' && <p className="text-xs text-green-600">Auto-renew is on · <button type="button" className="hover:underline">Manage</button></p>}
            </div>
            <button type="button" className="btn-primary px-5 py-2.5">{memberTier === 'free' ? 'Upgrade now' : 'Renew / Upgrade'}</button>
          </div>

          <div className="card p-6 overflow-x-auto mb-6">
            <h3 className="font-semibold text-bingo-dark mb-4">Member benefits by tier</h3>
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 px-3 font-semibold text-slate-800">Benefit</th>
                  {MEMBER_TIERS.map(t => (
                    <th key={t.id} className={`text-center py-2 px-2 font-semibold ${t.color}`}>{t.chinese}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-slate-600">
                {MEMBER_BENEFITS.map((row, i) => (
                  <tr key={i} className="border-b border-slate-100">
                    <td className="py-2 px-3 text-slate-700">{row[0]}</td>
                    {row.slice(1).map((cell, j) => (
                      <td key={j} className="py-2 px-2 text-center">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            {MEMBER_TIERS.filter(t => t.id !== 'free').map(t => (
              <div key={t.id} className={`card p-5 border-2 ${t.id === memberTier ? 'border-primary ring-2 ring-primary/20' : 'border-slate-100'} ${t.bg}`}>
                <div className={`font-bold ${t.color} mb-1`}>{t.chinese}</div>
                <div className="text-2xl font-bold text-bingo-dark mb-1">¥{t.price}<span className="text-sm font-normal text-slate-500">/period</span></div>
                {t.autoPrice && <p className="text-xs text-green-600 mb-3">Auto-renew ¥{t.autoPrice} {t.autoLabel}</p>}
                <div className="flex flex-col gap-2">
                  <button type="button" className="w-full btn-primary py-2 text-sm">Subscribe</button>
                  <button type="button" className="w-full border border-slate-200 text-slate-600 py-2 rounded-xl text-sm hover:bg-slate-50">Auto-renew (save)</button>
                </div>
              </div>
            ))}
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-bingo-dark mb-3">Member management</h3>
            <div className="flex flex-wrap gap-3">
              <button type="button" className="px-4 py-2 rounded-xl border border-slate-200 text-sm hover:bg-slate-50">Subscription history</button>
              <button type="button" className="px-4 py-2 rounded-xl border border-slate-200 text-sm hover:bg-slate-50">Auto-renew settings</button>
              <button type="button" className="px-4 py-2 rounded-xl border border-slate-200 text-sm hover:bg-slate-50">Claim member benefits</button>
              <button type="button" className="px-4 py-2 rounded-xl border border-slate-200 text-sm hover:bg-slate-50">Invoice / receipt</button>
            </div>
            <p className="text-xs text-slate-500 mt-3">Reminder 3 days before auto-renewal. You can turn off auto-renew at any time; current period is unaffected.</p>
          </div>
        </section>
      )}

      {/* ── Notifications (retained) ──────────────────────────────── */}
      {view === 'home' && (
        <section className="mb-8">
          <h2 className="section-title">Notifications</h2>
          <p className="text-sm text-slate-600">Announcements, activity reminders, Q&A replies, commission updates, referral order alerts</p>
        </section>
      )}

      {/* ── Bottom quick area ──────────────────────────────────────── */}
      <section className="border-t border-slate-200 pt-6">
        <div className="flex flex-wrap gap-4 justify-between items-center">
          <div className="flex flex-wrap gap-4 text-sm">
            <Link to="/" className="text-slate-600 hover:text-primary">Home</Link>
            <Link to="/profile#help" className="text-slate-600 hover:text-primary">Help</Link>
            <a href="tel:400-xxx-xxxx" className="text-slate-600 hover:text-primary">Contact us</a>
            {memberTier !== 'free' && <button type="button" onClick={() => setView('member')} className="text-amber-600 hover:text-amber-700 font-medium">Member support</button>}
            <button type="button" onClick={() => setView('member')} className="text-slate-600 hover:text-primary">Auto-renewal</button>
          </div>
          <p className="text-xs text-slate-400">Bingo AI Academy · Profile & Member Center</p>
        </div>
      </section>

      {/* ── B2B (retained) ─────────────────────────────────────────── */}
      <section className="mt-10">
        <h2 className="section-title">B2B login</h2>
        <p className="text-slate-600 text-sm mb-3">Schools, institutions, franchise partners, event partners: use separate B2B account</p>
        <a href="/#/b" className="btn-primary">B2B login</a>
      </section>
    </div>
  )
}

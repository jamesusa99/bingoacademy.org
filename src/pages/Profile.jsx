import { useCallback, useEffect, useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { authLink } from '../lib/authRedirect'
import {
  fetchMyProfile,
  profileDisplayName,
  profileInitials,
  maskPhone,
  formatAccountId,
  MEMBER_TIER_LABELS,
} from '../lib/userProfile'
import ProfileAccountForm from '../components/ProfileAccountForm'
import ProfileLabPacksSection from '../components/profile/ProfileLabPacksSection'
import ProfileNotificationsSection from '../components/profile/ProfileNotificationsSection'
import ProfileCertificatesSection from '../components/profile/ProfileCertificatesSection'
import ProfileAchievementsSection from '../components/profile/ProfileAchievementsSection'
import CourseAccessReset from '../components/CourseAccessReset'
import { fetchMyOrders } from '../lib/checkout'
import {
  fetchMyCertificates,
  fetchMyAchievements,
  syncLocalAccomplishments,
} from '../lib/userAccomplishments'
import { fetchMyNotifications, isNotificationUnread } from '../lib/userNotifications'
import { formatIoaiPrice } from '../lib/ioaiStore'

// ─── Member tier data ──────────────────────────────────────────────

const MEMBER_TIERS = [
  { id: 'free', name: 'Free Member', chinese: 'Free Member', price: 0, autoPrice: null, color: 'text-slate-600', bg: 'bg-slate-50' },
  { id: 'monthly', name: 'Monthly', chinese: 'Monthly Member', price: 39, autoPrice: 35, autoLabel: 'Auto-renew −10%', color: 'text-sky-600', bg: 'bg-sky-50' },
  { id: 'quarterly', name: 'Quarterly', chinese: 'Quarterly Member', price: 99, autoPrice: 84, autoLabel: 'Auto-renew −15% + 1 trial class', color: 'text-violet-600', bg: 'bg-violet-50' },
  { id: 'annual', name: 'Annual', chinese: 'Annual Member', price: 299, autoPrice: 239, autoLabel: 'Auto-renew −20% + extra perks', color: 'text-amber-600', bg: 'bg-amber-50' },
]

const MEMBER_BENEFITS = [
  ['AI course discount', '—', '10% off', '15% off', '30% off'],
  ['Competition prep access', 'Free only', 'Partial', 'Most', 'All'],
  ['Prestigious competition support', 'Entry only', 'Entry + guide', 'Entry + materials', 'Entry + camp + 1v1'],
  ['STEM planning', '—', 'Basic docs', 'Plan template', '1v1 planning'],
  ['Mall / teaching kit discount', '—', '5% off', '10% off', '20% off + free ship'],
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

// ─── Earn by Sharing ─────────────────────────────

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
          <li>· Withdraw: min $68, T+1 arrival</li>
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
          <li>· Withdrawal: min $68, T+1, no fee</li>
        </ul>
      </div>

      <div className="card p-6 border-amber-200/60 bg-amber-50/50">
        <h3 className="font-semibold text-bingo-dark mb-3">Team promotion (teachers only)</h3>
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
          <div><dt className="font-medium text-slate-800">Min withdrawal</dt><dd className="text-slate-600 mt-0.5">$68 (no fee)</dd></div>
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
            { title: 'Withdrawal', body: 'Profile → Commission settlement; Withdraw (min $68) → confirm → auto review (≤10 min) → transfer.' },
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

function scrollToProfileSection(id = 'settings') {
  const headerOffset = 120

  const attempt = (retriesLeft) => {
    const el = document.getElementById(id)
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - headerOffset
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
      return
    }
    if (retriesLeft > 0) {
      requestAnimationFrame(() => attempt(retriesLeft - 1))
    }
  }

  requestAnimationFrame(() => attempt(24))
}

const ORDER_STATUS_LABELS = {
  paid: 'Paid',
  pending: 'Pending',
  failed: 'Failed',
  refunded: 'Refunded',
  canceled: 'Canceled',
}

function formatOrderDate(value) {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return '—'
  }
}

function ProfileOrdersSection({ orders, loading, error }) {
  return (
    <section id="orders" className="mb-8 scroll-mt-28">
      <h2 className="section-title mb-4">My Orders</h2>
      <div className="card overflow-hidden">
        {loading ? (
          <p className="p-6 text-sm text-slate-500">Loading orders…</p>
        ) : error ? (
          <p className="p-6 text-sm text-red-600">{error}</p>
        ) : orders.length === 0 ? (
          <div className="p-6">
            <p className="text-sm text-slate-600">No orders yet.</p>
            <p className="text-xs text-slate-500 mt-2">
              Course purchases appear here after checkout completes.
            </p>
            <Link to="/courses?line=ioai" className="text-sm text-primary font-medium hover:underline mt-3 inline-block">
              Browse courses →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Product</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Amount</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => {
                  const statusLabel = ORDER_STATUS_LABELS[order.status] || order.status || '—'
                  const amount =
                    order.amount_cents != null
                      ? formatIoaiPrice(order.amount_cents, order.currency || 'usd')
                      : '—'
                  const productName =
                    order.product_name ||
                    order.metadata?.product_name ||
                    order.metadata?.course_slug ||
                    'Course purchase'
                  return (
                    <tr key={order.id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        {formatOrderDate(order.created_at)}
                      </td>
                      <td className="py-3 px-4 text-bingo-dark font-medium">{productName}</td>
                      <td className="py-3 px-4 text-slate-700">{amount}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            order.status === 'paid'
                              ? 'bg-emerald-50 text-emerald-700'
                              : order.status === 'pending'
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {statusLabel}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}

export default function Profile() {
  const location = useLocation()
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const [view, setView] = useState('home')
  const [accountSettingsOpen, setAccountSettingsOpen] = useState(false)
  const [showEarnBySharing, setShowEarnBySharing] = useState(false)
  const [shareModal, setShareModal] = useState(null)
  const [profile, setProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileError, setProfileError] = useState('')
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [ordersError, setOrdersError] = useState('')
  const [notifications, setNotifications] = useState([])
  const [notificationsLoading, setNotificationsLoading] = useState(true)
  const [notificationsError, setNotificationsError] = useState('')
  const [certificates, setCertificates] = useState([])
  const [certificatesLoading, setCertificatesLoading] = useState(true)
  const [certificatesError, setCertificatesError] = useState('')
  const [achievements, setAchievements] = useState([])
  const [achievementsLoading, setAchievementsLoading] = useState(true)
  const [achievementsError, setAchievementsError] = useState('')

  useEffect(() => {
    if (!user?.id) {
      setProfile(null)
      setProfileLoading(false)
      return
    }

    let mounted = true
    setProfileLoading(true)
    setProfileError('')

    fetchMyProfile(user.id).then(({ data, error }) => {
      if (!mounted) return
      if (error) setProfileError(error.message)
      else setProfile(data)
      setProfileLoading(false)
    })

    return () => {
      mounted = false
    }
  }, [user?.id])

  useEffect(() => {
    if (!isAuthenticated) {
      setOrders([])
      setOrdersLoading(false)
      return
    }

    let mounted = true
    setOrdersLoading(true)
    setOrdersError('')

    fetchMyOrders()
      .then(({ orders: rows }) => {
        if (!mounted) return
        setOrders(rows || [])
      })
      .catch((err) => {
        if (!mounted) return
        setOrdersError(err.message || 'Failed to load orders')
        setOrders([])
      })
      .finally(() => {
        if (mounted) setOrdersLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [isAuthenticated, user?.id])

  const loadNotifications = useCallback(() => {
    if (!user?.id) {
      setNotifications([])
      setNotificationsLoading(false)
      return Promise.resolve()
    }

    setNotificationsLoading(true)
    setNotificationsError('')

    return fetchMyNotifications(user.id)
      .then(({ data, error }) => {
        if (error) {
          setNotificationsError(error.message || 'Failed to load notifications')
          setNotifications([])
        } else {
          setNotifications(data || [])
        }
      })
      .finally(() => {
        setNotificationsLoading(false)
      })
  }, [user?.id])

  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([])
      setNotificationsLoading(false)
      return
    }

    let mounted = true
    loadNotifications().then(() => {
      if (!mounted) return
    })

    return () => {
      mounted = false
    }
  }, [isAuthenticated, loadNotifications])

  const loadAccomplishments = useCallback(async () => {
    if (!user?.id) {
      setCertificates([])
      setAchievements([])
      setCertificatesLoading(false)
      setAchievementsLoading(false)
      return
    }

    setCertificatesLoading(true)
    setAchievementsLoading(true)
    setCertificatesError('')
    setAchievementsError('')

    await syncLocalAccomplishments(user.id)

    const [certResult, achResult] = await Promise.all([
      fetchMyCertificates(user.id),
      fetchMyAchievements(user.id),
    ])

    if (certResult.error) {
      setCertificatesError(certResult.error.message || 'Failed to load certificates')
      setCertificates([])
    } else {
      setCertificates(certResult.data || [])
    }

    if (achResult.error) {
      setAchievementsError(achResult.error.message || 'Failed to load achievements')
      setAchievements([])
    } else {
      setAchievements(achResult.data || [])
    }

    setCertificatesLoading(false)
    setAchievementsLoading(false)
  }, [user?.id])

  useEffect(() => {
    if (!isAuthenticated) {
      setCertificates([])
      setAchievements([])
      setCertificatesLoading(false)
      setAchievementsLoading(false)
      return
    }

    loadAccomplishments()
  }, [isAuthenticated, loadAccomplishments])

  const unreadNotificationCount = notifications.filter((n) => isNotificationUnread(n)).length

  const toggleAccountSettings = useCallback(() => {
    setAccountSettingsOpen((open) => {
      const next = !open
      if (next) {
        window.setTimeout(() => scrollToProfileSection('settings'), 80)
      }
      return next
    })
  }, [])

  useEffect(() => {
    if (authLoading || !isAuthenticated || view !== 'home') return

    const hash = location.hash.replace('#', '')
    if (hash === 'settings') {
      setAccountSettingsOpen(true)
      const timer = window.setTimeout(() => scrollToProfileSection('settings'), 80)
      return () => window.clearTimeout(timer)
    }
    if (hash === 'orders' || hash === 'notifications' || hash === 'certificates' || hash === 'achievements') {
      const timer = window.setTimeout(() => scrollToProfileSection(hash), 80)
      return () => window.clearTimeout(timer)
    }
  }, [location.hash, view, authLoading, isAuthenticated, profileLoading, ordersLoading, notificationsLoading, certificatesLoading, achievementsLoading])

  if (authLoading) {
    return (
      <div className="page-content w-full py-16 text-center text-slate-500 text-sm">Loading…</div>
    )
  }

  if (!isAuthenticated) {
    const profileReturn = location.hash ? `/profile${location.hash}` : '/profile'
    return <Navigate to={authLink('/login', profileReturn)} replace />
  }

  const memberTier = profile?.member_tier || 'free'
  const memberExpiryDays = null
  const autoRenew = false
  const memberLabel = MEMBER_TIER_LABELS[memberTier] || MEMBER_TIER_LABELS.free
  const displayName = profileDisplayName(profile, user)
  const displayPhone = maskPhone(profile?.phone)
  const accountId = formatAccountId(user?.id)
  const avatarUrl = profile?.avatar_url?.trim()
  const userEmail = profile?.email || user?.email || ''

  const coreLinks = [
    { to: '/profile/study', icon: '📚', label: 'My Courses', share: false },
    { to: '/profile/works', icon: '🎨', label: 'My Works', share: true },
    { to: '/profile#orders', icon: '📦', label: 'My Orders', share: true },
    { to: '/profile#certificates', icon: '📜', label: 'My Certificates', share: true },
    { to: '/profile#achievements', icon: '🏅', label: 'My Achievements', share: true },
    { to: '/profile#notifications', icon: '🔔', label: 'Notifications', share: false, badge: unreadNotificationCount },
  ]

  const dataCards = [
    { label: 'Course hours', value: '128', unit: 'hrs', shareModule: null },
    { label: 'Events joined', value: '6', unit: '', shareModule: 'My Events' },
    { label: 'Awards / works', value: String(achievements.length), unit: '', shareModule: 'My Works' },
    { label: 'Certificates', value: String(certificates.length), unit: '', shareModule: 'My Certificates' },
    { label: 'Capability profile', value: 'Level 3', unit: '', shareModule: 'Capability Profile' },
    { label: 'Orders', value: String(orders.length), unit: '', shareModule: 'My Orders' },
    { label: 'Teaching kit stock', value: '2', unit: 'items', shareModule: null },
    { label: 'Charity points', value: '1,240', unit: 'pts', shareModule: null },
    { label: 'Commission balance', value: '$86', unit: '', shareModule: null },
    { label: 'Invited', value: '12', unit: 'friends', shareModule: null },
    { label: 'Pending commission', value: '$24', unit: '', shareModule: null },
    { label: 'Member benefits to claim', value: '2', unit: '', shareModule: null },
  ]

  return (
    <div className="page-content w-full py-6 sm:py-8">
      {shareModal && <ShareModal title={shareModal} onClose={() => setShareModal(null)} />}

      {/* ── Top bar: user + member ─────────────────────────────────── */}
      <section className="mb-8">
        <div className="card p-6 flex flex-wrap items-center gap-4">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="w-16 h-16 rounded-full object-cover shrink-0" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xl font-semibold shrink-0">
              {profileInitials(profile, user)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-bingo-dark">
              {profileLoading ? 'Loading…' : displayName}
              {displayPhone ? <span className="text-slate-500 font-normal"> · {displayPhone}</span> : null}
            </div>
            <div className="text-sm text-slate-500">
              Account ID: {accountId} ·{' '}
              <button
                type="button"
                onClick={toggleAccountSettings}
                className="text-primary hover:underline"
                aria-expanded={accountSettingsOpen}
              >
                Account settings
              </button>
            </div>
            {profileError ? (
              <p className="text-xs text-red-600 mt-1">{profileError}</p>
            ) : null}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${memberTier === 'annual' ? 'bg-amber-100 text-amber-700' : memberTier === 'free' ? 'bg-slate-100 text-slate-600' : 'bg-sky-100 text-sky-700'}`}>
                {memberLabel}
              </span>
              {memberTier !== 'free' && memberExpiryDays != null && (
                <>
                  <span className="text-xs text-slate-500">{memberExpiryDays} days left</span>
                  {autoRenew && <span className="text-xs text-green-600">Auto-renew on · <button type="button" onClick={() => setView('member')} className="hover:underline">Manage</button></span>}
                </>
              )}
              {memberTier === 'free' && <span className="text-xs text-slate-500">Upgrade to unlock perks</span>}
            </div>
          </div>
          <div className="flex gap-2 flex-wrap shrink-0">
            <button
              type="button"
              onClick={toggleAccountSettings}
              className="rounded-lg border border-slate-300 text-slate-700 px-4 py-2 text-sm hover:bg-slate-50"
              aria-expanded={accountSettingsOpen}
            >
              {accountSettingsOpen ? 'Hide profile' : 'Edit profile'}
            </button>
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
                  {item.badge > 0 ? (
                    <span className="absolute top-2 left-2 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  ) : null}
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

      <ProfileLabPacksSection />

      {/* ── Marketing recommendation ────────────────────────────────── */}
      <section className="mb-8">
        <h2 className="section-title mb-4">For you</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="card p-4 border-primary/20 bg-primary/5">
            <p className="text-xs font-semibold text-primary mb-1">Hot</p>
            <p className="font-semibold text-bingo-dark text-sm mb-1">Flash sale · Prestigious competition early bird</p>
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

      {/* ── Earn by Sharing (expandable) ────────────────── */}
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
                <div className="text-2xl font-bold text-bingo-dark mb-1">${t.price}<span className="text-sm font-normal text-slate-500">/period</span></div>
                {t.autoPrice && <p className="text-xs text-green-600 mb-3">Auto-renew ${t.autoPrice} {t.autoLabel}</p>}
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

      {/* ── My Orders ─────────────────────────────────────────────── */}
      {view === 'home' && (
        <ProfileOrdersSection orders={orders} loading={ordersLoading} error={ordersError} />
      )}

      {/* ── My Certificates ───────────────────────────────────────── */}
      {view === 'home' && (
        <ProfileCertificatesSection
          certificates={certificates}
          loading={certificatesLoading}
          error={certificatesError}
        />
      )}

      {/* ── My Achievements ───────────────────────────────────────── */}
      {view === 'home' && (
        <ProfileAchievementsSection
          achievements={achievements}
          loading={achievementsLoading}
          error={achievementsError}
        />
      )}

      {/* ── Account settings (collapsible) ─────────────────────────── */}
      {view === 'home' && (
        <section id="settings" className="mb-8 scroll-mt-28">
          <button
            type="button"
            className="w-full flex items-center justify-between gap-4 card p-5 hover:shadow-md transition text-left"
            onClick={toggleAccountSettings}
            aria-expanded={accountSettingsOpen}
          >
            <div>
              <h2 className="section-title mb-0">Account settings</h2>
              <p className="text-sm text-slate-500 mt-1">Name, contact info, and course access</p>
            </div>
            <span
              className={`text-slate-400 shrink-0 transition-transform ${accountSettingsOpen ? 'rotate-180' : ''}`}
              aria-hidden
            >
              ▼
            </span>
          </button>
          {accountSettingsOpen ? (
            <div className="card p-6 mt-3">
              {profileLoading ? (
                <p className="text-sm text-slate-500">Loading account info…</p>
              ) : profile ? (
                <ProfileAccountForm
                  userId={user.id}
                  profile={profile}
                  userEmail={userEmail}
                  onSaved={setProfile}
                />
              ) : (
                <p className="text-sm text-slate-600">
                  No profile found. Try signing in again, or contact support if the problem continues.
                </p>
              )}
              <CourseAccessReset />
            </div>
          ) : null}
        </section>
      )}

      {/* ── Notifications ─────────────────────────────────────────── */}
      {view === 'home' && (
        <ProfileNotificationsSection
          notifications={notifications}
          loading={notificationsLoading}
          error={notificationsError}
          userId={user?.id}
          onRefresh={loadNotifications}
        />
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
    </div>
  )
}
